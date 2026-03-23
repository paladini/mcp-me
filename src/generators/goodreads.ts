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
 * @data identity, projects (published/read books), interests, faq (reading/writing stats)
 */
import type { GeneratorSource, PartialProfile } from "./types.js";
import { parseRssFeed, rssHtmlToText, summarizeText } from "../utils/rss.js";

const BROWSER_UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

interface GoodreadsRSSItem {
  title: string;
  link: string;
  rating: number | null;
  author: string;
  review: string;
  dateRead?: string;
  shelves: string[];
  isbn?: string;
}

function parseGoodreadsRSS(xml: string): GoodreadsRSSItem[] {
  const feed = parseRssFeed(xml);
  return feed.items.map((item) => {
    const rawMetadata = `${item.description ?? ""}\n${item.content ?? ""}`;
    const readField = (tag: string): string | undefined => {
      return rawMetadata.match(new RegExp(`<${tag}>([\\s\\S]*?)<\\/${tag}>`, "i"))?.[1];
    };

    const ratingStr = item.description?.match(/<user_rating>(\d+)<\/user_rating>/)?.[1]
      ?? item.content?.match(/<user_rating>(\d+)<\/user_rating>/)?.[1];
    const author = readField("author_name") ?? "";
    const review = readField("user_review") ?? "";
    const dateRead = readField("user_date_added") ?? undefined;
    const shelvesBlock = readField("user_shelves") ?? "";
    const shelves = [...shelvesBlock.matchAll(/<shelf\s+name="([^"]+)"/g)].map((m) => m[1]);
    const isbn = readField("isbn") ?? undefined;

    return {
      title: item.title,
      link: item.link,
      rating: ratingStr ? parseInt(ratingStr, 10) : null,
      author,
      review: rssHtmlToText(review),
      dateRead,
      shelves,
      isbn,
    };
  });
}

/**
 * Try fetching the author page — works when the ID is a Goodreads author ID.
 * Returns published books, ratings, reviews, and author name.
 */
async function fetchAuthorPage(authorId: string): Promise<{
  name: string;
  bio?: string;
  books: { title: string; url: string; rating?: number; ratingsCount?: number }[];
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

    const bio = html.match(/<div[^>]*class="[^"]*aboutAuthorInfo[^"]*"[^>]*>([\s\S]*?)<\/div>/i)?.[1]
      ?? html.match(/<div[^>]*id="aboutAuthor"[^>]*>([\s\S]*?)<\/div>/i)?.[1]
      ?? undefined;

    // Extract books
    const books: { title: string; url: string; rating?: number; ratingsCount?: number }[] = [];
    const bookBlocks = [...html.matchAll(/<tr\s+itemscope\s+itemtype="https:\/\/schema.org\/Book"([\s\S]*?)<\/tr>/gi)];

    for (const block of bookBlocks) {
      const row = block[0];
      const title = row.match(/class="bookTitle"[^>]*>\s*([\s\S]*?)<\/a>/)?.[1]?.replace(/<[^>]+>/g, "").trim() ?? "";
      const href = row.match(/class="bookTitle"[^>]*href="([^"]+)"/)?.[1] ?? "";
      const rating = row.match(/itemprop="ratingValue"[^>]*>([\d.]+)/)?.[1];
      const ratingsCount = row.match(/itemprop="ratingCount"[^>]*>([\d,]+)/)?.[1];
      if (!title) continue;
      books.push({
        title,
        url: href ? `https://www.goodreads.com${href}` : `https://www.goodreads.com/author/show/${authorId}`,
        rating: rating ? parseFloat(rating) : undefined,
        ratingsCount: ratingsCount ? parseInt(ratingsCount.replace(/,/g, ""), 10) : undefined,
      });
    }

    if (books.length === 0) {
      const bookTitles = [...html.matchAll(/class="bookTitle"[^>]*>\s*([^<]+)/g)]
        .map((m) => m[1].trim())
        .filter((t) => t.length > 0);
      const uniqueBooks = [...new Set(bookTitles)].slice(0, 20);
      books.push(...uniqueBooks.map((t) => ({
        title: t,
        url: `https://www.goodreads.com/author/show/${authorId}`,
      })));
    }

    // Extract stats
    const ratingsMatch = html.match(/([\d,]+)\s+ratings/);
    const reviewsMatch = html.match(/([\d,]+)\s+reviews/);
    const ratings = ratingsMatch ? parseInt(ratingsMatch[1].replace(/,/g, ""), 10) : 0;
    const reviews = reviewsMatch ? parseInt(reviewsMatch[1].replace(/,/g, ""), 10) : 0;

    const uniqueBooks = books
      .filter((book, index, array) => array.findIndex((b) => b.title.toLowerCase() === book.title.toLowerCase()) === index)
      .slice(0, 20);

    if (uniqueBooks.length === 0 && ratings === 0) return null;

    return { name, bio: bio ? summarizeText(rssHtmlToText(bio), 500) : undefined, books: uniqueBooks, ratings, reviews };
  } catch {
    return null;
  }
}

