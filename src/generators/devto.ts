import type { GeneratorSource, PartialProfile } from "./types.js";

interface DevToArticle {
  id: number;
  title: string;
  description: string;
  url: string;
  published_at: string;
  positive_reactions_count: number;
  comments_count: number;
  reading_time_minutes: number;
  tag_list: string[];
}

async function fetchDevTo<T>(path: string): Promise<T> {
  const response = await fetch(`https://dev.to/api${path}`, {
    headers: { Accept: "application/json", "User-Agent": "mcp-me-generator" },
  });
  if (!response.ok) {
    throw new Error(`DEV.to API error: ${response.status} ${response.statusText}`);
  }
  return response.json() as Promise<T>;
}

export const devtoGenerator: GeneratorSource = {
  name: "devto",
  flag: "devto",
  flagArg: "<username>",
  description: "DEV.to articles, tags, reactions",
  category: "writing",

  async generate(config): Promise<PartialProfile> {
    const username = config.username as string;
    if (!username) throw new Error("DEV.to username is required");

    console.log(`  [DEV.to] Fetching articles for @${username}...`);
    const articles = await fetchDevTo<DevToArticle[]>(
      `/articles?username=${username}&per_page=100`,
    );
    console.log(`  [DEV.to] Found ${articles.length} published articles.`);

    // Extract unique tags across all articles
    const tagCounts: Record<string, number> = {};
    for (const article of articles) {
      for (const tag of article.tag_list) {
        tagCounts[tag] = (tagCounts[tag] ?? 0) + 1;
      }
    }

    const topTags = Object.entries(tagCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 15);

    // Skills from article tags
    const technical = topTags.map(([tag, count]) => ({
      name: tag,
      category: "topic",
      description: `Written about in ${count} DEV.to article(s)`,
    }));

    // Projects from top articles
    const topArticles = [...articles]
      .sort((a, b) => b.positive_reactions_count - a.positive_reactions_count)
      .slice(0, 10);

    const projects = topArticles.map((a) => ({
      name: a.title,
      description: a.description || a.title,
      url: a.url,
      status: "completed" as const,
      technologies: a.tag_list,
      start_date: a.published_at.slice(0, 10),
      category: "article",
    }));

    // Identity enrichment
    const identity: PartialProfile["identity"] = {
      contact: {
        social: [
          { platform: "devto", url: `https://dev.to/${username}`, username },
        ],
      },
    };

    // Interests from writing topics
    const interests: PartialProfile["interests"] = {
      topics: topTags.slice(0, 10).map(([tag]) => tag),
    };

    // FAQ
    const totalReactions = articles.reduce((sum, a) => sum + a.positive_reactions_count, 0);
    const faq: PartialProfile["faq"] = [
      {
        question: "Do you write technical articles?",
        answer: `Yes, I've published ${articles.length} articles on DEV.to with ${totalReactions.toLocaleString()} total reactions.`,
        category: "content",
      },
    ];

    return {
      identity,
      skills: { technical },
      projects,
      interests,
      faq,
    };
  },
};
