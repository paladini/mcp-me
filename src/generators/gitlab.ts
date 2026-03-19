/**
 * GitLab Generator
 *
 * Fetches your GitLab profile, projects, and topics.
 *
 * @flag --gitlab <username>
 * @example mcp-me generate ./profile --gitlab myuser
 * @auth None required (public API)
 * @api https://docs.gitlab.com/ee/api/users.html
 * @data identity, skills (topics), projects (top 20 by stars)
 */
import type { GeneratorSource, PartialProfile } from "./types.js";

interface GitLabUser {
  id: number;
  username: string;
  name: string;
  bio: string;
  location: string;
  web_url: string;
  website_url: string;
  twitter: string;
  linkedin: string;
  public_repos?: number;
}

interface GitLabProject {
  id: number;
  name: string;
  description: string | null;
  web_url: string;
  star_count: number;
  forks_count: number;
  topics: string[];
  created_at: string;
  last_activity_at: string;
  default_branch: string;
  forked_from_project?: unknown;
  archived: boolean;
}

export const gitlabGenerator: GeneratorSource = {
  name: "gitlab",
  flag: "gitlab",
  flagArg: "<username>",
  description: "GitLab projects, topics, profile",
  category: "code",

  async generate(config): Promise<PartialProfile> {
    const username = config.username as string;
    if (!username) throw new Error("GitLab username is required");

    const baseUrl = (config.instance as string) ?? "https://gitlab.com";

    console.log(`  [GitLab] Fetching profile for @${username} on ${baseUrl}...`);

    const usersResp = await fetch(`${baseUrl}/api/v4/users?username=${username}`, {
      headers: { Accept: "application/json", "User-Agent": "mcp-me-generator" },
    });
    if (!usersResp.ok) throw new Error(`GitLab API error: ${usersResp.status}`);
    const users = (await usersResp.json()) as GitLabUser[];
    const user = users[0];
    if (!user) throw new Error(`GitLab user "${username}" not found`);

    console.log(`  [GitLab] Fetching projects...`);
    const projectsResp = await fetch(
      `${baseUrl}/api/v4/users/${user.id}/projects?per_page=100&order_by=star_count&sort=desc`,
      { headers: { Accept: "application/json", "User-Agent": "mcp-me-generator" } },
    );
    const allProjects = projectsResp.ok
      ? ((await projectsResp.json()) as GitLabProject[])
      : [];

    const projects = allProjects.filter((p) => !p.forked_from_project && !p.archived);
    console.log(`  [GitLab] Found ${projects.length} original projects.`);

    // Languages from topics
    const topicCounts: Record<string, number> = {};
    for (const p of projects) {
      for (const t of p.topics) {
        topicCounts[t] = (topicCounts[t] ?? 0) + 1;
      }
    }

    const tools = Object.entries(topicCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 15)
      .map(([topic]) => ({ name: topic, category: "technology" }));

    const projectsList = projects.slice(0, 20).map((p) => ({
      name: p.name,
      description: p.description ?? "No description",
      url: p.web_url,
      status: "active" as const,
      technologies: p.topics,
      start_date: p.created_at.slice(0, 10),
      category: "open-source",
      ...(p.star_count > 0 ? { stars: p.star_count } : {}),
    }));

    const identity: PartialProfile["identity"] = {
      ...(user.name ? { name: user.name } : {}),
      ...(user.bio ? { bio: user.bio } : {}),
      ...(user.location ? { location: { city: user.location } } : {}),
      contact: {
        social: [
          { platform: "gitlab", url: user.web_url, username: user.username },
        ],
        ...(user.website_url ? { website: user.website_url } : {}),
      },
    };

    const faq: PartialProfile["faq"] = projects.length > 0
      ? [{
          question: "Do you use GitLab?",
          answer: `Yes, I have ${projects.length} project(s) on GitLab${projects[0].star_count > 0 ? `, most starred: ${projects[0].name} (${projects[0].star_count} stars)` : ""}.`,
          category: "code",
        }]
      : [];

    return {
      identity,
      skills: { tools },
      projects: projectsList,
      faq,
    };
  },
};
