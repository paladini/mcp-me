/**
 * YouTube Plugin — Live channel and video data
 *
 * Provides real-time access to your YouTube channel stats, recent videos, and search.
 * Uses YouTube Data API v3 (requires API key) or falls back to RSS feed.
 *
 * @config channel_id: YouTube channel ID
 * @config api_key_env: Env var for YouTube Data API v3 key (optional)
 */
import { z } from "zod";
import type { McpMePlugin, PluginResource, PluginTool } from "../../plugin-engine/types.js";
import { youtubePluginConfigSchema, type YouTubePluginConfig } from "./schema.js";

interface YouTubeVideo {
  title: string;
  videoId: string;
  description: string;
  publishedAt: string;
  viewCount?: string;
  likeCount?: string;
}

class YouTubePlugin implements McpMePlugin {
  name = "youtube";
  description = "Live YouTube channel data — recent videos, stats, and search.";
  version = "0.1.0";

  private config!: YouTubePluginConfig;
  private apiKey: string | null = null;

  async initialize(rawConfig: Record<string, unknown>): Promise<void> {
    this.config = youtubePluginConfigSchema.parse(rawConfig);
    if (this.config.api_key_env) {
      this.apiKey = process.env[this.config.api_key_env] ?? null;
    }
  }

  private async fetchRSSVideos(): Promise<YouTubeVideo[]> {
    const resp = await fetch(
      `https://www.youtube.com/feeds/videos.xml?channel_id=${this.config.channel_id}`,
      { headers: { "User-Agent": "mcp-me" } },
    );
    if (!resp.ok) throw new Error(`YouTube RSS error: ${resp.status}`);
    const xml = await resp.text();

    // Simple XML parsing for RSS entries
    const entries = [...xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g)];
    return entries.slice(0, this.config.max_videos).map((entry) => {
      const content = entry[1];
      const title = content.match(/<title>([^<]+)<\/title>/)?.[1] ?? "Untitled";
      const videoId = content.match(/<yt:videoId>([^<]+)<\/yt:videoId>/)?.[1] ?? "";
      const published = content.match(/<published>([^<]+)<\/published>/)?.[1] ?? "";
      const description = content.match(/<media:description>([^<]*)<\/media:description>/)?.[1] ?? "";

      return { title, videoId, description: description.slice(0, 200), publishedAt: published };
    });
  }

  private async fetchAPIVideos(): Promise<YouTubeVideo[]> {
    if (!this.apiKey) return this.fetchRSSVideos();

    const resp = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${this.config.channel_id}&order=date&maxResults=${this.config.max_videos}&type=video&key=${this.apiKey}`,
      { headers: { Accept: "application/json" } },
    );
    if (!resp.ok) return this.fetchRSSVideos(); // Fallback to RSS

    const data = (await resp.json()) as {
      items?: { id: { videoId: string }; snippet: { title: string; description: string; publishedAt: string } }[];
    };

    return (data.items ?? []).map((item) => ({
      title: item.snippet.title,
      videoId: item.id.videoId,
      description: item.snippet.description.slice(0, 200),
      publishedAt: item.snippet.publishedAt,
    }));
  }

  getResources(): PluginResource[] {
    return [
      {
        name: "youtube-channel",
        uri: "me://youtube/channel",
        title: "YouTube Channel",
        description: `YouTube channel ${this.config.channel_id}`,
        read: async () => {
          if (this.apiKey) {
            const resp = await fetch(
              `https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&id=${this.config.channel_id}&key=${this.apiKey}`,
              { headers: { Accept: "application/json" } },
            );
            if (resp.ok) {
              const data = (await resp.json()) as { items?: { snippet: Record<string, unknown>; statistics: Record<string, unknown> }[] };
              const channel = data.items?.[0];
              if (channel) {
                return JSON.stringify({ ...channel.snippet, ...channel.statistics }, null, 2);
              }
            }
          }
          return JSON.stringify({ channel_id: this.config.channel_id, note: "Set api_key_env for full channel stats" }, null, 2);
        },
      },
      {
        name: "youtube-videos",
        uri: "me://youtube/videos",
        title: "YouTube Recent Videos",
        description: `Recent videos from channel ${this.config.channel_id}`,
        read: async () => {
          const videos = await this.fetchAPIVideos();
          return JSON.stringify(
            videos.map((v) => ({
              title: v.title,
              url: `https://www.youtube.com/watch?v=${v.videoId}`,
              published: v.publishedAt,
              description: v.description,
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
        name: "get_youtube_videos",
        title: "Get YouTube Videos",
        description: `Get recent videos from the channel`,
        inputSchema: z.object({
          limit: z.number().optional().describe("Number of videos to return (default 10)"),
        }),
        annotations: { readOnlyHint: true },
        execute: async (input) => {
          const limit = Math.min((input.limit as number) ?? 10, this.config.max_videos);
          const videos = await this.fetchAPIVideos();
          return JSON.stringify(
            videos.slice(0, limit).map((v) => ({
              title: v.title,
              url: `https://www.youtube.com/watch?v=${v.videoId}`,
              published: v.publishedAt,
            })),
            null,
            2,
          );
        },
      },
    ];
  }
}

export default function createPlugin(): McpMePlugin {
  return new YouTubePlugin();
}
