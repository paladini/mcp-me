/**
 * Entertainment — Movies, TV, Anime, Books, Podcasts Generators (20)
 */
import { createGenerator, createStaticGenerator } from "./factory.js";

export const tmdbGenerator = createGenerator({
  name: "tmdb", flag: "tmdb", flagArg: "<account-id>", description: "TMDB movie/TV watchlist and ratings",
  category: "entertainment", platform: "tmdb", profileUrl: "https://www.themoviedb.org/u/{input}",
  apiUrl: "https://api.themoviedb.org/3/account/{input}?api_key=mcp-me",
  extract: (data: unknown) => {
    const d = data as { username?: string; name?: string };
    return { displayName: d.name ?? d.username, stats: `I track movies and TV on TMDB.`, hobbies: ["movies", "tv shows"], topics: ["film", "television", "cinema"] };
  },
});

export const traktGenerator = createGenerator({
  name: "trakt", flag: "trakt", description: "Trakt.tv watching history and stats",
  category: "entertainment", platform: "trakt", profileUrl: "https://trakt.tv/users/{input}",
  apiUrl: "https://api.trakt.tv/users/{input}/stats",
  apiHeaders: { "trakt-api-version": "2", "trakt-api-key": "mcp-me" },
  extract: (data: unknown) => {
    const d = data as { movies?: { watched?: number }; shows?: { watched?: number }; episodes?: { watched?: number } };
    return { stats: `I've watched ${d.movies?.watched ?? 0} movies and ${d.episodes?.watched ?? 0} episodes (${d.shows?.watched ?? 0} shows) on Trakt.`, hobbies: ["movies", "tv shows", "binge watching"], topics: ["film", "tv series", "streaming"] };
  },
});

export const simklGenerator = createStaticGenerator({
  name: "simkl", flag: "simkl", description: "Simkl anime/movie/show tracking",
  category: "entertainment", platform: "simkl", profileUrl: "https://simkl.com/{input}",
  buildProfile: (input) => ({
    identity: { contact: { social: [{ platform: "simkl", url: `https://simkl.com/${input}`, username: input }] } },
    faq: [{ question: "Do you track what you watch?", answer: `Yes, I track anime, movies, and shows on Simkl.`, category: "entertainment" }],
    interests: { hobbies: ["anime", "movies", "tv shows"], topics: ["anime tracking", "media tracking"] },
  }),
});

export const tvtimeGenerator = createStaticGenerator({
  name: "tvtime", flag: "tvtime", description: "TV Time episode tracking",
  category: "entertainment", platform: "tvtime", profileUrl: "https://tvtime.com/en/user/{input}",
  buildProfile: (input) => ({
    identity: { contact: { social: [{ platform: "tvtime", url: `https://tvtime.com/en/user/${input}`, username: input }] } },
    faq: [{ question: "Do you track TV episodes?", answer: `Yes, I track my watching on TV Time.`, category: "entertainment" }],
    interests: { hobbies: ["tv shows", "series binging"], topics: ["television", "series tracking"] },
  }),
});

export const myDramaListGenerator = createStaticGenerator({
  name: "mydramalist", flag: "mydramalist", description: "MyDramaList Asian drama tracking",
  category: "entertainment", platform: "mydramalist", profileUrl: "https://mydramalist.com/profile/{input}",
  buildProfile: (input) => ({
    identity: { contact: { social: [{ platform: "mydramalist", url: `https://mydramalist.com/profile/${input}`, username: input }] } },
    faq: [{ question: "Do you watch Asian dramas?", answer: `Yes, I track K-dramas and other Asian dramas on MyDramaList.`, category: "entertainment" }],
    interests: { hobbies: ["k-drama", "asian drama"], topics: ["korean drama", "japanese drama", "chinese drama"] },
  }),
});

export const mubiGenerator = createStaticGenerator({
  name: "mubi", flag: "mubi", description: "MUBI curated cinema profile",
  category: "entertainment", platform: "mubi", profileUrl: "https://mubi.com/en/users/{input}",
  buildProfile: (input) => ({
    identity: { contact: { social: [{ platform: "mubi", url: `https://mubi.com/en/users/${input}`, username: input }] } },
    faq: [{ question: "Do you watch art-house films?", answer: `Yes, I'm on MUBI for curated and indie cinema.`, category: "entertainment" }],
    interests: { hobbies: ["art-house cinema", "independent film"], topics: ["film festivals", "world cinema", "auteur cinema"] },
  }),
});