function parseDateToIso(dateText?: string): string | undefined {
  if (!dateText) return undefined;
  const parsed = new Date(dateText);
  if (Number.isNaN(parsed.getTime())) return undefined;
  return parsed.toISOString().slice(0, 10);
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
        ...(authorData.bio ? { bio: authorData.bio } : {}),
        contact: {
          social: [{ platform: "goodreads", url: `https://www.goodreads.com/author/show/${numericId}`, username: numericId }],
        },
      };

      const projects = authorData.books.map((b) => ({
        name: b.title,
        description: b.rating && b.ratingsCount
          ? `Published book on Goodreads. Average rating ${b.rating.toFixed(2)} from ${b.ratingsCount.toLocaleString()} rating(s).`
          : "Published book on Goodreads.",
        url: b.url,
        status: "completed" as const,
        technologies: ["books", "literature", "goodreads"],
        category: "book",
        stars: b.ratingsCount,
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
    const booksByAuthor = new Map<string, number>();
    const shelves = new Set<string>();
    for (const item of items) {
      if (item.author) booksByAuthor.set(item.author, (booksByAuthor.get(item.author) ?? 0) + 1);
      item.shelves.forEach((shelf) => shelves.add(shelf));
    }
    const favoriteAuthors = [...booksByAuthor.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([author]) => author);

    const projects = items.slice(0, 20).map((item) => {
      const ratingLabel = item.rating ? `${item.rating}/5` : "Unrated";
      const shelfLabel = item.shelves.length > 0 ? ` Shelves: ${item.shelves.slice(0, 5).join(", ")}.` : "";
      const reviewSummary = item.review ? ` Review: ${summarizeText(item.review, 220)}` : "";
      return {
        name: item.author ? `${item.title} — ${item.author}` : item.title,
        description: `${ratingLabel}.${shelfLabel}${reviewSummary}`.trim(),
        url: item.link,
        status: "completed" as const,
        technologies: ["books", "reading", ...(item.shelves.length > 0 ? item.shelves : [])],
        start_date: parseDateToIso(item.dateRead),
        category: "book",
        stars: item.rating ?? undefined,
      };
    });

    const identity: PartialProfile["identity"] = {
      contact: {
        social: [{ platform: "goodreads", url: `https://www.goodreads.com/user/show/${numericId}`, username: numericId }],
      },
    };

    const faq: PartialProfile["faq"] = items.length > 0
      ? [{
          question: "What books have you read recently?",
          answer: `I track my reading on Goodreads. ${items.length} books in my read list.${topRated.length > 0 ? ` Top rated: ${topRated.slice(0, 5).map((i) => `${i.title} by ${i.author}`).join("; ")}.` : ""}${favoriteAuthors.length > 0 ? ` Most read authors: ${favoriteAuthors.join(", ")}.` : ""}`,
          category: "reading",
        }, {
          question: "What are your reading habits?",
          answer: shelves.size > 0
            ? `My Goodreads shelves include ${[...shelves].slice(0, 8).join(", ")}.`
            : "I use Goodreads to track what I read and review.",
          category: "reading",
        }]
      : [];

    return {
      identity,
      projects,
      interests: {
        hobbies: ["reading"],
        topics: ["books", "literature", ...[...shelves].slice(0, 5)],
      },
      faq,
    };
  },
};
