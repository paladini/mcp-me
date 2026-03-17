import type { GeneratorSource, PartialProfile } from "./types.js";

interface LetterboxdRSSItem {
  title: string;
  link: string;
  pubDate: string;
  filmTitle: string;
  rating?: number;
}

/**
 * Parse Letterboxd RSS feed to extract film diary entries.
 */
function parseLetterboxdRSS(xml: string): LetterboxdRSSItem[] {
  const items: LetterboxdRSSItem[] = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  let match;

  while ((match = itemRegex.exec(xml)) !== null) {
    const block = match[1];
    const title = block.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/)?.[1]
      ?? block.match(/<title>(.*?)<\/title>/)?.[1]
      ?? "Untitled";
    const link = block.match(/<link>(.*?)<\/link>/)?.[1]
      ?? block.match(/<guid>(.*?)<\/guid>/)?.[1]
      ?? "";
    const pubDate = block.match(/<pubDate>(.*?)<\/pubDate>/)?.[1] ?? "";
    const filmTitle = block.match(/<letterboxd:filmTitle>(.*?)<\/letterboxd:filmTitle>/)?.[1] ?? title;
    const ratingStr = block.match(/<letterboxd:memberRating>([\d.]+)<\/letterboxd:memberRating>/)?.[1];
    const rating = ratingStr ? parseFloat(ratingStr) : undefined;

    items.push({ title, link, pubDate, filmTitle, rating });
  }

  return items;
}

export const letterboxdGenerator: GeneratorSource = {
  name: "letterboxd",
  flag: "letterboxd",
  flagArg: "<username>",
  description: "Letterboxd film diary, ratings, favorites",
  category: "activity",

  async generate(config): Promise<PartialProfile> {
    const username = config.username as string;
    if (!username) throw new Error("Letterboxd username is required");

    console.log(`  [Letterboxd] Fetching film diary for ${username}...`);
    const response = await fetch(`https://letterboxd.com/${username}/rss/`, {
      headers: { "User-Agent": "mcp-me-generator" },
    });
    if (!response.ok) {
      throw new Error(`Letterboxd RSS error: ${response.status} ${response.statusText}`);
    }

    const xml = await response.text();
    const items = parseLetterboxdRSS(xml);
    console.log(`  [Letterboxd] Found ${items.length} diary entries.`);

    const topRated = items
      .filter((i) => i.rating && i.rating >= 4)
      .slice(0, 10);

    const totalFilms = items.length;
    const avgRating = items.filter((i) => i.rating).length > 0
      ? (items.filter((i) => i.rating).reduce((sum, i) => sum + (i.rating ?? 0), 0) / items.filter((i) => i.rating).length).toFixed(1)
      : null;

    const identity: PartialProfile["identity"] = {
      contact: {
        social: [
          { platform: "letterboxd", url: `https://letterboxd.com/${username}`, username },
        ],
      },
    };

    const interests: PartialProfile["interests"] = {
      hobbies: ["Watching films"],
      topics: ["cinema", "film"],
    };

    const faq: PartialProfile["faq"] = [
      {
        question: "Do you watch a lot of movies?",
        answer: `Yes! I log films on Letterboxd. Recent diary: ${totalFilms} entries${avgRating ? `, average rating ${avgRating}/5` : ""}. ${topRated.length > 0 ? `Some favorites: ${topRated.slice(0, 5).map((i) => i.filmTitle).join(", ")}.` : ""}`,
        category: "entertainment",
      },
    ];

    return { identity, interests, faq };
  },
};
