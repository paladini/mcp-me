import type { GeneratorSource, PartialProfile } from "./types.js";

interface CratesIoCrate {
  id: string;
  name: string;
  description: string;
  downloads: number;
  recent_downloads: number;
  max_version: string;
  repository: string | null;
  homepage: string | null;
  documentation: string | null;
  keywords: string[];
  categories: string[];
  created_at: string;
  updated_at: string;
}

export const cratesioGenerator: GeneratorSource = {
  name: "cratesio",
  flag: "crates",
  flagArg: "<username>",
  description: "Crates.io published Rust packages",
  category: "packages",

  async generate(config): Promise<PartialProfile> {
    const userId = config.username as string;
    if (!userId) throw new Error("Crates.io user ID is required");

    console.log(`  [Crates.io] Fetching crates for user ${userId}...`);
    const resp = await fetch(
      `https://crates.io/api/v1/crates?user_id=${userId}&per_page=100&sort=downloads`,
      { headers: { Accept: "application/json", "User-Agent": "mcp-me-generator" } },
    );
    if (!resp.ok) throw new Error(`Crates.io API error: ${resp.status}`);
    const data = (await resp.json()) as { crates: CratesIoCrate[] };
    const crates = data.crates ?? [];
    console.log(`  [Crates.io] Found ${crates.length} crates.`);

    const totalDownloads = crates.reduce((sum, c) => sum + c.downloads, 0);

    const projects = crates.slice(0, 20).map((c) => ({
      name: c.name,
      description: c.description || "Rust crate",
      url: c.homepage ?? c.documentation ?? `https://crates.io/crates/${c.name}`,
      repo_url: c.repository ?? undefined,
      status: "active" as const,
      technologies: ["rust", ...c.keywords.slice(0, 5)],
      start_date: c.created_at.slice(0, 10),
      category: "crate",
    }));

    const identity: PartialProfile["identity"] = {
      contact: {
        social: [{ platform: "crates.io", url: `https://crates.io/users/${userId}`, username: userId }],
      },
    };

    const skills = { languages: [{ name: "Rust", category: "programming", description: `${crates.length} published crate(s) on crates.io` }] };

    const faq: PartialProfile["faq"] = crates.length > 0
      ? [{
          question: "Do you publish Rust crates?",
          answer: `Yes, ${crates.length} crate(s) on crates.io with ${totalDownloads.toLocaleString()} total downloads. Notable: ${crates.slice(0, 3).map((c) => c.name).join(", ")}.`,
          category: "open-source",
        }]
      : [];

    return { identity, skills, projects, faq };
  },
};
