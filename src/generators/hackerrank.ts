/**
 * HackerRank Generator
 *
 * Fetches your HackerRank profile, badges, and skills from the public REST API.
 *
 * @flag --hackerrank <username>
 * @example mcp-me generate ./profile --hackerrank hackuser
 * @auth None required (public API)
 * @api https://www.hackerrank.com/rest/hackers/<username>
 * @data identity, skills (languages, badges), faq (rank/scores)
 */
import type { GeneratorSource, PartialProfile } from "./types.js";

interface HRProfile {
  model: {
    username: string;
    name: string | null;
    short_bio: string | null;
    website: string | null;
    country: string | null;
    school: string | null;
    company: string | null;
    level: number;
    followers_count: number;
  };
}

interface HRBadge {
  badge_name: string;
  stars: number;
  current_points: number;
  solved: number;
}

export const hackerrankGenerator: GeneratorSource = {
  name: "hackerrank",
  flag: "hackerrank",
  flagArg: "<username>",
  description: "HackerRank profile, badges, skills, rank",
  category: "activity",

  async generate(config): Promise<PartialProfile> {
    const username = config.username as string;
    if (!username) throw new Error("HackerRank username is required");

    console.log(`  [HackerRank] Fetching profile for ${username}...`);

    const profileResp = await fetch(`https://www.hackerrank.com/rest/hackers/${username}`, {
      headers: { Accept: "application/json", "User-Agent": "mcp-me-generator" },
    });
    if (!profileResp.ok) throw new Error(`HackerRank API error: ${profileResp.status} ${profileResp.statusText}`);
    const profileData = (await profileResp.json()) as HRProfile;
    const user = profileData.model;

    console.log(`  [HackerRank] Fetching badges for ${username}...`);
    const badgesResp = await fetch(`https://www.hackerrank.com/rest/hackers/${username}/badges`, {
      headers: { Accept: "application/json", "User-Agent": "mcp-me-generator" },
    });

    let badges: HRBadge[] = [];
    if (badgesResp.ok) {
      const badgesData = (await badgesResp.json()) as { models?: HRBadge[] };
      badges = badgesData.models ?? [];
    }

    console.log(`  [HackerRank] Level ${user.level}, ${badges.length} badges.`);

    const identity: PartialProfile["identity"] = {
      ...(user.name ? { name: user.name } : {}),
      ...(user.short_bio ? { bio: user.short_bio } : {}),
      contact: {
        social: [{ platform: "hackerrank", url: `https://www.hackerrank.com/${username}`, username }],
        ...(user.website ? { website: user.website } : {}),
      },
    };

    if (user.country) {
      identity.location = { country: user.country };
    }

    const skills: PartialProfile["skills"] = {
      technical: badges
        .filter((b) => b.stars > 0)
        .sort((a, b) => b.stars - a.stars)
        .slice(0, 10)
        .map((b) => ({
          name: b.badge_name,
          category: "competitive-programming",
          proficiency:
            b.stars >= 5
              ? "expert"
              : b.stars >= 3
                ? "advanced"
                : "intermediate",
          description: `${b.stars} star(s) on HackerRank, ${b.solved} challenges solved`,
        })),
    };

    const totalSolved = badges.reduce((sum, b) => sum + b.solved, 0);

    const faq: PartialProfile["faq"] = [
      {
        question: "Are you on HackerRank?",
        answer: `Yes, I'm level ${user.level} on HackerRank with ${badges.length} badges and ${totalSolved} challenges solved across various domains.`,
        category: "coding",
      },
    ];

    const career: PartialProfile["career"] = {};
    if (user.company) {
      career.experience = [
        {
          title: "Software Engineer",
          company: user.company,
          current: true,
        },
      ];
    }

    return { identity, skills, faq, career };
  },
};
