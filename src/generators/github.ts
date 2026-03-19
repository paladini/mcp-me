/**
 * GitHub Generator
 *
 * Fetches your GitHub profile, repositories, programming languages, and topics.
 *
 * @flag --github <username>
 * @example mcp-me generate ./profile --github octocat
 * @auth Optional: set GITHUB_TOKEN env var for higher rate limits (5000 vs 60 req/hr)
 * @api https://docs.github.com/en/rest
 * @data identity, skills (languages), projects (top 20 repos by stars), career (company)
 */
import type { GeneratorSource, PartialProfile } from "./types.js";

interface GitHubUser {
  login: string;
  name: string | null;
  bio: string | null;
  blog: string | null;
  location: string | null;
  company: string | null;
  email: string | null;
  twitter_username: string | null;
  public_repos: number;
  followers: number;
  following: number;
  html_url: string;
  created_at: string;
}

interface GitHubRepo {
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  homepage: string | null;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  fork: boolean;
  archived: boolean;
  topics: string[];
  created_at: string;
  updated_at: string;
  pushed_at: string;
}

async function fetchGitHub<T>(path: string, token?: string): Promise<T> {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github.v3+json",
    "User-Agent": "mcp-me-generator",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`https://api.github.com${path}`, { headers });
  if (!response.ok) {
    if (response.status === 403) {
      throw new Error("GitHub API rate limit exceeded. Set GITHUB_TOKEN to increase limits.");
    }
    throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
  }
  return response.json() as Promise<T>;
}

async function fetchAllRepos(username: string, token?: string): Promise<GitHubRepo[]> {
  const allRepos: GitHubRepo[] = [];
  let page = 1;
  const perPage = 100;

  while (true) {
    const repos = await fetchGitHub<GitHubRepo[]>(
      `/users/${username}/repos?sort=updated&per_page=${perPage}&page=${page}`,
      token,
    );
    allRepos.push(...repos);
    if (repos.length < perPage) break;
    page++;
  }

  return allRepos.filter((r) => !r.fork);
}

export const githubGenerator: GeneratorSource = {
  name: "github",
  flag: "github",
  flagArg: "<username>",
  description: "GitHub profile, repos, languages, topics",
  category: "code",

  async generate(config): Promise<PartialProfile> {
    const username = config.username as string;
    if (!username) throw new Error("GitHub username is required");

    const token = process.env.GITHUB_TOKEN;
    console.log(`  [GitHub] Fetching profile for @${username}...`);
    const user = await fetchGitHub<GitHubUser>(`/users/${username}`, token);

    console.log(`  [GitHub] Fetching repositories...`);
    const repos = await fetchAllRepos(username, token);
    console.log(`  [GitHub] Found ${repos.length} non-fork repositories.`);

    // Identity
    const social: { platform: string; url: string; username?: string }[] = [
      { platform: "github", url: user.html_url, username: user.login },
    ];
    if (user.twitter_username) {
      social.push({
        platform: "twitter",
        url: `https://twitter.com/${user.twitter_username}`,
        username: user.twitter_username,
      });
    }

    const identity: PartialProfile["identity"] = {
      name: user.name ?? user.login,
      bio: user.bio ?? `GitHub user @${user.login}`,
      contact: {
        social,
        ...(user.email ? { email: user.email } : {}),
        ...(user.blog
          ? { website: user.blog.startsWith("http") ? user.blog : `https://${user.blog}` }
          : {}),
      },
    };
    if (user.location) {
      identity.location = { city: user.location, country: "" };
    }

    // Skills — languages
    const langCounts: Record<string, { count: number; stars: number }> = {};
    const topicCounts: Record<string, number> = {};
    for (const repo of repos) {
      if (repo.language) {
        const existing = langCounts[repo.language] ?? { count: 0, stars: 0 };
        existing.count++;
        existing.stars += repo.stargazers_count;
        langCounts[repo.language] = existing;
      }
      for (const topic of repo.topics) {
        topicCounts[topic] = (topicCounts[topic] ?? 0) + 1;
      }
    }

    const languages = Object.entries(langCounts)
      .sort(([, a], [, b]) => b.stars * 10 + b.count - (a.stars * 10 + a.count))
      .map(([lang, stats]) => ({
        name: lang,
        category: "programming",
        proficiency:
          stats.count >= 10
            ? "expert"
            : stats.count >= 5
              ? "advanced"
              : stats.count >= 2
                ? "intermediate"
                : "beginner",
        description: `Used in ${stats.count} repo(s), ${stats.stars} total stars`,
      }));

    const tools = Object.entries(topicCounts)
      .filter(([, count]) => count >= 2)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 15)
      .map(([topic]) => ({ name: topic, category: "technology" }));

    // Projects
    const projects = repos
      .filter((r) => !r.archived)
      .sort((a, b) => b.stargazers_count - a.stargazers_count)
      .slice(0, 20)
      .map((r) => ({
        name: r.name,
        description: r.description ?? "No description",
        repo_url: r.html_url,
        status: "active",
        technologies: [r.language, ...r.topics].filter(Boolean) as string[],
        start_date: r.created_at.slice(0, 10),
        category: "open-source",
        ...(r.homepage ? { url: r.homepage } : {}),
        ...(r.stargazers_count > 0 ? { stars: r.stargazers_count } : {}),
      }));

    // Career
    const career: PartialProfile["career"] = {};
    if (user.company) {
      career.experience = [
        {
          title: "Software Engineer",
          company: user.company.replace(/^@/, ""),
          current: true,
          start_date: "YYYY-MM",
          description: "TODO: Add your role description",
        },
      ];
    }

    return {
      identity,
      skills: { languages, ...(tools.length > 0 ? { tools } : {}) },
      projects,
      career,
    };
  },
};
