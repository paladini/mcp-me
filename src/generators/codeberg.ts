/**
 * Codeberg Generator
 *
 * Fetches your Codeberg (Gitea-based) profile and repositories via the public REST API.
 *
 * @flag --codeberg <username>
 * @example mcp-me generate ./profile --codeberg myuser
 * @auth None required (public API)
 * @api https://codeberg.org/api/v1/users/<username>
 * @data identity, skills (languages), projects (repos)
 */
import type { GeneratorSource, PartialProfile } from "./types.js";

interface CodebergUser {
  login: string;
  full_name: string;
  description: string;
  website: string;
  location: string;
  avatar_url: string;
  followers_count: number;
  following_count: number;
  created: string;
}

interface CodebergRepo {
  name: string;
  full_name: string;
  description: string;
  html_url: string;
  website: string;
  language: string;
  stars_count: number;
  forks_count: number;
  fork: boolean;
  archived: boolean;
  topics: string[];
  created_at: string;
  updated_at: string;
}

export const codebergGenerator: GeneratorSource = {
  name: "codeberg",
  flag: "codeberg",
  flagArg: "<username>",
  description: "Codeberg profile, repositories, languages",
  category: "code",

  async generate(config): Promise<PartialProfile> {
    const username = config.username as string;
    if (!username) throw new Error("Codeberg username is required");

    console.log(`  [Codeberg] Fetching profile for ${username}...`);

    const userResp = await fetch(`https://codeberg.org/api/v1/users/${username}`, {
      headers: { Accept: "application/json", "User-Agent": "mcp-me-generator" },
    });
    if (!userResp.ok) throw new Error(`Codeberg API error: ${userResp.status} ${userResp.statusText}`);
    const user = (await userResp.json()) as CodebergUser;

    console.log(`  [Codeberg] Fetching repositories...`);
    const reposResp = await fetch(
      `https://codeberg.org/api/v1/users/${username}/repos?sort=updated&limit=50`,
      { headers: { Accept: "application/json", "User-Agent": "mcp-me-generator" } },
    );
    if (!reposResp.ok) throw new Error(`Codeberg repos error: ${reposResp.status}`);
    const allRepos = (await reposResp.json()) as CodebergRepo[];
    const repos = allRepos.filter((r) => !r.fork);

    console.log(`  [Codeberg] Found ${repos.length} non-fork repositories.`);

    const identity: PartialProfile["identity"] = {
      ...(user.full_name ? { name: user.full_name } : {}),
      ...(user.description ? { bio: user.description } : {}),
      contact: {
        social: [{ platform: "codeberg", url: `https://codeberg.org/${username}`, username }],
        ...(user.website ? { website: user.website } : {}),
      },
    };

    if (user.location) {
      identity.location = { city: user.location };
    }

    // Languages
    const langCounts: Record<string, { count: number; stars: number }> = {};
    for (const repo of repos) {
      if (repo.language) {
        const existing = langCounts[repo.language] ?? { count: 0, stars: 0 };
        existing.count++;
        existing.stars += repo.stars_count;
        langCounts[repo.language] = existing;
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
        description: `Used in ${stats.count} Codeberg repo(s)`,
      }));

    // Projects
    const projects = repos
      .filter((r) => !r.archived)
      .sort((a, b) => b.stars_count - a.stars_count)
      .slice(0, 20)
      .map((r) => ({
        name: r.name,
        description: r.description || "No description",
        repo_url: r.html_url,
        status: "active",
        technologies: [r.language, ...(r.topics ?? [])].filter(Boolean),
        start_date: r.created_at?.slice(0, 10),
        category: "open-source",
        ...(r.website ? { url: r.website } : {}),
        ...(r.stars_count > 0 ? { stars: r.stars_count } : {}),
      }));

    const faq: PartialProfile["faq"] = [
      {
        question: "Are you on Codeberg?",
        answer: `Yes, I'm ${user.full_name || username} on Codeberg with ${repos.length} repositories and ${user.followers_count} followers.`,
        category: "code",
      },
    ];

    return {
      identity,
      skills: { languages },
      projects,
      faq,
    };
  },
};
