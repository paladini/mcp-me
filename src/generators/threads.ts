/**
 * Threads Generator
 *
 * Fetches your Meta Threads profile via the public API.
 *
 * @flag --threads <username>
 * @example mcp-me generate ./profile --threads threadsuser
 * @auth None required (public profile data)
 * @api https://www.threads.net/api/graphql (public profile endpoint)
 * @data identity (bio), faq (follower/post count)
 */
import type { GeneratorSource, PartialProfile } from "./types.js";

interface ThreadsUser {
  username: string;
  full_name: string;
  biography: string;
  follower_count: number;
  is_verified: boolean;
  profile_pic_url: string;
}

export const threadsGenerator: GeneratorSource = {
  name: "threads",
  flag: "threads",
  flagArg: "<username>",
  description: "Threads (Meta) profile, bio, follower stats",
  category: "community",

  async generate(config): Promise<PartialProfile> {
    const username = config.username as string;
    if (!username) throw new Error("Threads username is required");

    console.log(`  [Threads] Fetching profile for ${username}...`);

    // Use the public Threads profile endpoint
    const resp = await fetch(
      `https://www.threads.net/api/graphql`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "User-Agent": "mcp-me-generator",
          "X-IG-App-ID": "238260118697367",
        },
        body: `variables=${encodeURIComponent(JSON.stringify({ username }))}&doc_id=23996318473300828`,
      },
    );

    let user: ThreadsUser | null = null;

    if (resp.ok) {
      const data = (await resp.json()) as { data?: { userData?: { user?: ThreadsUser } } };
      user = data.data?.userData?.user ?? null;
    }

    if (!user) {
      // Fallback: minimal profile from username
      console.log(`  [Threads] Could not fetch full profile, using minimal data.`);
      return {
        identity: {
          contact: {
            social: [{ platform: "threads", url: `https://www.threads.net/@${username}`, username }],
          },
        },
        faq: [
          {
            question: "Are you on Threads?",
            answer: `Yes, you can find me on Threads at @${username}.`,
            category: "social",
          },
        ],
      };
    }

    console.log(`  [Threads] ${user.full_name}: ${user.follower_count.toLocaleString()} followers.`);

    const identity: PartialProfile["identity"] = {
      ...(user.full_name ? { name: user.full_name } : {}),
      ...(user.biography ? { bio: user.biography } : {}),
      contact: {
        social: [{ platform: "threads", url: `https://www.threads.net/@${username}`, username }],
      },
    };

    const faq: PartialProfile["faq"] = [
      {
        question: "Are you on Threads?",
        answer: `Yes, I'm @${username} on Threads with ${user.follower_count.toLocaleString()} followers.${user.is_verified ? " My account is verified." : ""}`,
        category: "social",
      },
    ];

    return { identity, faq };
  },
};
