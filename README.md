# mcp-me

> A community-driven MCP server framework that lets anyone expose personal information to AI assistants via the [Model Context Protocol](https://modelcontextprotocol.io/).

**mcp-me** makes it easy for AI assistants (Claude, Copilot, Cursor, Windsurf, etc.) to know about *you* — your bio, career, skills, interests, projects, and more — by serving structured personal data through a standardized MCP server.

Built with a **plugin ecosystem** so the community can add integrations with GitHub, Spotify, LinkedIn, Google Drive, and any other platform.

## Features

- 📝 **YAML-based profiles** — Human-friendly, version-controllable personal data
- 🔌 **Plugin ecosystem** — Community-built integrations for any platform
- 🤖 **MCP native** — Works with any MCP-compatible AI assistant
- 🛡️ **Schema validation** — Zod-powered validation with helpful error messages
- 🚀 **Zero config** — `npx mcp-me init` gets you started in seconds

## Quick Start

```bash
# Initialize a new profile
npx mcp-me init ~/my-profile

# Edit your YAML files
code ~/my-profile

# Start the MCP server
npx mcp-me serve ~/my-profile
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

## Plugins

Plugins extend mcp-me with dynamic data from external services.

### Built-in Plugins

| Plugin | Description |
|--------|-------------|
| **GitHub** | Repositories, contributions, languages, activity |
| **Spotify** | Top artists, recently played, playlists |
| **LinkedIn** | Professional history from exported data |

### Using Plugins

Enable plugins in your `plugins.yaml`:

```yaml
plugins:
  github:
    enabled: true
    username: "your-username"
    token_env: "GITHUB_TOKEN"
  spotify:
    enabled: true
    client_id_env: "SPOTIFY_CLIENT_ID"
    client_secret_env: "SPOTIFY_CLIENT_SECRET"
```

### Community Plugins

Install community plugins from npm:

```bash
npm install mcp-me-plugin-goodreads
```

Then enable in `plugins.yaml`:

```yaml
plugins:
  goodreads:
    enabled: true
    user_id: "12345"
```

### Creating Plugins

Want to build your own integration? See the [Plugin Creation Guide](docs/creating-plugins.md).

## CLI Reference

```bash
# Initialize a new profile with YAML templates
mcp-me init <directory>

# Start the MCP server
mcp-me serve <directory>

# Validate profile YAML files against schemas
mcp-me validate <directory>
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
