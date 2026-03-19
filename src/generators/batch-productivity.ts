/**
 * Productivity, Fashion & Lifestyle Generators (20)
 */
import { createGenerator, createStaticGenerator } from "./factory.js";

export const notionGenerator = createStaticGenerator({
  name: "notion", flag: "notion", flagArg: "<workspace-slug>", description: "Notion public workspace",
  category: "productivity", platform: "notion", profileUrl: "https://www.notion.so/{input}",
  buildProfile: (input) => ({
    identity: { contact: { social: [{ platform: "notion", url: `https://www.notion.so/${input}`, username: input }] } },
    faq: [{ question: "Do you use Notion?", answer: `Yes, I organize my work and life in Notion.`, category: "productivity" }],
    interests: { topics: ["notion", "productivity", "knowledge management", "second brain"] },
  }),
});

export const obsidianPublishGenerator = createStaticGenerator({
  name: "obsidianpublish", flag: "obsidianpublish", flagArg: "<site-slug>", description: "Obsidian Publish digital garden",
  category: "productivity", platform: "obsidian", profileUrl: "https://publish.obsidian.md/{input}",
  buildProfile: (input) => ({
    identity: { contact: { social: [{ platform: "obsidian", url: `https://publish.obsidian.md/${input}`, username: input }], website: `https://publish.obsidian.md/${input}` } },
    faq: [{ question: "Do you have a digital garden?", answer: `Yes, my digital garden is at publish.obsidian.md/${input}`, category: "productivity" }],
    interests: { hobbies: ["note-taking", "digital garden"], topics: ["obsidian", "zettelkasten", "pkm", "digital garden"] },
  }),
});

export const raindropGenerator = createGenerator({
  name: "raindrop", flag: "raindrop", flagArg: "<user-id>", description: "Raindrop.io public bookmarks",
  category: "productivity", platform: "raindrop", profileUrl: "https://raindrop.io/user/{input}",
  apiUrl: "https://api.raindrop.io/rest/v1/user/{input}",
  extract: (data: unknown) => {
    const d = data as { user?: { fullName?: string; pro?: boolean } };
    return { displayName: d.user?.fullName, stats: `I curate public bookmark collections on Raindrop.io.`, topics: ["bookmarking", "curation", "research"] };
  },
});

export const arenaGenerator = createStaticGenerator({
  name: "arena", flag: "arena", description: "Are.na visual research channels",
  category: "productivity", platform: "arena", profileUrl: "https://www.are.na/{input}",
  buildProfile: (input) => ({
    identity: { contact: { social: [{ platform: "are.na", url: `https://www.are.na/${input}`, username: input }] } },
    faq: [{ question: "Do you use Are.na?", answer: `Yes, I curate visual research channels on Are.na.`, category: "productivity" }],
    interests: { hobbies: ["visual research", "curation"], topics: ["are.na", "visual thinking", "mood boards", "research"] },
  }),
});

export const pinboardGenerator = createGenerator({
  name: "pinboard", flag: "pinboard", description: "Pinboard bookmarking (anti-social)",
  category: "productivity", platform: "pinboard", profileUrl: "https://pinboard.in/u:{input}",
  apiUrl: "https://pinboard.in/u:{input}",
  apiHeaders: { Accept: "text/html" },
  extract: (_data: unknown, _input) => ({
    stats: `I bookmark interesting links on Pinboard.`,
    topics: ["bookmarking", "link curation"],
  }),
});

export const todoistGenerator = createStaticGenerator({
  name: "todoist", flag: "todoist", flagArg: "<karma-level>", description: "Todoist productivity karma",
  category: "productivity", platform: "todoist", profileUrl: "https://todoist.com/",
  buildProfile: (input) => ({
    identity: { contact: { social: [{ platform: "todoist", url: "https://todoist.com/", username: input }] } },
    faq: [{ question: "How do you stay organized?", answer: `I use Todoist for task management. Karma level: ${input}`, category: "productivity" }],
    interests: { topics: ["todoist", "task management", "gtd", "productivity"] },
  }),
});

