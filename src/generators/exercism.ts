/**
 * Exercism Generator
 *
 * Fetches your Exercism profile, language tracks, and exercise progress.
 *
 * @flag --exercism <handle>
 * @example mcp-me generate ./profile --exercism exercismuser
 * @auth None required (public API)
 * @api https://exercism.org/api/v2/profiles/<handle>
 * @data identity, skills (languages with track progress), faq (exercises completed, reputation)
 */
import type { GeneratorSource, PartialProfile } from "./types.js";

interface ExercismProfile {
  user: {
    handle: string;
    bio: string | null;
    location: string | null;
    reputation: number;
    num_solutions_published: number;
    num_discussions: number;
  };
}

interface ExercismTrack {
  slug: string;
  title: string;
  num_completed_exercises: number;
  num_exercises: number;
}

export const exercismGenerator: GeneratorSource = {
  name: "exercism",
  flag: "exercism",
  flagArg: "<handle>",
  description: "Exercism profile, language tracks, exercise progress",
  category: "activity",

  async generate(config): Promise<PartialProfile> {
    const handle = config.username as string;
    if (!handle) throw new Error("Exercism handle is required");

    console.log(`  [Exercism] Fetching profile for ${handle}...`);

    const profileResp = await fetch(`https://exercism.org/api/v2/profiles/${handle}`, {
      headers: { Accept: "application/json", "User-Agent": "mcp-me-generator" },
    });
    if (!profileResp.ok) throw new Error(`Exercism API error: ${profileResp.status} ${profileResp.statusText}`);
    const profileData = (await profileResp.json()) as ExercismProfile;
    const user = profileData.user;

    console.log(`  [Exercism] Fetching tracks for ${handle}...`);
    const tracksResp = await fetch(`https://exercism.org/api/v2/profiles/${handle}/solutions?page=1`, {
      headers: { Accept: "application/json", "User-Agent": "mcp-me-generator" },
    });

    let tracks: ExercismTrack[] = [];
    if (tracksResp.ok) {
      const tracksData = (await tracksResp.json()) as { results?: ExercismTrack[] };
      tracks = tracksData.results ?? [];
    }

    console.log(`  [Exercism] ${user.reputation} reputation, ${user.num_solutions_published} solutions published.`);

    const identity: PartialProfile["identity"] = {
      ...(user.bio ? { bio: user.bio } : {}),
      contact: {
        social: [{ platform: "exercism", url: `https://exercism.org/profiles/${handle}`, username: handle }],
      },
    };

    if (user.location) {
      identity.location = { city: user.location };
    }

    const languages = tracks
      .filter((t) => t.num_completed_exercises > 0)
      .sort((a, b) => b.num_completed_exercises - a.num_completed_exercises)
      .slice(0, 15)
      .map((t) => ({
        name: t.title,
        category: "programming",
        proficiency:
          t.num_completed_exercises >= 30
            ? "advanced"
            : t.num_completed_exercises >= 10
              ? "intermediate"
              : "beginner",
        description: `${t.num_completed_exercises}/${t.num_exercises} exercises completed on Exercism`,
      }));

    const totalExercises = tracks.reduce((sum, t) => sum + t.num_completed_exercises, 0);

    const faq: PartialProfile["faq"] = [
      {
        question: "Do you practice coding exercises?",
        answer: `Yes, I'm on Exercism with ${user.reputation.toLocaleString()} reputation. I've published ${user.num_solutions_published} solutions across ${tracks.length} language tracks (${totalExercises} total exercises completed).`,
        category: "coding",
      },
    ];

    const interests: PartialProfile["interests"] = {
      topics: ["programming exercises", "language learning", "mentoring"],
    };

    return { identity, skills: { languages }, faq, interests };
  },
};
