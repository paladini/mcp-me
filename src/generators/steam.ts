/**
 * Steam Generator
 *
 * Fetches your Steam games library, playtime, and top played games.
 *
 * @flag --steam <steam-id>
 * @example mcp-me generate ./profile --steam 76561198012345678
 * @auth Requires STEAM_API_KEY env var. Get a free key at https://steamcommunity.com/dev/apikey
 * @api https://developer.valvesoftware.com/wiki/Steam_Web_API
 * @data identity, interests (gaming, top games), faq (playtime stats)
 */
import type { GeneratorSource, PartialProfile } from "./types.js";

interface SteamPlayer {
  personaname: string;
  profileurl: string;
  realname?: string;
  loccountrycode?: string;
  locstatecode?: string;
  timecreated?: number;
}

interface SteamGame {
  appid: number;
  name: string;
  playtime_forever: number;
  img_icon_url: string;
}

export const steamGenerator: GeneratorSource = {
  name: "steam",
  flag: "steam",
  flagArg: "<steam-id>",
  description: "Steam games, playtime (needs STEAM_API_KEY)",
  category: "activity",

  async generate(config): Promise<PartialProfile> {
    const steamId = config.username as string;
    if (!steamId) throw new Error("Steam ID (64-bit numeric) is required");

    const apiKey = process.env.STEAM_API_KEY;
    if (!apiKey) throw new Error("STEAM_API_KEY environment variable is required. Get a free key at https://steamcommunity.com/dev/apikey");

    console.log(`  [Steam] Fetching profile for ${steamId}...`);
    const playerResp = await fetch(
      `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/?key=${apiKey}&steamids=${steamId}`,
      { headers: { "User-Agent": "mcp-me-generator" } },
    );
    if (!playerResp.ok) throw new Error(`Steam API error: ${playerResp.status}`);
    const playerData = (await playerResp.json()) as { response: { players: SteamPlayer[] } };
    const player = playerData.response.players[0];
    if (!player) throw new Error(`Steam user ${steamId} not found`);

    console.log(`  [Steam] Fetching games...`);
    const gamesResp = await fetch(
      `https://api.steampowered.com/IPlayerService/GetOwnedGames/v1/?key=${apiKey}&steamid=${steamId}&include_appinfo=true&include_played_free_games=true`,
      { headers: { "User-Agent": "mcp-me-generator" } },
    );
    const gamesData = (await gamesResp.json()) as { response: { game_count: number; games: SteamGame[] } };
    const games = (gamesData.response?.games ?? []).sort((a, b) => b.playtime_forever - a.playtime_forever);
    console.log(`  [Steam] ${games.length} games, top: ${games.slice(0, 3).map((g) => g.name).join(", ")}.`);

    const topGames = games.slice(0, 10);
    const totalHours = Math.round(games.reduce((sum, g) => sum + g.playtime_forever, 0) / 60);

    const identity: PartialProfile["identity"] = {
      ...(player.realname ? { name: player.realname } : {}),
      contact: {
        social: [{ platform: "steam", url: player.profileurl, username: player.personaname }],
      },
    };

    const interests: PartialProfile["interests"] = {
      hobbies: ["Gaming"],
      topics: topGames.slice(0, 5).map((g) => g.name),
    };

    const faq: PartialProfile["faq"] = [{
      question: "Do you play video games?",
      answer: `Yes, I have ${games.length} games on Steam with ${totalHours.toLocaleString()} hours total playtime. Most played: ${topGames.slice(0, 5).map((g) => `${g.name} (${Math.round(g.playtime_forever / 60)}h)`).join(", ")}.`,
      category: "gaming",
    }];

    return { identity, interests, faq };
  },
};
