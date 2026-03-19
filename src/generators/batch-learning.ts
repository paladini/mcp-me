/**
 * Learning, Education & Languages Generators (20)
 */
import { createGenerator, createStaticGenerator } from "./factory.js";

export const duolingoGenerator = createGenerator({
  name: "duolingo", flag: "duolingo", description: "Duolingo language learning streak, XP",
  category: "learning", platform: "duolingo", profileUrl: "https://www.duolingo.com/profile/{input}",
  apiUrl: "https://www.duolingo.com/2017-06-30/users?username={input}&fields=streak,totalXp,courses,name",
  extract: (data: unknown) => {
    const d = data as { users?: { name?: string; streak?: number; totalXp?: number; courses?: { title: string }[] }[] };
    const u = d.users?.[0];
    const langs = (u?.courses ?? []).map(c => c.title).join(", ");
    return { displayName: u?.name, stats: `I have a ${u?.streak ?? 0}-day streak and ${(u?.totalXp ?? 0).toLocaleString()} XP on Duolingo. Learning: ${langs || "various languages"}.`, hobbies: ["language learning"], topics: ["duolingo", "language learning", "polyglot"] };
  },
});

export const courseraGenerator = createStaticGenerator({
  name: "coursera", flag: "coursera", flagArg: "<profile-slug>", description: "Coursera courses and certificates",
  category: "learning", platform: "coursera", profileUrl: "https://www.coursera.org/user/{input}",
  buildProfile: (input) => ({
    identity: { contact: { social: [{ platform: "coursera", url: `https://www.coursera.org/user/${input}`, username: input }] } },
    faq: [{ question: "Do you take online courses?", answer: `Yes, check my Coursera certificates and courses.`, category: "learning" }],
    interests: { hobbies: ["online learning"], topics: ["coursera", "MOOCs", "certificates", "lifelong learning"] },
  }),
});

export const edxGenerator = createStaticGenerator({
  name: "edx", flag: "edx", flagArg: "<username>", description: "edX courses and certificates",
  category: "learning", platform: "edx", profileUrl: "https://profile.edx.org/u/{input}",
  buildProfile: (input) => ({
    identity: { contact: { social: [{ platform: "edx", url: `https://profile.edx.org/u/${input}`, username: input }] } },
    faq: [{ question: "Do you learn on edX?", answer: `Yes, I take courses on edX from top universities.`, category: "learning" }],
    interests: { hobbies: ["online education"], topics: ["edx", "university courses", "professional certificates"] },
  }),
});

export const udemyGenerator = createStaticGenerator({
  name: "udemy", flag: "udemy", flagArg: "<profile-slug>", description: "Udemy courses taught or taken",
  category: "learning", platform: "udemy", profileUrl: "https://www.udemy.com/user/{input}",
  buildProfile: (input) => ({
    identity: { contact: { social: [{ platform: "udemy", url: `https://www.udemy.com/user/${input}`, username: input }] } },
    faq: [{ question: "Do you teach or learn on Udemy?", answer: `Yes, find my Udemy profile at udemy.com/user/${input}`, category: "learning" }],
    interests: { topics: ["online courses", "teaching", "skill development"] },
  }),
});

export const skillshareGenerator = createStaticGenerator({
  name: "skillshare", flag: "skillshare", flagArg: "<profile-slug>", description: "Skillshare classes and projects",
  category: "learning", platform: "skillshare", profileUrl: "https://www.skillshare.com/en/profile/{input}",
  buildProfile: (input) => ({
    identity: { contact: { social: [{ platform: "skillshare", url: `https://www.skillshare.com/en/profile/${input}`, username: input }] } },
    faq: [{ question: "Do you use Skillshare?", answer: `Yes, I learn and share creative skills on Skillshare.`, category: "learning" }],
    interests: { hobbies: ["creative skills"], topics: ["skillshare", "creative learning", "illustration", "design"] },
  }),
});

export const codecademyGenerator = createStaticGenerator({
  name: "codecademy", flag: "codecademy", description: "Codecademy coding courses profile",
  category: "learning", platform: "codecademy", profileUrl: "https://www.codecademy.com/profiles/{input}",
  buildProfile: (input) => ({
    identity: { contact: { social: [{ platform: "codecademy", url: `https://www.codecademy.com/profiles/${input}`, username: input }] } },
    faq: [{ question: "Do you learn coding online?", answer: `Yes, I learn programming on Codecademy.`, category: "learning" }],
    interests: { topics: ["coding education", "programming courses", "learn to code"] },
  }),
});

