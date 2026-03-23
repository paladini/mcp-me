/**
 * Medium Generator
 *
 * Fetches your published articles, excerpts, and categories from Medium via RSS feed.
 *
 * @flag --medium <username>
 * @example mcp-me generate ./profile --medium @yourname
 * @auth None required (public RSS feed)
 * @api https://medium.com/feed/@username
 * @data identity, skills (article categories), projects (articles with body text), interests, faq
 */
import type { GeneratorSource, PartialProfile } from "./types.js";
import { parseRssFeed, rssHtmlToText, summarizeText } from "../utils/rss.js";

function normalizeMediumUsername(username: string): string {
  return username.trim().replace(/^@+/, "");
}

function countWords(text: string): number {
  if (!text) return 0;
  return text.split(/\s+/).filter(Boolean).length;
}

export const mediumGenerator: GeneratorSource = {
  name: "medium",
  flag: "medium",
  flagArg: "<username>",
  description: "Medium articles and categories (via RSS)",
  category: "writing",

  async generate(config): Promise<PartialProfile> {
    const rawUsername = config.username as string;
    const username = normalizeMediumUsername(rawUsername);
    if (!username) throw new Error("Medium username is required");

    console.log(`  [Medium] Fetching RSS feed for @${username}...`);
    const response = await fetch(`https://medium.com/feed/@${username}`, {
      headers: { "User-Agent": "mcp-me-generator" },
    });
    if (!response.ok) {
      throw new Error(`Medium RSS error: ${response.status} ${response.statusText}`);
    }

    const xml = await response.text();
    const feed = parseRssFeed(xml);
    const items = feed.items;
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

    const articleWordCount = items.reduce((sum, item) => {
      const articleText = rssHtmlToText(item.content) || rssHtmlToText(item.description);
      return sum + countWords(articleText);
    }, 0);

    const averageWordCount = items.length > 0 ? Math.round(articleWordCount / items.length) : 0;

    const projects = items.slice(0, 10).map((item) => ({
      name: item.title,
      description: rssHtmlToText(item.content) || rssHtmlToText(item.description) || item.title,
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
          answer: `Yes, I've published ${items.length} articles on Medium covering topics like ${topTags.slice(0, 5).map(([t]) => t).join(", ")}. My recent posts average about ${averageWordCount} words each.${feed.description ? ` Feed summary: ${summarizeText(rssHtmlToText(feed.description), 180)}` : ""}`,
          category: "content",
        }, {
          question: "What do you usually write about on Medium?",
          answer: topTags.length > 0
            ? `Mostly ${topTags.slice(0, 8).map(([tag]) => tag).join(", ")}.`
            : "I publish technical and personal essays on Medium.",
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
