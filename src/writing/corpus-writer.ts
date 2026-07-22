import { mkdir, writeFile, readFile } from "node:fs/promises";
import { join } from "node:path";
import { stringify as toYaml } from "yaml";
import type { CorpusArticle } from "./types.js";
import type { CorpusManifest, CorpusManifestEntry } from "../schema/writing.js";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
}

function countWords(text: string): number {
  return text.split(/\s+/).filter(Boolean).length;
}

function buildFrontmatter(article: CorpusArticle): string {
  const lines = [
    "---",
    `title: ${JSON.stringify(article.title)}`,
    `source: ${JSON.stringify(article.source)}`,
  ];
  if (article.url) lines.push(`url: ${JSON.stringify(article.url)}`);
  if (article.date) lines.push(`date: ${JSON.stringify(article.date)}`);
  if (article.tags?.length) {
    lines.push(`tags: [${article.tags.map((t) => JSON.stringify(t)).join(", ")}]`);
  }
  lines.push(`format_profile: ${JSON.stringify(article.formatProfile)}`);
  if (article.tone?.length) {
    lines.push(`tone: [${article.tone.map((t) => JSON.stringify(t)).join(", ")}]`);
  }
  lines.push(`word_count: ${countWords(article.content)}`);
  lines.push("---");
  return lines.join("\n");
}

function articleFilename(article: CorpusArticle): string {
  const datePrefix = article.date?.slice(0, 10) ?? "undated";
  return `${datePrefix}-${slugify(article.title)}.md`;
}

/**
 * Write corpus articles to writing/corpus/ and update _manifest.yaml.
 */
export async function writeCorpusArticles(
  profileDir: string,
  articles: CorpusArticle[],
): Promise<number> {
  if (articles.length === 0) return 0;

  const corpusDir = join(profileDir, "writing", "corpus");
  await mkdir(corpusDir, { recursive: true });

  const entries: CorpusManifestEntry[] = [];

  for (const article of articles) {
    if (!article.content?.trim()) continue;

    const filename = articleFilename(article);
    const filePath = join(corpusDir, filename);
    const markdown = `${buildFrontmatter(article)}\n\n${article.content.trim()}\n`;
    await writeFile(filePath, markdown, "utf-8");

    entries.push({
      filename,
      title: article.title,
      source: article.source,
      url: article.url,
      date: article.date,
      tags: article.tags,
      format_profile: article.formatProfile,
      tone: article.tone,
      word_count: countWords(article.content),
    });
  }

  const manifest: CorpusManifest = {
    entries,
    updated_at: new Date().toISOString(),
  };

  await writeFile(join(corpusDir, "_manifest.yaml"), toYaml(manifest, { lineWidth: 120 }), "utf-8");
  return entries.length;
}

/**
 * Rebuild manifest from existing corpus .md files (without re-fetching).
 */
export async function rebuildCorpusManifest(profileDir: string): Promise<number> {
  const { loadWritingBundle } = await import("./corpus-loader.js");
  const bundle = await loadWritingBundle(profileDir);

  const manifest: CorpusManifest = {
    entries: bundle.documents.map((doc) => ({
      filename: doc.filename,
      title: doc.title,
      source: doc.source,
      url: doc.url,
      date: doc.date,
      tags: doc.tags,
      format_profile: doc.formatProfile,
      tone: doc.tone,
      word_count: doc.wordCount,
    })),
    updated_at: new Date().toISOString(),
  };

  const manifestPath = join(profileDir, "writing", "corpus", "_manifest.yaml");
  await writeFile(manifestPath, toYaml(manifest, { lineWidth: 120 }), "utf-8");
  return manifest.entries.length;
}

/** Ensure writing/ template structure exists. */
export async function ensureWritingStructure(profileDir: string): Promise<void> {
  const writingDir = join(profileDir, "writing");
  const corpusDir = join(writingDir, "corpus");
  await mkdir(corpusDir, { recursive: true });

  const stylePath = join(writingDir, "style.yaml");
  try {
    await readFile(stylePath, "utf-8");
  } catch {
    const defaultStyle = {
      default_profile: "personal_blog",
      global_voice: {
        tone: ["conversational", "direct"],
        notes: "Edit this file to describe your writing voice. Add format profiles for different contexts.",
      },
      profiles: {
        personal_blog: {
          format: "blog_post",
          tone: ["conversational", "direct", "humorous"],
          formality: "casual",
          perspective: "first-person",
          typical_length: "800-1500 words",
          corpus_tags: ["blog", "medium", "personal"],
        },
        tech_news: {
          format: "news_article",
          tone: ["informative", "neutral", "concise"],
          formality: "professional",
          perspective: "third-person",
          typical_length: "400-600 words",
          corpus_tags: ["news", "devto", "technical"],
        },
        ironic_thread: {
          format: "social_post",
          tone: ["ironic", "witty", "short"],
          formality: "casual",
          perspective: "first-person",
          typical_length: "280 chars or thread",
          corpus_tags: ["social", "threads"],
        },
      },
    };
    await writeFile(stylePath, toYaml(defaultStyle, { lineWidth: 120 }), "utf-8");
  }

  const manifestPath = join(corpusDir, "_manifest.yaml");
  try {
    await readFile(manifestPath, "utf-8");
  } catch {
    await writeFile(
      manifestPath,
      toYaml({ entries: [], updated_at: new Date().toISOString() }, { lineWidth: 120 }),
      "utf-8",
    );
  }
}
