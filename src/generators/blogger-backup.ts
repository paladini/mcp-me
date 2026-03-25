/**
 * Blogger Backup Generator
 *
 * Reads a Blogger XML export file from disk and imports authored posts into
 * `projects.yaml` as written content entries.
 *
 * How to get your Blogger export:
 *   1. Open Blogger and select your blog
 *   2. Go to Settings -> Manage blog
 *   3. Click "Back up content"
 *   4. Download the XML file and pass its path to this generator
 *
 * Optional author filters can be appended after `::` as a comma-separated list.
 * This is useful for multi-author blogs.
 *
 * @flag --blogger-backup <xml-path[::author1,author2,...]>
 * @example mcp-me generate ./profile --blogger-backup ~/Downloads/blog-2026-03-24.xml
 * @example mcp-me generate ./profile --blogger-backup "~/Downloads/blog.xml::fernandopalad@gmail.com,fnpaladini@gmail.com,Fernando Paladini"
 * @auth Local file (Blogger XML export)
 * @data identity (blog URL), skills (labels), projects (posts), interests, faq
 */
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import type { GeneratorSource, PartialProfile } from "./types.js";
import { rssHtmlToText, summarizeText } from "../utils/rss.js";

interface BloggerAuthor {
  name?: string;
  email?: string;
}

interface BloggerPost {
  title: string;
  url?: string;
  published?: string;
  content: string;
  labels: string[];
  authors: BloggerAuthor[];
}

function decodeXmlEntities(value: string): string {
  return value
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&#x([0-9a-f]+);/gi, (_, hex: string) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, dec: string) => String.fromCodePoint(parseInt(dec, 10)))
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, "&")
    .trim();
}

function normalizeAuthorValue(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function parseBloggerBackupInput(rawValue: string): { xmlPath: string; authorFilters: string[] } {
  const [pathPart, filtersPart] = rawValue.split("::", 2);
  const xmlPath = pathPart?.trim();
  if (!xmlPath) throw new Error("Path to Blogger XML export is required");

  const authorFilters = (filtersPart ?? "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);

  return { xmlPath, authorFilters };
}

function readTag(block: string, tagName: string): string | undefined {
  const match = block.match(new RegExp(`<${tagName}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${tagName}>`, "i"));
  if (!match?.[1]) return undefined;
  return decodeXmlEntities(match[1]);
}

function parseAttributes(raw: string): Record<string, string> {
  const attributes: Record<string, string> = {};
  const regex = /([a-zA-Z_:.-]+)=("([^"]*)"|'([^']*)')/g;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(raw)) !== null) {
    const [, key, , doubleQuoted, singleQuoted] = match;
    attributes[key] = decodeXmlEntities(doubleQuoted ?? singleQuoted ?? "");
  }

  return attributes;
}

function extractEntryBlocks(xml: string): string[] {
  return [...xml.matchAll(/<entry\b[\s\S]*?<\/entry>/gi)].map((match) => match[0]);
}

function extractAuthors(block: string): BloggerAuthor[] {
  return [...block.matchAll(/<author\b[\s\S]*?<\/author>/gi)].map((match) => {
    const authorBlock = match[0];
    return {
      name: readTag(authorBlock, "name"),
      email: readTag(authorBlock, "email"),
    };
  });
}

function extractCategoryAttributes(block: string): Record<string, string>[] {
  return [...block.matchAll(/<category\b([^>]*?)\/?\s*>/gi)].map((match) => parseAttributes(match[1] ?? ""));
}

function isPostEntry(block: string): boolean {
  return extractCategoryAttributes(block).some((attrs) =>
    (attrs.term ?? "").includes("http://schemas.google.com/blogger/2008/kind#post")
  );
}

function extractLabels(block: string): string[] {
  return extractCategoryAttributes(block)
    .filter((attrs) => {
      const term = attrs.term ?? "";
      return Boolean(term) && !term.includes("http://schemas.google.com/blogger/2008/kind#");
    })
    .map((attrs) => attrs.term)
    .filter((value): value is string => Boolean(value));
}

function extractAlternateLink(block: string): string | undefined {
  for (const match of block.matchAll(/<link\b([^>]*?)\/?\s*>/gi)) {
    const attrs = parseAttributes(match[1] ?? "");
    if (attrs.rel === "alternate" && attrs.href) return attrs.href;
  }
  return undefined;
}

function extractFeedLink(xml: string): string | undefined {
  const feedHeader = xml.split(/<entry\b/i, 1)[0] ?? xml;
  return extractAlternateLink(feedHeader);
}

function matchesAuthor(authors: BloggerAuthor[], filters: string[]): boolean {
  if (filters.length === 0) return true;
  const normalizedFilters = new Set(filters.map(normalizeAuthorValue));

  return authors.some((author) => {
    const candidates = [author.name, author.email]
      .filter(Boolean)
      .map((value) => normalizeAuthorValue(value!));
    return candidates.some((candidate) => normalizedFilters.has(candidate));
  });
}

