/**
 * Music & Audio Generators (20)
 */
import { createGenerator, createStaticGenerator } from "./factory.js";

export const soundcloudGenerator = createGenerator({
  name: "soundcloud", flag: "soundcloud", description: "SoundCloud profile, tracks, followers",
  category: "music", platform: "soundcloud", profileUrl: "https://soundcloud.com/{input}",
  apiUrl: "https://api-v2.soundcloud.com/resolve?url=https://soundcloud.com/{input}",
  extract: (data: unknown) => {
    const d = data as { username?: string; description?: string; track_count?: number; followers_count?: number; city?: string };
    return { displayName: d.username, bio: d.description, location: d.city, stats: `I have ${d.track_count ?? 0} tracks and ${d.followers_count ?? 0} followers on SoundCloud.`, topics: ["music production", "audio"], hobbies: ["music"] };
  },
});

export const bandcampGenerator = createStaticGenerator({
  name: "bandcamp", flag: "bandcamp", description: "Bandcamp artist/fan profile",
  category: "music", platform: "bandcamp", profileUrl: "https://{input}.bandcamp.com",
  buildProfile: (input) => ({
    identity: { contact: { social: [{ platform: "bandcamp", url: `https://${input}.bandcamp.com`, username: input }] } },
    faq: [{ question: "Are you on Bandcamp?", answer: `Yes, find my music at ${input}.bandcamp.com`, category: "music" }],
    interests: { hobbies: ["music", "independent music"], topics: ["bandcamp", "indie music", "music production"] },
  }),
});

export const discogsGenerator = createGenerator({
  name: "discogs", flag: "discogs", description: "Discogs vinyl collection, wantlist",
  category: "music", platform: "discogs", profileUrl: "https://www.discogs.com/user/{input}",
  apiUrl: "https://api.discogs.com/users/{input}",
  extract: (data: unknown) => {
    const d = data as { username?: string; num_collection?: number; num_wantlist?: number; location?: string; profile?: string };
    return { displayName: d.username, bio: d.profile?.slice(0, 200), location: d.location, stats: `I have ${d.num_collection ?? 0} records in my Discogs collection and ${d.num_wantlist ?? 0} on my wantlist.`, hobbies: ["vinyl collecting", "music"], topics: ["vinyl", "record collecting"] };
  },
});

export const geniusGenerator = createStaticGenerator({
  name: "genius", flag: "genius", description: "Genius lyrics annotations profile",
  category: "music", platform: "genius", profileUrl: "https://genius.com/{input}",
  buildProfile: (input) => ({
    identity: { contact: { social: [{ platform: "genius", url: `https://genius.com/${input}`, username: input }] } },
    faq: [{ question: "Are you on Genius?", answer: `Yes, I contribute to Genius lyrics at genius.com/${input}`, category: "music" }],
    interests: { hobbies: ["music", "lyrics"], topics: ["lyrics", "music analysis", "annotations"] },
  }),
});

export const mixcloudGenerator = createGenerator({
  name: "mixcloud", flag: "mixcloud", description: "Mixcloud DJ mixes, shows, followers",
  category: "music", platform: "mixcloud", profileUrl: "https://www.mixcloud.com/{input}/",
  apiUrl: "https://api.mixcloud.com/{input}/",
  extract: (data: unknown) => {
    const d = data as { name?: string; biog?: string; cloudcast_count?: number; follower_count?: number; city?: string; country?: string };
    return { displayName: d.name, bio: d.biog, location: d.city, stats: `I have ${d.cloudcast_count ?? 0} mixes and ${d.follower_count ?? 0} followers on Mixcloud.`, hobbies: ["djing", "music"], topics: ["djing", "mixes", "electronic music"] };
  },
});

export const listenbrainzGenerator = createGenerator({
  name: "listenbrainz", flag: "listenbrainz", description: "ListenBrainz open-source scrobbles",
  category: "music", platform: "listenbrainz", profileUrl: "https://listenbrainz.org/user/{input}/",
  apiUrl: "https://api.listenbrainz.org/1/user/{input}/listen-count",
  extract: (data: unknown) => {
    const d = data as { payload?: { count?: number } };
    return { stats: `I have ${(d.payload?.count ?? 0).toLocaleString()} scrobbles on ListenBrainz (open-source music tracking).`, topics: ["music", "open source"], hobbies: ["music listening"] };
  },
});

