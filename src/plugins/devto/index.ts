/**
 * DEV.to Plugin — Live article stats and latest posts
 *
 * Provides real-time access to your published articles, reactions,
 * comments, and latest post data from DEV.to.
 *
 * @config username: DEV.to username
 * @config api_key_env: (optional) env var for API key
 */
import { z } from "zod";
import type { McpMePlugin, PluginResource, PluginTool } from "../../plugin-engine/types.js";
import { devtoPluginConfigSchema, type DevToPluginConfig } from "./schema.js";

interface DevToArticle {
  id: number;
  title: string;
  description: string;
  url: string;
  published_at: string;
  positive_reactions_count: number;
  comments_count: number;
  reading_time_minutes: number;
  tag_list: string[];
  page_views_count?: number;
}

class DevToPlugin implements McpMePlugin {
  name = "devto";
  description = "Live article stats and latest posts from DEV.to.";
  version = "0.1.0";

  private config!: DevToPluginConfig;
  private headers: Record<string, string> = {};

  async initialize(rawConfig: Record<string, unknown>): Promise<void> {
    this.config = devtoPluginConfigSchema.parse(rawConfig);
    this.headers = { Accept: "application/json", "User-Agent": "mcp-me" };
    if (this.config.api_key_env) {
      const key = process.env[this.config.api_key_env];
      if (key) this.headers["api-key"] = key;
    }
  }

  private async fetchArticles(): Promise<DevToArticle[]> {
    const resp = await fetch(`https://dev.to/api/articles?username=${this.config.username}&per_page=30`, { headers: this.headers });
    if (!resp.ok) throw new Error(`DEV.to API error: ${resp.status}`);
    return resp.json() as Promise<DevToArticle[]>;
  }

  getResources(): PluginResource[] {
    return [
      {
        name: "devto-articles",
        uri: "me://devto/articles",
        title: "DEV.to Articles",
        description: `Latest articles by ${this.config.username}`,
        read: async () => {
          const articles = await this.fetchArticles();
          return JSON.stringify(articles.map((a) => ({
            title: a.title, url: a.url, reactions: a.positive_reactions_count,
            comments: a.comments_count, tags: a.tag_list, published: a.published_at,
          })), null, 2);
        },
      },
      {
        name: "devto-stats",
        uri: "me://devto/stats",
        title: "DEV.to Stats",
        description: `Aggregate stats for ${this.config.username}`,
        read: async () => {
          const articles = await this.fetchArticles();
          const totalReactions = articles.reduce((s, a) => s + a.positive_reactions_count, 0);
          const totalComments = articles.reduce((s, a) => s + a.comments_count, 0);
          return JSON.stringify({ articles: articles.length, totalReactions, totalComments }, null, 2);
        },
      },
    ];
  }

  getTools(): PluginTool[] {
    return [
      {
        name: "get_devto_latest",
        title: "Get Latest DEV.to Articles",
        description: `Get the most recent articles by ${this.config.username}`,
        inputSchema: z.object({ limit: z.number().optional().describe("Number of articles to return (default 5)") }),
        annotations: { readOnlyHint: true },
        execute: async (input) => {
          const limit = (input.limit as number) ?? 5;
          const articles = await this.fetchArticles();
          return JSON.stringify(articles.slice(0, limit).map((a) => ({
            title: a.title, url: a.url, reactions: a.positive_reactions_count, tags: a.tag_list,
          })), null, 2);
        },
      },
    ];
  }
}

export default function createPlugin(): McpMePlugin {
  return new DevToPlugin();
}
