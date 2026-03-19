/**
 * Miscellaneous & Niche Generators (20)
 */
import { createGenerator, createStaticGenerator } from "./factory.js";

export const wazeGenerator = createStaticGenerator({
  name: "waze", flag: "waze", description: "Waze navigation contributor",
  category: "travel", platform: "waze", profileUrl: "https://www.waze.com/user/editor/{input}",
  buildProfile: (input) => ({
    identity: { contact: { social: [{ platform: "waze", url: `https://www.waze.com/user/editor/${input}`, username: input }] } },
    faq: [{ question: "Do you contribute to Waze?", answer: `Yes, I'm a Waze map editor.`, category: "travel" }],
    interests: { hobbies: ["map editing"], topics: ["waze", "navigation", "crowdsourced maps"] },
  }),
});

export const openstreetmapGenerator = createGenerator({
  name: "openstreetmap", flag: "openstreetmap", flagArg: "<user-id>", description: "OpenStreetMap contributions",
  category: "travel", platform: "openstreetmap", profileUrl: "https://www.openstreetmap.org/user/{input}",
  apiUrl: "https://api.openstreetmap.org/api/0.6/user/{input}.json",
  extract: (data: unknown) => {
    const d = data as { user?: { display_name?: string; description?: string; changesets?: { count?: number } } };
    const u = d.user;
    return { displayName: u?.display_name, bio: u?.description, stats: `I've made ${u?.changesets?.count ?? 0} changesets on OpenStreetMap.`, hobbies: ["mapping"], topics: ["openstreetmap", "osm", "mapping", "open data"] };
  },
});

export const wikipediaGenerator = createStaticGenerator({
  name: "wikipedia", flag: "wikipedia", description: "Wikipedia editor contributions",
  category: "community", platform: "wikipedia", profileUrl: "https://en.wikipedia.org/wiki/User:{input}",
  buildProfile: (input) => ({
    identity: { contact: { social: [{ platform: "wikipedia", url: `https://en.wikipedia.org/wiki/User:${input}`, username: input }] } },
    faq: [{ question: "Do you edit Wikipedia?", answer: `Yes, I'm a Wikipedia editor as User:${input}.`, category: "community" }],
    interests: { hobbies: ["wikipedia editing", "knowledge sharing"], topics: ["wikipedia", "free knowledge", "wiki"] },
  }),
});

export const stackExchangeGenerator = createStaticGenerator({
  name: "stackexchange", flag: "stackexchange", flagArg: "<user-id>", description: "Stack Exchange network profile",
  category: "community", platform: "stackexchange", profileUrl: "https://stackexchange.com/users/{input}",
  buildProfile: (input) => ({
    identity: { contact: { social: [{ platform: "stackexchange", url: `https://stackexchange.com/users/${input}`, username: input }] } },
    faq: [{ question: "Are you active on Stack Exchange?", answer: `Yes, I contribute across the Stack Exchange network.`, category: "community" }],
    interests: { topics: ["q&a", "knowledge sharing", "stack exchange"] },
  }),
});

export const meetupGenerator = createStaticGenerator({
  name: "meetup", flag: "meetup", flagArg: "<member-id>", description: "Meetup.com event participation",
  category: "community", platform: "meetup", profileUrl: "https://www.meetup.com/members/{input}",
  buildProfile: (input) => ({
    identity: { contact: { social: [{ platform: "meetup", url: `https://www.meetup.com/members/${input}`, username: input }] } },
    faq: [{ question: "Do you attend meetups?", answer: `Yes, I'm active in the Meetup community.`, category: "community" }],
    interests: { hobbies: ["networking", "meetups"], topics: ["meetup", "local events", "tech meetups", "community"] },
  }),
});

export const eventbriteGenerator = createStaticGenerator({
  name: "eventbrite", flag: "eventbrite", flagArg: "<organizer-id>", description: "Eventbrite event organizer",
  category: "community", platform: "eventbrite", profileUrl: "https://www.eventbrite.com/o/{input}",
  buildProfile: (input) => ({
    identity: { contact: { social: [{ platform: "eventbrite", url: `https://www.eventbrite.com/o/${input}`, username: input }] } },
    faq: [{ question: "Do you organize events?", answer: `Yes, I organize events on Eventbrite.`, category: "community" }],
    interests: { hobbies: ["event organizing"], topics: ["events", "conferences", "workshops"] },
  }),
});

