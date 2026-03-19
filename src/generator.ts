import { access, mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { stringify as toYaml } from "yaml";
import type { GenerateOptions, GenerateResult, PartialProfile } from "./generators/types.js";
import { generators } from "./generators/index.js";
import { mergeProfiles } from "./generators/merger.js";

export type { GenerateOptions, GenerateResult };

const OPTIONAL_FILE_HEADERS: Record<string, string> = {
  "interests.yaml": "# Your interests — hobbies, music, books, movies, food\nhobbies: []\n",
  "personality.yaml": "# Your personality — traits, values, work style\ntraits: []\n",
  "goals.yaml": "# Your goals — short-term, medium-term, long-term\nshort_term: []\n",
};

/**
 * Returns true if the file should be written (either it doesn't exist, or force is true).
 * Logs a skip warning when an existing file is bypassed.
 */
async function shouldWriteFile(filePath: string, force: boolean): Promise<boolean> {
  if (force) return true;
  try {
    await access(filePath);
    const filename = filePath.split("/").pop() ?? filePath;
    console.log(`  ⚠ Skipping ${filename} (already exists, use --force to overwrite)`);
    return false;
  } catch {
    return true;
  }
}

/**
 * Convert a merged PartialProfile into YAML files on disk.
 */
async function writeProfile(
  directory: string,
  profile: PartialProfile,
  filesCreated: string[],
  force: boolean = false,
): Promise<void> {
  await mkdir(directory, { recursive: true });

  const filesToWrite: [string, unknown][] = [];

  if (profile.identity) filesToWrite.push(["identity.yaml", profile.identity]);
  if (profile.skills) filesToWrite.push(["skills.yaml", profile.skills]);
  if (profile.projects?.length) filesToWrite.push(["projects.yaml", { projects: profile.projects }]);
  if (profile.career?.experience?.length) filesToWrite.push(["career.yaml", profile.career]);
  // Plugin config now lives in .mcp-me.yaml — don't generate plugins.yaml
  if (profile.faq?.length) {
    filesToWrite.push(["faq.yaml", { items: profile.faq }]);
  }
  if (profile.interests?.topics?.length || profile.interests?.hobbies?.length) {
    filesToWrite.push(["interests.yaml", profile.interests]);
  }

  for (const [filename, data] of filesToWrite) {
    const filePath = join(directory, filename);
    if (!(await shouldWriteFile(filePath, force))) continue;
    const yamlContent = toYaml(data, { lineWidth: 120 });
    await writeFile(filePath, yamlContent, "utf-8");
    filesCreated.push(filename);
    console.log(`  ✔ Generated ${filename}`);
  }

  // Create template files for any missing optional categories
  const createdSet = new Set(filesCreated);
  for (const [filename, header] of Object.entries(OPTIONAL_FILE_HEADERS)) {
    if (!createdSet.has(filename)) {
      const filePath = join(directory, filename);
      if (!(await shouldWriteFile(filePath, force))) continue;
      await writeFile(filePath, header, "utf-8");
      filesCreated.push(filename);
      console.log(`  ✔ Created ${filename} (template)`);
    }
  }
}

/**
 * Generate a profile from multiple data sources.
 * Sources run in parallel when possible. Results are merged into unified YAML files.
 *
 * Usage:
 *   generateProfile({ directory: "./profile", github: "user", stackoverflow: "123", devto: "user" })
 */
export async function generateProfile(options: GenerateOptions): Promise<GenerateResult> {
  const warnings: string[] = [];

  // Match CLI flags to registered generators
  const tasks = generators
    .filter((g) => options[g.flag])
    .map((g) => ({
      name: g.name,
      run: () => g.generate({ username: options[g.flag] as string, email: options[g.flag] as string, userId: options[g.flag] as string, handle: options[g.flag] as string, packages: typeof options[g.flag] === "string" ? (options[g.flag] as string).split(",") : [] }),
    }));

  if (tasks.length === 0) {
    throw new Error("At least one data source is required. Use --help to see available sources.");
  }

  if (options.github && !process.env.GITHUB_TOKEN) {
    warnings.push("No GITHUB_TOKEN set. Using unauthenticated GitHub API (60 requests/hour limit).");
  }

  const sources = tasks.map((t) => t.name);

  // Run generators sequentially (avoids rate limits, keeps logs readable, graceful error handling)
  const partials: PartialProfile[] = [];
  for (const task of tasks) {
    try {
      partials.push(await task.run());
    } catch (error) {
      const msg = (error as Error).message;
      // Provide actionable hints for common network errors
      if (msg.includes("fetch failed") || msg.includes("SELF_SIGNED_CERT")) {
        warnings.push(
          `[${task.name}] Failed: Network error (${(error as Error).cause ? ((error as Error).cause as { code?: string }).code ?? "fetch failed" : "fetch failed"}). ` +
          `If you're behind a corporate proxy/VPN, try: NODE_TLS_REJECT_UNAUTHORIZED=0 mcp-me generate <dir>`
        );
      } else {
        warnings.push(`[${task.name}] Failed: ${msg}`);
      }
    }
  }

  if (partials.length === 0) {
    throw new Error("All data sources failed. Check the warnings above.");
  }

  // Merge all partial profiles
  console.log(`\n  Merging data from ${partials.length} source(s)...`);
  const merged = mergeProfiles(partials);

  // Write to disk
  const filesCreated: string[] = [];
  await writeProfile(options.directory, merged, filesCreated, options.force ?? false);

  return {
    filesCreated,
    warnings,
    sources,
    summary: {
      name: merged.identity?.name,
      skills: (merged.skills?.languages?.length ?? 0) + (merged.skills?.technical?.length ?? 0),
      projects: merged.projects?.length ?? 0,
      sources,
    },
  };
}

/**
 * Legacy wrapper for backward compatibility.
 * @deprecated Use `generateProfile` instead.
 */
export async function generateFromGitHub(options: {
  github?: string;
  directory: string;
  force?: boolean;
}): Promise<GenerateResult> {
  return generateProfile({
    directory: options.directory,
    github: options.github,
    force: options.force,
  });
}
