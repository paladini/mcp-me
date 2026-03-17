# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

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
