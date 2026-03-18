/**
 * Social Networks & Forums Generators (20)
 */
import { createGenerator, createStaticGenerator } from "./factory.js";

export const tumblrGenerator = createStaticGenerator({
  name: "tumblr", flag: "tumblr", description: "Tumblr blog profile",
  category: "social", platform: "tumblr", profileUrl: "https://{input}.tumblr.com",
  buildProfile: (input) => ({
    identity: { contact: { social: [{ platform: "tumblr", url: `https://${input}.tumblr.com`, username: input }] } },
    faq: [{ question: "Are you on Tumblr?", answer: `Yes, find my blog at ${input}.tumblr.com`, category: "social" }],
    interests: { hobbies: ["blogging"], topics: ["tumblr", "microblogging", "fandom"] },
  }),
});

export const pinterestGenerator = createStaticGenerator({
  name: "pinterest", flag: "pinterest", description: "Pinterest boards and pins",
  category: "social", platform: "pinterest", profileUrl: "https://www.pinterest.com/{input}",
  buildProfile: (input) => ({
    identity: { contact: { social: [{ platform: "pinterest", url: `https://www.pinterest.com/${input}`, username: input }] } },
    faq: [{ question: "Are you on Pinterest?", answer: `Yes, find my boards at pinterest.com/${input}`, category: "social" }],
    interests: { hobbies: ["curating", "visual inspiration"], topics: ["pinterest", "mood boards", "visual bookmarking"] },
  }),
});

export const tiktokGenerator = createStaticGenerator({
  name: "tiktok", flag: "tiktok", description: "TikTok creator profile",
  category: "social", platform: "tiktok", profileUrl: "https://www.tiktok.com/@{input}",
  buildProfile: (input) => ({
    identity: { contact: { social: [{ platform: "tiktok", url: `https://www.tiktok.com/@${input}`, username: input }] } },
    faq: [{ question: "Are you on TikTok?", answer: `Yes, follow me on TikTok @${input}`, category: "social" }],
    interests: { hobbies: ["short-form video"], topics: ["tiktok", "video creation", "content creation"] },
  }),
});

export const instagramGenerator = createStaticGenerator({
  name: "instagram", flag: "instagram", description: "Instagram profile link",
  category: "social", platform: "instagram", profileUrl: "https://www.instagram.com/{input}",
  buildProfile: (input) => ({
    identity: { contact: { social: [{ platform: "instagram", url: `https://www.instagram.com/${input}`, username: input }] } },
    faq: [{ question: "Are you on Instagram?", answer: `Yes, follow me on Instagram @${input}`, category: "social" }],
    interests: { hobbies: ["photography", "visual content"], topics: ["instagram", "photo sharing"] },
  }),
});

export const twitterGenerator = createStaticGenerator({
  name: "twitter", flag: "twitter", description: "Twitter/X profile link",
  category: "social", platform: "twitter", profileUrl: "https://twitter.com/{input}",
  buildProfile: (input) => ({
    identity: { contact: { social: [{ platform: "twitter", url: `https://twitter.com/${input}`, username: input }] } },
    faq: [{ question: "Are you on Twitter/X?", answer: `Yes, follow me @${input} on Twitter/X.`, category: "social" }],
    interests: { topics: ["twitter", "microblogging"] },
  }),
});

export const lemmy_Generator = createStaticGenerator({
  name: "lemmy", flag: "lemmy", flagArg: "<user@instance>", description: "Lemmy fediverse forum profile",
  category: "social", platform: "lemmy", profileUrl: "https://lemmy.ml/u/{input}",
  buildProfile: (input) => ({
    identity: { contact: { social: [{ platform: "lemmy", url: `https://lemmy.ml/u/${input}`, username: input }] } },
    faq: [{ question: "Are you on Lemmy?", answer: `Yes, I'm on Lemmy (federated Reddit alternative).`, category: "social" }],
    interests: { hobbies: ["fediverse"], topics: ["lemmy", "fediverse", "decentralized social"] },
  }),
});

export const lobstersGenerator = createGenerator({
  name: "lobsters", flag: "lobsters", description: "Lobste.rs tech forum profile",
  category: "social", platform: "lobsters", profileUrl: "https://lobste.rs/u/{input}",
  apiUrl: "https://lobste.rs/u/{input}.json",
  extract: (data: unknown) => {
    const d = data as { username?: string; about?: string; karma?: number; created_at?: string };
    return { displayName: d.username, bio: d.about, stats: `I have ${d.karma ?? 0} karma on Lobste.rs.`, topics: ["tech news", "programming", "lobsters"] };
  },
});

export const tildesGenerator = createStaticGenerator({
  name: "tildes", flag: "tildes", description: "Tildes thoughtful discussion forum",
  category: "social", platform: "tildes", profileUrl: "https://tildes.net/user/{input}",
  buildProfile: (input) => ({
    identity: { contact: { social: [{ platform: "tildes", url: `https://tildes.net/user/${input}`, username: input }] } },
    faq: [{ question: "Are you on Tildes?", answer: `Yes, I participate in thoughtful discussions on Tildes.`, category: "social" }],
    interests: { topics: ["thoughtful discussion", "community", "long-form content"] },
  }),
});

export const discordGenerator = createStaticGenerator({
  name: "discord", flag: "discord", flagArg: "<username>", description: "Discord profile",
  category: "social", platform: "discord", profileUrl: "https://discord.com/users/{input}",
  buildProfile: (input) => ({
    identity: { contact: { social: [{ platform: "discord", url: `https://discord.com/users/${input}`, username: input }] } },
    faq: [{ question: "Are you on Discord?", answer: `Yes, my Discord is ${input}. Feel free to add me!`, category: "social" }],
    interests: { topics: ["discord", "community", "gaming", "chat"] },
  }),
});

