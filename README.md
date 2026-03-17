# mcp-me

> A community-driven MCP server framework that lets anyone expose personal information to AI assistants via the [Model Context Protocol](https://modelcontextprotocol.io/).

**mcp-me** makes it easy for AI assistants (Claude, Copilot, Cursor, Windsurf, etc.) to know about *you* — your bio, career, skills, interests, projects, and more — by serving structured personal data through a standardized MCP server.

Built with two extension systems for the community: **generators** (auto-populate from 14 data sources) and **plugins** (live data for AI at runtime).

## Features

- ⚡ **Auto-generate from 14 sources** — GitHub, GitLab, Stack Overflow, DEV.to, Medium, npm, and more
- 📝 **YAML-based profiles** — Human-friendly, version-controllable personal data
- 🔌 **Plugin ecosystem** — Community-built live integrations (Spotify, LinkedIn, etc.)
- 🤖 **MCP native** — Works with any MCP-compatible AI assistant
- 🛡️ **Schema validation** — Zod-powered validation with helpful error messages

## Quick Start

```bash
# Auto-generate your profile from multiple sources at once
npx mcp-me generate ~/my-profile \
  --github your-username \
  --stackoverflow 12345 \
  --devto your-username

# Or initialize with blank templates
npx mcp-me init ~/my-profile

# Review and edit the generated YAML files
code ~/my-profile

# Start the MCP server
npx mcp-me serve ~/my-profile
```

The `generate` command pulls your data from public APIs and auto-populates profile YAML files — no API keys needed for most sources.

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

## Generators (14 data sources)

Generators run during `mcp-me generate` to auto-populate your profile from public APIs. **No API keys needed** for most sources.

| Category | Flag | Source | Data |
|---|---|---|---|
| **Code** | `--github <user>` | GitHub API | Repos, languages, stars, profile |
| **Code** | `--gitlab <user>` | GitLab API | Projects, topics, profile |
| **Writing** | `--devto <user>` | DEV.to API | Articles, tags, reactions |
| **Writing** | `--medium <user>` | Medium RSS | Articles, categories |
| **Community** | `--stackoverflow <id>` | Stack Exchange API | Top tags, reputation, badges |
| **Community** | `--hackernews <user>` | HN Firebase API | Karma, submissions |
| **Community** | `--mastodon <user@host>` | Mastodon API | Posts, hashtags, bio |
| **Community** | `--reddit <user>` | Reddit JSON API | Karma, bio |
| **Packages** | `--npm <user>` | npm Registry | Published packages |
| **Packages** | `--pypi <pkgs>` | PyPI JSON API | Package metadata |
| **Activity** | `--wakatime <user>` | WakaTime API | Coding time, languages, editors |
| **Activity** | `--letterboxd <user>` | Letterboxd RSS | Films watched, ratings |
| **Identity** | `--gravatar <email>` | Gravatar API | Bio, linked accounts, photo |
| **Identity** | `--keybase <user>` | Keybase API | Verified identity proofs |

Want to add a new data source? See the [Generator Creation Guide](docs/creating-generators.md).

## Plugins (live data at runtime)

Plugins run during `mcp-me serve` and provide **real-time data** to AI assistants on every query.

| Plugin | Description | Auth |
|---|---|---|
| **GitHub** | Live repos, activity, languages | Optional token |
| **Spotify** | Now playing, top artists, playlists | OAuth required |
| **LinkedIn** | Professional history from export | Local JSON file |

Enable plugins in `plugins.yaml`:

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

## Contributing

We welcome contributions! Whether it's a new plugin, a bug fix, or documentation improvements — see [CONTRIBUTING.md](.github/CONTRIBUTING.md) for guidelines.

## License

[MIT](LICENSE)
