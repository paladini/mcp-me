/**
 * Goodreads Generator
 *
 * Fetches your Goodreads profile — tries the author page first (for published authors),
 * then falls back to the RSS shelf feed (for readers). Extracts books, ratings, stats.
 *
 * @flag --goodreads <user-or-author-id>
 * @example mcp-me generate ./profile --goodreads 16062300
 * @auth None required (public pages)
 * @api https://www.goodreads.com/author/show/<id> + /review/list_rss/<id>
 * @data identity, projects (published books), interests, faq (reading stats)
 */
import type { GeneratorSource, PartialProfile } from "./types.js";

const BROWSER_UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

interface GoodreadsRSSItem {
  title: string;
  link: string;
  rating: number | null;
  author: string;
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

    items.push({ title, link, rating, author });
  }

  return items;
}

/**
 * Try fetching the author page — works when the ID is a Goodreads author ID.
 * Returns published books, ratings, reviews, and author name.
 */
async function fetchAuthorPage(authorId: string): Promise<{
  name: string;
  books: { title: string; url: string }[];
  ratings: number;
  reviews: number;
} | null> {
  try {
    const resp = await fetch(`https://www.goodreads.com/author/show/${authorId}`, {
      headers: { "User-Agent": BROWSER_UA },
    });
    if (!resp.ok) return null;
    const html = await resp.text();

    // Check if this is actually an author page (has book titles)
    const titleMatch = html.match(/<title>([^(]+)/);
    const name = titleMatch?.[1]?.trim() ?? "";
    if (!name || name.toLowerCase().includes("page not found")) return null;

    // Extract books
    const bookTitles = [...html.matchAll(/class="bookTitle"[^>]*>\s*([^<]+)/g)]
      .map((m) => m[1].trim())
      .filter((t) => t.length > 0);

    // Deduplicate (author page sometimes lists editions)
    const uniqueBooks = [...new Set(bookTitles)].slice(0, 20);
    const books = uniqueBooks.map((t) => ({
      title: t,
      url: `https://www.goodreads.com/author/show/${authorId}`,
    }));

    // Extract stats
    const ratingsMatch = html.match(/([\d,]+)\s+ratings/);
    const reviewsMatch = html.match(/([\d,]+)\s+reviews/);
    const ratings = ratingsMatch ? parseInt(ratingsMatch[1].replace(/,/g, ""), 10) : 0;
    const reviews = reviewsMatch ? parseInt(reviewsMatch[1].replace(/,/g, ""), 10) : 0;

    if (books.length === 0 && ratings === 0) return null;

    return { name, books, ratings, reviews };
  } catch {
    return null;
  }
}

export const goodreadsGenerator: GeneratorSource = {
  name: "goodreads",
  flag: "goodreads",
  flagArg: "<user-or-author-id>",
  description: "Goodreads profile — published books (authors) + reading list (readers)",
  category: "activity",

  async generate(config): Promise<PartialProfile> {
    const rawId = String(config.username ?? "");
    if (!rawId) throw new Error("Goodreads user/author ID is required");

    const numericId = rawId.split(".")[0];

    // Strategy 1: Try as author page (works for published authors)
    console.log(`  [Goodreads] Checking author page for ${numericId}...`);
    const authorData = await fetchAuthorPage(numericId);

    if (authorData && authorData.books.length > 0) {
      console.log(`  [Goodreads] Found author: ${authorData.name} — ${authorData.books.length} books, ${authorData.ratings} ratings.`);

      const identity: PartialProfile["identity"] = {
        ...(authorData.name ? { name: authorData.name } : {}),
        contact: {
          social: [{ platform: "goodreads", url: `https://www.goodreads.com/author/show/${numericId}`, username: numericId }],
        },
      };

      const projects = authorData.books.map((b) => ({
        name: b.title,
        description: "Published book on Goodreads",
        url: b.url,
        category: "book",
      }));

      const faq: PartialProfile["faq"] = [{
        question: "Have you published any books?",
        answer: `Yes, I have ${authorData.books.length} book(s) on Goodreads with ${authorData.ratings.toLocaleString()} ratings and ${authorData.reviews.toLocaleString()} reviews.${authorData.books.length <= 5 ? ` Titles: ${authorData.books.map((b) => b.title).join(", ")}.` : ""}`,
        category: "writing",
      }];

      return {
        identity,
        projects,
        faq,
        interests: { hobbies: ["writing", "reading", "publishing"], topics: ["books", "literature"] },
      };
    }

    // Strategy 2: Fall back to RSS shelf feed (works for readers)
    console.log(`  [Goodreads] Trying RSS shelf feed for ${numericId}...`);
    const response = await fetch(`https://www.goodreads.com/review/list_rss/${numericId}?shelf=read`, {
      headers: { "User-Agent": "mcp-me-generator" },
    });
    if (!response.ok) throw new Error(`Goodreads error: ${response.status} ${response.statusText}`);

    const xml = await response.text();
    const items = parseGoodreadsRSS(xml);
    console.log(`  [Goodreads] Found ${items.length} books in reading list.`);

    const topRated = items.filter((i) => i.rating && i.rating >= 4).slice(0, 10);

    const identity: PartialProfile["identity"] = {
      contact: {
        social: [{ platform: "goodreads", url: `https://www.goodreads.com/user/show/${numericId}`, username: numericId }],
      },
    };

    const faq: PartialProfile["faq"] = items.length > 0
      ? [{
          question: "What books have you read recently?",
          answer: `I track my reading on Goodreads. ${items.length} books in my read list.${topRated.length > 0 ? ` Top rated: ${topRated.slice(0, 5).map((i) => `${i.title} by ${i.author}`).join("; ")}.` : ""}`,
          category: "reading",
        }]
      : [];

    return {
      identity,
      interests: { hobbies: ["reading"], topics: ["books"] },
      faq,
    };
  },
};
