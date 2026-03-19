/**
 * Reddit Plugin — Live posts and karma
 *
 * Provides real-time access to your Reddit profile, karma, and recent posts.
 *
 * @config username: Reddit username
 */
import { z } from "zod";
import type { McpMePlugin, PluginResource, PluginTool } from "../../plugin-engine/types.js";
import { redditPluginConfigSchema, type RedditPluginConfig } from "./schema.js";

class RedditPlugin implements McpMePlugin {
  name = "reddit";
  description = "Live Reddit karma, profile, and recent posts.";
  version = "0.1.0";

  private config!: RedditPluginConfig;
  private headers = { Accept: "application/json", "User-Agent": "mcp-me:0.1.0 (by /u/mcp-me-bot)" };

  async initialize(rawConfig: Record<string, unknown>): Promise<void> {
    this.config = redditPluginConfigSchema.parse(rawConfig);
  }

  getResources(): PluginResource[] {
    return [
      {
        name: "reddit-profile",
        uri: "me://reddit/profile",
        title: "Reddit Profile",
        description: `Reddit profile for u/${this.config.username}`,
        read: async () => {
          const resp = await fetch(`https://www.reddit.com/user/${this.config.username}/about.json`, { headers: this.headers });
          if (!resp.ok) throw new Error(`Reddit API error: ${resp.status}`);
          const data = (await resp.json()) as { data: Record<string, unknown> };
          return JSON.stringify({
            username: data.data.name,
            karma: data.data.total_karma,
            link_karma: data.data.link_karma,
            comment_karma: data.data.comment_karma,
            created: new Date((data.data.created_utc as number) * 1000).toISOString(),
          }, null, 2);
        },
      },
      {
        name: "reddit-posts",
        uri: "me://reddit/posts",
        title: "Reddit Recent Posts",
        description: `Recent posts by u/${this.config.username}`,
        read: async () => {
          const resp = await fetch(`https://www.reddit.com/user/${this.config.username}/submitted.json?limit=10&sort=new`, { headers: this.headers });
          if (!resp.ok) throw new Error(`Reddit API error: ${resp.status}`);
          const data = (await resp.json()) as { data: { children: { data: { title: string; subreddit: string; score: number; url: string; created_utc: number; num_comments: number } }[] } };
          return JSON.stringify(data.data.children.map((c) => ({
            title: c.data.title, subreddit: `r/${c.data.subreddit}`, score: c.data.score,
            comments: c.data.num_comments, url: c.data.url,
            date: new Date(c.data.created_utc * 1000).toISOString(),
          })), null, 2);
        },
      },
    ];
  }

  getTools(): PluginTool[] {
    return [
      {
        name: "get_reddit_karma",
        title: "Get Reddit Karma",
        description: `Get live karma breakdown for u/${this.config.username}`,
        inputSchema: z.object({}),
        annotations: { readOnlyHint: true },
        execute: async () => {
          const resp = await fetch(`https://www.reddit.com/user/${this.config.username}/about.json`, { headers: this.headers });
          if (!resp.ok) throw new Error(`Reddit API error: ${resp.status}`);
          const data = (await resp.json()) as { data: { name: string; total_karma: number; link_karma: number; comment_karma: number } };
          return JSON.stringify({ username: data.data.name, total: data.data.total_karma, post: data.data.link_karma, comment: data.data.comment_karma });
        },
      },
    ];
  }
}

export default function createPlugin(): McpMePlugin {
  return new RedditPlugin();
}
