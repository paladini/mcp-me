/**
 * Generator Factory — create generators with minimal boilerplate.
 *
 * Instead of writing 60+ lines per generator, use createGenerator() to define
 * one in ~10 lines. The factory handles fetch, error handling, logging, and
 * profile assembly automatically.
 */
import type { GeneratorSource, GeneratorCategory, PartialProfile } from "./types.js";

export interface SimpleGeneratorConfig {
  name: string;
  flag: string;
  flagArg?: string;
  description: string;
  category: GeneratorCategory;
  platform: string;
  profileUrl: string | ((input: string) => string);
  apiUrl: string | ((input: string) => string);
  apiMethod?: "GET" | "POST";
  apiHeaders?: Record<string, string>;
  apiBody?: (input: string) => string;
  extract: (data: unknown, input: string) => {
    displayName?: string;
    bio?: string;
    location?: string;
    website?: string;
    stats?: string;
    statsCategory?: string;
    topics?: string[];
    hobbies?: string[];
    skills?: { name: string; category: string }[];
    projects?: { name: string; description: string; url?: string }[];
  };
}

export interface RssGeneratorConfig {
  name: string;
  flag: string;
  flagArg?: string;
  description: string;
  category: GeneratorCategory;
  platform: string;
  profileUrl: string | ((input: string) => string);
  rssUrl: string | ((input: string) => string);
  extract: (xml: string, input: string) => {
    displayName?: string;
    bio?: string;
    stats?: string;
    statsCategory?: string;
    topics?: string[];
    hobbies?: string[];
    items?: { title: string; url?: string }[];
  };
}

export interface StaticGeneratorConfig {
  name: string;
  flag: string;
  flagArg?: string;
  description: string;
  category: GeneratorCategory;
  platform: string;
  profileUrl: string | ((input: string) => string);
  buildProfile: (input: string) => PartialProfile;
}

const DEFAULT_HEADERS: Record<string, string> = {
  Accept: "application/json",
  "User-Agent": "mcp-me-generator",
};

function resolveUrl(template: string | ((input: string) => string), input: string): string {
  return typeof template === "function" ? template(input) : template.replace("{input}", input);
}

/**
 * Create a generator that fetches a JSON API endpoint.
 */
export function createGenerator(config: SimpleGeneratorConfig): GeneratorSource {
  const label = config.name.charAt(0).toUpperCase() + config.name.slice(1);
  return {
    name: config.name,
    flag: config.flag,
    flagArg: config.flagArg ?? "<username>",
    description: config.description,
    category: config.category,
    async generate(opts): Promise<PartialProfile> {
      const input = String(opts.username ?? opts.handle ?? opts.userId ?? opts.email ?? "");
      if (!input) throw new Error(`${label} input is required`);

      console.log(`  [${label}] Fetching data for ${input}...`);
      const url = resolveUrl(config.apiUrl, input);
      const resp = await fetch(url, {
        method: config.apiMethod ?? "GET",
        headers: { ...DEFAULT_HEADERS, ...(config.apiHeaders ?? {}) },
        ...(config.apiBody ? { body: config.apiBody(input) } : {}),
      });
      if (!resp.ok) throw new Error(`${label} API error: ${resp.status} ${resp.statusText}`);
      const data = await resp.json();
      const ex = config.extract(data, input);

      console.log(`  [${label}] Found: ${ex.displayName ?? input}`);

      const profileUrlResolved = resolveUrl(config.profileUrl, input);
      const profile: PartialProfile = {
        identity: {
          ...(ex.displayName ? { name: ex.displayName } : {}),
          ...(ex.bio ? { bio: ex.bio } : {}),
          ...(ex.location ? { location: { city: ex.location } } : {}),
          contact: {
            social: [{ platform: config.platform, url: profileUrlResolved, username: input }],
            ...(ex.website ? { website: ex.website } : {}),
          },
        },
      };

      if (ex.stats) {
        profile.faq = [{
          question: `Are you on ${label}?`,
          answer: ex.stats,
          category: ex.statsCategory ?? config.category,
        }];
      }

      if (ex.topics?.length || ex.hobbies?.length) {
        profile.interests = {
          ...(ex.topics?.length ? { topics: ex.topics } : {}),
          ...(ex.hobbies?.length ? { hobbies: ex.hobbies } : {}),
        };
      }

      if (ex.skills?.length) {
        profile.skills = {
          technical: ex.skills.map((s) => ({ name: s.name, category: s.category })),
        };
      }

      if (ex.projects?.length) {
        profile.projects = ex.projects.map((p) => ({
          name: p.name,
          description: p.description,
          ...(p.url ? { url: p.url } : {}),
          category: config.category,
        }));
      }

      return profile;
    },
  };
}

