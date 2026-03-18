/**
 * Kaggle Generator
 *
 * Fetches your Kaggle public profile, competitions, datasets, and notebooks.
 *
 * @flag --kaggle <username>
 * @example mcp-me generate ./profile --kaggle kaggleuser
 * @auth None required (public profile page)
 * @api https://www.kaggle.com/<username> (HTML scraping of public JSON data)
 * @data identity, skills (data science tools), projects (competitions, datasets), faq (tier, medals)
 */
import type { GeneratorSource, PartialProfile } from "./types.js";

interface KaggleProfile {
  displayName?: string;
  bio?: string;
  occupation?: string;
  organization?: string;
  city?: string;
  country?: string;
  tier?: string;
  totalGoldMedals?: number;
  totalSilverMedals?: number;
  totalBronzeMedals?: number;
  datasetsCount?: number;
  notebooksCount?: number;
  competitionsCount?: number;
  totalFollowers?: number;
}

export const kaggleGenerator: GeneratorSource = {
  name: "kaggle",
  flag: "kaggle",
  flagArg: "<username>",
  description: "Kaggle profile, competitions, datasets, notebooks",
  category: "code",

  async generate(config): Promise<PartialProfile> {
    const username = config.username as string;
    if (!username) throw new Error("Kaggle username is required");

    console.log(`  [Kaggle] Fetching profile for ${username}...`);

    const resp = await fetch(
      `https://www.kaggle.com/api/i/users.UserService/GetByUserName`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "User-Agent": "mcp-me-generator",
        },
        body: JSON.stringify({ userName: username }),
      },
    );
    if (!resp.ok) throw new Error(`Kaggle API error: ${resp.status} ${resp.statusText}`);
    const profile = (await resp.json()) as KaggleProfile;

    console.log(`  [Kaggle] Found: ${profile.displayName ?? username}, tier: ${profile.tier ?? "unknown"}`);

    const identity: PartialProfile["identity"] = {
      ...(profile.displayName ? { name: profile.displayName } : {}),
      ...(profile.bio ? { bio: profile.bio } : {}),
      contact: {
        social: [{ platform: "kaggle", url: `https://www.kaggle.com/${username}`, username }],
      },
    };

    if (profile.city || profile.country) {
      identity.location = {
        ...(profile.city ? { city: profile.city } : {}),
        ...(profile.country ? { country: profile.country } : {}),
      };
    }

    const skills: PartialProfile["skills"] = {
      technical: [
        { name: "Machine Learning", category: "data-science" },
        { name: "Data Analysis", category: "data-science" },
        { name: "Python", category: "programming" },
      ],
      tools: [
        { name: "Kaggle", category: "platform" },
        { name: "Jupyter Notebooks", category: "tool" },
      ],
    };

    const medals = [
      profile.totalGoldMedals ?? 0,
      profile.totalSilverMedals ?? 0,
      profile.totalBronzeMedals ?? 0,
    ];
    const totalMedals = medals[0] + medals[1] + medals[2];

    const faq: PartialProfile["faq"] = [
      {
        question: "Are you active on Kaggle?",
        answer: `Yes, I'm a ${profile.tier ?? "Kaggle"} user with ${totalMedals} medals (${medals[0]} gold, ${medals[1]} silver, ${medals[2]} bronze). I have ${profile.datasetsCount ?? 0} datasets and ${profile.notebooksCount ?? 0} notebooks.`,
        category: "data-science",
      },
    ];

    const interests: PartialProfile["interests"] = {
      topics: ["machine learning", "data science", "kaggle competitions"],
    };

    const career: PartialProfile["career"] = {};
    if (profile.organization) {
      career.experience = [
        {
          title: profile.occupation ?? "Data Scientist",
          company: profile.organization,
          current: true,
        },
      ];
    }

    return { identity, skills, faq, interests, career };
  },
};
