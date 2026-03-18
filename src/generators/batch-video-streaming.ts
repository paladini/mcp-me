/**
 * Video & Streaming Generators (20)
 */
import { createGenerator, createStaticGenerator } from "./factory.js";

export const vimeoGenerator = createGenerator({
  name: "vimeo", flag: "vimeo", description: "Vimeo video creator profile",
  category: "creative", platform: "vimeo", profileUrl: "https://vimeo.com/{input}",
  apiUrl: "https://api.vimeo.com/users/{input}",
  extract: (data: unknown) => {
    const d = data as { name?: string; bio?: string; location?: string };
    return { displayName: d.name, bio: d.bio, location: d.location, topics: ["filmmaking", "video production"], hobbies: ["video creation"] };
  },
});

export const dailymotionGenerator = createGenerator({
  name: "dailymotion", flag: "dailymotion", description: "Dailymotion video profile",
  category: "creative", platform: "dailymotion", profileUrl: "https://www.dailymotion.com/{input}",
  apiUrl: "https://api.dailymotion.com/user/{input}?fields=screenname,description,videos_total,followers_total",
  extract: (data: unknown) => {
    const d = data as { screenname?: string; description?: string; videos_total?: number; followers_total?: number };
    return { displayName: d.screenname, bio: d.description, stats: `I have ${d.videos_total ?? 0} videos and ${d.followers_total ?? 0} followers on Dailymotion.`, topics: ["video content"], hobbies: ["video creation"] };
  },
});

export const peertubeGenerator = createStaticGenerator({
  name: "peertube", flag: "peertube", flagArg: "<user@instance>", description: "PeerTube federated video profile",
  category: "creative", platform: "peertube", profileUrl: "https://joinpeertube.org/",
  buildProfile: (input) => ({
    identity: { contact: { social: [{ platform: "peertube", url: "https://joinpeertube.org/", username: input }] } },
    faq: [{ question: "Do you use PeerTube?", answer: `Yes, I share videos on PeerTube (federated/decentralized video).`, category: "creative" }],
    interests: { topics: ["peertube", "fediverse", "decentralized video", "free software"] },
  }),
});

export const odyseeGenerator = createStaticGenerator({
  name: "odysee", flag: "odysee", description: "Odysee/LBRY decentralized video profile",
  category: "creative", platform: "odysee", profileUrl: "https://odysee.com/@{input}",
  buildProfile: (input) => ({
    identity: { contact: { social: [{ platform: "odysee", url: `https://odysee.com/@${input}`, username: input }] } },
    faq: [{ question: "Are you on Odysee?", answer: `Yes, I publish content on Odysee (decentralized video).`, category: "creative" }],
    interests: { topics: ["odysee", "lbry", "decentralized content", "censorship resistant"] },
  }),
});

export const kickGenerator = createStaticGenerator({
  name: "kick", flag: "kick", description: "Kick.com live streaming profile",
  category: "creative", platform: "kick", profileUrl: "https://kick.com/{input}",
  buildProfile: (input) => ({
    identity: { contact: { social: [{ platform: "kick", url: `https://kick.com/${input}`, username: input }] } },
    faq: [{ question: "Do you stream on Kick?", answer: `Yes, I live stream on Kick.com.`, category: "creative" }],
    interests: { hobbies: ["live streaming"], topics: ["kick", "live streaming", "content creation"] },
  }),
});

export const bilibiliGenerator = createStaticGenerator({
  name: "bilibili", flag: "bilibili", flagArg: "<uid>", description: "Bilibili Chinese video platform",
  category: "creative", platform: "bilibili", profileUrl: "https://space.bilibili.com/{input}",
  buildProfile: (input) => ({
    identity: { contact: { social: [{ platform: "bilibili", url: `https://space.bilibili.com/${input}`, username: input }] } },
    faq: [{ question: "Are you on Bilibili?", answer: `Yes, find my videos on Bilibili.`, category: "creative" }],
    interests: { topics: ["bilibili", "chinese video", "anime", "vtuber"] },
  }),
});

