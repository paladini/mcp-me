/**
 * Bitbucket Generator
 *
 * Fetches your Bitbucket profile and public repositories.
 *
 * @flag --bitbucket <username>
 * @example mcp-me generate ./profile --bitbucket atlassian
 * @auth None required (public API)
 * @api https://developer.atlassian.com/cloud/bitbucket/rest/
 * @data identity, projects (repos), skills (languages)
 */
import type { GeneratorSource, PartialProfile } from "./types.js";

interface BBRepo {
  name: string;
  full_name: string;
  description: string;
  language: string;
  links: { html: { href: string } };
  created_on: string;
  updated_on: string;
  is_private: boolean;
}

export const bitbucketGenerator: GeneratorSource = {
  name: "bitbucket",
  flag: "bitbucket",
  flagArg: "<username>",
  description: "Bitbucket repos, languages, profile",
  category: "code",

  async generate(config): Promise<PartialProfile> {
    const username = config.username as string;
    if (!username) throw new Error("Bitbucket username is required");

    console.log(`  [Bitbucket] Fetching repos for ${username}...`);
    const resp = await fetch(
      `https://api.bitbucket.org/2.0/repositories/${username}?pagelen=100&sort=-updated_on`,
      { headers: { Accept: "application/json", "User-Agent": "mcp-me-generator" } },
    );
    if (!resp.ok) throw new Error(`Bitbucket API error: ${resp.status} ${resp.statusText}`);
    const data = (await resp.json()) as { values: BBRepo[] };
    const repos = (data.values ?? []).filter((r) => !r.is_private);
    console.log(`  [Bitbucket] Found ${repos.length} public repositories.`);

    const langCounts: Record<string, number> = {};
    for (const r of repos) {
      if (r.language) langCounts[r.language] = (langCounts[r.language] ?? 0) + 1;
    }

    const languages = Object.entries(langCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([lang, count]) => ({
        name: lang,
        category: "programming",
        description: `Used in ${count} Bitbucket repo(s)`,
      }));

    const projects = repos.slice(0, 20).map((r) => ({
      name: r.name,
      description: r.description || "No description",
      url: r.links.html.href,
      status: "active" as const,
      technologies: r.language ? [r.language] : [],
      start_date: r.created_on?.slice(0, 10),
      category: "open-source",
    }));

    const identity: PartialProfile["identity"] = {
      contact: {
        social: [{ platform: "bitbucket", url: `https://bitbucket.org/${username}`, username }],
      },
    };

    return { identity, skills: { languages }, projects };
  },
};
