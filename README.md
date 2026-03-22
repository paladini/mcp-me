# mcp-me

**Your AI assistants don't know who you are.** Every time you start a conversation with Claude, Copilot, Cursor, or Windsurf, it's a blank slate — no context about your skills, your projects, your career, or what you care about.

**mcp-me fixes that.** It creates a structured personal profile that any AI assistant can read via the [Model Context Protocol (MCP)](https://modelcontextprotocol.io/). Think of it as a **digital identity layer for AI** — your bio, career, skills, interests, projects, and more, always available to every AI tool you use.

```
You: "Write me a cover letter for this job"
AI:  (reads your me://career, me://skills, me://projects)
     "Based on your 5 years at Acme Corp, your TypeScript expertise,
      and your open-source work on mcp-me..."
```

## Why mcp-me?

- **AI that knows you** — Your assistants remember your skills, career, projects, and personality across every conversation
- **Auto-generated** — Pull data from 342+ sources (GitHub, Medium, Strava, Goodreads, and hundreds more) with one command
- **Privacy-first** — All data stays local in YAML files on your machine. Nothing is sent to any cloud.
- **Real-time plugins** — 13 live integrations (Spotify now playing, GitHub repos, Last.fm scrobbles) that AI queries on demand
- **Extensible** — Community-driven generators and plugins. Add a new data source in ~10 lines of code.
- **Works everywhere** — Claude Desktop, Cursor, Windsurf, Copilot, and any MCP-compatible AI assistant

## Installation

> **Prerequisite:** [Node.js](https://nodejs.org/) 20 or later. Verify with `node -v`.

**Recommended — install globally:**

```bash
npm install -g mcp-me
```

This makes the `mcp-me` command available everywhere on your system. No need to clone any repository — npm downloads the package for you.

```bash
mcp-me --help
mcp-me init ~/my-profile
mcp-me generate ~/my-profile
mcp-me serve ~/my-profile
```

**Alternative — run without installing** (via `npx`):

```bash
npx mcp-me --help
```

`npx` downloads the package temporarily and runs it. Useful for trying mcp-me once, but slower on repeated use since it re-downloads each time.

## Quick Start

```bash
# 1. Initialize your profile (creates YAML templates + .mcp-me.yaml config)
mcp-me init ~/my-profile

# 2. Edit the config file — uncomment your sources
code ~/my-profile/.mcp-me.yaml
```

Your `.mcp-me.yaml` config file:

```yaml
generators:
  github: your-username
  devto: your-username
  bluesky: handle.bsky.social
  zodiac: aquarius

plugins:
  github:
    enabled: true
    username: your-username
```

```bash
# 3. Generate! Reads sources from .mcp-me.yaml automatically
mcp-me generate ~/my-profile

# 4. Start the MCP server
mcp-me serve ~/my-profile
```

> **CLI flags also work:** `mcp-me generate ~/my-profile --github octocat --devto myuser`

All commands work with `npx` (zero install) or with `mcp-me` directly if installed globally. The `generate` command pulls your data from public APIs and auto-populates profile YAML files — no API keys needed for most sources.

### Profile directory structure

```
my-profile/
  .mcp-me.yaml        ← Configuration (generators + plugins)
  identity.yaml        ← Your data (name, bio, contact)
  skills.yaml          ← Your data (languages, tools)
  projects.yaml        ← Your data (portfolio)
  career.yaml          ← Your data (experience)
  interests.yaml       ← Your data (hobbies, topics)
  personality.yaml     ← Your data (traits, values)
  goals.yaml           ← Your data (short/long-term)
  faq.yaml             ← Your data (Q&A pairs)
```

## Configure Your AI Assistant

### Windsurf

Add to `~/.codeium/windsurf/mcp_config.json`:

```json
{
  "mcpServers": {
    "me": {
      "command": "npx",
      "args": ["mcp-me", "serve", "/absolute/path/to/my-profile"]
    }
  }
}
```

### Cursor

Add to `.cursor/mcp.json` in your project root:

```json
{
  "mcpServers": {
    "me": {
      "command": "npx",
      "args": ["mcp-me", "serve", "/absolute/path/to/my-profile"]
    }
  }
}
```

### Claude Desktop

Add to your Claude Desktop config:

```json
{
  "mcpServers": {
    "me": {
      "command": "npx",
      "args": ["mcp-me", "serve", "/absolute/path/to/my-profile"]
    }
  }
}
```

## Profile Schema

Your profile is a collection of YAML files:

| File | Description |
|------|-------------|
| `identity.yaml` | Name, bio, location, languages, contact info |
| `career.yaml` | Work experience, education, certifications |
| `skills.yaml` | Technical and soft skills with proficiency levels |
| `interests.yaml` | Hobbies, music, books, movies, food preferences |
| `personality.yaml` | Values, traits, MBTI, strengths |
| `goals.yaml` | Short, medium, and long-term goals |
| `projects.yaml` | Personal and open-source projects |
| `faq.yaml` | Custom Q&A pairs about yourself |

See [Schema Reference](docs/schema-reference.md) for full documentation.

## MCP Interface

### Resources

Static profile data exposed as MCP resources:

- `me://identity` — Personal identity and contact
- `me://career` — Professional history
- `me://skills` — Skills and proficiencies
- `me://interests` — Hobbies and preferences
- `me://personality` — Personality traits and values
- `me://goals` — Personal and professional goals
- `me://projects` — Portfolio and projects
- `me://faq` — Frequently asked questions

### Tools

- **`ask_about_me`** — Free-form question about the user
- **`search_profile`** — Keyword search across all profile data

### Prompts

- **`introduce_me`** — Generate a 2-paragraph introduction
- **`summarize_career`** — Summarize career trajectory
- **`technical_profile`** — Describe technical skills and stack
- **`collaboration_fit`** — Evaluate fit for a project

## Generators (42 data sources)

Generators run during `mcp-me generate` to auto-populate your profile from public APIs. **No API keys needed** for most sources.

| Category | Flag | Source | Data |
|---|---|---|---|
| **Code** | `--github <user>` | GitHub API | Repos, languages, stars, profile |
| **Code** | `--gitlab <user>` | GitLab API | Projects, topics, profile |
| **Code** | `--bitbucket <user>` | Bitbucket API | Repos, languages |
| **Code** | `--huggingface <user>` | Hugging Face API | Models, datasets, spaces |
| **Code** | `--kaggle <user>` | Kaggle API | Competitions, datasets, medals |
| **Code** | `--codeberg <user>` | Gitea API | Repos, languages |
| **Writing** | `--devto <user>` | DEV.to API | Articles, tags, reactions |
| **Writing** | `--medium <user>` | Medium RSS | Articles, categories |
| **Writing** | `--hashnode <user>` | Hashnode GraphQL | Blog posts, tags |
| **Writing** | `--substack <user>` | Substack RSS | Newsletter posts |
| **Writing** | `--wordpress <site>` | WordPress API | Blog posts, categories, tags |
| **Writing** | `--openlibrary <user>` | Open Library API | Books authored |
| **Writing** | `--orcid <id>` | ORCID API | Academic publications |
| **Writing** | `--semanticscholar <id>` | S2 API | Research papers, citations |
| **Writing** | `--youtube <channel>` | YouTube RSS | Videos, channel info |
| **Community** | `--stackoverflow <id>` | Stack Exchange API | Top tags, reputation, badges |
| **Community** | `--hackernews <user>` | HN Firebase API | Karma, submissions |
| **Community** | `--mastodon <user@host>` | Mastodon API | Posts, hashtags, bio |
| **Community** | `--bluesky <handle>` | AT Protocol API | Posts, followers |
| **Community** | `--reddit <user>` | Reddit JSON API | Karma, bio |
| **Community** | `--producthunt <user>` | ProductHunt GraphQL | Launched products, upvotes |
| **Community** | `--threads <user>` | Threads API | Bio, follower stats |
| **Packages** | `--npm <user>` | npm Registry | Published packages |
| **Packages** | `--pypi <pkgs>` | PyPI JSON API | Package metadata |
| **Packages** | `--crates <user>` | Crates.io API | Rust crates |
| **Packages** | `--dockerhub <user>` | Docker Hub API | Container images |
| **Activity** | `--wakatime <user>` | WakaTime API | Coding time, languages, editors |
| **Activity** | `--letterboxd <user>` | Letterboxd RSS | Films watched, ratings |
| **Activity** | `--goodreads <user>` | Goodreads RSS | Books, reading list |
| **Activity** | `--chess <user>` | Chess.com API | Rating, stats |
| **Activity** | `--lichess <user>` | Lichess API | Rating, games |
| **Activity** | `--codewars <user>` | Codewars API | Rank, honor, languages |
| **Activity** | `--leetcode <user>` | LeetCode GraphQL | Problems solved, contests |
| **Activity** | `--lastfm <user>` | Last.fm API | Listening history, top artists |
| **Activity** | `--steam <id>` | Steam API | Games, playtime |
| **Activity** | `--twitch <user>` | Twitch API | Stream info |
| **Activity** | `--dribbble <user>` | Dribbble | Design shots, portfolio |
| **Activity** | `--unsplash <user>` | Unsplash API | Photos, downloads, collections |
| **Activity** | `--exercism <user>` | Exercism API | Language tracks, exercises |
| **Activity** | `--hackerrank <user>` | HackerRank API | Badges, challenges solved |
| **Activity** | `--anilist <user>` | AniList GraphQL | Anime/manga stats, genres |
| **Identity** | `--gravatar <email>` | Gravatar API | Bio, linked accounts, photo |
| **Identity** | `--keybase <user>` | Keybase API | Verified identity proofs |

Want to add a new data source? See the [Generator Creation Guide](docs/creating-generators.md).

## Plugins (13 live integrations)

Plugins run during `mcp-me serve` and provide **real-time data** to AI assistants on every query.

| Plugin | Description | Auth |
|---|---|---|
| **GitHub** | Live repos, activity, languages | Optional token |
| **Spotify** | Now playing, top artists, playlists | OAuth required |
| **LinkedIn** | Professional history from export | Local JSON file |
| **WakaTime** | Live coding stats, languages | Optional API key |
| **DEV.to** | Live articles, reactions | Optional API key |
| **Bluesky** | Live posts, profile, followers | None |
| **Hacker News** | Live stories, karma | None |
| **Reddit** | Live karma, posts | None |
| **GitLab** | Live projects, activity, MRs | Optional token |
| **Mastodon** | Live toots, profile, engagement | None |
| **YouTube** | Live videos, channel stats | Optional API key |
| **Last.fm** | Now playing, top artists, scrobbles | Optional API key |
| **Steam** | Currently playing, game library | Optional API key |

Enable plugins in `.mcp-me.yaml`:

```yaml
plugins:
  github:
    enabled: true
    username: "your-username"
  spotify:
    enabled: true
    client_id_env: "SPOTIFY_CLIENT_ID"
    client_secret_env: "SPOTIFY_CLIENT_SECRET"
    refresh_token_env: "SPOTIFY_REFRESH_TOKEN"
```

Community plugins are installed from npm (`mcp-me-plugin-*`) and auto-discovered. See the [Plugin Creation Guide](docs/creating-plugins.md).

## Generators vs Plugins

| | Generators | Plugins |
|---|---|---|
| **Run when** | `mcp-me generate` (once) | `mcp-me serve` (continuously) |
| **Output** | Static YAML files | Live MCP resources/tools |
| **Auth** | Almost never needed | Sometimes (OAuth) |
| **Example** | "Repos I had in March" | "Repos I have right now" |
| **Extend** | Add `src/generators/*.ts` | Add `src/plugins/*/` |

## CLI Reference

```bash
# Auto-generate profile from multiple data sources
mcp-me generate <dir> --github <user> [--devto <user>] [--stackoverflow <id>] ...

# Initialize with blank YAML templates
mcp-me init <directory>

# Validate profile YAML files
mcp-me validate <directory>

# Start the MCP server
mcp-me serve <directory>

# Scaffold a new generator or plugin (for contributors)
mcp-me create generator <name> [--category <category>]
mcp-me create plugin <name>
```

## Development

```bash
# Clone the repo
git clone https://github.com/paladini/mcp-me.git
cd mcp-me

# Install dependencies
npm install

# Run tests
npm test

# Build
npm run build

# Run in dev mode
npm run dev
```

## FAQ

**What is MCP (Model Context Protocol)?**
MCP is an open standard by Anthropic that connects AI assistants to external data sources. mcp-me uses MCP to let AI assistants read your personal profile data.

**Do I need API keys?**
Most generators use public APIs with no auth needed. Some (Strava, Spotify) require tokens — see the `.mcp-me.yaml` comments for details.

**Can I use this with Claude Desktop / Cursor / Windsurf?**
Yes! Any MCP-compatible AI assistant works. See the [Configure Your AI Assistant](#configure-your-ai-assistant) section.

**How do I add a new data source?**
Run `mcp-me create generator myservice` to scaffold a new generator, or see the [Generator Creation Guide](docs/creating-generators.md).

**Is my data stored anywhere?**
No. All data stays local in your YAML files. The MCP server reads from disk — nothing is sent to any cloud.

**How many generators are there?**
342+ generators across 24 categories — from GitHub and Medium to Zodiac signs and D&D alignment.

## Contributing

We welcome contributions! Whether it's a new plugin, a bug fix, or documentation improvements — see [CONTRIBUTING.md](.github/CONTRIBUTING.md) for guidelines.

## License

[MIT](LICENSE)