export const freecodecampGenerator = createStaticGenerator({
  name: "freecodecamp", flag: "freecodecamp", description: "freeCodeCamp certifications",
  category: "learning", platform: "freecodecamp", profileUrl: "https://www.freecodecamp.org/{input}",
  buildProfile: (input) => ({
    identity: { contact: { social: [{ platform: "freecodecamp", url: `https://www.freecodecamp.org/${input}`, username: input }] } },
    faq: [{ question: "Do you learn on freeCodeCamp?", answer: `Yes, I have certifications from freeCodeCamp.`, category: "learning" }],
    interests: { topics: ["free coding education", "web development", "javascript"] },
  }),
});

export const khanGenerator = createStaticGenerator({
  name: "khanacademy", flag: "khanacademy", flagArg: "<kaid>", description: "Khan Academy learning profile",
  category: "learning", platform: "khanacademy", profileUrl: "https://www.khanacademy.org/profile/{input}",
  buildProfile: (input) => ({
    identity: { contact: { social: [{ platform: "khanacademy", url: `https://www.khanacademy.org/profile/${input}`, username: input }] } },
    faq: [{ question: "Do you learn on Khan Academy?", answer: `Yes, I learn on Khan Academy!`, category: "learning" }],
    interests: { hobbies: ["self-education"], topics: ["khan academy", "math", "science", "free education"] },
  }),
});

export const brilliantGenerator = createStaticGenerator({
  name: "brilliant", flag: "brilliant", description: "Brilliant.org math/science puzzles",
  category: "learning", platform: "brilliant", profileUrl: "https://brilliant.org/profile/{input}",
  buildProfile: (input) => ({
    identity: { contact: { social: [{ platform: "brilliant", url: `https://brilliant.org/profile/${input}`, username: input }] } },
    faq: [{ question: "Do you solve puzzles on Brilliant?", answer: `Yes, I solve math and science problems on Brilliant.`, category: "learning" }],
    interests: { hobbies: ["problem solving", "math puzzles"], topics: ["mathematics", "physics", "computer science", "logic puzzles"] },
  }),
});

export const pluralsightGenerator = createStaticGenerator({
  name: "pluralsight", flag: "pluralsight", flagArg: "<profile-id>", description: "Pluralsight tech skills profile",
  category: "learning", platform: "pluralsight", profileUrl: "https://app.pluralsight.com/profile/{input}",
  buildProfile: (input) => ({
    identity: { contact: { social: [{ platform: "pluralsight", url: `https://app.pluralsight.com/profile/${input}`, username: input }] } },
    faq: [{ question: "Do you use Pluralsight?", answer: `Yes, I develop tech skills on Pluralsight.`, category: "learning" }],
    interests: { topics: ["tech skills", "professional development", "cloud", "software engineering"] },
  }),
});

export const memriseGenerator = createStaticGenerator({
  name: "memrise", flag: "memrise", description: "Memrise language learning profile",
  category: "learning", platform: "memrise", profileUrl: "https://www.memrise.com/user/{input}",
  buildProfile: (input) => ({
    identity: { contact: { social: [{ platform: "memrise", url: `https://www.memrise.com/user/${input}`, username: input }] } },
    faq: [{ question: "Do you learn languages?", answer: `Yes, I learn vocabulary on Memrise.`, category: "learning" }],
    interests: { hobbies: ["language learning", "vocabulary building"], topics: ["memrise", "spaced repetition", "language learning"] },
  }),
});

export const ankiwebGenerator = createStaticGenerator({
  name: "ankiweb", flag: "ankiweb", description: "AnkiWeb spaced repetition shared decks",
  category: "learning", platform: "ankiweb", profileUrl: "https://ankiweb.net/shared/by/{input}",
  buildProfile: (input) => ({
    identity: { contact: { social: [{ platform: "ankiweb", url: `https://ankiweb.net/shared/by/${input}`, username: input }] } },
    faq: [{ question: "Do you use Anki?", answer: `Yes, I use spaced repetition with Anki for learning.`, category: "learning" }],
    interests: { hobbies: ["spaced repetition", "flashcards"], topics: ["anki", "memory", "spaced repetition", "efficient learning"] },
  }),
});

export const italkiGenerator = createStaticGenerator({
  name: "italki", flag: "italki", flagArg: "<user-id>", description: "italki language teacher/learner profile",
  category: "learning", platform: "italki", profileUrl: "https://www.italki.com/user/{input}",
  buildProfile: (input) => ({
    identity: { contact: { social: [{ platform: "italki", url: `https://www.italki.com/user/${input}`, username: input }] } },
    faq: [{ question: "Do you teach/learn languages on italki?", answer: `Yes, I'm active on italki for language exchange.`, category: "learning" }],
    interests: { hobbies: ["language exchange", "tutoring"], topics: ["italki", "language teaching", "conversation practice"] },
  }),
});

