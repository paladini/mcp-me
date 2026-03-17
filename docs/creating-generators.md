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

### 1. Create the generator file

```bash
# Create a new file in src/generators/
touch src/generators/myservice.ts
```

### 2. Implement the generator

```ts
// src/generators/myservice.ts
import type { GeneratorSource, PartialProfile } from "./types.js";

interface MyServiceUser {
  username: string;
  displayName: string;
  bio: string;
  // ... API response fields
}

export const myserviceGenerator: GeneratorSource = {
  name: "myservice",

  async generate(config): Promise<PartialProfile> {
    const username = config.username as string;
    if (!username) throw new Error("MyService username is required");

    console.log(`  [MyService] Fetching profile for ${username}...`);

    const response = await fetch(`https://api.myservice.com/users/${username}`, {
      headers: { Accept: "application/json", "User-Agent": "mcp-me-generator" },
    });
    if (!response.ok) {
      throw new Error(`MyService API error: ${response.status} ${response.statusText}`);
    }

    const user = (await response.json()) as MyServiceUser;
    console.log(`  [MyService] Found profile: ${user.displayName}`);

    return {
      identity: {
        name: user.displayName,
        bio: user.bio,
        contact: {
          social: [
            { platform: "myservice", url: `https://myservice.com/${username}`, username },
          ],
        },
      },
      // Add skills, projects, faq as applicable
    };
  },
};
```

### 3. Register the generator

**a.** Export from `src/generators/index.ts`:
```ts
export { myserviceGenerator } from "./myservice.js";
```

**b.** Add to `GenerateOptions` in `src/generators/types.ts`:
```ts
export interface GenerateOptions {
  // ... existing options
  myservice?: string;
}
```

**c.** Add to `src/generator.ts` — in the source keys array and task list:
```ts
const sourceKeys: (keyof GenerateOptions)[] = [
  // ... existing keys
  "myservice",
];

// ... in the task building section:
if (options.myservice) {
  tasks.push({ name: "myservice", run: () => myserviceGenerator.generate({ username: options.myservice! }) });
}
```

**d.** Add CLI flag in `src/cli.ts`:
```ts
.option("--myservice <username>", "MyService username")
```

### 4. Add tests

```ts
// tests/generators/myservice.test.ts
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { myserviceGenerator } from "../../src/generators/myservice.js";

// Mock fetch, test the generator output
```

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

## Current Generators (14)

| Category | Generator | API | Auth |
|---|---|---|---|
| **Code** | `--github` | GitHub REST API v3 | Optional token |
| **Code** | `--gitlab` | GitLab REST API v4 | None |
| **Writing** | `--devto` | DEV.to API | None |
| **Writing** | `--medium` | Medium RSS feed | None |
| **Community** | `--stackoverflow` | Stack Exchange API v2.3 | None |
| **Community** | `--hackernews` | HN Firebase API | None |
| **Community** | `--mastodon` | Mastodon API v1 | None |
| **Community** | `--reddit` | Reddit JSON API | None |
| **Packages** | `--npm` | npm Registry API | None |
| **Packages** | `--pypi` | PyPI JSON API | None |
| **Activity** | `--wakatime` | WakaTime API v1 | None (public profile) |
| **Activity** | `--letterboxd` | Letterboxd RSS | None |
| **Identity** | `--gravatar` | Gravatar JSON API | None |
| **Identity** | `--keybase` | Keybase API v1 | None |

## Ideas for New Generators

Looking to contribute? Here are some public APIs that would make great generators:

- **Hashnode** — GraphQL API for tech blog articles
- **Dribbble** — Design portfolio shots
- **ORCID** — Academic publications and research
- **Goodreads** — Reading list via RSS feed
- **Last.fm** — Music listening history (needs API key)
- **Chess.com** — Player stats and rating
- **Lichess** — Chess profile (public API, no auth)
- **Crates.io** — Rust packages
- **Docker Hub** — Published container images
- **Kaggle** — Data science competitions and datasets