function extractPosts(xml: string, authorFilters: string[]): BloggerPost[] {
  const posts: BloggerPost[] = [];

  for (const entry of extractEntryBlocks(xml)) {
    if (!isPostEntry(entry)) continue;

    const authors = extractAuthors(entry);
    if (!matchesAuthor(authors, authorFilters)) continue;

    const title = readTag(entry, "title") || "Untitled post";
    const rawContent = readTag(entry, "content") || readTag(entry, "summary") || title;
    const content = rssHtmlToText(rawContent) || title;
    const published = readTag(entry, "published") || readTag(entry, "updated");
    const url = extractAlternateLink(entry);
    const labels = extractLabels(entry);

    posts.push({ title, url, published, content, labels, authors });
  }

  return posts.sort((left, right) => (right.published ?? "").localeCompare(left.published ?? ""));
}

export const bloggerBackupGenerator: GeneratorSource = {
  name: "blogger-backup",
  flag: "blogger-backup",
  flagArg: "<xml-path[::author1,author2,...]>",
  description: "Blogger XML export — import authored posts from a local backup",
  category: "writing",

  async generate(config): Promise<PartialProfile> {
    const rawInput = config.username as string;
    const { xmlPath, authorFilters } = parseBloggerBackupInput(rawInput);
    const absolutePath = resolve(xmlPath);

    console.log(`  [Blogger Backup] Reading export from ${absolutePath}...`);

    let xml: string;
    try {
      xml = await readFile(absolutePath, "utf-8");
    } catch {
      throw new Error(
        `Cannot read Blogger export at: ${absolutePath}\n` +
        "  Open Blogger -> Settings -> Manage blog -> Back up content\n" +
        "  Download the XML file, then provide its path to --blogger-backup"
      );
    }

    const posts = extractPosts(xml, authorFilters);
    if (posts.length === 0) {
      throw new Error(
        authorFilters.length > 0
          ? `No Blogger posts matched the provided author filters: ${authorFilters.join(", ")}`
          : "No Blogger post entries were found in the XML export"
      );
    }

    console.log(`  [Blogger Backup] Found ${posts.length} matching post(s).`);

    const tagCounts: Record<string, number> = {};
    for (const post of posts) {
      for (const label of post.labels) {
        tagCounts[label] = (tagCounts[label] ?? 0) + 1;
      }
    }

    const topLabels = Object.entries(tagCounts)
      .sort(([, left], [, right]) => right - left)
      .slice(0, 15);

    const totalWords = posts.reduce((sum, post) => sum + post.content.split(/\s+/).filter(Boolean).length, 0);
    const averageWords = posts.length > 0 ? Math.round(totalWords / posts.length) : 0;
    const feedLink = extractFeedLink(xml);

    const identity: PartialProfile["identity"] = feedLink
      ? {
          contact: {
            social: [{ platform: "blogger", url: feedLink }],
          },
        }
      : undefined;

    const skills: PartialProfile["skills"] = topLabels.length > 0
      ? {
          technical: topLabels.map(([label, count]) => ({
            name: label,
            category: "blog-label",
            description: `Used in ${count} Blogger post(s)`,
          })),
        }
      : undefined;

    const interests: PartialProfile["interests"] = topLabels.length > 0
      ? { topics: topLabels.slice(0, 10).map(([label]) => label) }
      : undefined;

    const faq: PartialProfile["faq"] = [
      {
        question: "Do you have an archived Blogger writing history?",
        answer: `Yes. I imported ${posts.length} Blogger post(s) from an XML backup.${averageWords > 0 ? ` The average post length is about ${averageWords} words.` : ""}`,
        category: "content",
      },
    ];

    if (topLabels.length > 0) {
      faq.push({
        question: "What topics did you write about on Blogger?",
        answer: `Common labels include ${topLabels.slice(0, 8).map(([label]) => label).join(", ")}.`,
        category: "content",
      });
    }

    if (authorFilters.length > 0) {
      faq.push({
        question: "How was this Blogger archive filtered?",
        answer: `The import only included posts whose author name or email matched: ${authorFilters.join(", ")}.`,
        category: "content",
      });
    }

    return {
      ...(identity ? { identity } : {}),
      ...(skills ? { skills } : {}),
      projects: posts.map((post) => ({
        name: post.title,
        description: summarizeText(post.content, 600),
        ...(post.url ? { url: post.url } : {}),
        status: "completed",
        technologies: post.labels,
        ...(post.published ? { start_date: new Date(post.published).toISOString().slice(0, 10) } : {}),
        category: "article",
      })),
      ...(interests ? { interests } : {}),
      faq,
    };
  },
};