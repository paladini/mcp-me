/**
 * Gravatar Generator
 *
 * Fetches your Gravatar profile via the v3 REST API — bio, job title, company,
 * verified accounts, interests, pronouns, and more.
 *
 * @flag --gravatar <email>
 * @example mcp-me generate ./profile --gravatar me@example.com
 * @auth None required for public fields (optional: set GRAVATAR_API_KEY for full profile)
 * @api https://docs.gravatar.com/rest-api/
 * @data identity (name, bio, location, social links, email), career (job_title, company), interests, faq (pronouns)
 */
import { createHash } from "node:crypto";
import type { GeneratorSource, PartialProfile } from "./types.js";

interface GravatarV3Profile {
  hash: string;
  display_name: string;
  profile_url: string;
  avatar_url: string;
  avatar_alt_text?: string;
  location?: string;
  description?: string;
  job_title?: string;
  company?: string;
  verified_accounts?: { service_type: string; service_label: string; url: string; is_hidden: boolean }[];
  pronunciation?: string;
  pronouns?: string;
  timezone?: string;
  languages?: { code: string; name: string; is_primary: boolean; order: number }[];
  first_name?: string;
  last_name?: string;
  interests?: { id: number; name: string }[];
  links?: { label: string; url: string }[];
  contact_info?: { home_phone?: string; work_phone?: string; cell_phone?: string; email?: string; contact_form?: string; calendar?: string };
}

function emailToSha256(email: string): string {
  return createHash("sha256").update(email.trim().toLowerCase()).digest("hex");
}

export const gravatarGenerator: GeneratorSource = {
  name: "gravatar",
  flag: "gravatar",
  flagArg: "<email>",
  description: "Gravatar profile, bio, job, verified accounts, interests",
  category: "identity",

  async generate(config): Promise<PartialProfile> {
    const email = config.email as string;
    if (!email) throw new Error("Email is required for Gravatar lookup");

    const hash = emailToSha256(email);
    console.log(`  [Gravatar] Looking up profile for ${email}...`);

    const headers: Record<string, string> = { "User-Agent": "mcp-me-generator" };
    const apiKey = process.env.GRAVATAR_API_KEY;
    if (apiKey) {
      headers["Authorization"] = `Bearer ${apiKey}`;
    }

    const response = await fetch(`https://api.gravatar.com/v3/profiles/${hash}`, { headers });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error(`No Gravatar profile found for ${email}`);
      }
      throw new Error(`Gravatar API error: ${response.status} ${response.statusText}`);
    }

    const profile = (await response.json()) as GravatarV3Profile;
    console.log(`  [Gravatar] Found profile: ${profile.display_name}`);

    // Social links from verified accounts
    const social: { platform: string; url: string; username?: string }[] = [
      { platform: "gravatar", url: profile.profile_url },
    ];
    for (const account of profile.verified_accounts ?? []) {
      if (!account.is_hidden) {
        social.push({ platform: account.service_type, url: account.url });
      }
    }

    // Website from links
    const website = profile.links?.find(
      (l) => l.label?.toLowerCase().includes("website") || l.label?.toLowerCase().includes("blog"),
    )?.url ?? profile.links?.[0]?.url;

    const identity: PartialProfile["identity"] = {
      name: profile.display_name,
      ...(profile.description ? { bio: profile.description } : {}),
      ...(profile.location ? { location: { city: profile.location } } : {}),
      contact: {
        social,
        email,
        ...(website ? { website } : {}),
      },
    };

    // Career from job_title and company
    const career: PartialProfile["career"] = {};
    if (profile.company || profile.job_title) {
      career.experience = [{
        title: profile.job_title ?? "Professional",
        company: profile.company ?? "Unknown",
        current: true,
      }];
    }

    // Interests
    const interests: PartialProfile["interests"] = {};
    if (profile.interests?.length) {
      interests.topics = profile.interests.map((i) => i.name);
    }

    // FAQ — pronouns, timezone, languages
    const faq: PartialProfile["faq"] = [];
    if (profile.pronouns) {
      faq.push({ question: "What are your pronouns?", answer: `My pronouns are ${profile.pronouns}.`, category: "identity" });
    }
    if (profile.timezone) {
      faq.push({ question: "What timezone are you in?", answer: `I'm in ${profile.timezone}.`, category: "availability" });
    }
    if (profile.languages?.length) {
      const langs = profile.languages.map((l) => l.name).join(", ");
      faq.push({ question: "What languages do you speak?", answer: `I speak ${langs}.`, category: "identity" });
    }

    // Skills — languages spoken
    const skills: PartialProfile["skills"] = {};
    if (profile.languages?.length) {
      skills.languages = profile.languages.map((l) => ({
        name: l.name,
        category: "human-language",
        ...(l.is_primary ? { proficiency: "native" } : {}),
      }));
    }

    return {
      identity,
      ...(career.experience?.length ? { career } : {}),
      ...(interests.topics?.length ? { interests } : {}),
      ...(faq.length ? { faq } : {}),
      ...(skills.languages?.length ? { skills } : {}),
    };
  },
};
