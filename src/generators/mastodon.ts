import type { GeneratorSource, PartialProfile } from "./types.js";

interface MastodonAccount {
  id: string;
  username: string;
  display_name: string;
  note: string;
  url: string;
  avatar: string;
  header: string;
  followers_count: number;
  following_count: number;
  statuses_count: number;
  created_at: string;
  fields: { name: string; value: string }[];
}

interface MastodonStatus {
  id: string;
  content: string;
  created_at: string;
  tags: { name: string }[];
  reblogs_count: number;
  favourites_count: number;
  url: string;
}

export const mastodonGenerator: GeneratorSource = {
  name: "mastodon",

  async generate(config): Promise<PartialProfile> {
    const handle = config.handle as string;
    if (!handle) throw new Error("Mastodon handle is required (e.g. user@mastodon.social)");

    const atIndex = handle.lastIndexOf("@");
    if (atIndex <= 0) throw new Error("Invalid Mastodon handle. Use format: user@instance.social");

    const username = handle.slice(0, atIndex);
    const instance = handle.slice(atIndex + 1);

    console.log(`  [Mastodon] Fetching profile for @${username}@${instance}...`);

    const lookupResponse = await fetch(
      `https://${instance}/api/v1/accounts/lookup?acct=${username}`,
      { headers: { Accept: "application/json", "User-Agent": "mcp-me-generator" } },
    );
    if (!lookupResponse.ok) {
      throw new Error(`Mastodon API error: ${lookupResponse.status} ${lookupResponse.statusText}`);
    }
    const account = (await lookupResponse.json()) as MastodonAccount;

    console.log(`  [Mastodon] Fetching recent posts...`);
    const statusesResponse = await fetch(
      `https://${instance}/api/v1/accounts/${account.id}/statuses?limit=40&exclude_replies=true&exclude_reblogs=true`,
      { headers: { Accept: "application/json", "User-Agent": "mcp-me-generator" } },
    );
    const statuses = statusesResponse.ok
      ? ((await statusesResponse.json()) as MastodonStatus[])
      : [];

    console.log(`  [Mastodon] Found ${statuses.length} original posts.`);

    // Extract hashtags as interests
    const tagCounts: Record<string, number> = {};
    for (const status of statuses) {
      for (const tag of status.tags) {
        tagCounts[tag.name.toLowerCase()] = (tagCounts[tag.name.toLowerCase()] ?? 0) + 1;
      }
    }

    const topTags = Object.entries(tagCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 15);

    // Strip HTML from bio
    const bioText = account.note
      .replace(/<[^>]*>/g, "")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .trim();

    const identity: PartialProfile["identity"] = {
      ...(account.display_name ? { name: account.display_name } : {}),
      ...(bioText ? { bio: bioText } : {}),
      contact: {
        social: [
          { platform: "mastodon", url: account.url, username: `@${username}@${instance}` },
        ],
      },
    };

    // Parse profile fields for links
    for (const field of account.fields) {
      const urlMatch = field.value.match(/href="(https?:\/\/[^"]+)"/);
      if (urlMatch && field.name.toLowerCase().includes("website")) {
        identity.contact!.website = urlMatch[1];
      }
      if (urlMatch && field.name.toLowerCase().includes("github")) {
        identity.contact!.social!.push({
          platform: "github",
          url: urlMatch[1],
        });
      }
    }

    const interests: PartialProfile["interests"] = {
      topics: topTags.map(([tag]) => tag),
    };

    const faq: PartialProfile["faq"] = [
      {
        question: "Are you on the Fediverse?",
        answer: `Yes, I'm on Mastodon at @${username}@${instance} with ${account.followers_count.toLocaleString()} followers and ${account.statuses_count.toLocaleString()} posts.`,
        category: "social",
      },
    ];

    return { identity, interests, faq };
  },
};
