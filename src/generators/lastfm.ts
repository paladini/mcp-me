/**
 * Last.fm Generator
 *
 * Fetches your top artists, scrobble count, and music listening stats.
 *
 * @flag --lastfm <username>
 * @example mcp-me generate ./profile --lastfm rj
 * @auth Requires LASTFM_API_KEY env var. Get a free key at https://www.last.fm/api/account/create
 * @api https://www.last.fm/api
 * @data identity, interests (top artists, music), faq (scrobble stats)
 */
import type { GeneratorSource, PartialProfile } from "./types.js";

interface LastFmUser {
  user: {
    name: string;
    realname: string;
    url: string;
    country: string;
    playcount: string;
    registered: { unixtime: string };
  };
}

interface LastFmArtist {
  name: string;
  playcount: string;
  url: string;
}

interface LastFmTopArtists {
  topartists: { artist: LastFmArtist[] };
}

export const lastfmGenerator: GeneratorSource = {
  name: "lastfm",
  flag: "lastfm",
  flagArg: "<username>",
  description: "Last.fm top artists, scrobbles (needs LASTFM_API_KEY)",
  category: "activity",

  async generate(config): Promise<PartialProfile> {
    const username = config.username as string;
    if (!username) throw new Error("Last.fm username is required");

    const apiKey = process.env.LASTFM_API_KEY;
    if (!apiKey) throw new Error("LASTFM_API_KEY environment variable is required. Get a free key at https://www.last.fm/api/account/create");

    const base = `https://ws.audioscrobbler.com/2.0/?api_key=${apiKey}&format=json`;

    console.log(`  [Last.fm] Fetching profile for ${username}...`);
    const userResp = await fetch(`${base}&method=user.getinfo&user=${username}`, {
      headers: { "User-Agent": "mcp-me-generator" },
    });
    if (!userResp.ok) throw new Error(`Last.fm API error: ${userResp.status}`);
    const userData = (await userResp.json()) as LastFmUser;
    const user = userData.user;

    console.log(`  [Last.fm] Fetching top artists...`);
    const artistsResp = await fetch(`${base}&method=user.gettopartists&user=${username}&period=12month&limit=20`, {
      headers: { "User-Agent": "mcp-me-generator" },
    });
    const artistsData = (await artistsResp.json()) as LastFmTopArtists;
    const artists = artistsData.topartists?.artist ?? [];
    console.log(`  [Last.fm] ${user.playcount} total scrobbles, ${artists.length} top artists.`);

    const identity: PartialProfile["identity"] = {
      ...(user.realname ? { name: user.realname } : {}),
      contact: {
        social: [{ platform: "lastfm", url: user.url, username: user.name }],
      },
    };

    const interests: PartialProfile["interests"] = {
      hobbies: ["Music"],
      topics: artists.slice(0, 10).map((a) => a.name),
    };

    const faq: PartialProfile["faq"] = [{
      question: "What music do you listen to?",
      answer: `I've scrobbled ${parseInt(user.playcount).toLocaleString()} tracks on Last.fm. Top artists: ${artists.slice(0, 5).map((a) => a.name).join(", ")}.`,
      category: "music",
    }];

    return { identity, interests, faq };
  },
};
