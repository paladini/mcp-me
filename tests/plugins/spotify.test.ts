import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import createSpotifyPlugin from "../../src/plugins/spotify/index.js";
import type { McpMePlugin } from "../../src/plugin-engine/types.js";

const MOCK_TOKEN_RESPONSE = {
  access_token: "mock-access-token",
  token_type: "Bearer",
  expires_in: 3600,
};

const MOCK_TOP_ARTISTS = {
  items: [
    {
      name: "Radiohead",
      genres: ["alternative rock", "art rock", "electronic"],
      popularity: 80,
      external_urls: { spotify: "https://open.spotify.com/artist/radiohead" },
      images: [{ url: "https://img.example.com/radiohead.jpg", width: 300, height: 300 }],
    },
    {
      name: "Björk",
      genres: ["art pop", "electronic", "experimental"],
      popularity: 70,
      external_urls: { spotify: "https://open.spotify.com/artist/bjork" },
      images: [],
    },
  ],
};

const MOCK_TOP_TRACKS = {
  items: [
    {
      name: "Everything In Its Right Place",
      artists: [{ name: "Radiohead" }],
      album: { name: "Kid A", release_date: "2000-10-02" },
      duration_ms: 250000,
      popularity: 75,
      external_urls: { spotify: "https://open.spotify.com/track/eiirp" },
    },
  ],
};

const MOCK_RECENTLY_PLAYED = {
  items: [
    {
      track: {
        name: "Joga",
        artists: [{ name: "Björk" }],
        album: { name: "Homogenic", release_date: "1997-09-22" },
        duration_ms: 300000,
        popularity: 60,
        external_urls: { spotify: "https://open.spotify.com/track/joga" },
      },
      played_at: "2024-06-01T12:00:00Z",
    },
  ],
};

const MOCK_NOW_PLAYING = {
  is_playing: true,
  item: {
    name: "Idioteque",
    artists: [{ name: "Radiohead" }],
    album: { name: "Kid A", release_date: "2000-10-02" },
    duration_ms: 300000,
    popularity: 78,
    external_urls: { spotify: "https://open.spotify.com/track/idioteque" },
  },
};

function mockFetch(urlMap: Record<string, { status?: number; data?: unknown }>) {
  return vi.fn(async (url: string, _opts?: RequestInit) => {
    for (const [pattern, response] of Object.entries(urlMap)) {
      if (url.includes(pattern)) {
        const status = response.status ?? 200;
        return {
          ok: status >= 200 && status < 300,
          status,
          statusText: status === 200 ? "OK" : "No Content",
          json: async () => response.data,
        };
      }
    }
    return { ok: false, status: 404, statusText: "Not Found", json: async () => ({}) };
  });
}

describe("Spotify Plugin", () => {
  let plugin: McpMePlugin;
  let originalFetch: typeof globalThis.fetch;
  const originalEnv = { ...process.env };

  beforeEach(async () => {
    originalFetch = globalThis.fetch;

    process.env.TEST_SPOTIFY_CLIENT_ID = "test-client-id";
    process.env.TEST_SPOTIFY_CLIENT_SECRET = "test-client-secret";
    process.env.TEST_SPOTIFY_REFRESH_TOKEN = "test-refresh-token";

    globalThis.fetch = mockFetch({
      "accounts.spotify.com/api/token": { data: MOCK_TOKEN_RESPONSE },
      "/me/top/artists": { data: MOCK_TOP_ARTISTS },
      "/me/top/tracks": { data: MOCK_TOP_TRACKS },
      "/me/player/recently-played": { data: MOCK_RECENTLY_PLAYED },
      "/me/player/currently-playing": { data: MOCK_NOW_PLAYING },
    }) as unknown as typeof globalThis.fetch;

    plugin = createSpotifyPlugin();
    await plugin.initialize({
      enabled: true,
      client_id_env: "TEST_SPOTIFY_CLIENT_ID",
      client_secret_env: "TEST_SPOTIFY_CLIENT_SECRET",
      refresh_token_env: "TEST_SPOTIFY_REFRESH_TOKEN",
    });
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    process.env = { ...originalEnv };
  });

  describe("initialization", () => {
    it("creates a plugin with correct metadata", () => {
      expect(plugin.name).toBe("spotify");
      expect(plugin.version).toBe("0.1.0");
      expect(plugin.description).toContain("Spotify");
    });
  });

  describe("resources", () => {
    it("provides 3 resources", () => {
      expect(plugin.getResources()).toHaveLength(3);
    });

    it("has correct URIs", () => {
      const uris = plugin.getResources().map((r) => r.uri);
      expect(uris).toContain("me://spotify/top-artists");
      expect(uris).toContain("me://spotify/top-tracks");
      expect(uris).toContain("me://spotify/recently-played");
    });

    it("reads top artists", async () => {
      const resource = plugin.getResources().find((r) => r.uri === "me://spotify/top-artists")!;
      const data = JSON.parse(await resource.read());
      expect(data).toHaveLength(2);
      expect(data[0].name).toBe("Radiohead");
      expect(data[0].genres).toContain("alternative rock");
    });

    it("reads top tracks", async () => {
      const resource = plugin.getResources().find((r) => r.uri === "me://spotify/top-tracks")!;
      const data = JSON.parse(await resource.read());
      expect(data).toHaveLength(1);
      expect(data[0].name).toBe("Everything In Its Right Place");
      expect(data[0].artist).toBe("Radiohead");
    });

    it("reads recently played", async () => {
      const resource = plugin.getResources().find((r) => r.uri === "me://spotify/recently-played")!;
      const data = JSON.parse(await resource.read());
      expect(data).toHaveLength(1);
      expect(data[0].track).toBe("Joga");
      expect(data[0].played_at).toBe("2024-06-01T12:00:00Z");
    });
  });

  describe("tools", () => {
    it("provides 2 tools", () => {
      expect(plugin.getTools()).toHaveLength(2);
    });

    it("get_spotify_now_playing returns current track", async () => {
      const tool = plugin.getTools().find((t) => t.name === "get_spotify_now_playing")!;
      const result = JSON.parse(await tool.execute({}));
      expect(result.status).toBe("playing");
      expect(result.track).toBe("Idioteque");
      expect(result.artist).toBe("Radiohead");
    });

    it("get_spotify_now_playing falls back to recently played when 204", async () => {
      globalThis.fetch = mockFetch({
        "accounts.spotify.com/api/token": { data: MOCK_TOKEN_RESPONSE },
        "/me/player/currently-playing": { status: 204 },
        "/me/player/recently-played": { data: MOCK_RECENTLY_PLAYED },
      }) as unknown as typeof globalThis.fetch;

      const freshPlugin = createSpotifyPlugin();
      await freshPlugin.initialize({
        enabled: true,
        client_id_env: "TEST_SPOTIFY_CLIENT_ID",
        client_secret_env: "TEST_SPOTIFY_CLIENT_SECRET",
        refresh_token_env: "TEST_SPOTIFY_REFRESH_TOKEN",
      });

      const tool = freshPlugin.getTools().find((t) => t.name === "get_spotify_now_playing")!;
      const result = JSON.parse(await tool.execute({}));
      expect(result.status).toBe("last_played");
      expect(result.track).toBe("Joga");
    });

    it("get_spotify_music_taste returns genre summary", async () => {
      const tool = plugin.getTools().find((t) => t.name === "get_spotify_music_taste")!;
      const result = JSON.parse(await tool.execute({}));
      expect(result.top_artists).toContain("Radiohead");
      expect(result.top_genres.length).toBeGreaterThan(0);
      expect(result.top_genres[0].genre).toBe("electronic");
    });
  });
});
