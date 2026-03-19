/**
 * Weird, Fun & Unconventional Generators (20)
 */
import { createStaticGenerator } from "./factory.js";

export const zodiacGenerator = createStaticGenerator({
  name: "zodiac", flag: "zodiac", flagArg: "<sign>", description: "Zodiac/astrology sign profile",
  category: "entertainment", platform: "astrology", profileUrl: "https://www.astrology.com/",
  buildProfile: (input) => {
    const sign = input.toLowerCase();
    const traits: Record<string, string[]> = {
      aries: ["adventurous", "energetic", "courageous"], taurus: ["reliable", "patient", "determined"],
      gemini: ["adaptable", "curious", "communicative"], cancer: ["intuitive", "emotional", "protective"],
      leo: ["creative", "passionate", "generous"], virgo: ["analytical", "practical", "diligent"],
      libra: ["diplomatic", "gracious", "fair-minded"], scorpio: ["resourceful", "brave", "passionate"],
      sagittarius: ["generous", "idealistic", "humorous"], capricorn: ["responsible", "disciplined", "self-controlled"],
      aquarius: ["progressive", "independent", "humanitarian"], pisces: ["compassionate", "artistic", "intuitive"],
    };
    return {
      faq: [{ question: "What's your zodiac sign?", answer: `I'm a ${sign.charAt(0).toUpperCase() + sign.slice(1)}! Traits: ${(traits[sign] ?? ["mysterious"]).join(", ")}.`, category: "personality" }],
      interests: { topics: ["astrology", sign] },
    };
  },
});

export const mbtiGenerator = createStaticGenerator({
  name: "mbti", flag: "mbti", flagArg: "<type>", description: "MBTI personality type (e.g. INTJ, ENFP)",
  category: "identity", platform: "16personalities", profileUrl: "https://www.16personalities.com/",
  buildProfile: (input) => ({
    faq: [{ question: "What's your MBTI type?", answer: `I'm an ${input.toUpperCase()} according to the Myers-Briggs Type Indicator.`, category: "personality" }],
    interests: { topics: ["mbti", "personality types", "psychology", input.toLowerCase()] },
  }),
});

export const enneagramGenerator = createStaticGenerator({
  name: "enneagram", flag: "enneagram", flagArg: "<type-number>", description: "Enneagram personality type",
  category: "identity", platform: "enneagram", profileUrl: "https://www.enneagraminstitute.com/",
  buildProfile: (input) => {
    const names: Record<string, string> = { "1": "Reformer", "2": "Helper", "3": "Achiever", "4": "Individualist", "5": "Investigator", "6": "Loyalist", "7": "Enthusiast", "8": "Challenger", "9": "Peacemaker" };
    return {
      faq: [{ question: "What's your Enneagram type?", answer: `I'm a Type ${input} — The ${names[input] ?? "Unknown"}`, category: "personality" }],
      interests: { topics: ["enneagram", "personality", "self-development"] },
    };
  },
});

export const hogwartsGenerator = createStaticGenerator({
  name: "hogwarts", flag: "hogwarts", flagArg: "<house>", description: "Hogwarts house sorting",
  category: "entertainment", platform: "wizardingworld", profileUrl: "https://www.wizardingworld.com/",
  buildProfile: (input) => ({
    faq: [{ question: "What Hogwarts house are you in?", answer: `I'm a proud ${input.charAt(0).toUpperCase() + input.slice(1).toLowerCase()}! 🧙`, category: "fun" }],
    interests: { hobbies: ["harry potter"], topics: ["hogwarts", input.toLowerCase(), "wizarding world"] },
  }),
});

export const alignmentGenerator = createStaticGenerator({
  name: "alignment", flag: "alignment", flagArg: "<alignment>", description: "D&D alignment (e.g. chaotic-good)",
  category: "entertainment", platform: "dnd", profileUrl: "https://www.dndbeyond.com/",
  buildProfile: (input) => ({
    faq: [{ question: "What's your D&D alignment?", answer: `I'm ${input.replace("-", " ").replace(/\b\w/g, c => c.toUpperCase())}. Yes, I've thought about this.`, category: "fun" }],
    interests: { topics: ["d&d", "tabletop rpg", "alignment chart"] },
  }),
});