/**
 * Create a generator that fetches an RSS/XML feed.
 */
export function createRssGenerator(config: RssGeneratorConfig): GeneratorSource {
  const label = config.name.charAt(0).toUpperCase() + config.name.slice(1);
  return {
    name: config.name,
    flag: config.flag,
    flagArg: config.flagArg ?? "<username>",
    description: config.description,
    category: config.category,
    async generate(opts): Promise<PartialProfile> {
      const input = String(opts.username ?? opts.handle ?? opts.userId ?? "");
      if (!input) throw new Error(`${label} input is required`);

      console.log(`  [${label}] Fetching RSS for ${input}...`);
      const url = resolveUrl(config.rssUrl, input);
      const resp = await fetch(url, { headers: { "User-Agent": "mcp-me-generator" } });
      if (!resp.ok) throw new Error(`${label} RSS error: ${resp.status} ${resp.statusText}`);
      const xml = await resp.text();
      const ex = config.extract(xml, input);

      console.log(`  [${label}] Found: ${ex.displayName ?? input}`);

      const profileUrlResolved = resolveUrl(config.profileUrl, input);
      const profile: PartialProfile = {
        identity: {
          ...(ex.displayName ? { name: ex.displayName } : {}),
          ...(ex.bio ? { bio: ex.bio } : {}),
          contact: {
            social: [{ platform: config.platform, url: profileUrlResolved, username: input }],
          },
        },
      };

      if (ex.stats) {
        profile.faq = [{
          question: `Are you on ${label}?`,
          answer: ex.stats,
          category: ex.statsCategory ?? config.category,
        }];
      }

      if (ex.topics?.length || ex.hobbies?.length) {
        profile.interests = {
          ...(ex.topics?.length ? { topics: ex.topics } : {}),
          ...(ex.hobbies?.length ? { hobbies: ex.hobbies } : {}),
        };
      }

      if (ex.items?.length) {
        profile.projects = ex.items.map((item) => ({
          name: item.title,
          description: `Published on ${label}`,
          ...(item.url ? { url: item.url } : {}),
          category: config.category,
        }));
      }

      return profile;
    },
  };
}

/**
 * Create a generator with fully custom profile building (no API call).
 * Useful for generators based on user input alone (zodiac, personality, etc.)
 */
export function createStaticGenerator(config: StaticGeneratorConfig): GeneratorSource {
  const label = config.name.charAt(0).toUpperCase() + config.name.slice(1);
  return {
    name: config.name,
    flag: config.flag,
    flagArg: config.flagArg ?? "<input>",
    description: config.description,
    category: config.category,
    async generate(opts): Promise<PartialProfile> {
      const input = String(opts.username ?? opts.handle ?? opts.userId ?? opts.email ?? "");
      if (!input) throw new Error(`${label} input is required`);
      console.log(`  [${label}] Building profile for ${input}...`);
      return config.buildProfile(input);
    },
  };
}

/** Helper to extract text between XML tags from RSS feeds. */
export function xmlText(xml: string, tag: string): string {
  const match = xml.match(new RegExp(`<${tag}[^>]*>([^<]*)</${tag}>`));
  return match?.[1]?.trim() ?? "";
}

/** Helper to extract all items' titles from an RSS feed. */
export function rssItems(xml: string, max = 10): { title: string; url: string }[] {
  const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)].slice(0, max);
  return items.map((m) => ({
    title: xmlText(m[1], "title"),
    url: xmlText(m[1], "link"),
  }));
}
