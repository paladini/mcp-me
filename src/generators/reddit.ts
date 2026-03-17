import type { GeneratorSource, PartialProfile } from "./types.js";

interface RedditUser {
  data: {
    name: string;
    subreddit: {
      display_name_prefixed: string;
      title: string;
      public_description: string;
      url: string;
      icon_img?: string;
    };
    total_karma: number;
    link_karma: number;
    comment_karma: number;
    created_utc: number;
    is_gold: boolean;
  };
}

export const redditGenerator: GeneratorSource = {
  name: "reddit",

  async generate(config): Promise<PartialProfile> {
    const username = config.username as string;
    if (!username) throw new Error("Reddit username is required");

    console.log(`  [Reddit] Fetching profile for u/${username}...`);
    const response = await fetch(`https://www.reddit.com/user/${username}/about.json`, {
      headers: { "User-Agent": "mcp-me-generator/0.1.0" },
    });
    if (!response.ok) {
      throw new Error(`Reddit API error: ${response.status} ${response.statusText}`);
    }
    const user = (await response.json()) as RedditUser;
    const data = user.data;

    console.log(`  [Reddit] Karma: ${data.total_karma.toLocaleString()}, account since ${new Date(data.created_utc * 1000).getFullYear()}.`);

    const bioText = data.subreddit?.public_description?.trim() || null;

    const identity: PartialProfile["identity"] = {
      ...(bioText ? { bio: bioText } : {}),
      contact: {
        social: [
          {
            platform: "reddit",
            url: `https://www.reddit.com/user/${username}`,
            username: `u/${username}`,
          },
        ],
      },
    };

    const faq: PartialProfile["faq"] = [
      {
        question: "Are you on Reddit?",
        answer: `Yes, I'm u/${username} on Reddit with ${data.total_karma.toLocaleString()} karma (${data.link_karma.toLocaleString()} post, ${data.comment_karma.toLocaleString()} comment). Account since ${new Date(data.created_utc * 1000).getFullYear()}.`,
        category: "social",
      },
    ];

    return { identity, faq };
  },
};
