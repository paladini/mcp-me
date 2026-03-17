# Contributing to mcp-me

Thank you for your interest in contributing to mcp-me! Whether it's a new plugin, a bug fix, or documentation improvement, we appreciate your help.

## Ways to Contribute

mcp-me has **two extension systems** — pick the one that fits your idea:

### ⚡ Build a Generator

Generators auto-populate profile YAML from public APIs during `mcp-me generate`. They're the **easiest way to contribute** — just one file, no auth needed.

See the [Generator Creation Guide](../docs/creating-generators.md) for a step-by-step walkthrough.

**Generator ideas we'd love to see:**
- Hashnode (tech blog articles via GraphQL)
- Goodreads (reading list via RSS)
- Last.fm (music history — needs API key)
- Chess.com / Lichess (player rating and stats)
- Dribbble (design portfolio)
- ORCID (academic publications)
- Crates.io (Rust packages)
- Docker Hub (published images)
- Kaggle (data science competitions)

### 🔌 Build a Plugin

Plugins provide **live, real-time data** to AI assistants during `mcp-me serve`. They're more complex but more powerful.

See the [Plugin Creation Guide](../docs/creating-plugins.md) for a step-by-step walkthrough.

**Plugin ideas we'd love to see:**
- Google Calendar (live availability)
- Notion / Obsidian (knowledge base queries)
- Strava / Fitness (live activity data)
- YouTube (channel stats, recent videos)
- Twitter/X (recent posts)

### Generators vs Plugins — Which should I build?

| Build a **Generator** if... | Build a **Plugin** if... |
|---|---|
| Data is mostly static (profile, repos, articles) | Data changes frequently (now playing, availability) |
| Public API exists, no auth needed | OAuth or API key required |
| User only needs a snapshot | AI needs real-time access |
| You want to contribute quickly (1 file) | You want to build something richer (tools, prompts) |

### 🐛 Report Bugs

Found a bug? Open an [issue](https://github.com/paladini/mcp-me/issues/new?template=bug_report.md) with:
- Steps to reproduce
- Expected vs actual behavior
- Your environment (Node.js version, OS)

### 💡 Request Features

Have an idea? Open an [issue](https://github.com/paladini/mcp-me/issues/new?template=feature_request.md) describing your use case.

### 📝 Improve Documentation

Documentation improvements are always welcome. Fix typos, add examples, clarify confusing sections.

## Development Setup

```bash
# Clone the repo
git clone https://github.com/paladini/mcp-me.git
cd mcp-me

# Install dependencies
npm install

# Run tests
npm test

# Type check
npm run typecheck

# Lint
npm run lint

# Build
npm run build
```

## Pull Request Process

1. **Fork** the repository
2. **Create a branch** from `main`: `git checkout -b feat/my-feature`
3. **Make your changes** following the guidelines below
4. **Add tests** for new functionality
5. **Run the full check suite:**
   ```bash
   npm run lint
   npm run typecheck
   npm test
   npm run build
   ```
6. **Commit** using [Conventional Commits](https://www.conventionalcommits.org/):
   - `feat: add goodreads plugin`
   - `fix: handle missing YAML files gracefully`
   - `docs: improve plugin creation guide`
   - `chore: update dependencies`
   - `test: add schema validation tests`
   - `refactor: simplify plugin loader`
7. **Open a PR** against `main`

## Code Guidelines

- **TypeScript strict mode** — No `any` types unless absolutely necessary
- **Zod for validation** — Always validate external input with Zod schemas
- **Error handling** — Return meaningful errors, never crash the server
- **Tests** — All new features and bug fixes need tests
- **Documentation** — Update docs if your change affects user-facing behavior
- **Changelog** — Add an entry to `CHANGELOG.md` under `[Unreleased]`

## Plugin Contribution Guidelines

If you're contributing a **built-in plugin** (added to `src/plugins/`):

1. Create a directory: `src/plugins/<name>/`
2. Include:
   - `index.ts` — Plugin implementation with default export factory function
   - `schema.ts` — Zod config schema
   - `README.md` — Plugin documentation
3. Add tests in `tests/plugins/<name>.test.ts`
4. Register in `src/plugin-engine/loader.ts` `BUILTIN_PLUGINS` array
5. Add a config example to `templates/plugins.yaml`
6. Update `README.md` built-in plugins table

## Code of Conduct

Be respectful, constructive, and inclusive. We follow the [Contributor Covenant](https://www.contributor-covenant.org/version/2/1/code_of_conduct/).

## Questions?

Open a [Discussion](https://github.com/paladini/mcp-me/discussions) or reach out via issues. We're happy to help!
