/**
 * Hacker News Plugin — Live submissions and karma
 *
 * Provides real-time access to your HN submissions, comments, and karma.
 *
 * @config username: Hacker News username
 */
import { z } from "zod";
import type { McpMePlugin, PluginResource, PluginTool } from "../../plugin-engine/types.js";
import { hackernewsPluginConfigSchema, type HackerNewsPluginConfig } from "./schema.js";

interface HNItem {
  id: number;
  type: string;
  title?: string;
  url?: string;
  text?: string;
  score?: number;
  descendants?: number;
  time: number;
}

class HackerNewsPlugin implements McpMePlugin {
  name = "hackernews";
  description = "Live Hacker News submissions, comments, and karma.";
  version = "0.1.0";

  private config!: HackerNewsPluginConfig;

  async initialize(rawConfig: Record<string, unknown>): Promise<void> {
    this.config = hackernewsPluginConfigSchema.parse(rawConfig);
  }

  private async fetchHN<T>(path: string): Promise<T> {
    const resp = await fetch(`https://hacker-news.firebaseio.com/v0/${path}.json`, {
      headers: { Accept: "application/json", "User-Agent": "mcp-me" },
    });
    if (!resp.ok) throw new Error(`HN API error: ${resp.status}`);
    return resp.json() as Promise<T>;
  }

  getResources(): PluginResource[] {
    return [
      {
        name: "hackernews-profile",
        uri: "me://hackernews/profile",
        title: "Hacker News Profile",
        description: `HN profile for ${this.config.username}`,
        read: async () => {
          const user = await this.fetchHN<{ id: string; karma: number; about?: string; submitted?: number[] }>(`user/${this.config.username}`);
          return JSON.stringify({ username: user.id, karma: user.karma, about: user.about, submissions: user.submitted?.length ?? 0 }, null, 2);
        },
      },
      {
        name: "hackernews-submissions",
        uri: "me://hackernews/submissions",
        title: "HN Recent Submissions",
        description: `Recent submissions by ${this.config.username}`,
        read: async () => {
          const user = await this.fetchHN<{ submitted?: number[] }>(`user/${this.config.username}`);
          const ids = (user.submitted ?? []).slice(0, 10);
          const items: HNItem[] = [];
          for (const id of ids) {
            try {
              const item = await this.fetchHN<HNItem>(`item/${id}`);
              if (item.type === "story") items.push(item);
            } catch { /* skip failed items */ }
          }
          return JSON.stringify(items.map((i) => ({
            title: i.title, url: i.url ?? `https://news.ycombinator.com/item?id=${i.id}`,
            score: i.score, comments: i.descendants, date: new Date(i.time * 1000).toISOString(),
          })), null, 2);
        },
      },
    ];
  }

  getTools(): PluginTool[] {
    return [
      {
        name: "get_hn_karma",
        title: "Get HN Karma",
        description: `Get current karma and submission count for ${this.config.username}`,
        inputSchema: z.object({}),
        annotations: { readOnlyHint: true },
        execute: async () => {
          const user = await this.fetchHN<{ id: string; karma: number; submitted?: number[] }>(`user/${this.config.username}`);
          return JSON.stringify({ username: user.id, karma: user.karma, submissions: user.submitted?.length ?? 0 });
        },
      },
    ];
  }
}

export default function createPlugin(): McpMePlugin {
  return new HackerNewsPlugin();
}
