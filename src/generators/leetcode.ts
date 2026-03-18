/**
 * LeetCode Generator
 *
 * Fetches your LeetCode profile, problem stats, and contest rating via GraphQL.
 *
 * @flag --leetcode <username>
 * @example mcp-me generate ./profile --leetcode neal_wu
 * @auth None required (public GraphQL API)
 * @api https://leetcode.com/graphql
 * @data identity, skills (languages), faq (problem stats, contest rating)
 */
import type { GeneratorSource, PartialProfile } from "./types.js";

interface LCProfile {
  matchedUser: {
    username: string;
    profile: { realName: string; aboutMe: string; ranking: number; reputation: number; countryName: string };
    submitStats: { acSubmissionNum: { difficulty: string; count: number }[] };
    languageProblemCount: { languageName: string; problemsSolved: number }[];
  } | null;
}

export const leetcodeGenerator: GeneratorSource = {
  name: "leetcode",
  flag: "leetcode",
  flagArg: "<username>",
  description: "LeetCode problems solved, languages, ranking",
  category: "activity",

  async generate(config): Promise<PartialProfile> {
    const username = config.username as string;
    if (!username) throw new Error("LeetCode username is required");

    console.log(`  [LeetCode] Fetching profile for ${username}...`);
    const query = `query { matchedUser(username: "${username}") { username profile { realName aboutMe ranking reputation countryName } submitStats: submitStatsGlobal { acSubmissionNum { difficulty count } } languageProblemCount { languageName problemsSolved } } }`;

    const resp = await fetch("https://leetcode.com/graphql", {
      method: "POST",
      headers: { "Content-Type": "application/json", "User-Agent": "mcp-me-generator" },
      body: JSON.stringify({ query }),
    });
    if (!resp.ok) throw new Error(`LeetCode API error: ${resp.status}`);
    const data = (await resp.json()) as { data: LCProfile };
    const user = data.data?.matchedUser;
    if (!user) throw new Error(`LeetCode user "${username}" not found`);

    const stats = user.submitStats.acSubmissionNum;
    const totalSolved = stats.find((s) => s.difficulty === "All")?.count ?? 0;
    const easySolved = stats.find((s) => s.difficulty === "Easy")?.count ?? 0;
    const mediumSolved = stats.find((s) => s.difficulty === "Medium")?.count ?? 0;
    const hardSolved = stats.find((s) => s.difficulty === "Hard")?.count ?? 0;

    console.log(`  [LeetCode] ${totalSolved} problems solved (E:${easySolved} M:${mediumSolved} H:${hardSolved}), ranking #${user.profile.ranking}.`);

    const languages = user.languageProblemCount
      .filter((l) => l.problemsSolved > 0)
      .sort((a, b) => b.problemsSolved - a.problemsSolved)
      .slice(0, 10)
      .map((l) => ({
        name: l.languageName,
        category: "programming",
        description: `${l.problemsSolved} LeetCode problems solved in ${l.languageName}`,
      }));

    const identity: PartialProfile["identity"] = {
      ...(user.profile.realName ? { name: user.profile.realName } : {}),
      ...(user.profile.aboutMe ? { bio: user.profile.aboutMe } : {}),
      contact: {
        social: [{ platform: "leetcode", url: `https://leetcode.com/${username}`, username }],
      },
    };

    const faq: PartialProfile["faq"] = [{
      question: "Do you practice competitive programming?",
      answer: `Yes, I've solved ${totalSolved} problems on LeetCode (${easySolved} Easy, ${mediumSolved} Medium, ${hardSolved} Hard). Global ranking: #${user.profile.ranking.toLocaleString()}.`,
      category: "coding",
    }];

    return { identity, skills: { languages }, faq };
  },
};