export const lumaGenerator = createStaticGenerator({
  name: "luma", flag: "luma", description: "Luma event hosting profile",
  category: "community", platform: "luma", profileUrl: "https://lu.ma/{input}",
  buildProfile: (input) => ({
    identity: { contact: { social: [{ platform: "luma", url: `https://lu.ma/${input}`, username: input }] } },
    faq: [{ question: "Do you host events?", answer: `Yes, I host events on Luma.`, category: "community" }],
    interests: { topics: ["events", "community building", "luma"] },
  }),
});

export const speakerdeckGenerator = createStaticGenerator({
  name: "speakerdeck", flag: "speakerdeck", description: "Speaker Deck presentation slides",
  category: "community", platform: "speakerdeck", profileUrl: "https://speakerdeck.com/{input}",
  buildProfile: (input) => ({
    identity: { contact: { social: [{ platform: "speakerdeck", url: `https://speakerdeck.com/${input}`, username: input }] } },
    faq: [{ question: "Do you give talks?", answer: `Yes, find my presentation slides on Speaker Deck.`, category: "community" }],
    interests: { hobbies: ["public speaking"], topics: ["presentations", "public speaking", "tech talks"] },
  }),
});

export const slideshareGenerator = createStaticGenerator({
  name: "slideshare", flag: "slideshare", description: "SlideShare presentations",
  category: "community", platform: "slideshare", profileUrl: "https://www.slideshare.net/{input}",
  buildProfile: (input) => ({
    identity: { contact: { social: [{ platform: "slideshare", url: `https://www.slideshare.net/${input}`, username: input }] } },
    faq: [{ question: "Do you share presentations?", answer: `Yes, my slides are on SlideShare.`, category: "community" }],
    interests: { topics: ["presentations", "slideshare", "knowledge sharing"] },
  }),
});

export const calendlyGenerator = createStaticGenerator({
  name: "calendly", flag: "calendly", description: "Calendly scheduling link",
  category: "productivity", platform: "calendly", profileUrl: "https://calendly.com/{input}",
  buildProfile: (input) => ({
    identity: { contact: { social: [{ platform: "calendly", url: `https://calendly.com/${input}`, username: input }], website: `https://calendly.com/${input}` } },
    faq: [{ question: "How can I schedule a meeting?", answer: `Book a time at calendly.com/${input}`, category: "availability" }],
    interests: { topics: ["scheduling", "time management"] },
  }),
});

export const calGenerator = createStaticGenerator({
  name: "caldotcom", flag: "caldotcom", description: "Cal.com open-source scheduling",
  category: "productivity", platform: "cal.com", profileUrl: "https://cal.com/{input}",
  buildProfile: (input) => ({
    identity: { contact: { social: [{ platform: "cal.com", url: `https://cal.com/${input}`, username: input }], website: `https://cal.com/${input}` } },
    faq: [{ question: "How can I book a call?", answer: `Book a call at cal.com/${input}`, category: "availability" }],
    interests: { topics: ["open source scheduling", "cal.com"] },
  }),
});

export const giphy_Generator = createStaticGenerator({
  name: "giphy", flag: "giphy", description: "GIPHY GIF creator profile",
  category: "entertainment", platform: "giphy", profileUrl: "https://giphy.com/{input}",
  buildProfile: (input) => ({
    identity: { contact: { social: [{ platform: "giphy", url: `https://giphy.com/${input}`, username: input }] } },
    faq: [{ question: "Do you create GIFs?", answer: `Yes, I create and share GIFs on GIPHY!`, category: "entertainment" }],
    interests: { hobbies: ["gif making", "animation"], topics: ["gifs", "animation", "memes"] },
  }),
});