export const storygraphGenerator = createStaticGenerator({
  name: "storygraph", flag: "storygraph", description: "The StoryGraph reading and book stats",
  category: "entertainment", platform: "storygraph", profileUrl: "https://app.thestorygraph.com/profile/{input}",
  buildProfile: (input) => ({
    identity: { contact: { social: [{ platform: "storygraph", url: `https://app.thestorygraph.com/profile/${input}`, username: input }] } },
    faq: [{ question: "Do you track reading?", answer: `Yes, I use The StoryGraph to track my reading with mood-based stats.`, category: "entertainment" }],
    interests: { hobbies: ["reading", "books"], topics: ["book tracking", "reading stats", "book recommendations"] },
  }),
});

export const librarythingGenerator = createStaticGenerator({
  name: "librarything", flag: "librarything", description: "LibraryThing personal library catalog",
  category: "entertainment", platform: "librarything", profileUrl: "https://www.librarything.com/profile/{input}",
  buildProfile: (input) => ({
    identity: { contact: { social: [{ platform: "librarything", url: `https://www.librarything.com/profile/${input}`, username: input }] } },
    faq: [{ question: "Do you catalog your books?", answer: `Yes, I catalog my library on LibraryThing.`, category: "entertainment" }],
    interests: { hobbies: ["book collecting", "cataloging"], topics: ["books", "library", "book reviews"] },
  }),
});

export const bookwyrmGenerator = createStaticGenerator({
  name: "bookwyrm", flag: "bookwyrm", flagArg: "<user@instance>", description: "BookWyrm federated book tracking",
  category: "entertainment", platform: "bookwyrm", profileUrl: "https://bookwyrm.social/user/{input}",
  buildProfile: (input) => ({
    identity: { contact: { social: [{ platform: "bookwyrm", url: `https://bookwyrm.social/user/${input}`, username: input }] } },
    faq: [{ question: "Do you use BookWyrm?", answer: `Yes, I track books on BookWyrm (federated/Fediverse).`, category: "entertainment" }],
    interests: { hobbies: ["reading", "fediverse"], topics: ["bookwyrm", "fediverse", "decentralized book tracking"] },
  }),
});

export const mangadexGenerator = createStaticGenerator({
  name: "mangadex", flag: "mangadex", flagArg: "<user-id>", description: "MangaDex manga reading profile",
  category: "entertainment", platform: "mangadex", profileUrl: "https://mangadex.org/user/{input}",
  buildProfile: (input) => ({
    identity: { contact: { social: [{ platform: "mangadex", url: `https://mangadex.org/user/${input}`, username: input }] } },
    faq: [{ question: "Do you read manga?", answer: `Yes, I read manga on MangaDex.`, category: "entertainment" }],
    interests: { hobbies: ["manga", "reading"], topics: ["manga", "japanese comics", "webtoons"] },
  }),
});

export const novelupdatesGenerator = createStaticGenerator({
  name: "novelupdates", flag: "novelupdates", description: "Novel Updates web/light novel reading",
  category: "entertainment", platform: "novelupdates", profileUrl: "https://www.novelupdates.com/user/{input}",
  buildProfile: (input) => ({
    identity: { contact: { social: [{ platform: "novelupdates", url: `https://www.novelupdates.com/user/${input}`, username: input }] } },
    faq: [{ question: "Do you read web novels?", answer: `Yes, I track web novels and light novels on Novel Updates.`, category: "entertainment" }],
    interests: { hobbies: ["web novels", "light novels"], topics: ["web fiction", "light novels", "xianxia", "isekai"] },
  }),
});

export const podchaserGenerator = createGenerator({
  name: "podchaser", flag: "podchaser", description: "Podchaser podcast reviews and lists",
  category: "podcasts", platform: "podchaser", profileUrl: "https://www.podchaser.com/users/{input}",
  apiUrl: "https://api.podchaser.com/users/{input}",
  extract: (data: unknown) => {
    const d = data as { username?: string; bio?: string; ratings_count?: number };
    return { displayName: d.username, bio: d.bio, stats: `I've rated ${d.ratings_count ?? 0} podcasts on Podchaser.`, hobbies: ["podcasts"], topics: ["podcasts", "podcast reviews"] };
  },
});

export const goodpodsGenerator = createStaticGenerator({
  name: "goodpods", flag: "goodpods", description: "Goodpods podcast community",
  category: "podcasts", platform: "goodpods", profileUrl: "https://goodpods.com/users/{input}",
  buildProfile: (input) => ({
    identity: { contact: { social: [{ platform: "goodpods", url: `https://goodpods.com/users/${input}`, username: input }] } },
    faq: [{ question: "Do you listen to podcasts?", answer: `Yes, I discover and share podcasts on Goodpods.`, category: "podcasts" }],
    interests: { hobbies: ["podcasts"], topics: ["podcasts", "podcast discovery", "audio content"] },
  }),
});

