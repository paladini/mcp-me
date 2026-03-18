/**
 * Bluesky Generator
 *
 * Fetches your Bluesky/AT Protocol profile, bio, and post count.
 *
 * @flag --bluesky <handle>
 * @example mcp-me generate ./profile --bluesky alice.bsky.social
 * @auth None required (public AT Protocol API)
 * @api https://docs.bsky.app/docs/api/
 * @data identity (name, bio, avatar), faq (post/follower stats)
 */
import type { GeneratorSource, PartialProfile } from "./types.js";

interface BSkyProfile {
  did: string;
  handle: string;
  displayName?: string;
  description?: string;
  avatar?: string;
  followersCount: number;
  followsCount: number;
  postsCount: number;
  createdAt: string;
}

export const blueskyGenerator: GeneratorSource = {
  name: "bluesky",
  flag: "bluesky",
  flagArg: "<handle>",
  description: "Bluesky profile, bio, follower stats",
  category: "community",

  async generate(config): Promise<PartialProfile> {
    const handle = config.username as string;
    if (!handle) throw new Error("Bluesky handle is required (e.g. alice.bsky.social)");

    console.log(`  [Bluesky] Fetching profile for ${handle}...`);
    const resp = await fetch(
      `https://public.api.bsky.app/xrpc/app.bsky.actor.getProfile?actor=${encodeURIComponent(handle)}`,
      { headers: { Accept: "application/json", "User-Agent": "mcp-me-generator" } },
    );
    if (!resp.ok) throw new Error(`Bluesky API error: ${resp.status} ${resp.statusText}`);
    const profile = (await resp.json()) as BSkyProfile;

    console.log(`  [Bluesky] ${profile.displayName ?? handle}: ${profile.followersCount} followers, ${profile.postsCount} posts.`);

    const identity: PartialProfile["identity"] = {
      ...(profile.displayName ? { name: profile.displayName } : {}),
      ...(profile.description ? { bio: profile.description } : {}),
      contact: {
        social: [{ platform: "bluesky", url: `https://bsky.app/profile/${handle}`, username: handle }],
      },
    };

    const faq: PartialProfile["faq"] = [{
      question: "Are you on Bluesky?",
      answer: `Yes, I'm @${handle} on Bluesky with ${profile.followersCount.toLocaleString()} followers and ${profile.postsCount.toLocaleString()} posts.`,
      category: "social",
    }];

    return { identity, faq };
  },
};