export const rumbleGenerator = createStaticGenerator({
  name: "rumble", flag: "rumble", description: "Rumble video platform profile",
  category: "creative", platform: "rumble", profileUrl: "https://rumble.com/user/{input}",
  buildProfile: (input) => ({
    identity: { contact: { social: [{ platform: "rumble", url: `https://rumble.com/user/${input}`, username: input }] } },
    faq: [{ question: "Are you on Rumble?", answer: `Yes, I share videos on Rumble.`, category: "creative" }],
    interests: { topics: ["video content", "alternative platforms"] },
  }),
});

export const nebulaGenerator = createStaticGenerator({
  name: "nebula", flag: "nebula", flagArg: "<creator-slug>", description: "Nebula creator-owned streaming",
  category: "creative", platform: "nebula", profileUrl: "https://nebula.tv/{input}",
  buildProfile: (input) => ({
    identity: { contact: { social: [{ platform: "nebula", url: `https://nebula.tv/${input}`, username: input }] } },
    faq: [{ question: "Are you on Nebula?", answer: `Yes, I create content on Nebula (creator-owned platform).`, category: "creative" }],
    interests: { topics: ["nebula", "educational content", "creator-owned media"] },
  }),
});

export const floatplaneGenerator = createStaticGenerator({
  name: "floatplane", flag: "floatplane", description: "Floatplane exclusive content",
  category: "creative", platform: "floatplane", profileUrl: "https://www.floatplane.com/channel/{input}",
  buildProfile: (input) => ({
    identity: { contact: { social: [{ platform: "floatplane", url: `https://www.floatplane.com/channel/${input}`, username: input }] } },
    faq: [{ question: "Are you on Floatplane?", answer: `Yes, I share exclusive content on Floatplane.`, category: "creative" }],
    interests: { topics: ["exclusive content", "tech content", "membership"] },
  }),
});

export const streamlabsGenerator = createStaticGenerator({
  name: "streamlabs", flag: "streamlabs", description: "Streamlabs streamer profile",
  category: "creative", platform: "streamlabs", profileUrl: "https://streamlabs.com/{input}",
  buildProfile: (input) => ({
    identity: { contact: { social: [{ platform: "streamlabs", url: `https://streamlabs.com/${input}`, username: input }] } },
    faq: [{ question: "Do you live stream?", answer: `Yes, support my streams via Streamlabs.`, category: "creative" }],
    interests: { hobbies: ["live streaming"], topics: ["streaming", "obs", "content creation"] },
  }),
});

export const loomGenerator = createStaticGenerator({
  name: "loom", flag: "loom", flagArg: "<workspace>", description: "Loom async video messaging",
  category: "productivity", platform: "loom", profileUrl: "https://www.loom.com/{input}",
  buildProfile: (input) => ({
    identity: { contact: { social: [{ platform: "loom", url: `https://www.loom.com/${input}`, username: input }] } },
    faq: [{ question: "Do you use Loom?", answer: `Yes, I use Loom for async video communication.`, category: "productivity" }],
    interests: { topics: ["async communication", "video messaging", "remote work"] },
  }),
});

export const substackVideoGenerator = createStaticGenerator({
  name: "substackvideo", flag: "substackvideo", description: "Substack video content",
  category: "creative", platform: "substack", profileUrl: "https://{input}.substack.com",
  buildProfile: (input) => ({
    identity: { contact: { social: [{ platform: "substack", url: `https://${input}.substack.com`, username: input }] } },
    faq: [{ question: "Do you have a Substack?", answer: `Yes, subscribe at ${input}.substack.com`, category: "writing" }],
    interests: { topics: ["newsletters", "writing", "substack"] },
  }),
});

export const youtubeShorts = createStaticGenerator({
  name: "youtubeshorts", flag: "youtubeshorts", flagArg: "<channel-handle>", description: "YouTube Shorts creator",
  category: "creative", platform: "youtube-shorts", profileUrl: "https://www.youtube.com/@{input}/shorts",
  buildProfile: (input) => ({
    identity: { contact: { social: [{ platform: "youtube-shorts", url: `https://www.youtube.com/@${input}/shorts`, username: input }] } },
    faq: [{ question: "Do you create YouTube Shorts?", answer: `Yes, check my Shorts at youtube.com/@${input}/shorts`, category: "creative" }],
    interests: { hobbies: ["short-form video"], topics: ["youtube shorts", "vertical video", "short-form content"] },
  }),
});

