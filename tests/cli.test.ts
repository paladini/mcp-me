import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { mkdir, writeFile, rm, access } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { initProfileDirectory } from "../src/init-profile.js";
import { loadProfile } from "../src/loader.js";
import { loadWritingBundle } from "../src/writing/corpus-loader.js";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const TEMPLATES_DIR = join(__dirname, "..", "templates");

describe("CLI profile workflows", () => {
  const profileDir = join(tmpdir(), `mcp-me-cli-${Date.now()}`);

  beforeEach(async () => {
    await mkdir(profileDir, { recursive: true });
  });

  afterEach(async () => {
    await rm(profileDir, { recursive: true, force: true });
  });

  it("init copies YAML templates including writing/", async () => {
    const result = await initProfileDirectory({
      targetDir: profileDir,
      templatesDir: TEMPLATES_DIR,
      logger: { log: () => {} },
    });

    expect(result.copied).toBeGreaterThan(0);
    await expect(access(join(profileDir, "identity.yaml"))).resolves.toBeUndefined();
    await expect(access(join(profileDir, "writing", "style.yaml"))).resolves.toBeUndefined();
    await expect(access(join(profileDir, "writing", "corpus", "_manifest.yaml"))).resolves.toBeUndefined();
  });

  it("validate loads profile with extended identity fields", async () => {
    await writeFile(
      join(profileDir, "identity.yaml"),
      `name: "Jane Doe"
headline: "Engineer · writer"
bio: "Test bio"
physical:
  height: "1.70m"
`,
      "utf-8",
    );
    await writeFile(join(profileDir, "interests.yaml"), "topics:\n  - rust\n  - music\n", "utf-8");

    const profile = await loadProfile(profileDir);
    expect(profile.valid).toBe(true);
    expect(profile.data.identity).toMatchObject({ headline: "Engineer · writer" });
  });

  it("loadWritingBundle reads style and corpus documents", async () => {
    await mkdir(join(profileDir, "writing", "corpus"), { recursive: true });
    await writeFile(
      join(profileDir, "writing", "style.yaml"),
      "default_profile: personal_blog\nprofiles:\n  personal_blog:\n    format: blog_post\n",
      "utf-8",
    );
    await writeFile(
      join(profileDir, "writing", "corpus", "test-post.md"),
      `---
title: "Hello World"
source: "local"
format_profile: personal_blog
tags: [test]
word_count: 3
---

Hello world test.
`,
      "utf-8",
    );

    const bundle = await loadWritingBundle(profileDir);
    expect(bundle.valid).toBe(true);
    expect(bundle.style?.default_profile).toBe("personal_blog");
    expect(bundle.documents).toHaveLength(1);
    expect(bundle.documents[0].title).toBe("Hello World");
  });
});