export const gravatar2Generator = createStaticGenerator({
  name: "gravatarprofile", flag: "gravatarprofile", flagArg: "<email-hash>", description: "Gravatar profile (hash-based)",
  category: "identity", platform: "gravatar", profileUrl: "https://gravatar.com/{input}",
  buildProfile: (input) => ({
    identity: { contact: { social: [{ platform: "gravatar", url: `https://gravatar.com/${input}`, username: input }] } },
    faq: [{ question: "Do you have a Gravatar?", answer: `Yes, my globally recognized avatar is on Gravatar.`, category: "identity" }],
  }),
});

export const aboutMeGenerator = createStaticGenerator({
  name: "aboutme", flag: "aboutme", description: "About.me personal page",
  category: "identity", platform: "aboutme", profileUrl: "https://about.me/{input}",
  buildProfile: (input) => ({
    identity: { contact: { social: [{ platform: "about.me", url: `https://about.me/${input}`, username: input }], website: `https://about.me/${input}` } },
    faq: [{ question: "Where can I learn about you?", answer: `Check my About.me page: about.me/${input}`, category: "identity" }],
  }),
});

export const humansTxtGenerator = createStaticGenerator({
  name: "humanstxt", flag: "humanstxt", flagArg: "<site-url>", description: "humans.txt team credit page",
  category: "identity", platform: "humanstxt", profileUrl: "https://humanstxt.org/",
  buildProfile: (input) => ({
    identity: { contact: { website: `${input}/humans.txt` } },
    faq: [{ question: "Do you have a humans.txt?", answer: `Yes, find our team credit at ${input}/humans.txt`, category: "identity" }],
    interests: { topics: ["humans.txt", "web standards", "team credits"] },
  }),
});

export const webringGenerator = createStaticGenerator({
  name: "webring", flag: "webring", flagArg: "<webring-url>", description: "Webring membership",
  category: "community", platform: "webring", profileUrl: "{input}",
  buildProfile: (input) => ({
    identity: { contact: { social: [{ platform: "webring", url: input }] } },
    faq: [{ question: "Are you part of a webring?", answer: `Yes! I'm part of a webring: ${input}`, category: "community" }],
    interests: { hobbies: ["indie web"], topics: ["webring", "indie web", "small web", "personal websites"] },
  }),
});

export const indiewebGenerator = createStaticGenerator({
  name: "indieweb", flag: "indieweb", flagArg: "<domain>", description: "IndieWeb personal domain profile",
  category: "community", platform: "indieweb", profileUrl: "https://indieweb.org/",
  buildProfile: (input) => ({
    identity: { contact: { website: input, social: [{ platform: "indieweb", url: input }] } },
    faq: [{ question: "Are you part of the IndieWeb?", answer: `Yes, I own my content on my own domain: ${input}`, category: "community" }],
    interests: { topics: ["indieweb", "personal website", "POSSE", "webmentions", "microformats"] },
  }),
});

export const mastodonVerifyGenerator = createStaticGenerator({
  name: "mastodonverify", flag: "mastodonverify", flagArg: "<user@instance>", description: "Mastodon verified identity link",
  category: "identity", platform: "mastodon-verify", profileUrl: "https://mastodon.social/@{input}",
  buildProfile: (input) => ({
    identity: { contact: { social: [{ platform: "mastodon", url: `https://mastodon.social/@${input}`, username: input }] } },
    faq: [{ question: "How can I verify your identity?", answer: `My verified Mastodon identity is ${input}`, category: "identity" }],
    interests: { topics: ["fediverse", "identity verification", "mastodon"] },
  }),
});

export const matrixVerifyGenerator = createStaticGenerator({
  name: "keyoxide", flag: "keyoxide", flagArg: "<fingerprint>", description: "Keyoxide decentralized identity proof",
  category: "identity", platform: "keyoxide", profileUrl: "https://keyoxide.org/{input}",
  buildProfile: (input) => ({
    identity: { contact: { social: [{ platform: "keyoxide", url: `https://keyoxide.org/${input}`, username: input }] } },
    faq: [{ question: "How can I verify your online identity?", answer: `My cryptographic identity proofs are on Keyoxide: keyoxide.org/${input}`, category: "identity" }],
    interests: { topics: ["keyoxide", "pgp", "identity verification", "cryptographic proofs"] },
  }),
});