export const lingqGenerator = createStaticGenerator({
  name: "lingq", flag: "lingq", description: "LingQ reading-based language learning",
  category: "learning", platform: "lingq", profileUrl: "https://www.lingq.com/en/accounts/{input}/",
  buildProfile: (input) => ({
    identity: { contact: { social: [{ platform: "lingq", url: `https://www.lingq.com/en/accounts/${input}/`, username: input }] } },
    faq: [{ question: "How do you learn languages?", answer: `I use LingQ for immersive, reading-based language learning.`, category: "learning" }],
    interests: { hobbies: ["extensive reading", "language immersion"], topics: ["lingq", "comprehensible input", "reading"] },
  }),
});

export const treehouseGenerator = createStaticGenerator({
  name: "treehouse", flag: "treehouse", description: "Treehouse tech learning profile",
  category: "learning", platform: "treehouse", profileUrl: "https://teamtreehouse.com/{input}",
  buildProfile: (input) => ({
    identity: { contact: { social: [{ platform: "treehouse", url: `https://teamtreehouse.com/${input}`, username: input }] } },
    faq: [{ question: "Do you learn on Treehouse?", answer: `Yes, I'm learning tech skills on Treehouse.`, category: "learning" }],
    interests: { topics: ["web development", "mobile development", "tech education"] },
  }),
});

export const researchgateGenerator = createGenerator({
  name: "researchgate", flag: "researchgate", flagArg: "<profile-slug>", description: "ResearchGate academic profile",
  category: "science", platform: "researchgate", profileUrl: "https://www.researchgate.net/profile/{input}",
  apiUrl: "https://www.researchgate.net/profile/{input}",
  apiHeaders: { Accept: "text/html" },
  extract: (_data: unknown, _input) => ({
    stats: `I have an academic profile on ResearchGate.`,
    topics: ["academic research", "publications", "science"],
  }),
});

export const zenodoGenerator = createGenerator({
  name: "zenodo", flag: "zenodo", flagArg: "<orcid-or-name>", description: "Zenodo open research deposits",
  category: "science", platform: "zenodo", profileUrl: "https://zenodo.org/search?q=owners:{input}",
  apiUrl: "https://zenodo.org/api/records?q=owners:{input}&size=10",
  extract: (data: unknown) => {
    const d = data as { hits?: { total?: number; hits?: { metadata?: { title: string; doi?: string } }[] } };
    const total = d.hits?.total ?? 0;
    const items = (d.hits?.hits ?? []).slice(0, 5);
    return { stats: `I have ${total} open research deposits on Zenodo.`,
      projects: items.map(h => ({ name: h.metadata?.title ?? "Untitled", description: "Open research deposit", url: h.metadata?.doi ? `https://doi.org/${h.metadata.doi}` : undefined })),
      topics: ["open science", "research data", "open access"] };
  },
});

export const arxivGenerator = createStaticGenerator({
  name: "arxiv", flag: "arxiv", flagArg: "<author-query>", description: "arXiv preprints search",
  category: "science", platform: "arxiv", profileUrl: (i) => `https://arxiv.org/search/?query=${encodeURIComponent(i)}&searchtype=author`,
  buildProfile: (input) => ({
    identity: { contact: { social: [{ platform: "arxiv", url: `https://arxiv.org/search/?query=${encodeURIComponent(input)}&searchtype=author`, username: input }] } },
    faq: [{ question: "Do you publish preprints?", answer: `Yes, search for my papers on arXiv.`, category: "science" }],
    interests: { topics: ["preprints", "academic research", "open access", "physics", "computer science"] },
  }),
});

export const googleScholarGenerator = createStaticGenerator({
  name: "googlescholar", flag: "googlescholar", flagArg: "<scholar-id>", description: "Google Scholar citations profile",
  category: "science", platform: "googlescholar", profileUrl: "https://scholar.google.com/citations?user={input}",
  buildProfile: (input) => ({
    identity: { contact: { social: [{ platform: "google-scholar", url: `https://scholar.google.com/citations?user=${input}`, username: input }] } },
    faq: [{ question: "Do you publish academic papers?", answer: `Yes, see my Google Scholar profile for publications and citations.`, category: "science" }],
    interests: { topics: ["academic research", "citations", "publications", "h-index"] },
  }),
});
