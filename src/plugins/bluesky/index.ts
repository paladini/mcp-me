/**
 * Bluesky Plugin — Live Fediverse feed
 *
 * Provides real-time access to your Bluesky posts, profile, and follower stats
 * via the AT Protocol public API.
 *
 * @config handle: Bluesky handle (e.g. alice.bsky.social)
 */
import { z } from "zod";
import type { McpMePlugin, PluginResource, PluginTool } from "../../plugin-engine/types.js";
import { blueskyPluginConfigSchema, type BlueskyPluginConfig } from "./schema.js";

interface BSkyPost {
  post: {
    uri: string;
    record: { text: string; createdAt: string };
    likeCount: number;
    repostCount: number;
    replyCount: number;
  };
}

class BlueskyPlugin implements McpMePlugin {
  name = "bluesky";
  description = "Live Bluesky/AT Protocol feed — recent posts, profile, follower stats.";
  version = "0.1.0";

  private config!: BlueskyPluginConfig;

  async initialize(rawConfig: Record<string, unknown>): Promise<void> {
    this.config = blueskyPluginConfigSchema.parse(rawConfig);
  }

  private async fetchBsky<T>(path: string): Promise<T> {
    const resp = await fetch(`https://public.api.bsky.app/xrpc/${path}`, {
      headers: { Accept: "application/json", "User-Agent": "mcp-me" },
    });
    if (!resp.ok) throw new Error(`Bluesky API error: ${resp.status} ${resp.statusText}`);
    return resp.json() as Promise<T>;
  }

  getResources(): PluginResource[] {
    return [
      {
        name: "bluesky-profile",
        uri: "me://bluesky/profile",
        title: "Bluesky Profile",
        description: `Profile for ${this.config.handle}`,
        read: async () => {
          const profile = await this.fetchBsky<Record<string, unknown>>(
            `app.bsky.actor.getProfile?actor=${encodeURIComponent(this.config.handle)}`,
          );
          return JSON.stringify(profile, null, 2);
        },
      },
      {
        name: "bluesky-feed",
        uri: "me://bluesky/feed",
        title: "Bluesky Recent Posts",
        description: `Recent posts by ${this.config.handle}`,
        read: async () => {
          const data = await this.fetchBsky<{ feed: BSkyPost[] }>(
            `app.bsky.feed.getAuthorFeed?actor=${encodeURIComponent(this.config.handle)}&limit=20`,
          );
          const posts = (data.feed ?? []).map((p) => ({
            text: p.post.record.text?.slice(0, 300),
            date: p.post.record.createdAt,
            likes: p.post.likeCount,
            reposts: p.post.repostCount,
            replies: p.post.replyCount,
          }));
          return JSON.stringify(posts, null, 2);
        },
      },
    ];
  }

  getTools(): PluginTool[] {
    return [
      {
        name: "get_bluesky_posts",
        title: "Get Bluesky Posts",
        description: `Get recent posts from ${this.config.handle}`,
        inputSchema: z.object({
          limit: z.number().optional().describe("Number of posts (default 10, max 50)"),
        }),
        annotations: { readOnlyHint: true },
        execute: async (input) => {
          const limit = Math.min((input.limit as number) ?? 10, 50);
          const data = await this.fetchBsky<{ feed: BSkyPost[] }>(
            `app.bsky.feed.getAuthorFeed?actor=${encodeURIComponent(this.config.handle)}&limit=${limit}`,
          );
          return JSON.stringify((data.feed ?? []).map((p) => ({
            text: p.post.record.text?.slice(0, 300),
            date: p.post.record.createdAt,
            likes: p.post.likeCount,
          })), null, 2);
        },
      },
    ];
  }
}

export default function createPlugin(): McpMePlugin {
  return new BlueskyPlugin();
}
