/**
 * Keybase Generator
 *
 * Fetches your verified identity proofs, PGP keys, and linked social accounts.
 *
 * @flag --keybase <username>
 * @example mcp-me generate ./profile --keybase myuser
 * @auth None required (public API)
 * @api https://keybase.io/docs/api/1.0
 * @data identity (name, bio, verified social links), faq (identity verification)
 */
import type { GeneratorSource, PartialProfile } from "./types.js";

interface KeybaseUser {
  status: { code: number };
  them: {
    id: string;
    basics: {
      username: string;
      full_name?: string;
      bio?: string;
      ctime: number;
    };
    profile?: {
      full_name?: string;
      bio?: string;
      location?: string;
    };
    proofs_summary?: {
      all: {
        proof_type: string;
        nametag: string;
        service_url: string;
        state: number;
        human_url: string;
      }[];
    };
    cryptocurrency_addresses?: Record<string, { address: string }[]>;
    devices?: Record<string, { name: string; type: string; ctime: number }>;
  };
}

export const keybaseGenerator: GeneratorSource = {
  name: "keybase",
  flag: "keybase",
  flagArg: "<username>",
  description: "Keybase verified identity proofs, PGP",
  category: "identity",

  async generate(config): Promise<PartialProfile> {
    const username = config.username as string;
    if (!username) throw new Error("Keybase username is required");

    console.log(`  [Keybase] Fetching identity proofs for ${username}...`);
    const response = await fetch(
      `https://keybase.io/_/api/1.0/user/lookup.json?username=${username}`,
      { headers: { Accept: "application/json", "User-Agent": "mcp-me-generator" } },
    );
    if (!response.ok) {
      throw new Error(`Keybase API error: ${response.status} ${response.statusText}`);
    }

    const data = (await response.json()) as KeybaseUser;
    if (data.status.code !== 0 || !data.them) {
      throw new Error(`Keybase user "${username}" not found`);
    }

    const user = data.them;
    const profile = user.profile;
    const proofs = user.proofs_summary?.all?.filter((p) => p.state === 1) ?? [];

    console.log(`  [Keybase] Found ${proofs.length} verified identity proofs.`);

    // Build social links from verified proofs
    const social: { platform: string; url: string; username?: string }[] = [
      { platform: "keybase", url: `https://keybase.io/${username}`, username },
    ];

    for (const proof of proofs) {
      social.push({
        platform: proof.proof_type,
        url: proof.human_url,
        username: proof.nametag,
      });
    }

    const identity: PartialProfile["identity"] = {
      ...(profile?.full_name || user.basics.full_name
        ? { name: profile?.full_name ?? user.basics.full_name }
        : {}),
      ...(profile?.bio || user.basics.bio
        ? { bio: profile?.bio ?? user.basics.bio }
        : {}),
      ...(profile?.location ? { location: { city: profile.location } } : {}),
      contact: { social },
    };

    const verifiedPlatforms = proofs.map((p) => p.proof_type).join(", ");
    const faq: PartialProfile["faq"] = [
      {
        question: "How can I verify your identity?",
        answer: `I have a Keybase profile (keybase.io/${username}) with ${proofs.length} verified identity proof(s)${verifiedPlatforms ? `: ${verifiedPlatforms}` : ""}.`,
        category: "identity",
      },
    ];

    return { identity, faq };
  },
};
