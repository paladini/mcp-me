import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { stringify as toYaml } from "yaml";

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

interface GenerateOptions {
  github?: string;
  directory: string;
  force?: boolean;
}

interface GenerateResult {
  filesCreated: string[];
  warnings: string[];
  profile: {
    name?: string;
    username?: string;
    repos?: number;
    languages?: string[];
  };
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

function buildIdentityYaml(user: GitHubUser): Record<string, unknown> {
  const identity: Record<string, unknown> = {
    name: user.name ?? user.login,
    bio: user.bio ?? `GitHub user @${user.login}`,
  };

  if (user.location) {
    identity.location = { city: user.location, country: "" };
  }

  const social: Record<string, unknown>[] = [
    { platform: "github", url: user.html_url, username: user.login },
  ];
  if (user.twitter_username) {
    social.push({
      platform: "twitter",
      url: `https://twitter.com/${user.twitter_username}`,
      username: user.twitter_username,
    });
  }

  const contact: Record<string, unknown> = { social };
  if (user.email) contact.email = user.email;
  if (user.blog) contact.website = user.blog.startsWith("http") ? user.blog : `https://${user.blog}`;

  identity.contact = contact;

  return identity;
}

function buildSkillsYaml(repos: GitHubRepo[]): Record<string, unknown> {
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
      proficiency: stats.count >= 10 ? "expert" : stats.count >= 5 ? "advanced" : stats.count >= 2 ? "intermediate" : "beginner",
      description: `Used in ${stats.count} repo(s), ${stats.stars} total stars`,
    }));

  const tools = Object.entries(topicCounts)
    .filter(([, count]) => count >= 2)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 15)
    .map(([topic]) => ({
      name: topic,
      category: "technology",
    }));

  return {
    languages,
    ...(tools.length > 0 ? { tools } : {}),
  };
}

function buildProjectsYaml(repos: GitHubRepo[]): Record<string, unknown> {
  const notable = repos
    .filter((r) => !r.archived)
    .sort((a, b) => b.stargazers_count - a.stargazers_count)
    .slice(0, 20);

  const projects = notable.map((r) => {
    const project: Record<string, unknown> = {
      name: r.name,
      description: r.description ?? "No description",
      repo_url: r.html_url,
      status: r.archived ? "archived" : "active",
      technologies: [r.language, ...r.topics].filter(Boolean),
      start_date: r.created_at.slice(0, 10),
      category: "open-source",
    };
    if (r.homepage) project.url = r.homepage;
    if (r.stargazers_count > 0) project.stars = r.stargazers_count;
    return project;
  });

  return { projects };
}

function buildCareerYaml(user: GitHubUser): Record<string, unknown> {
  const career: Record<string, unknown> = {};

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

  return career;
}

function buildPluginsYaml(username: string): Record<string, unknown> {
  return {
    plugins: {
      github: {
        enabled: true,
        username,
      },
    },
  };
}

/**
 * Generate a complete mcp-me profile from GitHub data.
 */
export async function generateFromGitHub(options: GenerateOptions): Promise<GenerateResult> {
  const { github: username, directory } = options;
  if (!username) throw new Error("GitHub username is required");

  const token = process.env.GITHUB_TOKEN;
  const warnings: string[] = [];

  if (!token) {
    warnings.push("No GITHUB_TOKEN set. Using unauthenticated API (60 requests/hour limit).");
  }

  console.log(`\n  Fetching GitHub profile for @${username}...`);
  const user = await fetchGitHub<GitHubUser>(`/users/${username}`, token);

  console.log(`  Fetching repositories...`);
  const repos = await fetchAllRepos(username, token);
  console.log(`  Found ${repos.length} non-fork repositories.`);

  const languageNames = Object.entries(
    repos.reduce(
      (acc, r) => {
        if (r.language) acc[r.language] = (acc[r.language] ?? 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    ),
  )
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([lang]) => lang);

  // Build YAML data
  const identityData = buildIdentityYaml(user);
  const skillsData = buildSkillsYaml(repos);
  const projectsData = buildProjectsYaml(repos);
  const careerData = buildCareerYaml(user);
  const pluginsData = buildPluginsYaml(username);

  // Write files
  await mkdir(directory, { recursive: true });
  const filesCreated: string[] = [];

  const filesToWrite: [string, unknown][] = [
    ["identity.yaml", identityData],
    ["skills.yaml", skillsData],
    ["projects.yaml", projectsData],
    ["career.yaml", careerData],
    ["plugins.yaml", pluginsData],
  ];

  for (const [filename, data] of filesToWrite) {
    const filePath = join(directory, filename);
    const yamlContent = toYaml(data, { lineWidth: 120 });
    await writeFile(filePath, yamlContent, "utf-8");
    filesCreated.push(filename);
    console.log(`  ✔ Generated ${filename}`);
  }

  // Also create empty optional files so validate doesn't complain
  const optionalFiles = ["interests.yaml", "personality.yaml", "goals.yaml", "faq.yaml"];
  for (const filename of optionalFiles) {
    const filePath = join(directory, filename);
    const comment =
      filename === "interests.yaml"
        ? "# Your interests — hobbies, music, books, movies, food\n# Edit this file to add your personal interests.\n"
        : filename === "personality.yaml"
          ? "# Your personality — traits, values, work style\n# Edit this file to describe yourself.\n"
          : filename === "goals.yaml"
            ? "# Your goals — short-term, medium-term, long-term\n# Edit this file to add your goals.\n"
            : "# FAQ — frequently asked questions about you\n# items:\n#   - question: \"What do you do?\"\n#     answer: \"...\"\n";
    await writeFile(filePath, comment, "utf-8");
    filesCreated.push(filename);
    console.log(`  ✔ Created ${filename} (template)`);
  }

  return {
    filesCreated,
    warnings,
    profile: {
      name: user.name ?? user.login,
      username: user.login,
      repos: repos.length,
      languages: languageNames,
    },
  };
}
