# Contributing to mcp-me

Thank you for your interest in contributing to mcp-me! Whether it's a new plugin, a bug fix, or documentation improvement, we appreciate your help.

## Ways to Contribute

### 🔌 Build a Plugin

The #1 way to contribute is by building a new plugin. See the [Plugin Creation Guide](../docs/creating-plugins.md) for a step-by-step walkthrough.

**Plugin ideas we'd love to see:**
- Goodreads / Open Library (reading lists)
- Twitter/X (social activity)
- Stack Overflow (developer Q&A)
- YouTube (channels, playlists)
- Google Calendar (availability)
- Strava / Fitness (activity data)
- Notion / Obsidian (knowledge base)
- Blog / RSS (published articles)
- Google Drive (documents)
- Reddit (community activity)

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
