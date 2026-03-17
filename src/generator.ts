import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { stringify as toYaml } from "yaml";
import type { GenerateOptions, GenerateResult, PartialProfile } from "./generators/types.js";
import { githubGenerator } from "./generators/github.js";
import { stackoverflowGenerator } from "./generators/stackoverflow.js";
import { devtoGenerator } from "./generators/devto.js";
import { npmGenerator, pypiGenerator } from "./generators/npm.js";
import { mediumGenerator } from "./generators/medium.js";
import { wakatimeGenerator } from "./generators/wakatime.js";
import { mastodonGenerator } from "./generators/mastodon.js";
import { letterboxdGenerator } from "./generators/letterboxd.js";
import { hackernewsGenerator } from "./generators/hackernews.js";
import { gitlabGenerator } from "./generators/gitlab.js";
import { mergeProfiles } from "./generators/merger.js";

export type { GenerateOptions, GenerateResult };

const OPTIONAL_FILE_HEADERS: Record<string, string> = {
  "interests.yaml": "# Your interests — hobbies, music, books, movies, food\n# Edit this file to add your personal interests.\n",
  "personality.yaml": "# Your personality — traits, values, work style\n# Edit this file to describe yourself.\n",
  "goals.yaml": "# Your goals — short-term, medium-term, long-term\n# Edit this file to add your goals.\n",
};

/**
 * Convert a merged PartialProfile into YAML files on disk.
 */
async function writeProfile(
  directory: string,
  profile: PartialProfile,
  filesCreated: string[],
): Promise<void> {
  await mkdir(directory, { recursive: true });

  const filesToWrite: [string, unknown][] = [];

  if (profile.identity) filesToWrite.push(["identity.yaml", profile.identity]);
  if (profile.skills) filesToWrite.push(["skills.yaml", profile.skills]);
  if (profile.projects?.length) filesToWrite.push(["projects.yaml", { projects: profile.projects }]);
  if (profile.career?.experience?.length) filesToWrite.push(["career.yaml", profile.career]);
  if (profile.plugins && Object.keys(profile.plugins).length > 0) {
    filesToWrite.push(["plugins.yaml", { plugins: profile.plugins }]);
  }
  if (profile.faq?.length) {
    filesToWrite.push(["faq.yaml", { items: profile.faq }]);
  }
  if (profile.interests?.topics?.length || profile.interests?.hobbies?.length) {
    filesToWrite.push(["interests.yaml", profile.interests]);
  }

  for (const [filename, data] of filesToWrite) {
    const filePath = join(directory, filename);
    const yamlContent = toYaml(data, { lineWidth: 120 });
    await writeFile(filePath, yamlContent, "utf-8");
    filesCreated.push(filename);
    console.log(`  ✔ Generated ${filename}`);
  }

  // Create template files for any missing optional categories
  const createdSet = new Set(filesCreated);
  for (const [filename, header] of Object.entries(OPTIONAL_FILE_HEADERS)) {
    if (!createdSet.has(filename)) {
      await writeFile(join(directory, filename), header, "utf-8");
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
  const sources: string[] = [];

  const sourceKeys: (keyof GenerateOptions)[] = [
    "github", "gitlab", "stackoverflow", "devto", "medium",
    "hackernews", "npm", "pypi", "wakatime", "mastodon", "letterboxd",
  ];
  if (!sourceKeys.some((k) => options[k])) {
    throw new Error("At least one data source is required. Use --help to see available sources.");
  }

  if (options.github && !process.env.GITHUB_TOKEN) {
    warnings.push("No GITHUB_TOKEN set. Using unauthenticated GitHub API (60 requests/hour limit).");
  }

  // Build list of generators to run (lazy — functions, not promises)
  const tasks: { name: string; run: () => Promise<PartialProfile> }[] = [];

  if (options.github) {
    tasks.push({ name: "github", run: () => githubGenerator.generate({ username: options.github! }) });
  }
  if (options.stackoverflow) {
    tasks.push({ name: "stackoverflow", run: () => stackoverflowGenerator.generate({ userId: options.stackoverflow! }) });
  }
  if (options.devto) {
    tasks.push({ name: "devto", run: () => devtoGenerator.generate({ username: options.devto! }) });
  }
  if (options.npm) {
    tasks.push({ name: "npm", run: () => npmGenerator.generate({ username: options.npm! }) });
  }
  if (options.pypi) {
    tasks.push({ name: "pypi", run: () => pypiGenerator.generate({ packages: options.pypi!.split(",") }) });
  }
  if (options.medium) {
    tasks.push({ name: "medium", run: () => mediumGenerator.generate({ username: options.medium! }) });
  }
  if (options.wakatime) {
    tasks.push({ name: "wakatime", run: () => wakatimeGenerator.generate({ username: options.wakatime! }) });
  }
  if (options.mastodon) {
    tasks.push({ name: "mastodon", run: () => mastodonGenerator.generate({ handle: options.mastodon! }) });
  }
  if (options.letterboxd) {
    tasks.push({ name: "letterboxd", run: () => letterboxdGenerator.generate({ username: options.letterboxd! }) });
  }
  if (options.hackernews) {
    tasks.push({ name: "hackernews", run: () => hackernewsGenerator.generate({ username: options.hackernews! }) });
  }
  if (options.gitlab) {
    tasks.push({ name: "gitlab", run: () => gitlabGenerator.generate({ username: options.gitlab! }) });
  }
  sources.push(...tasks.map((t) => t.name));

  // Run generators sequentially (avoids rate limits, keeps logs readable, graceful error handling)
  const partials: PartialProfile[] = [];
  for (const task of tasks) {
    try {
      partials.push(await task.run());
    } catch (error) {
      warnings.push(`[${task.name}] Failed: ${(error as Error).message}`);
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
  await writeProfile(options.directory, merged, filesCreated);

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
