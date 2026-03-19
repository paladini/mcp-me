# Creating Generators for mcp-me

Generators are data sources that auto-populate profile YAML files from public APIs. They run **once** during `mcp-me generate` to create a snapshot of your online presence.

> **Generators vs Plugins:** Generators run once at generation time and produce static YAML. Plugins run continuously during `mcp-me serve` and provide live data to AI assistants. See the [architecture overview](#generators-vs-plugins) below.

## The Generator Interface

Every generator implements the `GeneratorSource` interface:

```ts
import type { GeneratorSource, PartialProfile } from "mcp-me";

export const myGenerator: GeneratorSource = {
  name: "myservice",

  async generate(config: Record<string, unknown>): Promise<PartialProfile> {
    const username = config.username as string;

    // Fetch data from public API
    const data = await fetch(`https://api.myservice.com/users/${username}`);

    // Return partial profile data
    return {
      identity: { name: "...", bio: "..." },
      skills: { technical: [{ name: "...", category: "..." }] },
      projects: [{ name: "...", description: "..." }],
      faq: [{ question: "...", answer: "..." }],
    };
  },
};
```

## PartialProfile Structure

Generators return a `PartialProfile` — a subset of profile data that gets merged with other sources:

```ts
interface PartialProfile {
  identity?: {
    name?: string;
    bio?: string;
    location?: { city?: string; country?: string };
    contact?: {
      email?: string;
      website?: string;
      social?: { platform: string; url: string; username?: string }[];
    };
  };
  skills?: {
    languages?: { name: string; category?: string; proficiency?: string; description?: string }[];
    technical?: { name: string; category?: string; proficiency?: string; description?: string }[];
    tools?: { name: string; category?: string }[];
  };
  projects?: {
    name: string;
    description: string;
    url?: string;
    repo_url?: string;
    status?: string;
    technologies?: string[];
    start_date?: string;
    stars?: number;
    category?: string;
  }[];
  career?: {
    experience?: { title: string; company: string; current?: boolean; start_date?: string; description?: string }[];
  };
  interests?: {
    hobbies?: string[];
    topics?: string[];
  };
  faq?: { question: string; answer: string; category?: string }[];
  plugins?: Record<string, Record<string, unknown>>;
}
```

Only include the fields your source can provide. The merger handles deduplication and combining data from multiple generators.

## Step-by-Step: Adding a Built-in Generator

### Option A: Use the scaffolding command (recommended)

```bash
mcp-me create generator myservice --category community
```

This creates `src/generators/myservice.ts` with a ready-to-edit template. Then:

1. Edit the file — implement your API calls
2. Register in `src/generators/index.ts` (one import + one array entry)
3. Run `npm test` — the generator harness validates it automatically

### Option B: Use the generator factory (for simple APIs)

The factory lets you define a generator in ~10 lines:

```ts
// src/generators/myservice.ts
import { createGenerator } from "./factory.js";

export const myserviceGenerator = createGenerator({
  name: "myservice",
  flag: "myservice",
  description: "MyService profile, posts, stats",
  category: "community",
  platform: "myservice",
  profileUrl: "https://myservice.com/{input}",
  apiUrl: "https://api.myservice.com/users/{input}",
  extract: (data: unknown) => {
    const d = data as { name?: string; bio?: string; followers?: number };
    return {
      displayName: d.name,
      bio: d.bio,
      stats: `I have ${d.followers ?? 0} followers on MyService.`,
      topics: ["myservice"],
    };
  },
});
```

Three factory functions are available:

- **`createGenerator()`** — fetches a JSON API endpoint
- **`createRssGenerator()`** — fetches an RSS/XML feed
- **`createStaticGenerator()`** — no API call, builds profile from user input (e.g. zodiac, MBTI)

### Option C: Write a full custom generator

```ts
// src/generators/myservice.ts
import type { GeneratorSource, PartialProfile } from "./types.js";

export const myserviceGenerator: GeneratorSource = {
  name: "myservice",
  flag: "myservice",
  flagArg: "<username>",
  description: "MyService profile and stats",
  category: "community",

  async generate(config): Promise<PartialProfile> {
    const username = config.username as string;
    if (!username) throw new Error("MyService username is required");

    console.log(`  [MyService] Fetching profile for ${username}...`);
    const response = await fetch(`https://api.myservice.com/users/${username}`, {
      headers: { Accept: "application/json", "User-Agent": "mcp-me-generator" },
    });
    if (!response.ok) throw new Error(`MyService API error: ${response.status}`);
    const user = (await response.json()) as { displayName: string; bio: string };

    return {
      identity: {
        name: user.displayName,
        bio: user.bio,
        contact: {
          social: [{ platform: "myservice", url: `https://myservice.com/${username}`, username }],
        },
      },
    };
  },
};
```

### Register the generator

Add **two lines** to `src/generators/index.ts`:

```ts
import { myserviceGenerator } from "./myservice.js";

