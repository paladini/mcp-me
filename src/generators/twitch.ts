/**
 * Twitch Generator
 *
 * Fetches your Twitch channel info, follower count, and stream categories.
 *
 * @flag --twitch <username>
 * @example mcp-me generate ./profile --twitch ninja
 * @auth Requires TWITCH_CLIENT_ID and TWITCH_CLIENT_SECRET env vars.
 *       Get free credentials at https://dev.twitch.tv/console/apps
 * @api https://dev.twitch.tv/docs/api/reference
 * @data identity (bio), interests (streaming, game categories), faq (follower stats)
 */
import type { GeneratorSource, PartialProfile } from "./types.js";

interface TwitchTokenResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
}

interface TwitchUser {
  id: string;
  login: string;
  display_name: string;
  description: string;
  profile_image_url: string;
  created_at: string;
}

interface TwitchFollowers {
  total: number;
}

export const twitchGenerator: GeneratorSource = {
  name: "twitch",
  flag: "twitch",
  flagArg: "<username>",
  description: "Twitch channel, followers (needs TWITCH_CLIENT_ID + TWITCH_CLIENT_SECRET)",
  category: "activity",

  async generate(config): Promise<PartialProfile> {
    const username = config.username as string;
    if (!username) throw new Error("Twitch username is required");

    const clientId = process.env.TWITCH_CLIENT_ID;
    const clientSecret = process.env.TWITCH_CLIENT_SECRET;
    if (!clientId || !clientSecret) {
      throw new Error("TWITCH_CLIENT_ID and TWITCH_CLIENT_SECRET env vars are required. Get them at https://dev.twitch.tv/console/apps");
    }

    console.log(`  [Twitch] Authenticating...`);
    const tokenResp = await fetch(
      `https://id.twitch.tv/oauth2/token?client_id=${clientId}&client_secret=${clientSecret}&grant_type=client_credentials`,
      { method: "POST" },
    );
    if (!tokenResp.ok) throw new Error(`Twitch auth error: ${tokenResp.status}`);
    const tokenData = (await tokenResp.json()) as TwitchTokenResponse;

    const headers = {
      "Client-Id": clientId,
      Authorization: `Bearer ${tokenData.access_token}`,
      "User-Agent": "mcp-me-generator",
    };

    console.log(`  [Twitch] Fetching profile for ${username}...`);
    const userResp = await fetch(`https://api.twitch.tv/helix/users?login=${username}`, { headers });
    if (!userResp.ok) throw new Error(`Twitch API error: ${userResp.status}`);
    const userData = (await userResp.json()) as { data: TwitchUser[] };
    const user = userData.data[0];
    if (!user) throw new Error(`Twitch user "${username}" not found`);

    const followResp = await fetch(`https://api.twitch.tv/helix/channels/followers?broadcaster_id=${user.id}`, { headers });
    const followData = followResp.ok ? ((await followResp.json()) as TwitchFollowers) : { total: 0 };

    console.log(`  [Twitch] ${user.display_name}: ${followData.total.toLocaleString()} followers.`);

    const identity: PartialProfile["identity"] = {
      ...(user.display_name ? { name: user.display_name } : {}),
      ...(user.description ? { bio: user.description } : {}),
      contact: {
        social: [{ platform: "twitch", url: `https://twitch.tv/${user.login}`, username: user.login }],
      },
    };

    const interests: PartialProfile["interests"] = { hobbies: ["Streaming", "Gaming"] };

    const faq: PartialProfile["faq"] = [{
      question: "Do you stream on Twitch?",
      answer: `Yes, I'm ${user.display_name} on Twitch with ${followData.total.toLocaleString()} followers.`,
      category: "streaming",
    }];

    return { identity, interests, faq };
  },
};
