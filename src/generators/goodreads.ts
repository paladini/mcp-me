/**
 * Goodreads Generator
 *
 * Fetches your reading list, ratings, and favorite books via RSS feed.
 *
 * @flag --goodreads <user-id>
 * @example mcp-me generate ./profile --goodreads 12345678
 * @auth None required (public RSS feed)
 * @api https://www.goodreads.com/review/list_rss/<user-id>
 * @data identity, interests (reading), faq (reading stats)
 */
import type { GeneratorSource, PartialProfile } from "./types.js";

interface GoodreadsRSSItem {
  title: string;
  link: string;
  rating: number | null;
  author: string;
  shelf: string;
}

function parseGoodreadsRSS(xml: string): GoodreadsRSSItem[] {
  const items: GoodreadsRSSItem[] = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  let match;

  while ((match = itemRegex.exec(xml)) !== null) {
    const block = match[1];
    const title = block.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/)?.[1]
      ?? block.match(/<title>(.*?)<\/title>/)?.[1]
      ?? "Untitled";
    const link = block.match(/<link>(.*?)<\/link>/)?.[1] ?? "";
    const ratingStr = block.match(/<user_rating>(\d+)<\/user_rating>/)?.[1];
    const rating = ratingStr ? parseInt(ratingStr, 10) : null;
    const author = block.match(/<author_name>(.*?)<\/author_name>/)?.[1] ?? "";
    const shelf = block.match(/<user_shelves>(.*?)<\/user_shelves>/)?.[1] ?? "read";

    items.push({ title, link, rating, author, shelf });
  }

  return items;
}

export const goodreadsGenerator: GeneratorSource = {
  name: "goodreads",
  flag: "goodreads",
  flagArg: "<user-id>",
  description: "Goodreads reading list, ratings, reviews (RSS)",
  category: "activity",

  async generate(config): Promise<PartialProfile> {
    const rawId = config.username as string;
    if (!rawId) throw new Error("Goodreads user ID is required");

    // Extract numeric ID from composite strings like "16062300.Fernando_Paladini"
    const userId = rawId.split(".")[0];

    console.log(`  [Goodreads] Fetching reading list for user ${userId}...`);
    const response = await fetch(`https://www.goodreads.com/review/list_rss/${userId}?shelf=read`, {
      headers: { "User-Agent": "mcp-me-generator" },
    });
    if (!response.ok) throw new Error(`Goodreads RSS error: ${response.status} ${response.statusText}`);

    const xml = await response.text();
    const items = parseGoodreadsRSS(xml);
    console.log(`  [Goodreads] Found ${items.length} books.`);

    const topRated = items.filter((i) => i.rating && i.rating >= 4).slice(0, 10);

    const interests: PartialProfile["interests"] = {
      hobbies: ["Reading"],
    };

    const faq: PartialProfile["faq"] = items.length > 0
      ? [{
          question: "What books have you read recently?",
          answer: `I track my reading on Goodreads. ${items.length} books in my read list.${topRated.length > 0 ? ` Top rated: ${topRated.slice(0, 5).map((i) => `${i.title} by ${i.author}`).join("; ")}.` : ""}`,
          category: "reading",
        }]
      : [];

    const identity: PartialProfile["identity"] = {
      contact: {
        social: [{ platform: "goodreads", url: `https://www.goodreads.com/user/show/${userId}`, username: userId }],
      },
    };

    return { identity, interests, faq };
  },
};
