import { z } from "zod";
import type {
  McpMePlugin,
  PluginResource,
  PluginTool,
} from "../../plugin-engine/types.js";
import { githubConfigSchema, type GitHubConfig } from "./schema.js";

interface GitHubRepo {
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  fork: boolean;
  topics: string[];
  created_at: string;
  updated_at: string;
  pushed_at: string;
}

interface GitHubUser {
  login: string;
  name: string | null;
  bio: string | null;
  public_repos: number;
  followers: number;
  following: number;
  html_url: string;
  blog: string | null;
  location: string | null;
  company: string | null;
  created_at: string;
}

interface GitHubEvent {
  type: string;
  repo: { name: string };
  created_at: string;
  payload: Record<string, unknown>;
}

class GitHubPlugin implements McpMePlugin {
  name = "github";
  description = "Integrates with GitHub to provide repository, contribution, and activity data.";
  version = "0.1.0";

  private config!: GitHubConfig;
  private headers: Record<string, string> = {};

  async initialize(rawConfig: Record<string, unknown>): Promise<void> {
    this.config = githubConfigSchema.parse(rawConfig);

    this.headers = {
      Accept: "application/vnd.github.v3+json",
      "User-Agent": "mcp-me",
    };

    if (this.config.token_env) {
      const token = process.env[this.config.token_env];
      if (token) {
        this.headers["Authorization"] = `Bearer ${token}`;
      }
    }
  }

  private async fetchGitHub<T>(path: string): Promise<T> {
    const response = await fetch(`https://api.github.com${path}`, {
      headers: this.headers,
    });

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
    }

    return response.json() as Promise<T>;
  }

  private async getUser(): Promise<GitHubUser> {
    return this.fetchGitHub<GitHubUser>(`/users/${this.config.username}`);
  }

  private async getRepos(): Promise<GitHubRepo[]> {
    const repos = await this.fetchGitHub<GitHubRepo[]>(
      `/users/${this.config.username}/repos?sort=updated&per_page=${this.config.max_repos}`,
    );

    if (!this.config.include_forks) {
      return repos.filter((r) => !r.fork);
    }
    return repos;
  }

  private async getRecentActivity(): Promise<GitHubEvent[]> {
    return this.fetchGitHub<GitHubEvent[]>(
      `/users/${this.config.username}/events/public?per_page=30`,
    );
  }

  getResources(): PluginResource[] {
    return [
      {
        name: "github-profile",
        uri: "me://github/profile",
        title: "GitHub Profile",
        description: `GitHub profile for ${this.config.username}`,
        read: async () => {
          const user = await this.getUser();
          return JSON.stringify(user, null, 2);
        },
      },
      {
        name: "github-repos",
        uri: "me://github/repos",
        title: "GitHub Repositories",
        description: `Public repositories for ${this.config.username}`,
        read: async () => {
          const repos = await this.getRepos();
          const summary = repos.map((r) => ({
            name: r.name,
            description: r.description,
            url: r.html_url,
            language: r.language,
            stars: r.stargazers_count,
            forks: r.forks_count,
            topics: r.topics,
            updated: r.updated_at,
          }));
          return JSON.stringify(summary, null, 2);
        },
      },
      {
        name: "github-activity",
        uri: "me://github/activity",
        title: "GitHub Activity",
        description: `Recent public activity for ${this.config.username}`,
        read: async () => {
          const events = await this.getRecentActivity();
          const summary = events.map((e) => ({
            type: e.type,
            repo: e.repo.name,
            date: e.created_at,
          }));
          return JSON.stringify(summary, null, 2);
        },
      },
      {
        name: "github-languages",
        uri: "me://github/languages",
        title: "GitHub Languages",
        description: `Programming languages used by ${this.config.username}`,
        read: async () => {
          const repos = await this.getRepos();
          const langCounts: Record<string, number> = {};
          for (const repo of repos) {
            if (repo.language) {
              langCounts[repo.language] = (langCounts[repo.language] ?? 0) + 1;
            }
          }
          const sorted = Object.entries(langCounts)
            .sort(([, a], [, b]) => b - a)
            .map(([lang, count]) => ({ language: lang, repos: count }));
          return JSON.stringify(sorted, null, 2);
        },
      },
    ];
  }

  getTools(): PluginTool[] {
    return [
      {
        name: "get_github_repos",
        title: "Get GitHub Repos",
        description: `List public repositories for ${this.config.username}`,
        inputSchema: z.object({
          language: z.string().optional().describe("Filter by programming language"),
          min_stars: z.number().optional().describe("Minimum number of stars"),
        }),
        annotations: { readOnlyHint: true },
        execute: async (input) => {
          let repos = await this.getRepos();

          if (input.language) {
            const lang = (input.language as string).toLowerCase();
            repos = repos.filter((r) => r.language?.toLowerCase() === lang);
          }
          if (input.min_stars) {
            repos = repos.filter((r) => r.stargazers_count >= (input.min_stars as number));
          }

          return JSON.stringify(
            repos.map((r) => ({
              name: r.name,
              description: r.description,
              url: r.html_url,
              language: r.language,
              stars: r.stargazers_count,
              topics: r.topics,
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
  return new GitHubPlugin();
}
