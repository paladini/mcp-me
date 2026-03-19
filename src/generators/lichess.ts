/**
 * Lichess Generator
 *
 * Fetches your Lichess profile, ratings across game modes, and play stats.
 *
 * @flag --lichess <username>
 * @example mcp-me generate ./profile --lichess DrNykterstein
 * @auth None required (public API)
 * @api https://lichess.org/api
 * @data identity, interests (chess), faq (ratings, game count)
 */
import type { GeneratorSource, PartialProfile } from "./types.js";

interface LichessUser {
  id: string;
  username: string;
  url: string;
  profile?: { bio?: string; firstName?: string; lastName?: string; location?: string; links?: string };
  count: { all: number; win: number; loss: number; draw: number };
  perfs: Record<string, { games: number; rating: number; prog: number }>;
  playTime?: { total: number };
}

export const lichessGenerator: GeneratorSource = {
  name: "lichess",
  flag: "lichess",
  flagArg: "<username>",
  description: "Lichess chess rating, games, puzzles",
  category: "activity",

  async generate(config): Promise<PartialProfile> {
    const username = config.username as string;
    if (!username) throw new Error("Lichess username is required");

    console.log(`  [Lichess] Fetching profile for ${username}...`);
    const resp = await fetch(`https://lichess.org/api/user/${username}`, {
      headers: { Accept: "application/json", "User-Agent": "mcp-me-generator" },
    });
    if (!resp.ok) throw new Error(`Lichess API error: ${resp.status}`);
    const user = (await resp.json()) as LichessUser;

    const ratings = Object.entries(user.perfs)
      .filter(([, v]) => v.games > 0)
      .sort(([, a], [, b]) => b.rating - a.rating)
      .slice(0, 5)
      .map(([mode, v]) => `${mode} ${v.rating}`);
    console.log(`  [Lichess] ${user.count.all} games. Ratings: ${ratings.join(", ") || "none"}.`);

    const identity: PartialProfile["identity"] = {
      ...(user.profile?.firstName ? { name: `${user.profile.firstName} ${user.profile?.lastName ?? ""}`.trim() } : {}),
      ...(user.profile?.bio ? { bio: user.profile.bio } : {}),
      contact: {
        social: [{ platform: "lichess", url: user.url, username: user.username }],
      },
    };

    const interests: PartialProfile["interests"] = { hobbies: ["Chess"] };

    const faq: PartialProfile["faq"] = [{
      question: "Do you play chess?",
      answer: `Yes, I play on Lichess as ${user.username}. ${user.count.all.toLocaleString()} games played.${ratings.length > 0 ? ` Ratings: ${ratings.join(", ")}.` : ""}`,
      category: "hobbies",
    }];

    return { identity, interests, faq };
  },
};
