import type { GeneratorSource, PartialProfile } from "./types.js";

interface SOUser {
  display_name: string;
  reputation: number;
  badge_counts: { gold: number; silver: number; bronze: number };
  link: string;
  location?: string;
  website_url?: string;
  about_me?: string;
  creation_date: number;
}

interface SOTag {
  tag_name: string;
  answer_count: number;
  answer_score: number;
  question_count: number;
  question_score: number;
}

async function fetchSO<T>(path: string): Promise<T> {
  const response = await fetch(`https://api.stackexchange.com/2.3${path}&site=stackoverflow`, {
    headers: { Accept: "application/json", "User-Agent": "mcp-me-generator" },
  });
  if (!response.ok) {
    throw new Error(`Stack Overflow API error: ${response.status} ${response.statusText}`);
  }
  return response.json() as Promise<T>;
}

export const stackoverflowGenerator: GeneratorSource = {
  name: "stackoverflow",

  async generate(config): Promise<PartialProfile> {
    const userId = config.userId as string;
    if (!userId) throw new Error("Stack Overflow user ID is required");

    console.log(`  [StackOverflow] Fetching profile for user ${userId}...`);
    const userData = await fetchSO<{ items: SOUser[] }>(`/users/${userId}?order=desc&sort=reputation`);
    const user = userData.items[0];
    if (!user) throw new Error(`Stack Overflow user ${userId} not found`);

    console.log(`  [StackOverflow] Fetching top tags...`);
    const tagsData = await fetchSO<{ items: SOTag[] }>(
      `/users/${userId}/top-answer-tags?pagesize=20`,
    );
    const tags = tagsData.items;
    console.log(`  [StackOverflow] Found ${tags.length} top tags, reputation: ${user.reputation}.`);

    // Skills from SO tags
    const technical = tags
      .filter((t) => t.answer_score > 0)
      .slice(0, 15)
      .map((t) => ({
        name: t.tag_name,
        category: "technology",
        description: `${t.answer_count} answers, score ${t.answer_score} on Stack Overflow`,
      }));

    // Identity enrichment
    const identity: PartialProfile["identity"] = {
      contact: {
        social: [
          { platform: "stackoverflow", url: user.link, username: userId },
        ],
        ...(user.website_url ? { website: user.website_url } : {}),
      },
    };
    if (user.location) {
      identity.location = { city: user.location };
    }

    // FAQ from SO presence
    const faq: PartialProfile["faq"] = [
      {
        question: "What is your Stack Overflow reputation?",
        answer: `${user.reputation.toLocaleString()} reputation with ${user.badge_counts.gold} gold, ${user.badge_counts.silver} silver, and ${user.badge_counts.bronze} bronze badges.`,
        category: "tech",
      },
    ];

    return {
      identity,
      skills: { technical },
      faq,
    };
  },
};
