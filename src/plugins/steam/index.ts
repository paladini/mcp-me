/**
 * Steam Plugin — Live gaming profile and library
 *
 * Provides real-time access to your Steam profile, game library, and recent playtime
 * via the Steam Web API.
 *
 * @config steam_id: Steam64 ID or vanity URL name
 * @config api_key_env: Env var for Steam Web API key (optional)
 */
import { z } from "zod";
import type { McpMePlugin, PluginResource, PluginTool } from "../../plugin-engine/types.js";
import { steamPluginConfigSchema, type SteamPluginConfig } from "./schema.js";

interface SteamPlayer {
  steamid: string;
  personaname: string;
  profileurl: string;
  avatar: string;
  avatarfull: string;
  personastate: number;
  realname?: string;
  loccountrycode?: string;
  loccityid?: number;
  timecreated?: number;
  gameid?: string;
  gameextrainfo?: string;
}

interface SteamGame {
  appid: number;
  name: string;
  playtime_forever: number;
  playtime_2weeks?: number;
  img_icon_url: string;
}

class SteamPlugin implements McpMePlugin {
  name = "steam";
  description = "Live Steam gaming profile — currently playing, game library, playtime stats.";
  version = "0.1.0";

  private config!: SteamPluginConfig;
  private apiKey: string | null = null;

  async initialize(rawConfig: Record<string, unknown>): Promise<void> {
    this.config = steamPluginConfigSchema.parse(rawConfig);
    if (this.config.api_key_env) {
      this.apiKey = process.env[this.config.api_key_env] ?? null;
    }
  }

  private async fetchSteam<T>(iface: string, method: string, params: Record<string, string> = {}): Promise<T> {
    const qs = new URLSearchParams({
      key: this.apiKey ?? "",
      ...params,
      format: "json",
    });
    const resp = await fetch(
      `https://api.steampowered.com/${iface}/${method}/v0002/?${qs}`,
      { headers: { "User-Agent": "mcp-me" } },
    );
    if (!resp.ok) throw new Error(`Steam API error: ${resp.status} ${resp.statusText}`);
    return resp.json() as Promise<T>;
  }

  private async resolveSteamId(): Promise<string> {
    // If it's already a 17-digit Steam64 ID, return as-is
    if (/^\d{17}$/.test(this.config.steam_id)) return this.config.steam_id;

    // Try resolving vanity URL
    if (this.apiKey) {
      const data = await this.fetchSteam<{ response: { steamid?: string; success: number } }>(
        "ISteamUser",
        "ResolveVanityURL",
        { vanityurl: this.config.steam_id },
      );
      if (data.response.success === 1 && data.response.steamid) {
        return data.response.steamid;
      }
    }
    return this.config.steam_id;
  }

  getResources(): PluginResource[] {
    return [
      {
        name: "steam-profile",
        uri: "me://steam/profile",
        title: "Steam Profile",
        description: `Steam profile for ${this.config.steam_id}`,
        read: async () => {
          const steamId = await this.resolveSteamId();
          const data = await this.fetchSteam<{ response: { players: SteamPlayer[] } }>(
            "ISteamUser",
            "GetPlayerSummaries",
            { steamids: steamId },
          );
          const player = data.response.players[0];
          if (!player) return JSON.stringify({ error: "Player not found" });

          return JSON.stringify(
            {
              name: player.personaname,
              real_name: player.realname,
              profile_url: player.profileurl,
              status: ["Offline", "Online", "Busy", "Away", "Snooze", "Looking to trade", "Looking to play"][player.personastate] ?? "Unknown",
              currently_playing: player.gameextrainfo ?? null,
              country: player.loccountrycode,
              member_since: player.timecreated ? new Date(player.timecreated * 1000).toISOString() : null,
            },
            null,
            2,
          );
        },
      },
      {
        name: "steam-games",
        uri: "me://steam/games",
        title: "Steam Game Library",
        description: `Game library for ${this.config.steam_id}`,
        read: async () => {
          if (!this.apiKey) {
            return JSON.stringify({ error: "Steam API key required for game library. Set api_key_env." });
          }
          const steamId = await this.resolveSteamId();
          const data = await this.fetchSteam<{ response: { games?: SteamGame[] } }>(
            "IPlayerService",
            "GetOwnedGames",
            { steamid: steamId, include_appinfo: "1", include_played_free_games: "1" },
          );
          const games = (data.response.games ?? [])
            .sort((a, b) => b.playtime_forever - a.playtime_forever)
            .slice(0, 30);

          return JSON.stringify(
            games.map((g) => ({
              name: g.name,
              playtime_hours: Math.round(g.playtime_forever / 60 * 10) / 10,
              recent_hours: g.playtime_2weeks ? Math.round(g.playtime_2weeks / 60 * 10) / 10 : 0,
              url: `https://store.steampowered.com/app/${g.appid}`,
            })),
            null,
            2,
          );
        },
      },
    ];
  }

  getTools(): PluginTool[] {
    return [
      {
        name: "get_steam_recent_games",
        title: "Get Recent Games",
        description: `Get recently played games for ${this.config.steam_id}`,
        inputSchema: z.object({
          count: z.number().optional().describe("Number of games to return (default 10)"),
        }),
        annotations: { readOnlyHint: true },
        execute: async (input) => {
          if (!this.apiKey) return JSON.stringify({ error: "Steam API key required" });
          const steamId = await this.resolveSteamId();
          const count = (input.count as number) ?? 10;
          const data = await this.fetchSteam<{ response: { games?: SteamGame[] } }>(
            "IPlayerService",
            "GetRecentlyPlayedGames",
            { steamid: steamId, count: String(count) },
          );
          return JSON.stringify(
            (data.response.games ?? []).map((g) => ({
              name: g.name,
              recent_hours: Math.round((g.playtime_2weeks ?? 0) / 60 * 10) / 10,
              total_hours: Math.round(g.playtime_forever / 60 * 10) / 10,
            })),
            null,
            2,
          );
        },
      },
      {
        name: "get_steam_playtime",
        title: "Get Total Playtime",
        description: `Get total gaming playtime stats`,
        inputSchema: z.object({}),
        annotations: { readOnlyHint: true },
        execute: async () => {
          if (!this.apiKey) return JSON.stringify({ error: "Steam API key required" });
          const steamId = await this.resolveSteamId();
          const data = await this.fetchSteam<{ response: { game_count?: number; games?: SteamGame[] } }>(
            "IPlayerService",
            "GetOwnedGames",
            { steamid: steamId, include_appinfo: "1" },
          );
          const games = data.response.games ?? [];
          const totalMinutes = games.reduce((sum, g) => sum + g.playtime_forever, 0);
          const top5 = games.sort((a, b) => b.playtime_forever - a.playtime_forever).slice(0, 5);

          return JSON.stringify({
            total_games: data.response.game_count ?? games.length,
            total_hours: Math.round(totalMinutes / 60),
            top_5: top5.map((g) => ({ name: g.name, hours: Math.round(g.playtime_forever / 60) })),
          });
        },
      },
    ];
  }
}

export default function createPlugin(): McpMePlugin {
  return new SteamPlugin();
}
