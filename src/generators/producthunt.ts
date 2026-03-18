/**
 * ProductHunt Generator
 *
 * Fetches your ProductHunt profile and launched products via the public GraphQL API.
 *
 * @flag --producthunt <username>
 * @example mcp-me generate ./profile --producthunt maker123
 * @auth None required (public API)
 * @api https://api.producthunt.com/v2/api/graphql
 * @data identity, projects (launched products), faq (upvotes, products made)
 */
import type { GeneratorSource, PartialProfile } from "./types.js";

interface PHUser {
  id: string;
  name: string;
  headline: string | null;
  username: string;
  websiteUrl: string | null;
  profileImage: string | null;
  twitterUsername: string | null;
  followersCount: number;
  followingCount: number;
  madePosts: {
    edges: { node: { name: string; tagline: string; url: string; votesCount: number; createdAt: string } }[];
  };
}

export const producthuntGenerator: GeneratorSource = {
  name: "producthunt",
  flag: "producthunt",
  flagArg: "<username>",
  description: "ProductHunt profile, launched products, upvotes",
  category: "community",

  async generate(config): Promise<PartialProfile> {
    const username = config.username as string;
    if (!username) throw new Error("ProductHunt username is required");

    console.log(`  [ProductHunt] Fetching profile for ${username}...`);

    const query = `
      query {
        user(username: "${username}") {
          id name headline username websiteUrl profileImage twitterUsername
          followersCount followingCount
          madePosts(first: 20) {
            edges { node { name tagline url votesCount createdAt } }
          }
        }
      }
    `;

    const resp = await fetch("https://api.producthunt.com/v2/api/graphql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "mcp-me-generator",
        Accept: "application/json",
      },
      body: JSON.stringify({ query }),
    });
    if (!resp.ok) throw new Error(`ProductHunt API error: ${resp.status} ${resp.statusText}`);
    const data = (await resp.json()) as { data?: { user?: PHUser } };
    const user = data.data?.user;
    if (!user) throw new Error(`ProductHunt user "${username}" not found`);

    const madeProducts = user.madePosts.edges.map((e) => e.node);
    const totalUpvotes = madeProducts.reduce((sum, p) => sum + p.votesCount, 0);
    console.log(`  [ProductHunt] Found ${madeProducts.length} products, ${totalUpvotes} total upvotes.`);

    const identity: PartialProfile["identity"] = {
      name: user.name,
      ...(user.headline ? { bio: user.headline } : {}),
      contact: {
        social: [{ platform: "producthunt", url: `https://www.producthunt.com/@${username}`, username }],
        ...(user.websiteUrl ? { website: user.websiteUrl } : {}),
      },
    };

    const projects = madeProducts.map((p) => ({
      name: p.name,
      description: p.tagline,
      url: p.url,
      status: "launched" as const,
      start_date: p.createdAt.slice(0, 10),
      category: "product",
      stars: p.votesCount,
    }));

    const faq: PartialProfile["faq"] = [
      {
        question: "Have you launched products on ProductHunt?",
        answer: `Yes, I've launched ${madeProducts.length} product(s) on ProductHunt with ${totalUpvotes.toLocaleString()} total upvotes. I have ${user.followersCount.toLocaleString()} followers.`,
        category: "products",
      },
    ];

    return { identity, projects, faq };
  },
};
