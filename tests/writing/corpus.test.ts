import { describe, it, expect } from "vitest";
import {
  loadWritingBundle,
  searchCorpus,
  getWritingReferences,
} from "../../src/writing/corpus-loader.js";
import { analyzeWritingStyle, compareProfiles } from "../../src/writing/analyzer.js";
import { writeCorpusArticles } from "../../src/writing/corpus-writer.js";
import { mkdir, writeFile, rm } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";

const DIR = join(tmpdir(), `writing-corpus-${Date.now()}`);

describe("writing corpus loader", () => {
  it("parses frontmatter and searches corpus", async () => {
    await mkdir(join(DIR, "writing", "corpus"), { recursive: true });
    await writeFile(
      join(DIR, "writing", "style.yaml"),
      "default_profile: personal_blog\nprofiles:\n  personal_blog:\n    format: blog_post\n",
      "utf-8",
    );
    await writeFile(
      join(DIR, "writing", "corpus", "a.md"),
      `---
title: Rust for beginners
source: medium
format_profile: personal_blog
tags: [rust]
word_count: 4
---
Learning Rust is fun.
`,
      "utf-8",
    );

    const bundle = await loadWritingBundle(DIR);
    expect(bundle.documents[0].title).toBe("Rust for beginners");

    const hits = searchCorpus(bundle.documents, "Rust");
    expect(hits).toHaveLength(1);

    const refs = getWritingReferences(bundle.documents, "Rust", "personal_blog");
    expect(refs[0].body).toContain("Learning Rust");

    await rm(DIR, { recursive: true, force: true });
  });
});

describe("writing analyzer", () => {
  it("analyzes documents and compares profiles", () => {
    const docs = [
      {
        filename: "a.md",
        title: "Blog",
        formatProfile: "personal_blog",
        tags: [],
        tone: [],
        wordCount: 10,
        body: "I think this is great. I love writing.",
      },
      {
        filename: "b.md",
        title: "News",
        formatProfile: "tech_news",
        tags: [],
        tone: [],
        wordCount: 8,
        body: "The company announced results today.",
      },
    ];

    const analysis = analyzeWritingStyle(docs, { default_profile: "personal_blog" }, "personal_blog");
    expect(analysis.stats.document_count).toBe(1);
    expect(analysis.stats.first_person_ratio).toBeGreaterThan(0);

    const comparison = compareProfiles(docs, "personal_blog", "tech_news");
    expect(comparison.stats_a.document_count).toBe(1);
    expect(comparison.stats_b.document_count).toBe(1);
  });
});

describe("corpus writer", () => {
  it("writes articles and manifest", async () => {
    const dir = join(tmpdir(), `corpus-write-${Date.now()}`);
    const count = await writeCorpusArticles(dir, [
      {
        title: "My Post",
        content: "Hello from the corpus writer.",
        source: "local",
        formatProfile: "personal_blog",
        date: "2024-01-15",
      },
    ]);
    expect(count).toBe(1);

    const bundle = await loadWritingBundle(dir);
    expect(bundle.documents).toHaveLength(1);

    await rm(dir, { recursive: true, force: true });
  });
});