export const colorPaletteGenerator = createStaticGenerator({
  name: "colorpalette", flag: "colorpalette", flagArg: "<hex-colors>", description: "Favorite color palette",
  category: "creative", platform: "coolors", profileUrl: "https://coolors.co/",
  buildProfile: (input) => ({
    faq: [{ question: "What are your favorite colors?", answer: `My color palette: ${input}`, category: "creative" }],
    interests: { topics: ["color theory", "design", "aesthetics"] },
  }),
});

export const timezoneGenerator = createStaticGenerator({
  name: "timezone", flag: "timezone", flagArg: "<tz-name>", description: "Your timezone and work hours",
  category: "identity", platform: "worldtimebuddy", profileUrl: "https://www.worldtimebuddy.com/",
  buildProfile: (input) => ({
    faq: [{ question: "What timezone are you in?", answer: `I'm in ${input}. Best time to reach me is during business hours in this timezone.`, category: "availability" }],
    interests: { topics: ["remote work", "async communication"] },
  }),
});

export const languagesSpokenGenerator = createStaticGenerator({
  name: "languagesspoken", flag: "languagesspoken", flagArg: "<lang1,lang2,...>", description: "Human languages you speak",
  category: "identity", platform: "languages", profileUrl: "https://en.wikipedia.org/wiki/Language",
  buildProfile: (input) => {
    const langs = input.split(",").map(l => l.trim());
    return {
      faq: [{ question: "What languages do you speak?", answer: `I speak ${langs.join(", ")} (${langs.length} language${langs.length > 1 ? "s" : ""}).`, category: "identity" }],
      interests: { topics: ["languages", "polyglot", ...langs.map(l => l.toLowerCase())] },
    };
  },
});

export const dietGenerator = createStaticGenerator({
  name: "diet", flag: "diet", flagArg: "<diet-type>", description: "Dietary preference (vegan, keto, etc.)",
  category: "food", platform: "diet", profileUrl: "https://en.wikipedia.org/wiki/Diet_(nutrition)",
  buildProfile: (input) => ({
    faq: [{ question: "Do you have dietary preferences?", answer: `Yes, I follow a ${input} diet.`, category: "food" }],
    interests: { hobbies: ["cooking", input.toLowerCase()], topics: [input.toLowerCase(), "nutrition", "healthy eating"] },
  }),
});

export const sleepGenerator = createStaticGenerator({
  name: "sleepschedule", flag: "sleepschedule", flagArg: "<chronotype>", description: "Sleep chronotype (night-owl, early-bird)",
  category: "identity", platform: "sleep", profileUrl: "https://en.wikipedia.org/wiki/Chronotype",
  buildProfile: (input) => ({
    faq: [{ question: "Are you a morning person or night owl?", answer: `I'm a ${input}. My most productive hours depend on this.`, category: "lifestyle" }],
    interests: { topics: ["sleep science", "chronotype", "productivity"] },
  }),
});

export const coffeeTeaGenerator = createStaticGenerator({
  name: "coffeetea", flag: "coffeetea", flagArg: "<preference>", description: "Coffee vs Tea preference",
  category: "food", platform: "beverage", profileUrl: "https://en.wikipedia.org/wiki/Coffee",
  buildProfile: (input) => ({
    faq: [{ question: "Coffee or tea?", answer: `Definitely ${input}!`, category: "fun" }],
    interests: { hobbies: [input.toLowerCase()], topics: [input.toLowerCase()] },
  }),
});

export const ideGenerator = createStaticGenerator({
  name: "ide", flag: "ide", flagArg: "<editor-name>", description: "Favorite IDE/editor (vscode, vim, etc.)",
  category: "code", platform: "editor", profileUrl: "https://code.visualstudio.com/",
  buildProfile: (input) => ({
    faq: [{ question: "What IDE do you use?", answer: `My editor of choice is ${input}. Yes, I have strong opinions about this.`, category: "code" }],
    interests: { topics: [input.toLowerCase(), "developer tools", "editor wars"] },
    skills: { tools: [{ name: input, category: "editor" }] },
  }),
});

