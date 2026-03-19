/**
 * WakaTime Generator
 *
 * Fetches your coding time stats, top languages, editors, and OS breakdown.
 *
 * @flag --wakatime <username>
 * @example mcp-me generate ./profile --wakatime myuser
 * @auth None required if profile is public. Set "Display code time publicly" in WakaTime settings.
 * @api https://wakatime.com/developers
 * @data identity, skills (languages, editors, OS), faq (coding time summary)
 */
import type { GeneratorSource, PartialProfile } from "./types.js";

interface WakaTimeStats {
  data: {
    languages: { name: string; percent: number; total_seconds: number; text: string }[];
    editors: { name: string; percent: number; text: string }[];
    operating_systems: { name: string; percent: number; text: string }[];
    categories: { name: string; percent: number; text: string }[];
    human_readable_total: string;
    human_readable_daily_average: string;
  };
}

export const wakatimeGenerator: GeneratorSource = {
  name: "wakatime",
  flag: "wakatime",
  flagArg: "<username>",
  description: "WakaTime coding time, languages, editors",
  category: "activity",

  async generate(config): Promise<PartialProfile> {
    const username = config.username as string;
    if (!username) throw new Error("WakaTime username is required");

    console.log(`  [WakaTime] Fetching coding stats for @${username}...`);
    const response = await fetch(
      `https://wakatime.com/api/v1/users/${username}/stats/last_year`,
      { headers: { Accept: "application/json", "User-Agent": "mcp-me-generator" } },
    );
    if (!response.ok) {
      throw new Error(`WakaTime API error: ${response.status} ${response.statusText}`);
    }

    const stats = (await response.json()) as WakaTimeStats;
    const data = stats.data;
    console.log(`  [WakaTime] Total coding time: ${data.human_readable_total}, daily avg: ${data.human_readable_daily_average}.`);

    // Languages as programming skills
    const languages = data.languages
      .filter((l) => l.percent >= 1)
      .slice(0, 15)
      .map((l) => ({
        name: l.name,
        category: "programming",
        proficiency: l.percent >= 30 ? "expert" : l.percent >= 15 ? "advanced" : l.percent >= 5 ? "intermediate" : "beginner",
        description: `${l.text} coding time (${l.percent.toFixed(1)}% of total) on WakaTime`,
      }));

    // Editors as tools
    const tools = [
      ...data.editors.filter((e) => e.percent >= 5).map((e) => ({
        name: e.name,
        category: "editor",
      })),
      ...data.operating_systems.filter((o) => o.percent >= 10).map((o) => ({
        name: o.name,
        category: "os",
      })),
    ];

    const identity: PartialProfile["identity"] = {
      contact: {
        social: [
          { platform: "wakatime", url: `https://wakatime.com/@${username}`, username },
        ],
      },
    };

    const faq: PartialProfile["faq"] = [
      {
        question: "How much do you code?",
        answer: `Over the last year: ${data.human_readable_total} total, averaging ${data.human_readable_daily_average} per day. Top languages: ${data.languages.slice(0, 3).map((l) => l.name).join(", ")}.`,
        category: "coding",
      },
    ];

    return {
      identity,
      skills: { languages, tools },
      faq,
    };
  },
};