export const linearGenerator = createStaticGenerator({
  name: "linear", flag: "linear", flagArg: "<workspace>", description: "Linear project management profile",
  category: "productivity", platform: "linear", profileUrl: "https://linear.app/{input}",
  buildProfile: (input) => ({
    identity: { contact: { social: [{ platform: "linear", url: `https://linear.app/${input}`, username: input }] } },
    faq: [{ question: "What project management tool do you use?", answer: `I use Linear for project and issue tracking.`, category: "productivity" }],
    interests: { topics: ["linear", "project management", "issue tracking", "agile"] },
  }),
});

export const grailedGenerator = createStaticGenerator({
  name: "grailed", flag: "grailed", description: "Grailed fashion marketplace profile",
  category: "social", platform: "grailed", profileUrl: "https://www.grailed.com/{input}",
  buildProfile: (input) => ({
    identity: { contact: { social: [{ platform: "grailed", url: `https://www.grailed.com/${input}`, username: input }] } },
    faq: [{ question: "Are you into fashion?", answer: `Yes, I buy and sell on Grailed.`, category: "social" }],
    interests: { hobbies: ["fashion", "streetwear"], topics: ["grailed", "streetwear", "designer fashion", "vintage"] },
  }),
});

export const depopGenerator = createStaticGenerator({
  name: "depop", flag: "depop", description: "Depop vintage/fashion marketplace",
  category: "social", platform: "depop", profileUrl: "https://www.depop.com/{input}",
  buildProfile: (input) => ({
    identity: { contact: { social: [{ platform: "depop", url: `https://www.depop.com/${input}`, username: input }] } },
    faq: [{ question: "Do you sell on Depop?", answer: `Yes, I sell vintage and fashion on Depop.`, category: "social" }],
    interests: { hobbies: ["vintage fashion", "thrifting"], topics: ["depop", "sustainable fashion", "vintage", "thrifting"] },
  }),
});

export const vintedGenerator = createStaticGenerator({
  name: "vinted", flag: "vinted", description: "Vinted secondhand marketplace",
  category: "social", platform: "vinted", profileUrl: "https://www.vinted.com/member/{input}",
  buildProfile: (input) => ({
    identity: { contact: { social: [{ platform: "vinted", url: `https://www.vinted.com/member/${input}`, username: input }] } },
    faq: [{ question: "Do you sell secondhand?", answer: `Yes, I sell and buy secondhand on Vinted.`, category: "social" }],
    interests: { hobbies: ["secondhand shopping"], topics: ["sustainable fashion", "circular economy", "secondhand"] },
  }),
});

export const etsyGenerator = createStaticGenerator({
  name: "etsy", flag: "etsy", description: "Etsy handmade/vintage shop",
  category: "social", platform: "etsy", profileUrl: "https://www.etsy.com/shop/{input}",
  buildProfile: (input) => ({
    identity: { contact: { social: [{ platform: "etsy", url: `https://www.etsy.com/shop/${input}`, username: input }], website: `https://www.etsy.com/shop/${input}` } },
    faq: [{ question: "Do you sell on Etsy?", answer: `Yes, find my handmade/vintage shop at etsy.com/shop/${input}`, category: "social" }],
    interests: { hobbies: ["handmade crafts"], topics: ["etsy", "handmade", "crafts", "small business"] },
  }),
});

export const shopiifyGenerator = createStaticGenerator({
  name: "shopify", flag: "shopify", flagArg: "<store-url>", description: "Shopify store owner profile",
  category: "finance", platform: "shopify", profileUrl: "https://{input}",
  buildProfile: (input) => ({
    identity: { contact: { social: [{ platform: "shopify", url: `https://${input}`, username: input }], website: `https://${input}` } },
    faq: [{ question: "Do you have an online store?", answer: `Yes, check out my shop at ${input}`, category: "finance" }],
    interests: { topics: ["ecommerce", "shopify", "online business"] },
  }),
});

