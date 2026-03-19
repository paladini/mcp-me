/**
 * Mastodon Plugin — Live Fediverse feed
 *
 * Provides real-time access to your Mastodon profile, toots, and engagement stats
 * via the Mastodon API v1.
 *
 * @config handle: Full Mastodon handle (e.g. user@mastodon.social)
 */
import { z } from "zod";
import type { McpMePlugin, PluginResource, PluginTool } from "../../plugin-engine/types.js";
import { mastodonPluginConfigSchema, type MastodonPluginConfig } from "./schema.js";

interface MastodonAccount {
  id: string;
  username: string;
  display_name: string;
  note: string;
  url: string;
  followers_count: number;
  following_count: number;
  statuses_count: number;
  created_at: string;
}

interface MastodonStatus {
  id: string;
  content: string;
  created_at: string;
  favourites_count: number;
  reblogs_count: number;
  replies_count: number;
  url: string;
}

class MastodonPlugin implements McpMePlugin {
  name = "mastodon";
  description = "Live Mastodon/Fediverse profile, toots, and engagement stats.";
  version = "0.1.0";

  private config!: MastodonPluginConfig;
  private instance = "";
  private username = "";

  async initialize(rawConfig: Record<string, unknown>): Promise<void> {
    this.config = mastodonPluginConfigSchema.parse(rawConfig);
    const parts = this.config.handle.split("@").filter(Boolean);
    if (parts.length < 2) {
      throw new Error("Handle must be in format user@instance.tld");
    }
    this.username = parts[0];
    this.instance = parts[1];
  }

  private async fetchMastodon<T>(path: string): Promise<T> {
    const resp = await fetch(`https://${this.instance}/api/v1${path}`, {
      headers: { Accept: "application/json", "User-Agent": "mcp-me" },
    });
    if (!resp.ok) throw new Error(`Mastodon API error: ${resp.status} ${resp.statusText}`);
    return resp.json() as Promise<T>;
  }

  private async lookupAccount(): Promise<MastodonAccount> {
    const accounts = await this.fetchMastodon<MastodonAccount[]>(
      `/accounts/lookup?acct=${this.username}`,
    );
    // lookup returns a single account, not an array in Mastodon v1
    // but some implementations return differently, handle both
    if (Array.isArray(accounts)) {
      if (accounts.length === 0) throw new Error(`Account ${this.config.handle} not found`);
      return accounts[0];
    }
    return accounts as unknown as MastodonAccount;
  }

  getResources(): PluginResource[] {
    return [
      {
        name: "mastodon-profile",
        uri: "me://mastodon/profile",
        title: "Mastodon Profile",
        description: `Mastodon profile for ${this.config.handle}`,
        read: async () => {
          const account = await this.lookupAccount();
          return JSON.stringify(
            {
              username: account.username,
              display_name: account.display_name,
              bio: account.note?.replace(/<[^>]+>/g, ""),
              url: account.url,
              followers: account.followers_count,
              following: account.following_count,
              toots: account.statuses_count,
              joined: account.created_at,
            },
            null,
            2,
          );
        },
      },
      {
        name: "mastodon-toots",
        uri: "me://mastodon/toots",
        title: "Mastodon Recent Toots",
        description: `Recent toots by ${this.config.handle}`,
        read: async () => {
          const account = await this.lookupAccount();
          const statuses = await this.fetchMastodon<MastodonStatus[]>(
            `/accounts/${account.id}/statuses?limit=20&exclude_replies=true`,
          );
          return JSON.stringify(
            statuses.map((s) => ({
              text: s.content?.replace(/<[^>]+>/g, "").slice(0, 300),
              date: s.created_at,
              favourites: s.favourites_count,
              boosts: s.reblogs_count,
              replies: s.replies_count,
              url: s.url,
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
        name: "get_mastodon_posts",
        title: "Get Mastodon Posts",
        description: `Get recent toots from ${this.config.handle}`,
        inputSchema: z.object({
          limit: z.number().optional().describe("Number of toots to fetch (default 10, max 40)"),
          exclude_replies: z.boolean().optional().describe("Exclude replies (default true)"),
        }),
        annotations: { readOnlyHint: true },
        execute: async (input) => {
          const limit = Math.min((input.limit as number) ?? 10, 40);
          const excludeReplies = (input.exclude_replies as boolean) ?? true;
          const account = await this.lookupAccount();
          const statuses = await this.fetchMastodon<MastodonStatus[]>(
            `/accounts/${account.id}/statuses?limit=${limit}&exclude_replies=${excludeReplies}`,
          );
          return JSON.stringify(
            statuses.map((s) => ({
              text: s.content?.replace(/<[^>]+>/g, "").slice(0, 300),
              date: s.created_at,
              favourites: s.favourites_count,
              boosts: s.reblogs_count,
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
  return new MastodonPlugin();
}
