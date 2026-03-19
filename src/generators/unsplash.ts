/**
 * Unsplash Generator
 *
 * Fetches your Unsplash photography profile, collections, and stats.
 *
 * @flag --unsplash <username>
 * @example mcp-me generate ./profile --unsplash photographer123
 * @auth None required (public API with demo rate limit)
 * @api https://unsplash.com/napi/users/<username>
 * @data identity (photographer bio), projects (collections), faq (photo/download stats)
 */
import type { GeneratorSource, PartialProfile } from "./types.js";

interface UnsplashUser {
  username: string;
  name: string;
  bio: string | null;
  location: string | null;
  portfolio_url: string | null;
  total_photos: number;
  total_likes: number;
  total_collections: number;
  followers_count: number;
  following_count: number;
  downloads: number;
  social: {
    instagram_username: string | null;
    twitter_username: string | null;
    portfolio_url: string | null;
  };
}

interface UnsplashCollection {
  id: string;
  title: string;
  description: string | null;
  total_photos: number;
  published_at: string;
}

export const unsplashGenerator: GeneratorSource = {
  name: "unsplash",
  flag: "unsplash",
  flagArg: "<username>",
  description: "Unsplash photography profile, collections, stats",
  category: "activity",

  async generate(config): Promise<PartialProfile> {
    const username = config.username as string;
    if (!username) throw new Error("Unsplash username is required");

    console.log(`  [Unsplash] Fetching profile for ${username}...`);

    const resp = await fetch(`https://unsplash.com/napi/users/${username}`, {
      headers: { Accept: "application/json", "User-Agent": "mcp-me-generator" },
    });
    if (!resp.ok) throw new Error(`Unsplash API error: ${resp.status} ${resp.statusText}`);
    const user = (await resp.json()) as UnsplashUser;

    console.log(`  [Unsplash] Fetching collections...`);
    const collectionsResp = await fetch(
      `https://unsplash.com/napi/users/${username}/collections?per_page=10`,
      { headers: { Accept: "application/json", "User-Agent": "mcp-me-generator" } },
    );

    let collections: UnsplashCollection[] = [];
    if (collectionsResp.ok) {
      collections = (await collectionsResp.json()) as UnsplashCollection[];
    }

    console.log(`  [Unsplash] ${user.name}: ${user.total_photos} photos, ${user.downloads.toLocaleString()} downloads.`);

    const identity: PartialProfile["identity"] = {
      name: user.name,
      ...(user.bio ? { bio: user.bio } : {}),
      contact: {
        social: [
          { platform: "unsplash", url: `https://unsplash.com/@${username}`, username },
          ...(user.social?.instagram_username
            ? [{ platform: "instagram", url: `https://instagram.com/${user.social.instagram_username}`, username: user.social.instagram_username }]
            : []),
          ...(user.social?.twitter_username
            ? [{ platform: "twitter", url: `https://twitter.com/${user.social.twitter_username}`, username: user.social.twitter_username }]
            : []),
        ],
        ...(user.portfolio_url ? { website: user.portfolio_url } : {}),
      },
    };

    if (user.location) {
      identity.location = { city: user.location };
    }

    const skills: PartialProfile["skills"] = {
      technical: [
        { name: "Photography", category: "creative" },
      ],
      tools: [
        { name: "Unsplash", category: "platform" },
      ],
    };

    const projects = collections.map((c) => ({
      name: c.title,
      description: c.description ?? `Collection with ${c.total_photos} photos`,
      url: `https://unsplash.com/collections/${c.id}`,
      start_date: c.published_at?.slice(0, 10),
      category: "photography",
    }));

    const faq: PartialProfile["faq"] = [
      {
        question: "Do you do photography?",
        answer: `Yes, I'm on Unsplash with ${user.total_photos.toLocaleString()} photos, ${user.downloads.toLocaleString()} downloads, and ${user.followers_count.toLocaleString()} followers.`,
        category: "photography",
      },
    ];

    const interests: PartialProfile["interests"] = {
      hobbies: ["photography"],
      topics: ["visual arts", "creative commons"],
    };

    return { identity, skills, projects, faq, interests };
  },
};
