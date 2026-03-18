/**
 * Hacker News Generator
 *
 * Fetches your HN profile, karma, and submission count.
 *
 * @flag --hackernews <username>
 * @example mcp-me generate ./profile --hackernews pg
 * @auth None required (public Firebase API)
 * @api https://github.com/HackerNews/API
 * @data identity (bio), faq (karma, submissions)
 */
import type { GeneratorSource, PartialProfile } from "./types.js";

interface HNUser {
  id: string;
  about?: string;
  karma: number;
  created: number;
  submitted?: number[];
}

export const hackernewsGenerator: GeneratorSource = {
  name: "hackernews",
  flag: "hackernews",
  flagArg: "<username>",
  description: "Hacker News karma, submissions, bio",
  category: "community",

  async generate(config): Promise<PartialProfile> {
    const username = config.username as string;
    if (!username) throw new Error("Hacker News username is required");

    console.log(`  [HackerNews] Fetching profile for ${username}...`);
    const response = await fetch(`https://hacker-news.firebaseio.com/v0/user/${username}.json`, {
      headers: { Accept: "application/json", "User-Agent": "mcp-me-generator" },
    });
    if (!response.ok) {
      throw new Error(`Hacker News API error: ${response.status} ${response.statusText}`);
    }

    const user = (await response.json()) as HNUser | null;
    if (!user) throw new Error(`Hacker News user "${username}" not found`);

    console.log(`  [HackerNews] Karma: ${user.karma}, submissions: ${user.submitted?.length ?? 0}.`);

    const bioText = user.about
      ? user.about.replace(/<[^>]*>/g, "").replace(/&amp;/g, "&").replace(/&#x27;/g, "'").trim()
      : undefined;

    const identity: PartialProfile["identity"] = {
      ...(bioText ? { bio: bioText } : {}),
      contact: {
        social: [
          { platform: "hackernews", url: `https://news.ycombinator.com/user?id=${username}`, username },
        ],
      },
    };

    const faq: PartialProfile["faq"] = [
      {
        question: "Are you active on Hacker News?",
        answer: `Yes, I'm on HN as ${username} with ${user.karma.toLocaleString()} karma and ${(user.submitted?.length ?? 0).toLocaleString()} submissions. Account created ${new Date(user.created * 1000).getFullYear()}.`,
        category: "community",
      },
    ];

    return { identity, faq };
  },
};