export const generators: GeneratorSource[] = [
  // ... existing generators
  myserviceGenerator,  // ← add here
];
```

That's it. The CLI flag (`--myservice <username>`) and orchestrator integration are **automatic** — they read from the `flag`, `flagArg`, and `description` fields.

No need to touch `generator.ts`, `cli.ts`, or `types.ts`. The test harness validates your generator automatically on `npm test`.

## Generator Categories

Generators must use one of the valid `GeneratorCategory` values:

`code` · `writing` · `community` · `packages` · `activity` · `identity` · `gaming` · `music` · `creative` · `fitness` · `food` · `travel` · `learning` · `science` · `finance` · `maker` · `social` · `entertainment` · `podcasts` · `photography` · `sports` · `nature` · `productivity` · `crypto`

## Best Practices

1. **Use only public APIs** — No auth should be required for basic usage
2. **Log progress** — Use `console.log(\`  [SourceName] ...\`)` format for consistency
3. **Handle errors gracefully** — Throw descriptive errors; the orchestrator catches them
4. **Include `User-Agent: mcp-me-generator`** — Be a good API citizen
5. **Respect rate limits** — Don't make excessive API calls
6. **Return only what you have** — Don't fabricate data; leave fields undefined if unknown
7. **Add FAQ entries** — Great way to surface summary stats (karma, follower count, etc.)
8. **Add social links** — Always include a link back to the user's profile on the platform

## Generators vs Plugins

| | Generators | Plugins |
|---|---|---|
| **When they run** | Once, during `mcp-me generate` | Continuously, during `mcp-me serve` |
| **Output** | Static YAML files on disk | Live MCP resources, tools, prompts |
| **Data freshness** | Snapshot at generation time | Real-time on each AI query |
| **Auth required** | Almost never (public APIs) | Sometimes (OAuth for Spotify, etc.) |
| **Use case** | "Build my profile from my GitHub" | "What song am I playing right now?" |
| **Contribution** | Add a file to `src/generators/` | Add a directory to `src/plugins/` |

**When to build a generator:** The data source has a public API and the data doesn't change frequently (profile, repos, articles, karma).

**When to build a plugin:** The data is dynamic and the AI needs real-time access (now playing, current availability, live stats).

## Current Generators (42)

| Category | Generator | API | Auth |
|---|---|---|---|
| **Code** | `--github` | GitHub REST API v3 | Optional token |
| **Code** | `--gitlab` | GitLab REST API v4 | None |
| **Code** | `--bitbucket` | Bitbucket REST API v2 | None |
| **Code** | `--huggingface` | Hugging Face API | None |
| **Code** | `--kaggle` | Kaggle API | None |
| **Code** | `--codeberg` | Gitea REST API v1 | None |
| **Writing** | `--devto` | DEV.to API | None |
| **Writing** | `--medium` | Medium RSS feed | None |
| **Writing** | `--hashnode` | Hashnode GraphQL API | None |
| **Writing** | `--substack` | Substack RSS | None |
| **Writing** | `--openlibrary` | Open Library API | None |
| **Writing** | `--orcid` | ORCID Public API | None |
| **Writing** | `--semanticscholar` | Semantic Scholar API | None |
| **Writing** | `--youtube` | YouTube RSS / Data API | Optional key |
| **Writing** | `--wordpress` | WordPress REST API v2 | None |
| **Community** | `--stackoverflow` | Stack Exchange API v2.3 | None |
| **Community** | `--hackernews` | HN Firebase API | None |
| **Community** | `--mastodon` | Mastodon API v1 | None |
| **Community** | `--bluesky` | AT Protocol API | None |
| **Community** | `--reddit` | Reddit JSON API | None |
| **Community** | `--producthunt` | ProductHunt GraphQL | None |
| **Community** | `--threads` | Threads API | None |
| **Packages** | `--npm` | npm Registry API | None |
| **Packages** | `--pypi` | PyPI JSON API | None |
| **Packages** | `--crates` | Crates.io API | None |
| **Packages** | `--dockerhub` | Docker Hub API | None |
| **Activity** | `--wakatime` | WakaTime API v1 | None (public profile) |
| **Activity** | `--letterboxd` | Letterboxd RSS | None |
| **Activity** | `--goodreads` | Goodreads RSS | None |
| **Activity** | `--chess` | Chess.com API | None |
| **Activity** | `--lichess` | Lichess API | None |
| **Activity** | `--codewars` | Codewars API | None |
| **Activity** | `--leetcode` | LeetCode GraphQL | None |
| **Activity** | `--lastfm` | Last.fm API | Optional key |
| **Activity** | `--steam` | Steam Web API | Optional key |
| **Activity** | `--twitch` | Twitch API | None |
| **Activity** | `--dribbble` | Dribbble public profile | None |
| **Activity** | `--unsplash` | Unsplash API | None |
| **Activity** | `--exercism` | Exercism API v2 | None |
| **Activity** | `--hackerrank` | HackerRank REST API | None |
| **Activity** | `--anilist` | AniList GraphQL | None |
| **Identity** | `--gravatar` | Gravatar JSON API | None |
| **Identity** | `--keybase` | Keybase API v1 | None |

## Scaffolding a New Generator

The fastest way to start is with the built-in scaffolding command:

```bash
mcp-me create generator myservice --category community
```

This creates `src/generators/myservice.ts` with a ready-to-edit template. Then:

1. Edit the file — implement your API calls
2. Register in `src/generators/index.ts` (one import + one array entry)
3. Run `npm test` — the **generator harness** validates it automatically

## Test Harness

Every registered generator is automatically tested by `tests/generators/generator-harness.test.ts`:

- Validates `name`, `flag`, `flagArg`, `description`, `category`, `generate()` exist
- Checks no duplicate names or flags
- Verifies every `.ts` file in `src/generators/` is registered
- No manual test setup needed — just register and it's covered

## Ideas for New Generators

Looking to contribute? Here are some public APIs that would make great generators:

- **Behance** — Adobe creative portfolio
- **Figma Community** — Figma plugins/files
- **CodinGame** — Competitive programming
- **SourceHut** — sr.ht code hosting
- **MyAnimeList** — Anime/manga tracking
- **Spotify** — Public playlists (generator, not plugin)
- **Twitch VODs** — Stream history and clips
- **GitBook** — Published documentation
