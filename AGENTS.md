# Agent Instructions

This file provides instructions for AI coding agents (Copilot, Cascade, Cursor, Cline, etc.) working on this project.

## Critical Rules

1. **Always verify before declaring done** — Before saying a task is complete, committing, or pushing, you **must** run the full verification suite in this exact order:
   ```bash
   npm run lint        # ESLint must pass with 0 errors
   npm run typecheck   # TypeScript strict mode, no errors
   npm test            # All Vitest tests must pass
   npm run build       # tsup build must succeed
   ```
   If any step fails, fix the issue before proceeding. Never commit or push broken code.

2. **Always update `CHANGELOG.md`** — Every change, no matter how small, must be documented under `[Unreleased]` following [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) format.

3. **Always update documentation** — If your change affects user-facing behavior, update `README.md`, `docs/creating-plugins.md`, `docs/schema-reference.md`, and any other relevant docs.

4. **Follow Semantic Versioning** — Bump the version in `package.json` when preparing a release:
   - **PATCH** (0.1.x): Bug fixes
   - **MINOR** (0.x.0): New features, new plugins
   - **MAJOR** (x.0.0): Breaking changes to plugin interface or schema

5. **Use Conventional Commits** — Format: `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`, `test:`.

6. **Add tests for every change** — New features and bug fixes must include tests. Never reduce test coverage.

7. **No unused imports** — ESLint enforces this. Clean up imports when refactoring.

8. **Plugin changes require plugin docs** — Any change to a built-in plugin must update its `README.md`. Any change to the plugin interface must update `docs/creating-plugins.md`.

## Pre-commit Checklist

Before every commit, verify:
- [ ] `npm run lint` passes (0 errors)
- [ ] `npm run typecheck` passes (0 errors)
- [ ] `npm test` passes (all tests green)
- [ ] `npm run build` succeeds (ESM + DTS)
- [ ] `CHANGELOG.md` is updated
- [ ] Documentation is updated (if behavior changed)
- [ ] Commit message follows Conventional Commits

## Project Structure

```
src/
├── index.ts                  # Public API exports
├── cli.ts                    # CLI: init, serve, validate
├── server.ts                 # MCP server core (resources, tools, prompts)
├── loader.ts                 # YAML file loader + validation + search
├── schema/
│   ├── index.ts              # Re-exports all schemas + category map
│   ├── identity.ts           # Zod schema for identity.yaml
│   ├── career.ts             # Zod schema for career.yaml
│   ├── skills.ts             # Zod schema for skills.yaml
│   ├── interests.ts          # Zod schema for interests.yaml
│   ├── personality.ts        # Zod schema for personality.yaml
│   ├── goals.ts              # Zod schema for goals.yaml
│   ├── projects.ts           # Zod schema for projects.yaml
│   └── faq.ts                # Zod schema for faq.yaml
├── plugin-engine/
│   ├── index.ts              # Re-exports plugin types + discoverPlugins
│   ├── types.ts              # McpMePlugin interface (THE contract)
│   └── loader.ts             # Plugin discovery: built-in → npm → local
└── plugins/                  # Built-in plugins
    ├── github/               # GitHub API integration
    ├── spotify/              # Spotify Web API integration
    └── linkedin/             # LinkedIn JSON export parser
templates/                    # YAML templates for `mcp-me init`
tests/                        # Vitest test files
docs/
├── creating-plugins.md       # Step-by-step plugin creation guide
└── schema-reference.md       # Full YAML schema reference
```

## Version Locations

When bumping the version, update **all** of these:
- `package.json` → `"version": "x.y.z"`
- `CHANGELOG.md` → New section `## [x.y.z] - YYYY-MM-DD` + link at the bottom
- `src/server.ts` → `version` field in `McpServer` constructor

## Tech Stack

- **Runtime**: Node.js 20+
- **Language**: TypeScript (strict mode)
- **MCP SDK**: `@modelcontextprotocol/sdk`
- **Schema validation**: Zod
- **YAML parsing**: yaml (npm)
- **CLI**: Commander.js
- **Build**: tsup (ESM + DTS)
- **Test**: Vitest
- **Lint**: ESLint 9 (flat config) + typescript-eslint + Prettier

## Key Design Decisions

- **Plugin interface** (`McpMePlugin`) is the public API contract — changes here are **breaking changes**
- **MCP SDK `argsSchema`** expects raw Zod shape objects (`{ key: z.string() }`), NOT `z.object({...})`
- **Plugin discovery** follows 3-tier order: built-in → npm (`mcp-me-plugin-*`) → local file paths
- **Secrets** are always referenced via `_env` suffix config keys that read from environment variables — never store secrets in YAML