export const pocketcastsGenerator = createStaticGenerator({
  name: "pocketcasts", flag: "pocketcasts", flagArg: "<share-url>", description: "Pocket Casts listening profile",
  category: "podcasts", platform: "pocketcasts", profileUrl: "https://lists.pocketcasts.com/user/{input}",
  buildProfile: (input) => ({
    identity: { contact: { social: [{ platform: "pocketcasts", url: `https://lists.pocketcasts.com/user/${input}`, username: input }] } },
    faq: [{ question: "What podcast app do you use?", answer: `I use Pocket Casts for my podcast listening.`, category: "podcasts" }],
    interests: { hobbies: ["podcasts", "audio content"], topics: ["podcast listening", "podcast app"] },
  }),
});

export const anchorGenerator = createStaticGenerator({
  name: "anchor", flag: "anchor", description: "Anchor/Spotify podcast creator profile",
  category: "podcasts", platform: "anchor", profileUrl: "https://anchor.fm/{input}",
  buildProfile: (input) => ({
    identity: { contact: { social: [{ platform: "anchor", url: `https://anchor.fm/${input}`, username: input }] } },
    faq: [{ question: "Do you host a podcast?", answer: `Yes, find my podcast on Anchor/Spotify at anchor.fm/${input}`, category: "podcasts" }],
    interests: { hobbies: ["podcasting", "audio creation"], topics: ["podcast creation", "audio storytelling"] },
  }),
});

export const podbeanGenerator = createStaticGenerator({
  name: "podbean", flag: "podbean", description: "Podbean podcast hosting profile",
  category: "podcasts", platform: "podbean", profileUrl: "https://{input}.podbean.com",
  buildProfile: (input) => ({
    identity: { contact: { social: [{ platform: "podbean", url: `https://${input}.podbean.com`, username: input }] } },
    faq: [{ question: "Do you podcast?", answer: `Yes, my podcast is hosted on Podbean at ${input}.podbean.com`, category: "podcasts" }],
    interests: { hobbies: ["podcasting"], topics: ["podcast hosting", "audio content creation"] },
  }),
});

export const wattpadGenerator = createStaticGenerator({
  name: "wattpad", flag: "wattpad", description: "Wattpad stories and reading",
  category: "entertainment", platform: "wattpad", profileUrl: "https://www.wattpad.com/user/{input}",
  buildProfile: (input) => ({
    identity: { contact: { social: [{ platform: "wattpad", url: `https://www.wattpad.com/user/${input}`, username: input }] } },
    faq: [{ question: "Do you write stories?", answer: `Yes, I write and read stories on Wattpad.`, category: "entertainment" }],
    interests: { hobbies: ["creative writing", "reading fiction"], topics: ["wattpad", "fan fiction", "web fiction", "storytelling"] },
  }),
});

export const royalroadGenerator = createStaticGenerator({
  name: "royalroad", flag: "royalroad", flagArg: "<author-id>", description: "Royal Road web fiction",
  category: "entertainment", platform: "royalroad", profileUrl: "https://www.royalroad.com/profile/{input}",
  buildProfile: (input) => ({
    identity: { contact: { social: [{ platform: "royalroad", url: `https://www.royalroad.com/profile/${input}`, username: input }] } },
    faq: [{ question: "Do you write web fiction?", answer: `Yes, I write/read web fiction on Royal Road.`, category: "entertainment" }],
    interests: { hobbies: ["web fiction", "litrpg"], topics: ["web serial", "litrpg", "progression fantasy", "royal road"] },
  }),
});

export const ao3Generator = createStaticGenerator({
  name: "ao3", flag: "ao3", description: "Archive of Our Own fanfiction",
  category: "entertainment", platform: "ao3", profileUrl: "https://archiveofourown.org/users/{input}",
  buildProfile: (input) => ({
    identity: { contact: { social: [{ platform: "ao3", url: `https://archiveofourown.org/users/${input}`, username: input }] } },
    faq: [{ question: "Do you write fanfiction?", answer: `Yes, find my works on AO3 (Archive of Our Own).`, category: "entertainment" }],
    interests: { hobbies: ["fanfiction", "creative writing"], topics: ["fanfiction", "ao3", "fan works", "creative writing"] },
  }),
});
