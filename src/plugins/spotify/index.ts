import { z } from "zod";
import type {
  McpMePlugin,
  PluginResource,
  PluginTool,
} from "../../plugin-engine/types.js";
import { spotifyConfigSchema, type SpotifyConfig } from "./schema.js";

interface SpotifyTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

interface SpotifyArtist {
  name: string;
  genres: string[];
  popularity: number;
  external_urls: { spotify: string };
  images: { url: string; width: number; height: number }[];
}

interface SpotifyTrack {
  name: string;
  artists: { name: string }[];
  album: { name: string; release_date: string };
  duration_ms: number;
  popularity: number;
  external_urls: { spotify: string };
}

interface SpotifyPlayHistory {
  track: SpotifyTrack;
  played_at: string;
}

class SpotifyPlugin implements McpMePlugin {
  name = "spotify";
  description = "Integrates with Spotify to provide music taste, top artists, and listening data.";
  version = "0.1.0";

  private config!: SpotifyConfig;
  private accessToken: string | null = null;
  private tokenExpiry = 0;

  async initialize(rawConfig: Record<string, unknown>): Promise<void> {
    this.config = spotifyConfigSchema.parse(rawConfig);
  }

  private async getAccessToken(): Promise<string> {
    if (this.accessToken && Date.now() < this.tokenExpiry) {
      return this.accessToken;
    }

    const clientId = process.env[this.config.client_id_env];
    const clientSecret = process.env[this.config.client_secret_env];
    const refreshToken = process.env[this.config.refresh_token_env];

    if (!clientId || !clientSecret || !refreshToken) {
      throw new Error(
        `Spotify plugin requires environment variables: ${this.config.client_id_env}, ${this.config.client_secret_env}, ${this.config.refresh_token_env}`,
      );
    }

    const response = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
      },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: refreshToken,
      }),
    });

    if (!response.ok) {
      throw new Error(`Spotify token refresh failed: ${response.status} ${response.statusText}`);
    }

    const data = (await response.json()) as SpotifyTokenResponse;
    this.accessToken = data.access_token;
    this.tokenExpiry = Date.now() + (data.expires_in - 60) * 1000;
    return this.accessToken;
  }

  private async fetchSpotify<T>(path: string): Promise<T> {
    const token = await this.getAccessToken();
    const response = await fetch(`https://api.spotify.com/v1${path}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      throw new Error(`Spotify API error: ${response.status} ${response.statusText}`);
    }

    return response.json() as Promise<T>;
  }

  private async getTopArtists(): Promise<SpotifyArtist[]> {
    const data = await this.fetchSpotify<{ items: SpotifyArtist[] }>(
      `/me/top/artists?limit=${this.config.top_artists_limit}&time_range=${this.config.time_range}`,
    );
    return data.items;
  }

  private async getTopTracks(): Promise<SpotifyTrack[]> {
    const data = await this.fetchSpotify<{ items: SpotifyTrack[] }>(
      `/me/top/tracks?limit=${this.config.top_tracks_limit}&time_range=${this.config.time_range}`,
    );
    return data.items;
  }

  private async getRecentlyPlayed(): Promise<SpotifyPlayHistory[]> {
    const data = await this.fetchSpotify<{ items: SpotifyPlayHistory[] }>(
      `/me/player/recently-played?limit=${this.config.recently_played_limit}`,
    );
    return data.items;
  }

  getResources(): PluginResource[] {
    return [
      {
        name: "spotify-top-artists",
        uri: "me://spotify/top-artists",
        title: "Spotify Top Artists",
        description: `Top ${this.config.top_artists_limit} artists (${this.config.time_range})`,
        read: async () => {
          const artists = await this.getTopArtists();
          return JSON.stringify(
            artists.map((a) => ({
              name: a.name,
              genres: a.genres,
              popularity: a.popularity,
              url: a.external_urls.spotify,
            })),
            null,
            2,
          );
        },
      },
      {
        name: "spotify-top-tracks",
        uri: "me://spotify/top-tracks",
        title: "Spotify Top Tracks",
        description: `Top ${this.config.top_tracks_limit} tracks (${this.config.time_range})`,
        read: async () => {
          const tracks = await this.getTopTracks();
          return JSON.stringify(
            tracks.map((t) => ({
              name: t.name,
              artist: t.artists.map((a) => a.name).join(", "),
              album: t.album.name,
              url: t.external_urls.spotify,
            })),
            null,
            2,
          );
        },
      },
      {
        name: "spotify-recently-played",
        uri: "me://spotify/recently-played",
        title: "Spotify Recently Played",
        description: "Recently played tracks",
        read: async () => {
          const history = await this.getRecentlyPlayed();
          return JSON.stringify(
            history.map((h) => ({
              track: h.track.name,
              artist: h.track.artists.map((a) => a.name).join(", "),
              album: h.track.album.name,
              played_at: h.played_at,
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
        name: "get_spotify_now_playing",
        title: "Get Now Playing",
        description: "Get the currently playing track on Spotify (or most recently played)",
        inputSchema: z.object({}),
        annotations: { readOnlyHint: true },
        execute: async () => {
          try {
            const token = await this.getAccessToken();
            const response = await fetch("https://api.spotify.com/v1/me/player/currently-playing", {
              headers: { Authorization: `Bearer ${token}` },
            });

            if (response.status === 204) {
              const recent = await this.getRecentlyPlayed();
              if (recent.length > 0) {
                const last = recent[0];
                return JSON.stringify({
                  status: "last_played",
                  track: last.track.name,
                  artist: last.track.artists.map((a) => a.name).join(", "),
                  album: last.track.album.name,
                  played_at: last.played_at,
                });
              }
              return JSON.stringify({ status: "nothing_playing" });
            }

            const data = (await response.json()) as {
              is_playing: boolean;
              item: SpotifyTrack;
            };

            return JSON.stringify({
              status: data.is_playing ? "playing" : "paused",
              track: data.item.name,
              artist: data.item.artists.map((a) => a.name).join(", "),
              album: data.item.album.name,
            });
          } catch (error) {
            return JSON.stringify({ error: (error as Error).message });
          }
        },
      },
      {
        name: "get_spotify_music_taste",
        title: "Get Music Taste Summary",
        description: "Get a summary of music taste based on top artists and genres",
        inputSchema: z.object({}),
        annotations: { readOnlyHint: true },
        execute: async () => {
          const artists = await this.getTopArtists();
          const genreCounts: Record<string, number> = {};

          for (const artist of artists) {
            for (const genre of artist.genres) {
              genreCounts[genre] = (genreCounts[genre] ?? 0) + 1;
            }
          }

          const topGenres = Object.entries(genreCounts)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 10)
            .map(([genre, count]) => ({ genre, count }));

          return JSON.stringify(
            {
              top_artists: artists.slice(0, 5).map((a) => a.name),
              top_genres: topGenres,
              total_artists_analyzed: artists.length,
              time_range: this.config.time_range,
            },
            null,
            2,
          );
        },
      },
    ];
  }
}

export default function createPlugin(): McpMePlugin {
  return new SpotifyPlugin();
}