export const setlistfmGenerator = createGenerator({
  name: "setlistfm", flag: "setlistfm", flagArg: "<user-id>", description: "Setlist.fm concerts attended",
  category: "music", platform: "setlistfm", profileUrl: "https://www.setlist.fm/user/{input}",
  apiUrl: "https://api.setlist.fm/rest/1.0/user/{input}/attended?p=1",
  apiHeaders: { Accept: "application/json", "x-api-key": "mcp-me" },
  extract: (data: unknown) => {
    const d = data as { total?: number; setlist?: { artist?: { name: string }; eventDate?: string }[] };
    return { stats: `I've been to ${d.total ?? 0} concerts tracked on Setlist.fm.`, hobbies: ["concerts", "live music"], topics: ["live music", "concerts"] };
  },
});

export const spliceGenerator = createStaticGenerator({
  name: "splice", flag: "splice", description: "Splice music production profile",
  category: "music", platform: "splice", profileUrl: "https://splice.com/user/{input}",
  buildProfile: (input) => ({
    identity: { contact: { social: [{ platform: "splice", url: `https://splice.com/user/${input}`, username: input }] } },
    faq: [{ question: "Do you produce music?", answer: `Yes, find my samples and projects on Splice: splice.com/user/${input}`, category: "music" }],
    interests: { hobbies: ["music production"], topics: ["music production", "samples", "DAW"] },
  }),
});

export const beatstarsGenerator = createStaticGenerator({
  name: "beatstars", flag: "beatstars", description: "BeatStars producer profile, beats",
  category: "music", platform: "beatstars", profileUrl: "https://www.beatstars.com/{input}",
  buildProfile: (input) => ({
    identity: { contact: { social: [{ platform: "beatstars", url: `https://www.beatstars.com/${input}`, username: input }] } },
    faq: [{ question: "Do you make beats?", answer: `Yes, check out my beats on BeatStars: beatstars.com/${input}`, category: "music" }],
    interests: { hobbies: ["beat making", "music production"], topics: ["beats", "hip hop production", "instrumentals"] },
  }),
});

export const distrokidGenerator = createStaticGenerator({
  name: "distrokid", flag: "distrokid", flagArg: "<artist-url>", description: "DistroKid music distribution profile",
  category: "music", platform: "distrokid", profileUrl: "https://distrokid.com/hyperfollow/{input}",
  buildProfile: (input) => ({
    identity: { contact: { social: [{ platform: "distrokid", url: `https://distrokid.com/hyperfollow/${input}`, username: input }] } },
    faq: [{ question: "Do you release music?", answer: `Yes, I distribute music via DistroKid. Find me at distrokid.com/hyperfollow/${input}`, category: "music" }],
    interests: { hobbies: ["music", "music distribution"], topics: ["music release", "streaming platforms"] },
  }),
});

export const audiusGenerator = createGenerator({
  name: "audius", flag: "audius", description: "Audius decentralized music profile",
  category: "music", platform: "audius", profileUrl: "https://audius.co/{input}",
  apiUrl: "https://discoveryprovider.audius.co/v1/users?handle={input}",
  extract: (data: unknown) => {
    const d = data as { data?: { name?: string; bio?: string; track_count?: number; follower_count?: number }[] };
    const user = d.data?.[0];
    return { displayName: user?.name, bio: user?.bio, stats: `I have ${user?.track_count ?? 0} tracks and ${user?.follower_count ?? 0} followers on Audius (decentralized music).`, topics: ["decentralized music", "web3 music"], hobbies: ["music"] };
  },
});

export const songkickGenerator = createStaticGenerator({
  name: "songkick", flag: "songkick", flagArg: "<username>", description: "Songkick concerts and events",
  category: "music", platform: "songkick", profileUrl: "https://www.songkick.com/users/{input}",
  buildProfile: (input) => ({
    identity: { contact: { social: [{ platform: "songkick", url: `https://www.songkick.com/users/${input}`, username: input }] } },
    faq: [{ question: "Do you go to concerts?", answer: `Yes, I track concerts on Songkick as ${input}.`, category: "music" }],
    interests: { hobbies: ["concerts", "live music", "festivals"], topics: ["live events", "music festivals"] },
  }),
});

