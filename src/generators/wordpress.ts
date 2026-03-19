/**
 * WordPress Generator
 *
 * Fetches your WordPress.com blog profile, posts, and categories via the REST API.
 *
 * @flag --wordpress <site>
 * @example mcp-me generate ./profile --wordpress myblog.wordpress.com
 * @auth None required (public REST API v2)
 * @api https://public-api.wordpress.com/rest/v1.1/sites/<site>
 * @data identity (author bio), faq (post count), interests (categories/tags)
 */
import type { GeneratorSource, PartialProfile } from "./types.js";

interface WPSite {
  name: string;
  description: string;
  URL: string;
  post_count: number;
  subscribers_count: number;
}

interface WPPost {
  title: string;
  URL: string;
  excerpt: string;
  date: string;
  categories: Record<string, { name: string }>;
  tags: Record<string, { name: string }>;
}

export const wordpressGenerator: GeneratorSource = {
  name: "wordpress",
  flag: "wordpress",
  flagArg: "<site>",
  description: "WordPress.com blog posts, categories, tags",
  category: "writing",

  async generate(config): Promise<PartialProfile> {
    const site = config.username as string;
    if (!site) throw new Error("WordPress site is required (e.g. myblog.wordpress.com)");

    console.log(`  [WordPress] Fetching site info for ${site}...`);

    const siteResp = await fetch(`https://public-api.wordpress.com/rest/v1.1/sites/${site}`, {
      headers: { Accept: "application/json", "User-Agent": "mcp-me-generator" },
    });
    if (!siteResp.ok) throw new Error(`WordPress API error: ${siteResp.status} ${siteResp.statusText}`);
    const siteData = (await siteResp.json()) as WPSite;

    console.log(`  [WordPress] Fetching recent posts...`);
    const postsResp = await fetch(
      `https://public-api.wordpress.com/rest/v1.1/sites/${site}/posts?number=20&fields=title,URL,excerpt,date,categories,tags`,
      { headers: { Accept: "application/json", "User-Agent": "mcp-me-generator" } },
    );

    let posts: WPPost[] = [];
    if (postsResp.ok) {
      const postsData = (await postsResp.json()) as { posts?: WPPost[] };
      posts = postsData.posts ?? [];
    }

    console.log(`  [WordPress] ${siteData.name}: ${siteData.post_count} posts, ${siteData.subscribers_count} subscribers.`);

    const identity: PartialProfile["identity"] = {
      bio: siteData.description || `Author at ${siteData.name}`,
      contact: {
        website: siteData.URL,
        social: [{ platform: "wordpress", url: siteData.URL }],
      },
    };

    // Extract unique categories and tags
    const categories = new Set<string>();
    const tags = new Set<string>();
    for (const post of posts) {
      for (const cat of Object.values(post.categories)) categories.add(cat.name);
      for (const tag of Object.values(post.tags)) tags.add(tag.name);
    }

    const interests: PartialProfile["interests"] = {
      topics: [...categories, ...tags].slice(0, 20),
    };

    const faq: PartialProfile["faq"] = [
      {
        question: "Do you have a blog?",
        answer: `Yes, I write at ${siteData.name} (${siteData.URL}) with ${siteData.post_count} published posts and ${siteData.subscribers_count.toLocaleString()} subscribers.`,
        category: "writing",
      },
    ];

    const projects = posts.slice(0, 10).map((p) => ({
      name: p.title.replace(/<[^>]+>/g, ""),
      description: p.excerpt.replace(/<[^>]+>/g, "").slice(0, 200).trim(),
      url: p.URL,
      start_date: p.date.slice(0, 10),
      category: "blog-post",
    }));

    return { identity, interests, faq, projects };
  },
};
