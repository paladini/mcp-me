import type { GeneratorSource, PartialProfile } from "./types.js";

interface ChessComPlayer {
  url: string;
  username: string;
  name?: string;
  location?: string;
  country: string;
  joined: number;
  status: string;
  followers: number;
}

interface ChessComStats {
  chess_rapid?: { last: { rating: number }; record: { win: number; loss: number; draw: number } };
  chess_blitz?: { last: { rating: number }; record: { win: number; loss: number; draw: number } };
  chess_bullet?: { last: { rating: number }; record: { win: number; loss: number; draw: number } };
  puzzle?: { last: { rating: number } };
}

export const chesscomGenerator: GeneratorSource = {
  name: "chesscom",
  flag: "chess",
  flagArg: "<username>",
  description: "Chess.com rating, games, stats",
  category: "activity",

  async generate(config): Promise<PartialProfile> {
    const username = config.username as string;
    if (!username) throw new Error("Chess.com username is required");

    console.log(`  [Chess.com] Fetching profile for ${username}...`);
    const profileResp = await fetch(`https://api.chess.com/pub/player/${username}`, {
      headers: { "User-Agent": "mcp-me-generator" },
    });
    if (!profileResp.ok) throw new Error(`Chess.com API error: ${profileResp.status}`);
    const player = (await profileResp.json()) as ChessComPlayer;

    const statsResp = await fetch(`https://api.chess.com/pub/player/${username}/stats`, {
      headers: { "User-Agent": "mcp-me-generator" },
    });
    const stats = statsResp.ok ? ((await statsResp.json()) as ChessComStats) : null;

    const ratings: string[] = [];
    if (stats?.chess_rapid?.last) ratings.push(`Rapid ${stats.chess_rapid.last.rating}`);
    if (stats?.chess_blitz?.last) ratings.push(`Blitz ${stats.chess_blitz.last.rating}`);
    if (stats?.chess_bullet?.last) ratings.push(`Bullet ${stats.chess_bullet.last.rating}`);
    if (stats?.puzzle?.last) ratings.push(`Puzzles ${stats.puzzle.last.rating}`);
    console.log(`  [Chess.com] Ratings: ${ratings.join(", ") || "none"}.`);

    const identity: PartialProfile["identity"] = {
      ...(player.name ? { name: player.name } : {}),
      contact: {
        social: [{ platform: "chess.com", url: player.url, username }],
      },
    };

    const interests: PartialProfile["interests"] = { hobbies: ["Chess"] };

    const faq: PartialProfile["faq"] = [{
      question: "Do you play chess?",
      answer: `Yes, I play on Chess.com as ${username}.${ratings.length > 0 ? ` Ratings: ${ratings.join(", ")}.` : ""}`,
      category: "hobbies",
    }];

    return { identity, interests, faq };
  },
};