export const reelsGenerator = createStaticGenerator({
  name: "reels", flag: "reels", description: "Instagram Reels creator",
  category: "creative", platform: "instagram-reels", profileUrl: "https://www.instagram.com/{input}/reels/",
  buildProfile: (input) => ({
    identity: { contact: { social: [{ platform: "instagram-reels", url: `https://www.instagram.com/${input}/reels/`, username: input }] } },
    faq: [{ question: "Do you create Reels?", answer: `Yes, watch my Instagram Reels.`, category: "creative" }],
    interests: { hobbies: ["short-form video", "content creation"], topics: ["reels", "instagram", "vertical video"] },
  }),
});

export const clipchampGenerator = createStaticGenerator({
  name: "clipchamp", flag: "clipchamp", description: "Clipchamp video editing profile",
  category: "creative", platform: "clipchamp", profileUrl: "https://clipchamp.com/",
  buildProfile: (input) => ({
    identity: { contact: { social: [{ platform: "clipchamp", url: "https://clipchamp.com/", username: input }] } },
    interests: { hobbies: ["video editing"], topics: ["video editing", "content creation"] },
  }),
});

export const davinciResolve = createStaticGenerator({
  name: "davinciresolve", flag: "davinciresolve", flagArg: "<forum-user>", description: "DaVinci Resolve video editor",
  category: "creative", platform: "davinciresolve", profileUrl: "https://forum.blackmagicdesign.com/viewforum.php",
  buildProfile: (input) => ({
    identity: { contact: { social: [{ platform: "davinci-resolve", url: "https://forum.blackmagicdesign.com/", username: input }] } },
    interests: { hobbies: ["video editing", "color grading"], topics: ["davinci resolve", "color grading", "video production", "vfx"] },
    skills: { tools: [{ name: "DaVinci Resolve", category: "video-editing" }] },
  }),
});

export const adobePortfolioGenerator = createStaticGenerator({
  name: "adobeportfolio", flag: "adobeportfolio", description: "Adobe Portfolio creative showcase",
  category: "creative", platform: "adobeportfolio", profileUrl: "https://{input}.myportfolio.com",
  buildProfile: (input) => ({
    identity: { contact: { social: [{ platform: "adobe-portfolio", url: `https://${input}.myportfolio.com`, username: input }], website: `https://${input}.myportfolio.com` } },
    faq: [{ question: "Do you have a portfolio?", answer: `Yes, see my creative portfolio at ${input}.myportfolio.com`, category: "creative" }],
    interests: { topics: ["creative portfolio", "design", "photography"] },
  }),
});

export const cargocollectiveGenerator = createStaticGenerator({
  name: "cargocollective", flag: "cargocollective", description: "Cargo Collective portfolio",
  category: "creative", platform: "cargocollective", profileUrl: "https://cargo.site/{input}",
  buildProfile: (input) => ({
    identity: { contact: { social: [{ platform: "cargo", url: `https://cargo.site/${input}`, username: input }], website: `https://cargo.site/${input}` } },
    faq: [{ question: "Do you have a design portfolio?", answer: `Yes, view my work at cargo.site/${input}`, category: "creative" }],
    interests: { topics: ["design portfolio", "creative direction", "visual design"] },
  }),
});

export const readcvGenerator = createStaticGenerator({
  name: "readcv", flag: "readcv", description: "Read.cv professional profile",
  category: "creative", platform: "readcv", profileUrl: "https://read.cv/{input}",
  buildProfile: (input) => ({
    identity: { contact: { social: [{ platform: "readcv", url: `https://read.cv/${input}`, username: input }], website: `https://read.cv/${input}` } },
    faq: [{ question: "Do you have a Read.cv?", answer: `Yes, see my professional profile at read.cv/${input}`, category: "identity" }],
    interests: { topics: ["professional profile", "portfolio", "career"] },
  }),
});
