/**
 * GitLab Plugin — Live projects, merge requests, and activity
 *
 * Provides real-time access to your GitLab projects, pipeline status, and recent activity
 * via the GitLab REST API v4.
 *
 * @config username: GitLab username
 * @config instance_url: GitLab instance URL (default: https://gitlab.com)
 * @config token_env: Env var for personal access token (optional)
 */
import { z } from "zod";
import type { McpMePlugin, PluginResource, PluginTool } from "../../plugin-engine/types.js";
import { gitlabPluginConfigSchema, type GitLabPluginConfig } from "./schema.js";

interface GitLabProject {
  id: number;
  name: string;
  path_with_namespace: string;
  description: string | null;
  web_url: string;
  star_count: number;
  forks_count: number;
  default_branch: string;
  topics: string[];
  last_activity_at: string;
  visibility: string;
}

interface GitLabEvent {
  action_name: string;
  target_type: string | null;
  target_title: string | null;
  created_at: string;
  project_id: number;
}

class GitLabPlugin implements McpMePlugin {
  name = "gitlab";
  description = "Live GitLab projects, merge requests, pipelines, and activity.";
  version = "0.1.0";

  private config!: GitLabPluginConfig;
  private headers: Record<string, string> = {};

  async initialize(rawConfig: Record<string, unknown>): Promise<void> {
    this.config = gitlabPluginConfigSchema.parse(rawConfig);

    this.headers = {
      Accept: "application/json",
      "User-Agent": "mcp-me",
    };

    if (this.config.token_env) {
      const token = process.env[this.config.token_env];
      if (token) {
        this.headers["PRIVATE-TOKEN"] = token;
      }
    }
  }

  private async fetchGitLab<T>(path: string): Promise<T> {
    const base = this.config.instance_url.replace(/\/$/, "");
    const response = await fetch(`${base}/api/v4${path}`, { headers: this.headers });
    if (!response.ok) {
      throw new Error(`GitLab API error: ${response.status} ${response.statusText}`);
    }
    return response.json() as Promise<T>;
  }

  getResources(): PluginResource[] {
    return [
      {
        name: "gitlab-profile",
        uri: "me://gitlab/profile",
        title: "GitLab Profile",
        description: `GitLab profile for ${this.config.username}`,
        read: async () => {
          const users = await this.fetchGitLab<{ id: number; name: string; bio: string; web_url: string; followers: number; public_repos: number }[]>(
            `/users?username=${this.config.username}`,
          );
          return JSON.stringify(users[0] ?? {}, null, 2);
        },
      },
      {
        name: "gitlab-projects",
        uri: "me://gitlab/projects",
        title: "GitLab Projects",
        description: `Public projects for ${this.config.username}`,
        read: async () => {
          const projects = await this.fetchGitLab<GitLabProject[]>(
            `/users/${this.config.username}/projects?order_by=last_activity_at&sort=desc&per_page=${this.config.max_projects}`,
          );
          return JSON.stringify(
            projects.map((p) => ({
              name: p.name,
              description: p.description,
              url: p.web_url,
              stars: p.star_count,
              forks: p.forks_count,
              topics: p.topics,
              last_activity: p.last_activity_at,
            })),
            null,
            2,
          );
        },
      },
      {
        name: "gitlab-activity",
        uri: "me://gitlab/activity",
        title: "GitLab Activity",
        description: `Recent activity for ${this.config.username}`,
        read: async () => {
          const events = await this.fetchGitLab<GitLabEvent[]>(
            `/users/${this.config.username}/events?per_page=20`,
          );
          return JSON.stringify(
            events.map((e) => ({
              action: e.action_name,
              target_type: e.target_type,
              target_title: e.target_title,
              date: e.created_at,
            })),
            null,
            2,
          );
        },
      },
    ];
  }

  getTools(): PluginTool[] {
    return [
      {
        name: "get_gitlab_projects",
        title: "Get GitLab Projects",
        description: `List projects for ${this.config.username} with optional filters`,
        inputSchema: z.object({
          topic: z.string().optional().describe("Filter by topic/tag"),
          min_stars: z.number().optional().describe("Minimum star count"),
        }),
        annotations: { readOnlyHint: true },
        execute: async (input) => {
          let projects = await this.fetchGitLab<GitLabProject[]>(
            `/users/${this.config.username}/projects?order_by=star_count&sort=desc&per_page=${this.config.max_projects}`,
          );

          if (input.topic) {
            const topic = (input.topic as string).toLowerCase();
            projects = projects.filter((p) => p.topics.some((t) => t.toLowerCase().includes(topic)));
          }
          if (input.min_stars) {
            projects = projects.filter((p) => p.star_count >= (input.min_stars as number));
          }

          return JSON.stringify(
            projects.map((p) => ({
              name: p.name,
              description: p.description,
              url: p.web_url,
              stars: p.star_count,
              topics: p.topics,
            })),
            null,
            2,
          );
        },
      },
    ];
  }
}

export default function createPlugin(): McpMePlugin {
  return new GitLabPlugin();
}
