import { readFile, readdir } from "node:fs/promises";
import { join } from "node:path";
import { parse as parseYaml } from "yaml";
import { ZodError } from "zod";
import {
  writingStyleSchema,
  corpusManifestSchema,
  type WritingStyle,
  type CorpusManifest,
} from "../schema/writing.js";
import type { CorpusDocument, WritingBundle } from "./types.js";

const FRONTMATTER_RE = /^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/;

function parseFrontmatter(content: string): { meta: Record<string, unknown>; body: string } {
  const match = content.match(FRONTMATTER_RE);
  if (!match) {
    return { meta: {}, body: content };
  }
  const meta = parseYaml(match[1]) as Record<string, unknown>;
  return { meta, body: match[2].trim() };
}

function countWords(text: string): number {
  return text.split(/\s+/).filter(Boolean).length;
}

function metaToDocument(filename: string, meta: Record<string, unknown>, body: string): CorpusDocument {
  return {
    filename,
    title: String(meta.title ?? filename),
    source: meta.source ? String(meta.source) : undefined,
    url: meta.url ? String(meta.url) : undefined,
    date: meta.date ? String(meta.date) : undefined,
    tags: Array.isArray(meta.tags) ? meta.tags.map(String) : [],
    formatProfile: meta.format_profile ? String(meta.format_profile) : undefined,
    tone: Array.isArray(meta.tone) ? meta.tone.map(String) : [],
    wordCount: typeof meta.word_count === "number" ? meta.word_count : countWords(body),
    body,
  };
}

export async function loadWritingBundle(profileDir: string): Promise<WritingBundle> {
  const errors: string[] = [];
  let style: WritingStyle | null = null;
  let manifest: CorpusManifest | null = null;
  const documents: CorpusDocument[] = [];

  const stylePath = join(profileDir, "writing", "style.yaml");
  try {
    const content = await readFile(stylePath, "utf-8");
    style = writingStyleSchema.parse(parseYaml(content));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
      if (error instanceof ZodError) {
        errors.push(`writing/style.yaml: ${error.issues.map((i) => i.message).join(", ")}`);
      } else {
        errors.push(`writing/style.yaml: ${(error as Error).message}`);
      }
    }
  }

  const manifestPath = join(profileDir, "writing", "corpus", "_manifest.yaml");
  try {
    const content = await readFile(manifestPath, "utf-8");
    manifest = corpusManifestSchema.parse(parseYaml(content));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
      if (error instanceof ZodError) {
        errors.push(`writing/corpus/_manifest.yaml: ${error.issues.map((i) => i.message).join(", ")}`);
      } else {
        errors.push(`writing/corpus/_manifest.yaml: ${(error as Error).message}`);
      }
    }
  }

  const corpusDir = join(profileDir, "writing", "corpus");
  try {
    const files = await readdir(corpusDir);
    for (const file of files) {
      if (!file.endsWith(".md")) continue;
      try {
        const content = await readFile(join(corpusDir, file), "utf-8");
        const { meta, body } = parseFrontmatter(content);
        documents.push(metaToDocument(file, meta, body));
      } catch (error) {
        errors.push(`writing/corpus/${file}: ${(error as Error).message}`);
      }
    }
  } catch {
    // corpus dir may not exist yet
  }

  return {
    style,
    manifest,
    documents,
    valid: errors.length === 0,
    errors,
  };
}

export function filterDocumentsByProfile(
  documents: CorpusDocument[],
  profile?: string,
): CorpusDocument[] {
  if (!profile) return documents;
  return documents.filter((d) => d.formatProfile === profile);
}

export function searchCorpus(documents: CorpusDocument[], query: string): CorpusDocument[] {
  const lower = query.toLowerCase();
  return documents.filter(
    (d) =>
      d.title.toLowerCase().includes(lower) ||
      d.body.toLowerCase().includes(lower) ||
      d.tags.some((t) => t.toLowerCase().includes(lower)),
  );
}

export function getWritingReferences(
  documents: CorpusDocument[],
  topic: string,
  profile?: string,
  limit = 3,
): CorpusDocument[] {
  const filtered = filterDocumentsByProfile(documents, profile);
  const topicLower = topic.toLowerCase();
  const words = topicLower.split(/\s+/).filter(Boolean);

  const scored = filtered.map((doc) => {
    const haystack = `${doc.title} ${doc.body} ${doc.tags.join(" ")}`.toLowerCase();
    let score = 0;
    for (const word of words) {
      if (haystack.includes(word)) score += 1;
    }
    return { doc, score };
  });

  return scored
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ doc }) => doc);
}

export function extractSamples(documents: CorpusDocument[], profile?: string, limit = 3): string[] {
  const filtered = filterDocumentsByProfile(documents, profile);
  return filtered.slice(0, limit).map((d) => {
    const excerpt = d.body.slice(0, 500);
    return `## ${d.title}\n${excerpt}${d.body.length > 500 ? "…" : ""}`;
  });
}
