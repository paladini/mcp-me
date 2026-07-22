import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { mkdir, writeFile, rm } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { createMcpMeServer } from "../src/server.js";
import { loadWritingBundle } from "../src/writing/corpus-loader.js";
import { getProfileCompleteness } from "../src/writing/completeness.js";
import { loadProfile } from "../src/loader.js";

const TEST_DIR = join(tmpdir(), `mcp-me-mcp-${Date.now()}`);

async function writeCompleteProfile(dir: string): Promise<void> {
  await writeFile(
    join(dir, "identity.yaml"),
    `name: "Alex Writer"
headline: "Engineer · author"
bio: "Full-stack engineer who writes about TypeScript."
location:
  country: "Brazil"
contact:
  social:
    - platform: github
      url: https://github.com/alex
`,
    "utf-8",
  );
  await writeFile(
    join(dir, "career.yaml"),
    `experience:
  - title: "Senior Engineer"
    company: "Acme"
    start_date: "2020-01"
    current: true
`,
    "utf-8",
  );
  await writeFile(
    join(dir, "skills.yaml"),
    `technical:
  - name: TypeScript
    proficiency: advanced
languages:
  - name: Rust
    proficiency: intermediate
`,
    "utf-8",
  );
  await writeFile(
    join(dir, "interests.yaml"),
    `hobbies: [reading]
topics: [typescript, rust]
`,
    "utf-8",
  );
  await writeFile(
    join(dir, "personality.yaml"),
    `traits: [curious]
values: [honesty]
`,
    "utf-8",
  );
  await writeFile(
    join(dir, "goals.yaml"),
    `short_term:
  - title: Learn Rust
`,
    "utf-8",
  );
  await writeFile(
    join(dir, "projects.yaml"),
    `projects:
  - name: mcp-me
    description: Personal MCP server
    status: active
`,
    "utf-8",
  );
  await writeFile(
    join(dir, "faq.yaml"),
    `items:
  - question: What do you do?
    answer: I build developer tools.
`,
    "utf-8",
  );

  const writingDir = join(dir, "writing", "corpus");
  await mkdir(writingDir, { recursive: true });
  await writeFile(
    join(dir, "writing", "style.yaml"),
    `default_profile: personal_blog
profiles:
  personal_blog:
    format: blog_post
    tone: [conversational]
`,
    "utf-8",
  );
  await writeFile(
    join(writingDir, "post.md"),
    `---
title: "TypeScript Tips"
source: medium
format_profile: personal_blog
tags: [typescript]
word_count: 5
---

Here are some TypeScript tips.
`,
    "utf-8",
  );
  await writeFile(
    join(writingDir, "_manifest.yaml"),
    `entries:
  - filename: post.md
    title: TypeScript Tips
    format_profile: personal_blog
`,
    "utf-8",
  );
}

describe("MCP server integration", () => {
  beforeEach(async () => {
    await mkdir(TEST_DIR, { recursive: true });
    await writeCompleteProfile(TEST_DIR);
  });

  afterEach(async () => {
    await rm(TEST_DIR, { recursive: true, force: true });
  });

  it("creates server with complete profile and writing bundle", async () => {
    const server = await createMcpMeServer(TEST_DIR);
    expect(server).toBeDefined();
  });

  it("loads writing bundle with documents", async () => {
    const writing = await loadWritingBundle(TEST_DIR);
    expect(writing.documents).toHaveLength(1);
    expect(writing.style?.default_profile).toBe("personal_blog");
  });

  it("computes profile completeness", async () => {
    const profile = await loadProfile(TEST_DIR);
    const writing = await loadWritingBundle(TEST_DIR);
    const completeness = getProfileCompleteness(profile, writing);
    expect(completeness.overall_percent).toBeGreaterThan(50);
    expect(completeness.domains.find((d) => d.domain === "writing")?.filled).toBe(true);
  });
});