export const producthuntMaker = createStaticGenerator({
  name: "phmaker", flag: "phmaker", flagArg: "<ph-username>", description: "ProductHunt Maker profile",
  category: "community", platform: "producthunt-maker", profileUrl: "https://www.producthunt.com/@{input}",
  buildProfile: (input) => ({
    identity: { contact: { social: [{ platform: "producthunt", url: `https://www.producthunt.com/@${input}`, username: input }] } },
    faq: [{ question: "Are you a maker?", answer: `Yes, I build and launch products. Find me on ProductHunt.`, category: "community" }],
    interests: { hobbies: ["building products"], topics: ["product hunt", "maker", "startup", "launch"] },
  }),
});

export const typefullyGenerator = createStaticGenerator({
  name: "typefully", flag: "typefully", description: "Typefully thread writing profile",
  category: "writing", platform: "typefully", profileUrl: "https://typefully.com/u/{input}",
  buildProfile: (input) => ({
    identity: { contact: { social: [{ platform: "typefully", url: `https://typefully.com/u/${input}`, username: input }] } },
    faq: [{ question: "Do you write threads?", answer: `Yes, I write Twitter/X threads on Typefully.`, category: "writing" }],
    interests: { topics: ["thread writing", "twitter threads", "content writing"] },
  }),
});

export const convertKitGenerator = createStaticGenerator({
  name: "convertkit", flag: "convertkit", flagArg: "<creator-slug>", description: "ConvertKit newsletter creator",
  category: "writing", platform: "convertkit", profileUrl: "https://{input}.ck.page",
  buildProfile: (input) => ({
    identity: { contact: { social: [{ platform: "convertkit", url: `https://${input}.ck.page`, username: input }], website: `https://${input}.ck.page` } },
    faq: [{ question: "Do you have a newsletter?", answer: `Yes, subscribe at ${input}.ck.page`, category: "writing" }],
    interests: { topics: ["newsletter", "email marketing", "creator economy"] },
  }),
});

export const buttondownGenerator = createStaticGenerator({
  name: "buttondown", flag: "buttondown", description: "Buttondown newsletter",
  category: "writing", platform: "buttondown", profileUrl: "https://buttondown.email/{input}",
  buildProfile: (input) => ({
    identity: { contact: { social: [{ platform: "buttondown", url: `https://buttondown.email/${input}`, username: input }], website: `https://buttondown.email/${input}` } },
    faq: [{ question: "Do you write a newsletter?", answer: `Yes, subscribe to my newsletter at buttondown.email/${input}`, category: "writing" }],
    interests: { topics: ["newsletter", "writing", "email"] },
  }),
});

export const revueGenerator = createStaticGenerator({
  name: "revue", flag: "revue", description: "Revue newsletter profile",
  category: "writing", platform: "revue", profileUrl: "https://www.getrevue.co/profile/{input}",
  buildProfile: (input) => ({
    identity: { contact: { social: [{ platform: "revue", url: `https://www.getrevue.co/profile/${input}`, username: input }] } },
    faq: [{ question: "Do you publish a newsletter?", answer: `Yes, my newsletter is on Revue.`, category: "writing" }],
    interests: { topics: ["newsletter", "curation", "writing"] },
  }),
});

export const polyworkGenerator = createStaticGenerator({
  name: "polywork", flag: "polywork", description: "Polywork professional timeline",
  category: "identity", platform: "polywork", profileUrl: "https://www.polywork.com/{input}",
  buildProfile: (input) => ({
    identity: { contact: { social: [{ platform: "polywork", url: `https://www.polywork.com/${input}`, username: input }], website: `https://www.polywork.com/${input}` } },
    faq: [{ question: "Do you have a Polywork?", answer: `Yes, see my professional timeline at polywork.com/${input}`, category: "identity" }],
    interests: { topics: ["professional profile", "career timeline", "networking"] },
  }),
});

export const bioLinkGenerator = createStaticGenerator({
  name: "biolink", flag: "biolink", flagArg: "<link-slug>", description: "Bio link page (Linktree, etc.)",
  category: "identity", platform: "linktree", profileUrl: "https://linktr.ee/{input}",
  buildProfile: (input) => ({
    identity: { contact: { social: [{ platform: "linktree", url: `https://linktr.ee/${input}`, username: input }], website: `https://linktr.ee/${input}` } },
    faq: [{ question: "Where can I find all your links?", answer: `Check my link page at linktr.ee/${input}`, category: "identity" }],
  }),
});
