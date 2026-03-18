import type { GeneratorSource, PartialProfile } from "./types.js";

interface CodewarsUser {
  username: string;
  name: string | null;
  honor: number;
  clan: string | null;
  leaderboardPosition: number | null;
  ranks: {
    overall: { name: string; color: string; score: number };
    languages: Record<string, { name: string; color: string; score: number }>;
  };
  codeChallenges: { totalAuthored: number; totalCompleted: number };
}

export const codewarsGenerator: GeneratorSource = {
  name: "codewars",
  flag: "codewars",
  flagArg: "<username>",
  description: "Codewars rank, honor, languages practiced",
  category: "activity",

  async generate(config): Promise<PartialProfile> {
    const username = config.username as string;
    if (!username) throw new Error("Codewars username is required");

    console.log(`  [Codewars] Fetching profile for ${username}...`);
    const resp = await fetch(`https://www.codewars.com/api/v1/users/${username}`, {
      headers: { Accept: "application/json", "User-Agent": "mcp-me-generator" },
    });
    if (!resp.ok) throw new Error(`Codewars API error: ${resp.status}`);
    const user = (await resp.json()) as CodewarsUser;

    console.log(`  [Codewars] Rank: ${user.ranks.overall.name}, ${user.codeChallenges.totalCompleted} kata completed.`);

    const languages = Object.entries(user.ranks.languages)
      .sort(([, a], [, b]) => b.score - a.score)
      .slice(0, 10)
      .map(([lang, info]) => ({
        name: lang,
        category: "programming",
        description: `${info.name} rank on Codewars (score: ${info.score})`,
      }));

    const identity: PartialProfile["identity"] = {
      ...(user.name ? { name: user.name } : {}),
      contact: {
        social: [{ platform: "codewars", url: `https://www.codewars.com/users/${username}`, username }],
      },
    };

    const faq: PartialProfile["faq"] = [{
      question: "Do you practice coding challenges?",
      answer: `Yes, I'm ${user.ranks.overall.name} on Codewars with ${user.honor.toLocaleString()} honor and ${user.codeChallenges.totalCompleted} kata completed.`,
      category: "coding",
    }];

    return { identity, skills: { languages }, faq };
  },
};