export const telegramGenerator = createStaticGenerator({
  name: "telegram", flag: "telegram", description: "Telegram public profile/channel",
  category: "social", platform: "telegram", profileUrl: "https://t.me/{input}",
  buildProfile: (input) => ({
    identity: { contact: { social: [{ platform: "telegram", url: `https://t.me/${input}`, username: input }] } },
    faq: [{ question: "Are you on Telegram?", answer: `Yes, reach me on Telegram at t.me/${input}`, category: "social" }],
    interests: { topics: ["telegram", "messaging", "channels"] },
  }),
});

export const signalGenerator = createStaticGenerator({
  name: "signal", flag: "signal", flagArg: "<username>", description: "Signal messenger profile",
  category: "social", platform: "signal", profileUrl: "https://signal.me/#p/{input}",
  buildProfile: (input) => ({
    identity: { contact: { social: [{ platform: "signal", url: `https://signal.me/#p/${input}`, username: input }] } },
    faq: [{ question: "Do you use Signal?", answer: `Yes, I prefer Signal for encrypted messaging.`, category: "social" }],
    interests: { topics: ["privacy", "encrypted messaging", "open source"] },
  }),
});

export const matrixGenerator = createStaticGenerator({
  name: "matrix", flag: "matrix", flagArg: "<@user:server>", description: "Matrix decentralized chat profile",
  category: "social", platform: "matrix", profileUrl: "https://matrix.to/#/{input}",
  buildProfile: (input) => ({
    identity: { contact: { social: [{ platform: "matrix", url: `https://matrix.to/#/${input}`, username: input }] } },
    faq: [{ question: "Are you on Matrix?", answer: `Yes, my Matrix ID is ${input}`, category: "social" }],
    interests: { topics: ["matrix", "decentralized communication", "open source chat"] },
  }),
});

export const linkedinGenerator2 = createStaticGenerator({
  name: "linkedinprofile", flag: "linkedinprofile", flagArg: "<profile-slug>", description: "LinkedIn public profile link",
  category: "social", platform: "linkedin", profileUrl: "https://www.linkedin.com/in/{input}",
  buildProfile: (input) => ({
    identity: { contact: { social: [{ platform: "linkedin", url: `https://www.linkedin.com/in/${input}`, username: input }] } },
    faq: [{ question: "Are you on LinkedIn?", answer: `Yes, connect with me on LinkedIn: linkedin.com/in/${input}`, category: "social" }],
    interests: { topics: ["professional networking", "career"] },
  }),
});

export const facebookGenerator = createStaticGenerator({
  name: "facebook", flag: "facebook", description: "Facebook profile link",
  category: "social", platform: "facebook", profileUrl: "https://www.facebook.com/{input}",
  buildProfile: (input) => ({
    identity: { contact: { social: [{ platform: "facebook", url: `https://www.facebook.com/${input}`, username: input }] } },
    faq: [{ question: "Are you on Facebook?", answer: `Yes, find me on Facebook.`, category: "social" }],
    interests: { topics: ["social networking"] },
  }),
});

export const snapchatGenerator = createStaticGenerator({
  name: "snapchat", flag: "snapchat", description: "Snapchat profile",
  category: "social", platform: "snapchat", profileUrl: "https://www.snapchat.com/add/{input}",
  buildProfile: (input) => ({
    identity: { contact: { social: [{ platform: "snapchat", url: `https://www.snapchat.com/add/${input}`, username: input }] } },
    faq: [{ question: "Are you on Snapchat?", answer: `Yes, add me on Snapchat: ${input}`, category: "social" }],
    interests: { topics: ["snapchat", "ephemeral content"] },
  }),
});

export const whatsappGenerator = createStaticGenerator({
  name: "whatsapp", flag: "whatsapp", flagArg: "<phone-number>", description: "WhatsApp contact link",
  category: "social", platform: "whatsapp", profileUrl: "https://wa.me/{input}",
  buildProfile: (input) => ({
    identity: { contact: { social: [{ platform: "whatsapp", url: `https://wa.me/${input}`, username: input }] } },
    faq: [{ question: "Can I reach you on WhatsApp?", answer: `Yes, message me on WhatsApp: wa.me/${input}`, category: "social" }],
  }),
});

export const wechatGenerator = createStaticGenerator({
  name: "wechat", flag: "wechat", flagArg: "<wechat-id>", description: "WeChat profile",
  category: "social", platform: "wechat", profileUrl: "https://weixin.qq.com/",
  buildProfile: (input) => ({
    identity: { contact: { social: [{ platform: "wechat", url: "https://weixin.qq.com/", username: input }] } },
    faq: [{ question: "Are you on WeChat?", answer: `Yes, my WeChat ID is ${input}`, category: "social" }],
  }),
});

export const lineGenerator = createStaticGenerator({
  name: "line", flag: "line", flagArg: "<line-id>", description: "LINE messenger profile",
  category: "social", platform: "line", profileUrl: "https://line.me/ti/p/{input}",
  buildProfile: (input) => ({
    identity: { contact: { social: [{ platform: "line", url: `https://line.me/ti/p/${input}`, username: input }] } },
    faq: [{ question: "Are you on LINE?", answer: `Yes, my LINE ID is ${input}`, category: "social" }],
  }),
});

export const vkGenerator = createStaticGenerator({
  name: "vk", flag: "vk", description: "VK (VKontakte) profile",
  category: "social", platform: "vk", profileUrl: "https://vk.com/{input}",
  buildProfile: (input) => ({
    identity: { contact: { social: [{ platform: "vk", url: `https://vk.com/${input}`, username: input }] } },
    faq: [{ question: "Are you on VK?", answer: `Yes, find me on VK at vk.com/${input}`, category: "social" }],
  }),
});
