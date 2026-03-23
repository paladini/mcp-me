/**
 * Substack Generator
 *
 * Fetches your Substack newsletter posts, excerpts, and body text via RSS feed.
 *
 * @flag --substack <publication>
 * @example mcp-me generate ./profile --substack platformer
 * @auth None required (public RSS feed)
 * @api https://<publication>.substack.com/feed
 * @data identity, projects (newsletter posts with body text), interests (topics), faq
 */
import type { GeneratorSource, PartialProfile } from "./types.js";
import { parseRssFeed, rssHtmlToText, summarizeText } from "../utils/rss.js";

function countWords(text: string): number {
  if (!text) return 0;
  return text.split(/\s+/).filter(Boolean).length;
}

export const substackGenerator: GeneratorSource = {
  name: "substack",
  flag: "substack",
  flagArg: "<publication>",
  description: "Substack newsletter posts (via RSS)",
  category: "writing",

  async generate(config): Promise<PartialProfile> {
    const publication = config.username as string;
    if (!publication) throw new Error("Substack publication name is required");

    console.log(`  [Substack] Fetching RSS feed for ${publication}...`);
    const resp = await fetch(`https://${publication}.substack.com/feed`, {
      headers: { "User-Agent": "mcp-me-generator" },
    });
    if (!resp.ok) throw new Error(`Substack RSS error: ${resp.status} ${resp.statusText}`);

    const xml = await resp.text();
    const feed = parseRssFeed(xml);
    const items = feed.items;
    console.log(`  [Substack] Found ${items.length} posts.`);

    const tagCounts: Record<string, number> = {};
    for (const item of items) {
      for (const cat of item.categories) tagCounts[cat] = (tagCounts[cat] ?? 0) + 1;
    }

    const topTags = Object.entries(tagCounts).sort(([, a], [, b]) => b - a).slice(0, 10);
    const totalWords = items.reduce((sum, item) => {
      const articleText = rssHtmlToText(item.content) || rssHtmlToText(item.description);
      return sum + countWords(articleText);
    }, 0);
    const averageWordCount = items.length > 0 ? Math.round(totalWords / items.length) : 0;

    const projects = items.slice(0, 10).map((item) => ({
      name: item.title,
      description: rssHtmlToText(item.content) || rssHtmlToText(item.description) || item.title,
      url: item.link,
      status: "completed" as const,
      technologies: item.categories,
      start_date: item.pubDate ? new Date(item.pubDate).toISOString().slice(0, 10) : undefined,
      category: "newsletter",
    }));

    const identity: PartialProfile["identity"] = {
      contact: {
        social: [{ platform: "substack", url: `https://${publication}.substack.com`, username: publication }],
      },
    };

    const faq: PartialProfile["faq"] = items.length > 0
      ? [{
          question: "Do you write a newsletter?",
          answer: `Yes, I publish on Substack at ${publication}.substack.com with ${items.length} posts.${topTags.length > 0 ? ` Topics: ${topTags.slice(0, 5).map(([t]) => t).join(", ")}.` : ""} My recent posts average about ${averageWordCount} words each.${feed.description ? ` Publication summary: ${summarizeText(rssHtmlToText(feed.description), 180)}` : ""}`,
          category: "writing",
        }, {
          question: "What do you publish on Substack?",
          answer: topTags.length > 0
            ? `Mostly ${topTags.slice(0, 8).map(([tag]) => tag).join(", ")}.`
            : "I publish essays and newsletter posts on Substack.",
          category: "writing",
        }]
      : [];

    return { identity, projects, interests: { topics: topTags.map(([t]) => t) }, faq };
  },
};
