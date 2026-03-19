/**
 * WakaTime Plugin — Live coding activity
 *
 * Provides real-time coding stats: today's coding time, current project,
 * languages used today, and weekly summaries.
 *
 * @config username: WakaTime username
 * @config api_key_env: (optional) env var name for API key (private profiles)
 */
import { z } from "zod";
import type { McpMePlugin, PluginResource, PluginTool } from "../../plugin-engine/types.js";
import { wakatimePluginConfigSchema, type WakaTimePluginConfig } from "./schema.js";

class WakaTimePlugin implements McpMePlugin {
  name = "wakatime";
  description = "Live coding activity from WakaTime — today's stats, current project, weekly summary.";
  version = "0.1.0";

  private config!: WakaTimePluginConfig;
  private headers: Record<string, string> = {};
  private baseUrl = "";

  async initialize(rawConfig: Record<string, unknown>): Promise<void> {
    this.config = wakatimePluginConfigSchema.parse(rawConfig);
    this.headers = { Accept: "application/json", "User-Agent": "mcp-me" };
    const apiKey = this.config.api_key_env ? process.env[this.config.api_key_env] : undefined;
    if (apiKey) {
      this.baseUrl = `https://wakatime.com/api/v1`;
      this.headers["Authorization"] = `Basic ${Buffer.from(apiKey).toString("base64")}`;
    } else {
      this.baseUrl = `https://wakatime.com/api/v1/users/${this.config.username}`;
    }
  }

  private async fetchWaka<T>(path: string): Promise<T> {
    const url = this.config.api_key_env && process.env[this.config.api_key_env]
      ? `${this.baseUrl}/users/current${path}`
      : `${this.baseUrl}${path}`;
    const resp = await fetch(url, { headers: this.headers });
    if (!resp.ok) throw new Error(`WakaTime API error: ${resp.status} ${resp.statusText}`);
    return resp.json() as Promise<T>;
  }

  getResources(): PluginResource[] {
    return [
      {
        name: "wakatime-today",
        uri: "me://wakatime/today",
        title: "WakaTime Today",
        description: "Today's coding activity",
        read: async () => {
          const data = await this.fetchWaka<{ data: { grand_total: { text: string }; languages: { name: string; text: string }[]; projects: { name: string; text: string }[] } }>("/summaries?range=today");
          const today = data.data;
          return JSON.stringify({ total: today.grand_total?.text, languages: today.languages?.slice(0, 5), projects: today.projects?.slice(0, 5) }, null, 2);
        },
      },
      {
        name: "wakatime-stats",
        uri: "me://wakatime/stats",
        title: "WakaTime Stats (Last 7 Days)",
        description: "Coding stats for the last 7 days",
        read: async () => {
          const data = await this.fetchWaka<{ data: { human_readable_total: string; languages: { name: string; percent: number; text: string }[]; editors: { name: string; text: string }[] } }>("/stats/last_7_days");
          return JSON.stringify({ total: data.data.human_readable_total, languages: data.data.languages?.slice(0, 10), editors: data.data.editors?.slice(0, 5) }, null, 2);
        },
      },
    ];
  }

  getTools(): PluginTool[] {
    return [
      {
        name: "get_wakatime_today",
        title: "Get Today's Coding Activity",
        description: "Get how much coding has been done today, in which languages and projects",
        inputSchema: z.object({}),
        annotations: { readOnlyHint: true },
        execute: async () => {
          const data = await this.fetchWaka<{ data: { grand_total: { text: string }; languages: { name: string; text: string }[]; projects: { name: string; text: string }[] } }>("/summaries?range=today");
          const today = data.data;
          return JSON.stringify({ total: today.grand_total?.text, languages: today.languages?.slice(0, 5), projects: today.projects?.slice(0, 5) }, null, 2);
        },
      },
    ];
  }
}

export default function createPlugin(): McpMePlugin {
  return new WakaTimePlugin();
}
