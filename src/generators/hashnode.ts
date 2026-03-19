/**
 * Hashnode Generator
 *
 * Fetches your blog posts, tags, and reactions from Hashnode via GraphQL API.
 *
 * @flag --hashnode <username>
 * @example mcp-me generate ./profile --hashnode myuser
 * @auth None required (public GraphQL API)
 * @api https://gql.hashnode.com
 * @data identity, skills (post tags), projects (top articles), interests, faq
 */
import type { GeneratorSource, PartialProfile } from "./types.js";

interface HashnodePost {
  title: string;
  brief: string;
  slug: string;
  dateAdded: string;
  totalReactions: number;
  tags: { name: string; slug: string }[];
  url: string;
}

interface HashnodeUser {
  name: string;
  username: string;
  bio: { text: string } | null;
  profilePicture: string;
  socialMediaLinks: { website: string; twitter: string; github: string };
  publications: { edges: { node: { posts: { edges: { node: HashnodePost }[] } } }[] };
}

export const hashnodeGenerator: GeneratorSource = {
  name: "hashnode",
  flag: "hashnode",
  flagArg: "<username>",
  description: "Hashnode blog posts, tags, reactions",
  category: "writing",

  async generate(config): Promise<PartialProfile> {
    const username = config.username as string;
    if (!username) throw new Error("Hashnode username is required");

    console.log(`  [Hashnode] Fetching profile for ${username}...`);
    const query = `query GetUser($username: String!) { user(username: $username) { name username bio { text } socialMediaLinks { website twitter github } publications(first: 1) { edges { node { posts(first: 50) { edges { node { title brief slug dateAdded totalReactions tags { name slug } url } } } } } } } }`;

    const resp = await fetch("https://gql.hashnode.com", {
      method: "POST",
      headers: { "Content-Type": "application/json", "User-Agent": "mcp-me-generator" },
      body: JSON.stringify({ query, variables: { username } }),
    });
    if (!resp.ok) throw new Error(`Hashnode API error: ${resp.status}`);
    const data = (await resp.json()) as { data: { user: HashnodeUser | null } };
    const user = data.data?.user;
    if (!user) throw new Error(`Hashnode user "${username}" not found`);

    const posts = user.publications?.edges?.[0]?.node?.posts?.edges?.map((e) => e.node) ?? [];
    console.log(`  [Hashnode] Found ${posts.length} posts.`);

    const tagCounts: Record<string, number> = {};
    for (const post of posts) {
      for (const tag of post.tags) {
        tagCounts[tag.name] = (tagCounts[tag.name] ?? 0) + 1;
      }
    }

    const topTags = Object.entries(tagCounts).sort(([, a], [, b]) => b - a).slice(0, 15);

    const technical = topTags.map(([tag, count]) => ({
      name: tag,
      category: "topic",
      description: `Written about in ${count} Hashnode post(s)`,
    }));

    const projects = posts
      .sort((a, b) => b.totalReactions - a.totalReactions)
      .slice(0, 10)
      .map((p) => ({
        name: p.title,
        description: p.brief?.slice(0, 200) || p.title,
        url: p.url,
        status: "completed" as const,
        technologies: p.tags.map((t) => t.name),
        start_date: p.dateAdded?.slice(0, 10),
        category: "article",
      }));

    const identity: PartialProfile["identity"] = {
      ...(user.name ? { name: user.name } : {}),
      ...(user.bio?.text ? { bio: user.bio.text } : {}),
      contact: {
        social: [{ platform: "hashnode", url: `https://hashnode.com/@${username}`, username }],
        ...(user.socialMediaLinks?.website ? { website: user.socialMediaLinks.website } : {}),
      },
    };

    const totalReactions = posts.reduce((sum, p) => sum + p.totalReactions, 0);
    const faq: PartialProfile["faq"] = posts.length > 0
      ? [{
          question: "Do you write on Hashnode?",
          answer: `Yes, ${posts.length} posts with ${totalReactions.toLocaleString()} total reactions. Topics: ${topTags.slice(0, 5).map(([t]) => t).join(", ")}.`,
          category: "content",
        }]
      : [];

    return { identity, skills: { technical }, projects, interests: { topics: topTags.slice(0, 10).map(([t]) => t) }, faq };
  },
};
