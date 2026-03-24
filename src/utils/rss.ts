interface ParsedRssItem {
  title: string;
  link: string;
  pubDate: string;
  categories: string[];
  description?: string;
  content?: string;
  author?: string;
}

interface ParsedRssFeed {
  title?: string;
  description?: string;
  link?: string;
  items: ParsedRssItem[];
}

function escapeTagName(tagName: string): string {
  return tagName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function decodeXmlEntities(value: string): string {
  return value
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, "&");
}

function stripHtml(value: string): string {
  return value
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<\/div>/gi, "\n")
    .replace(/<li>/gi, "- ")
    .replace(/<[^>]+>/g, " ");
}

function normalizeWhitespace(value: string): string {
  return value
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/ *\n */g, "\n")
    .trim();
}

function readTag(block: string, tagName: string): string | undefined {
  const tag = escapeTagName(tagName);
  const match = block.match(new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${tag}>`, "i"));
  if (!match?.[1]) return undefined;
  return decodeXmlEntities(match[1]).trim();
}

function readAllTags(block: string, tagName: string): string[] {
  const tag = escapeTagName(tagName);
  const regex = new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${tag}>`, "gi");
  const values: string[] = [];
  let match: RegExpExecArray | null;

  while ((match = regex.exec(block)) !== null) {
    const value = decodeXmlEntities(match[1] ?? "").trim();
    if (value) values.push(value);
  }

  return values;
}

export function rssHtmlToText(value: string | undefined): string {
  if (!value) return "";
  return normalizeWhitespace(stripHtml(decodeXmlEntities(value)));
}

export function summarizeText(value: string, maxLength: number): string {
  const normalized = normalizeWhitespace(value);
  if (normalized.length <= maxLength) return normalized;

  const sliced = normalized.slice(0, maxLength);
  const lastSentence = Math.max(sliced.lastIndexOf(". "), sliced.lastIndexOf("! "), sliced.lastIndexOf("? "));
  if (lastSentence > Math.floor(maxLength * 0.6)) {
    return `${sliced.slice(0, lastSentence + 1).trim()}…`;
  }

  const lastSpace = sliced.lastIndexOf(" ");
  return `${sliced.slice(0, lastSpace > 0 ? lastSpace : maxLength).trim()}…`;
}

export function parseRssFeed(xml: string): ParsedRssFeed {
  const channelBlock = xml.match(/<channel>([\s\S]*?)<\/channel>/i)?.[1] ?? xml;
  const itemRegex = /<item>([\s\S]*?)<\/item>/gi;
  const items: ParsedRssItem[] = [];
  let match: RegExpExecArray | null;

  while ((match = itemRegex.exec(xml)) !== null) {
    const block = match[1];
    const title = readTag(block, "title") ?? "Untitled";
    const link = readTag(block, "link") ?? "";
    const pubDate = readTag(block, "pubDate") ?? "";
    const description = readTag(block, "description");
    const content = readTag(block, "content:encoded") ?? readTag(block, "content");
    const author = readTag(block, "dc:creator") ?? readTag(block, "author");
    const categories = readAllTags(block, "category");

    items.push({ title, link, pubDate, description, content, author, categories });
  }

  return {
    title: readTag(channelBlock, "title"),
    description: readTag(channelBlock, "description"),
    link: readTag(channelBlock, "link"),
    items,
  };
}
