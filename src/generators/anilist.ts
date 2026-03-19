/**
 * AniList Generator
 *
 * Fetches your AniList anime/manga profile, stats, and genre preferences via the public GraphQL API.
 *
 * @flag --anilist <username>
 * @example mcp-me generate ./profile --anilist animeuser
 * @auth None required (public GraphQL API)
 * @api https://graphql.anilist.co
 * @data identity, interests (anime/manga genres), faq (watch/read stats)
 */
import type { GeneratorSource, PartialProfile } from "./types.js";

interface AniListUser {
  name: string;
  about: string | null;
  siteUrl: string;
  statistics: {
    anime: {
      count: number;
      meanScore: number;
      episodesWatched: number;
      genres: { genre: string; count: number }[];
    };
    manga: {
      count: number;
      meanScore: number;
      chaptersRead: number;
      genres: { genre: string; count: number }[];
    };
  };
  favourites: {
    anime: { nodes: { title: { romaji: string } }[] };
    manga: { nodes: { title: { romaji: string } }[] };
  };
}

export const anilistGenerator: GeneratorSource = {
  name: "anilist",
  flag: "anilist",
  flagArg: "<username>",
  description: "AniList anime/manga profile, genres, watch stats",
  category: "activity",

  async generate(config): Promise<PartialProfile> {
    const username = config.username as string;
    if (!username) throw new Error("AniList username is required");

    console.log(`  [AniList] Fetching profile for ${username}...`);

    const query = `
      query ($name: String) {
        User(name: $name) {
          name about siteUrl
          statistics {
            anime {
              count meanScore episodesWatched
              genres(sort: COUNT_DESC, limit: 10) { genre count }
            }
            manga {
              count meanScore chaptersRead
              genres(sort: COUNT_DESC, limit: 10) { genre count }
            }
          }
          favourites {
            anime(page: 1, perPage: 5) { nodes { title { romaji } } }
            manga(page: 1, perPage: 5) { nodes { title { romaji } } }
          }
        }
      }
    `;

    const resp = await fetch("https://graphql.anilist.co", {
      method: "POST",
      headers: { "Content-Type": "application/json", "User-Agent": "mcp-me-generator" },
      body: JSON.stringify({ query, variables: { name: username } }),
    });
    if (!resp.ok) throw new Error(`AniList API error: ${resp.status} ${resp.statusText}`);
    const data = (await resp.json()) as { data?: { User?: AniListUser } };
    const user = data.data?.User;
    if (!user) throw new Error(`AniList user "${username}" not found`);

    const anime = user.statistics.anime;
    const manga = user.statistics.manga;
    console.log(`  [AniList] ${anime.count} anime watched, ${manga.count} manga read.`);

    const identity: PartialProfile["identity"] = {
      ...(user.about ? { bio: user.about.replace(/<[^>]+>/g, "").slice(0, 300) } : {}),
      contact: {
        social: [{ platform: "anilist", url: user.siteUrl, username }],
      },
    };

    // Combine anime and manga genres, deduplicate
    const genreMap = new Map<string, number>();
    for (const g of [...anime.genres, ...manga.genres]) {
      genreMap.set(g.genre, (genreMap.get(g.genre) ?? 0) + g.count);
    }
    const topGenres = [...genreMap.entries()]
      .sort(([, a], [, b]) => b - a)
      .slice(0, 15)
      .map(([genre]) => genre.toLowerCase());

    const favAnime = user.favourites.anime.nodes.map((n) => n.title.romaji);

    const interests: PartialProfile["interests"] = {
      hobbies: ["anime", "manga"],
      topics: topGenres,
    };

    const faq: PartialProfile["faq"] = [
      {
        question: "Do you watch anime or read manga?",
        answer: `Yes! I've watched ${anime.count} anime (${anime.episodesWatched.toLocaleString()} episodes, mean score ${anime.meanScore}/100) and read ${manga.count} manga (${manga.chaptersRead.toLocaleString()} chapters).${favAnime.length > 0 ? ` Favorites: ${favAnime.join(", ")}.` : ""}`,
        category: "entertainment",
      },
    ];

    return { identity, interests, faq };
  },
};