export const musixmatchGenerator = createStaticGenerator({
  name: "musixmatch", flag: "musixmatch", description: "Musixmatch lyrics contributor",
  category: "music", platform: "musixmatch", profileUrl: "https://www.musixmatch.com/profile/{input}",
  buildProfile: (input) => ({
    identity: { contact: { social: [{ platform: "musixmatch", url: `https://www.musixmatch.com/profile/${input}`, username: input }] } },
    faq: [{ question: "Do you contribute lyrics?", answer: `Yes, I contribute to Musixmatch as ${input}.`, category: "music" }],
    interests: { hobbies: ["lyrics", "music translation"], topics: ["lyrics", "music", "translation"] },
  }),
});

export const soundtrapGenerator = createStaticGenerator({
  name: "soundtrap", flag: "soundtrap", description: "Soundtrap online music studio profile",
  category: "music", platform: "soundtrap", profileUrl: "https://www.soundtrap.com/profile/{input}",
  buildProfile: (input) => ({
    identity: { contact: { social: [{ platform: "soundtrap", url: `https://www.soundtrap.com/profile/${input}`, username: input }] } },
    faq: [{ question: "Do you use Soundtrap?", answer: `Yes, I make music collaboratively on Soundtrap.`, category: "music" }],
    interests: { hobbies: ["music production", "collaboration"], topics: ["online daw", "music collaboration"] },
  }),
});

export const rateYourMusicGenerator = createStaticGenerator({
  name: "rateyourmusic", flag: "rym", description: "RateYourMusic ratings and reviews",
  category: "music", platform: "rateyourmusic", profileUrl: "https://rateyourmusic.com/~{input}",
  buildProfile: (input) => ({
    identity: { contact: { social: [{ platform: "rateyourmusic", url: `https://rateyourmusic.com/~${input}`, username: input }] } },
    faq: [{ question: "Do you rate music?", answer: `Yes, I review and rate albums on RateYourMusic as ${input}.`, category: "music" }],
    interests: { hobbies: ["music criticism", "album reviews"], topics: ["music reviews", "album ratings", "music discovery"] },
  }),
});

export const kompozGenerator = createStaticGenerator({
  name: "kompoz", flag: "kompoz", description: "Kompoz collaborative music projects",
  category: "music", platform: "kompoz", profileUrl: "https://www.kompoz.com/music/people/{input}",
  buildProfile: (input) => ({
    identity: { contact: { social: [{ platform: "kompoz", url: `https://www.kompoz.com/music/people/${input}`, username: input }] } },
    faq: [{ question: "Do you collaborate on music?", answer: `Yes, I collaborate on music projects on Kompoz.`, category: "music" }],
    interests: { hobbies: ["music collaboration"], topics: ["collaborative music", "remote music production"] },
  }),
});

export const chordsGenerator = createStaticGenerator({
  name: "ultimateguitar", flag: "ultimateguitar", description: "Ultimate Guitar tabs and contributions",
  category: "music", platform: "ultimateguitar", profileUrl: "https://www.ultimate-guitar.com/u/{input}",
  buildProfile: (input) => ({
    identity: { contact: { social: [{ platform: "ultimateguitar", url: `https://www.ultimate-guitar.com/u/${input}`, username: input }] } },
    faq: [{ question: "Do you play guitar?", answer: `Yes, I contribute tabs on Ultimate Guitar as ${input}.`, category: "music" }],
    interests: { hobbies: ["guitar", "music"], topics: ["guitar tabs", "chord progressions", "music theory"] },
  }),
});

export const spotifyArtistGenerator = createStaticGenerator({
  name: "spotifyartist", flag: "spotifyartist", flagArg: "<artist-id>", description: "Spotify artist public profile",
  category: "music", platform: "spotify", profileUrl: (i) => `https://open.spotify.com/artist/${i}`,
  buildProfile: (input) => ({
    identity: { contact: { social: [{ platform: "spotify", url: `https://open.spotify.com/artist/${input}`, username: input }] } },
    faq: [{ question: "Are you on Spotify as an artist?", answer: `Yes, listen to my music on Spotify: open.spotify.com/artist/${input}`, category: "music" }],
    interests: { hobbies: ["music", "recording"], topics: ["spotify", "streaming", "music release"] },
  }),
});
