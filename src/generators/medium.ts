import type { GeneratorSource, PartialProfile } from "./types.js";

interface MediumRSSItem {
  title: string;
  link: string;
  pubDate: string;
  categories: string[];
}

/**
 * Parse a simple RSS/Atom XML feed to extract items.
 * Lightweight: no external XML parser dependency — uses regex extraction.
 */
function parseRSSItems(xml: string): MediumRSSItem[] {
  const items: MediumRSSItem[] = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  let match;

  while ((match = itemRegex.exec(xml)) !== null) {
    const block = match[1];
    const title = block.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/)?.[1]
      ?? block.match(/<title>(.*?)<\/title>/)?.[1]
      ?? "Untitled";
    const link = block.match(/<link>(.*?)<\/link>/)?.[1] ?? "";
    const pubDate = block.match(/<pubDate>(.*?)<\/pubDate>/)?.[1] ?? "";

    const categories: string[] = [];
    const catRegex = /<category>(.*?)<\/category>/g;
    let catMatch;
    while ((catMatch = catRegex.exec(block)) !== null) {
      categories.push(catMatch[1]);
    }

    items.push({ title, link, pubDate, categories });
  }

  return items;
}

export const mediumGenerator: GeneratorSource = {
  name: "medium",

  async generate(config): Promise<PartialProfile> {
    const username = config.username as string;
    if (!username) throw new Error("Medium username is required");

    console.log(`  [Medium] Fetching RSS feed for @${username}...`);
    const response = await fetch(`https://medium.com/feed/@${username}`, {
      headers: { "User-Agent": "mcp-me-generator" },
    });
    if (!response.ok) {
      throw new Error(`Medium RSS error: ${response.status} ${response.statusText}`);
    }

    const xml = await response.text();
    const items = parseRSSItems(xml);
    console.log(`  [Medium] Found ${items.length} articles.`);

    // Extract tags across all articles
    const tagCounts: Record<string, number> = {};
    for (const item of items) {
      for (const cat of item.categories) {
        tagCounts[cat] = (tagCounts[cat] ?? 0) + 1;
      }
    }

    const topTags = Object.entries(tagCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 15);

    const technical = topTags.map(([tag, count]) => ({
      name: tag,
      category: "topic",
      description: `Written about in ${count} Medium article(s)`,
    }));

    const projects = items.slice(0, 10).map((item) => ({
      name: item.title,
      description: item.title,
      url: item.link,
      status: "completed" as const,
      technologies: item.categories,
      start_date: item.pubDate ? new Date(item.pubDate).toISOString().slice(0, 10) : undefined,
      category: "article",
    }));

    const identity: PartialProfile["identity"] = {
      contact: {
        social: [
          { platform: "medium", url: `https://medium.com/@${username}`, username },
        ],
      },
    };

    const interests: PartialProfile["interests"] = {
      topics: topTags.slice(0, 10).map(([tag]) => tag),
    };

    const faq: PartialProfile["faq"] = items.length > 0
      ? [{
          question: "Do you write on Medium?",
          answer: `Yes, I've published ${items.length} articles on Medium covering topics like ${topTags.slice(0, 5).map(([t]) => t).join(", ")}.`,
          category: "content",
        }]
      : [];

    return {
      identity,
      skills: { technical },
      projects,
      interests,
      faq,
    };
  },
};
