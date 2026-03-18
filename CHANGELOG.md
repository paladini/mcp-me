# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- **10 new generators** bringing total to 42 data sources for `mcp-me generate`
  - **Code:** `--kaggle` (Kaggle competitions, datasets), `--codeberg` (Gitea-based repos)
  - **Community:** `--producthunt` (launched products, upvotes), `--threads` (Meta Threads profile)
  - **Activity:** `--dribbble` (design portfolio), `--unsplash` (photography), `--exercism` (coding exercises), `--hackerrank` (competitive programming), `--anilist` (anime/manga)
  - **Writing:** `--wordpress` (WordPress.com blog posts, categories)
- **5 new built-in plugins** bringing total to 13 live data plugins
  - **gitlab** — live projects, merge requests, activity via GitLab REST API v4
  - **mastodon** — live fediverse profile, toots, engagement stats
  - **youtube** — live channel stats, recent videos (RSS fallback + Data API)
  - **lastfm** — now playing, recent scrobbles, top artists/tracks
  - **steam** — currently playing, game library, playtime stats
- **Universal generator test harness** (`tests/generators/generator-harness.test.ts`)
  - Auto-validates every registered generator for structural correctness
  - Checks for duplicate names/flags, validates categories, verifies file registration
  - Zero test setup needed — just register a generator and it's covered
- **Universal plugin test harness** (`tests/plugins/plugin-harness.test.ts`)
  - Auto-validates every built-in plugin (factory, init, resources, tools)
  - Verifies URI conventions, required fields, directory registration
- **Scaffolding CLI** — `mcp-me create generator <name>` and `mcp-me create plugin <name>`
  - Generates boilerplate code from templates with TODO markers
  - Prints next steps (register, test, implement)
- Updated `docs/creating-generators.md` with full 42-generator table, scaffolding guide, test harness docs
- Updated `docs/creating-plugins.md` with 13-plugin table, scaffolding guide, test harness docs
- **Multi-source `mcp-me generate` with 30 data sources** — Auto-generate profile from your entire online presence
  - **Code:** `--github`, `--gitlab`
  - **Writing:** `--devto`, `--medium`, `--hashnode`, `--openlibrary`, `--orcid`, `--semanticscholar`, `--youtube`
  - **Community:** `--stackoverflow`, `--hackernews`, `--mastodon`, `--reddit`
  - **Packages:** `--npm`, `--pypi`, `--crates`, `--dockerhub`
  - **Activity:** `--wakatime`, `--letterboxd`, `--goodreads`, `--chess`, `--lichess`, `--codewars`, `--lastfm`, `--steam`
  - **Identity:** `--gravatar`, `--keybase`
  - All sources can be combined in a single command; data is merged intelligently
  - Graceful error handling: if one source fails, others still succeed
  - Lazy task execution to prevent unhandled promise rejections
- Comprehensive tests for GitHub plugin (12 tests: resources, tools, fork filtering)
- Comprehensive tests for Spotify plugin (10 tests: resources, tools, token refresh, now playing fallback)
- Comprehensive tests for LinkedIn plugin (12 tests: resources, tools, partial data, missing file)

### Fixed

- Built-in plugins now use explicit imports instead of dynamic `import()` globs, fixing tsup bundling
- Removed unused imports flagged by ESLint

### Previously Added

- Initial project scaffolding with TypeScript, tsup, Vitest
- Zod schemas for 8 YAML profile categories (identity, career, skills, interests, personality, goals, projects, faq)
- YAML profile loader with validation and helpful error messages
- MCP server core with resources, tools, and prompts
- Plugin engine with support for built-in, npm, and local plugins
- Built-in plugins: GitHub, Spotify, LinkedIn
- CLI commands: `mcp-me init`, `mcp-me serve`, `mcp-me validate`
- YAML templates for profile initialization
- Plugin creation guide (`docs/creating-plugins.md`)
- Schema reference documentation (`docs/schema-reference.md`)
- Community contribution guide (`CONTRIBUTING.md`)
