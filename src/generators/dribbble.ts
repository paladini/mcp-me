/**
 * Dribbble Generator
 *
 * Fetches your Dribbble design portfolio — shots, bio, and skills.
 *
 * @flag --dribbble <username>
 * @example mcp-me generate ./profile --dribbble designeruser
 * @auth None required (public HTML profile)
 * @api https://dribbble.com/<username> (public profile)
 * @data identity (designer bio), projects (shots), skills (design tools), faq (shot/follower stats)
 */
import type { GeneratorSource, PartialProfile } from "./types.js";

interface DribbbleShot {
  title: string;
  url: string;
  description: string;
}

export const dribbbleGenerator: GeneratorSource = {
  name: "dribbble",
  flag: "dribbble",
  flagArg: "<username>",
  description: "Dribbble design portfolio, shots, bio",
  category: "activity",

  async generate(config): Promise<PartialProfile> {
    const username = config.username as string;
    if (!username) throw new Error("Dribbble username is required");

    console.log(`  [Dribbble] Fetching profile for ${username}...`);

    // Fetch public profile page and extract JSON-LD or meta data
    const resp = await fetch(`https://dribbble.com/${username}`, {
      headers: { Accept: "text/html", "User-Agent": "mcp-me-generator" },
    });
    if (!resp.ok) throw new Error(`Dribbble error: ${resp.status} ${resp.statusText}`);
    const html = await resp.text();

    // Extract basic info from meta tags
    const nameMatch = html.match(/<title>([^<|]+)/);
    const bioMatch = html.match(/<meta\s+name="description"\s+content="([^"]+)"/);
    const displayName = nameMatch?.[1]?.trim() ?? username;
    const bio = bioMatch?.[1]?.trim();

    // Extract shots from HTML
    const shotMatches = [...html.matchAll(/data-shot-title="([^"]+)"/g)].slice(0, 12);
    const shots: DribbbleShot[] = shotMatches.map((m) => ({
      title: m[1],
      url: `https://dribbble.com/${username}`,
      description: `Design shot: ${m[1]}`,
    }));

    console.log(`  [Dribbble] Found ${shots.length} shots for ${displayName}.`);

    const identity: PartialProfile["identity"] = {
      name: displayName,
      ...(bio ? { bio } : {}),
      contact: {
        social: [{ platform: "dribbble", url: `https://dribbble.com/${username}`, username }],
      },
    };

    const skills: PartialProfile["skills"] = {
      technical: [
        { name: "UI Design", category: "design", proficiency: "advanced" },
        { name: "Visual Design", category: "design" },
      ],
      tools: [
        { name: "Dribbble", category: "platform" },
        { name: "Figma", category: "design-tool" },
      ],
    };

    const projects = shots.map((s) => ({
      name: s.title,
      description: s.description,
      url: s.url,
      category: "design",
    }));

    const faq: PartialProfile["faq"] = [
      {
        question: "Do you share your design work?",
        answer: `Yes, I have a Dribbble portfolio at dribbble.com/${username} with ${shots.length}+ shots.`,
        category: "design",
      },
    ];

    const interests: PartialProfile["interests"] = {
      topics: ["ui design", "visual design", "product design"],
    };

    return { identity, skills, projects, faq, interests };
  },
};
