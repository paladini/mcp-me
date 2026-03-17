import { createHash } from "node:crypto";
import type { GeneratorSource, PartialProfile } from "./types.js";

interface GravatarProfile {
  entry: {
    hash: string;
    requestHash: string;
    profileUrl: string;
    preferredUsername?: string;
    thumbnailUrl?: string;
    displayName?: string;
    aboutMe?: string;
    currentLocation?: string;
    urls?: { value: string; title: string }[];
    accounts?: { domain: string; url: string; username: string; shortname: string }[];
    emails?: { primary: string; value: string }[];
    name?: { givenName?: string; familyName?: string; formatted?: string };
  }[];
}

function emailToHash(email: string): string {
  return createHash("md5").update(email.trim().toLowerCase()).digest("hex");
}

export const gravatarGenerator: GeneratorSource = {
  name: "gravatar",
  flag: "gravatar",
  flagArg: "<email>",
  description: "Gravatar profile, bio, linked accounts",
  category: "identity",

  async generate(config): Promise<PartialProfile> {
    const email = config.email as string;
    if (!email) throw new Error("Email is required for Gravatar lookup");

    const hash = emailToHash(email);
    console.log(`  [Gravatar] Looking up profile for ${email}...`);

    const response = await fetch(`https://gravatar.com/${hash}.json`, {
      headers: { "User-Agent": "mcp-me-generator" },
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error(`No Gravatar profile found for ${email}`);
      }
      throw new Error(`Gravatar API error: ${response.status} ${response.statusText}`);
    }

    const data = (await response.json()) as GravatarProfile;
    const entry = data.entry[0];
    if (!entry) throw new Error("No Gravatar profile data returned");

    console.log(`  [Gravatar] Found profile: ${entry.displayName ?? entry.preferredUsername ?? hash}`);

    // Identity
    const social: { platform: string; url: string; username?: string }[] = [
      { platform: "gravatar", url: entry.profileUrl, username: entry.preferredUsername },
    ];

    // Add linked accounts
    if (entry.accounts) {
      for (const account of entry.accounts) {
        social.push({
          platform: account.shortname || account.domain,
          url: account.url,
          username: account.username,
        });
      }
    }

    // Add URLs
    const website = entry.urls?.find(
      (u) => u.title?.toLowerCase().includes("website") || u.title?.toLowerCase().includes("blog"),
    )?.value;

    const identity: PartialProfile["identity"] = {
      ...(entry.displayName || entry.name?.formatted ? { name: entry.displayName ?? entry.name?.formatted } : {}),
      ...(entry.aboutMe ? { bio: entry.aboutMe } : {}),
      ...(entry.currentLocation ? { location: { city: entry.currentLocation } } : {}),
      contact: {
        social,
        ...(entry.emails?.[0]?.value ? { email: entry.emails[0].value } : { email }),
        ...(website ? { website } : {}),
      },
    };

    return { identity };
  },
};
