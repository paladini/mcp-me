/**
 * Last.fm Plugin — Now playing and scrobble history
 *
 * Provides real-time access to your Last.fm listening history, top artists,
 * and now-playing status via the Last.fm API.
 *
 * @config username: Last.fm username
 * @config api_key_env: Env var for Last.fm API key (optional, uses public endpoints as fallback)
 */
import { z } from "zod";
import type { McpMePlugin, PluginResource, PluginTool } from "../../plugin-engine/types.js";
import { lastfmPluginConfigSchema, type LastfmPluginConfig } from "./schema.js";

interface LastfmTrack {
  name: string;
  artist: { "#text": string } | string;
  album?: { "#text": string } | string;
  url: string;
  date?: { uts: string; "#text": string };
  "@attr"?: { nowplaying: string };
}

interface LastfmArtist {
  name: string;
  playcount: string;
  url: string;
}

class LastfmPlugin implements McpMePlugin {
  name = "lastfm";
  description = "Live Last.fm listening data — now playing, recent tracks, top artists.";
  version = "0.1.0";

  private config!: LastfmPluginConfig;
  private apiKey: string | null = null;

  async initialize(rawConfig: Record<string, unknown>): Promise<void> {
    this.config = lastfmPluginConfigSchema.parse(rawConfig);
    if (this.config.api_key_env) {
      this.apiKey = process.env[this.config.api_key_env] ?? null;
    }
  }

  private async fetchLastfm<T>(method: string, params: Record<string, string> = {}): Promise<T> {
    const key = this.apiKey ?? ""; // Some methods work without key for public profiles
    const qs = new URLSearchParams({
      method,
      user: this.config.username,
      api_key: key,
      format: "json",
      ...params,
    });
    const resp = await fetch(`https://ws.audioscrobbler.com/2.0/?${qs}`, {
      headers: { "User-Agent": "mcp-me" },
    });
    if (!resp.ok) throw new Error(`Last.fm API error: ${resp.status} ${resp.statusText}`);
    return resp.json() as Promise<T>;
  }

  private extractArtistName(artist: { "#text": string } | string): string {
    return typeof artist === "string" ? artist : artist["#text"];
  }

  getResources(): PluginResource[] {
    return [
      {
        name: "lastfm-profile",
        uri: "me://lastfm/profile",
        title: "Last.fm Profile",
        description: `Last.fm profile for ${this.config.username}`,
        read: async () => {
          const data = await this.fetchLastfm<{ user: Record<string, unknown> }>("user.getinfo");
          return JSON.stringify(data.user, null, 2);
        },
      },
      {
        name: "lastfm-recent",
        uri: "me://lastfm/recent",
        title: "Last.fm Recent Tracks",
        description: `Recent scrobbles by ${this.config.username}`,
        read: async () => {
          const data = await this.fetchLastfm<{ recenttracks: { track: LastfmTrack[] } }>(
            "user.getrecenttracks",
            { limit: "20" },
          );
          const tracks = data.recenttracks?.track ?? [];
          return JSON.stringify(
            tracks.map((t) => ({
              track: t.name,
              artist: this.extractArtistName(t.artist),
              url: t.url,
              now_playing: t["@attr"]?.nowplaying === "true",
              ...(t.date ? { date: t.date["#text"] } : {}),
            })),
            null,
            2,
          );
        },
      },
      {
        name: "lastfm-top-artists",
        uri: "me://lastfm/top-artists",
        title: "Last.fm Top Artists",
        description: `Top artists for ${this.config.username}`,
        read: async () => {
          const data = await this.fetchLastfm<{ topartists: { artist: LastfmArtist[] } }>(
            "user.gettopartists",
            { limit: "20", period: "12month" },
          );
          return JSON.stringify(
            (data.topartists?.artist ?? []).map((a) => ({
              name: a.name,
              plays: parseInt(a.playcount, 10),
              url: a.url,
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
        name: "get_lastfm_now_playing",
        title: "Get Now Playing",
        description: `Check what ${this.config.username} is listening to right now`,
        inputSchema: z.object({}),
        annotations: { readOnlyHint: true },
        execute: async () => {
          const data = await this.fetchLastfm<{ recenttracks: { track: LastfmTrack[] } }>(
            "user.getrecenttracks",
            { limit: "1" },
          );
          const track = data.recenttracks?.track?.[0];
          if (!track) return JSON.stringify({ status: "Nothing playing" });

          const isPlaying = track["@attr"]?.nowplaying === "true";
          return JSON.stringify({
            status: isPlaying ? "now_playing" : "last_played",
            track: track.name,
            artist: this.extractArtistName(track.artist),
            url: track.url,
          });
        },
      },
      {
        name: "get_lastfm_top",
        title: "Get Top Artists/Tracks",
        description: `Get top artists or tracks for ${this.config.username}`,
        inputSchema: z.object({
          type: z.enum(["artists", "tracks"]).optional().describe("Type: artists or tracks (default: artists)"),
          period: z.enum(["7day", "1month", "3month", "6month", "12month", "overall"]).optional().describe("Time period (default: 12month)"),
          limit: z.number().optional().describe("Number of results (default 10, max 50)"),
        }),
        annotations: { readOnlyHint: true },
        execute: async (input) => {
          const type = (input.type as string) ?? "artists";
          const period = (input.period as string) ?? "12month";
          const limit = Math.min((input.limit as number) ?? 10, 50);
          const method = type === "tracks" ? "user.gettoptracks" : "user.gettopartists";
          const data = await this.fetchLastfm<Record<string, { artist?: LastfmArtist[]; track?: LastfmTrack[] }>>(
            method,
            { limit: String(limit), period },
          );

          if (type === "tracks") {
            const tracks = (data.toptracks as unknown as { track: LastfmTrack[] })?.track ?? [];
            return JSON.stringify(tracks.map((t) => ({
              track: t.name,
              artist: this.extractArtistName(t.artist),
              url: t.url,
            })), null, 2);
          }

          const artists = (data.topartists as unknown as { artist: LastfmArtist[] })?.artist ?? [];
          return JSON.stringify(artists.map((a) => ({
            name: a.name,
            plays: parseInt(a.playcount, 10),
            url: a.url,
          })), null, 2);
        },
      },
    ];
  }
}

export default function createPlugin(): McpMePlugin {
  return new LastfmPlugin();
}
