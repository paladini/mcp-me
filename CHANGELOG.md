# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

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