export const osGenerator = createStaticGenerator({
  name: "os", flag: "os", flagArg: "<os-name>", description: "Preferred operating system",
  category: "code", platform: "os", profileUrl: "https://en.wikipedia.org/wiki/Operating_system",
  buildProfile: (input) => ({
    faq: [{ question: "What OS do you use?", answer: `I use ${input} as my daily driver.`, category: "code" }],
    interests: { topics: [input.toLowerCase(), "operating systems"] },
    skills: { tools: [{ name: input, category: "operating-system" }] },
  }),
});

export const keyboardGenerator = createStaticGenerator({
  name: "keyboard", flag: "keyboard", flagArg: "<keyboard-model>", description: "Mechanical keyboard setup",
  category: "maker", platform: "keyboard", profileUrl: "https://www.reddit.com/r/MechanicalKeyboards/",
  buildProfile: (input) => ({
    faq: [{ question: "What keyboard do you use?", answer: `I type on a ${input}. Mechanical keyboard enthusiast!`, category: "gear" }],
    interests: { hobbies: ["mechanical keyboards"], topics: ["mechanical keyboards", "switches", "keycaps", "ergonomics"] },
  }),
});

export const deskSetupGenerator = createStaticGenerator({
  name: "desksetup", flag: "desksetup", flagArg: "<setup-description>", description: "Desk/workstation setup",
  category: "productivity", platform: "desksetup", profileUrl: "https://www.reddit.com/r/battlestations/",
  buildProfile: (input) => ({
    faq: [{ question: "What's your desk setup?", answer: `My setup: ${input}`, category: "gear" }],
    interests: { hobbies: ["desk setup", "workstation optimization"], topics: ["battlestation", "ergonomics", "productivity setup"] },
  }),
});

export const dotfilesGenerator = createStaticGenerator({
  name: "dotfiles", flag: "dotfiles", flagArg: "<github-user>", description: "Dotfiles/dev environment config",
  category: "code", platform: "github", profileUrl: "https://github.com/{input}/dotfiles",
  buildProfile: (input) => ({
    identity: { contact: { social: [{ platform: "github-dotfiles", url: `https://github.com/${input}/dotfiles`, username: input }] } },
    faq: [{ question: "Where are your dotfiles?", answer: `My dev environment config is at github.com/${input}/dotfiles`, category: "code" }],
    interests: { topics: ["dotfiles", "dev environment", "terminal", "shell configuration"] },
  }),
});

export const nowPageGenerator = createStaticGenerator({
  name: "nowpage", flag: "nowpage", flagArg: "<url>", description: "/now page (nownownow.com inspired)",
  category: "identity", platform: "nownownow", profileUrl: "https://nownownow.com/",
  buildProfile: (input) => ({
    identity: { contact: { website: input, social: [{ platform: "now-page", url: input, username: input }] } },
    faq: [{ question: "What are you doing now?", answer: `Check my /now page: ${input}`, category: "identity" }],
    interests: { topics: ["now page", "nownownow", "transparency"] },
  }),
});

export const usesPageGenerator = createStaticGenerator({
  name: "usespage", flag: "usespage", flagArg: "<url>", description: "/uses page (uses.tech inspired)",
  category: "identity", platform: "usestech", profileUrl: "https://uses.tech/",
  buildProfile: (input) => ({
    identity: { contact: { website: input, social: [{ platform: "uses-page", url: input, username: input }] } },
    faq: [{ question: "What tools do you use?", answer: `Check my /uses page: ${input}`, category: "identity" }],
    interests: { topics: ["uses page", "tools", "developer setup"] },
  }),
});

export const personalSiteGenerator = createStaticGenerator({
  name: "personalsite", flag: "personalsite", flagArg: "<url>", description: "Personal website/blog URL",
  category: "identity", platform: "personal-site", profileUrl: "{input}",
  buildProfile: (input) => ({
    identity: { contact: { website: input, social: [{ platform: "website", url: input }] } },
    faq: [{ question: "Do you have a website?", answer: `Yes! Visit my site: ${input}`, category: "identity" }],
  }),
});

export const pronounsGenerator = createStaticGenerator({
  name: "pronouns", flag: "pronouns", flagArg: "<pronouns>", description: "Preferred pronouns (he/him, she/her, they/them)",
  category: "identity", platform: "pronouns", profileUrl: "https://pronouns.page/",
  buildProfile: (input) => ({
    faq: [{ question: "What are your pronouns?", answer: `My pronouns are ${input}.`, category: "identity" }],
  }),
});
