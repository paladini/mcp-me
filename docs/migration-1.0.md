# Migration Guide: 0.x → 1.0

This guide covers upgrading from mcp-me 0.x to 1.0.0.

## Summary

mcp-me 1.0.0 is a **stability release**. The core architecture is unchanged — 8 YAML categories, generators, plugins, and MCP server. Changes are additive schema fields, documentation, and API stability declarations.

## Upgrade steps

```bash
npm install -g mcp-me@1.0.0
# or
npx mcp-me@1.0.0 --version
```

Then validate your existing profile:

```bash
mcp-me validate
```

## Breaking changes

### None for core profile YAML

Existing `identity.yaml`, `career.yaml`, etc. continue to work without modification.

### Plugin configuration

**`plugins.yaml` is no longer generated.** Plugin config lives exclusively in `.mcp-me.yaml`:

```yaml
plugins:
  github:
    enabled: true
    username: your-username
  spotify:
    enabled: true
    client_id_env: SPOTIFY_CLIENT_ID
    client_secret_env: SPOTIFY_CLIENT_SECRET
    refresh_token_env: SPOTIFY_REFRESH_TOKEN
```

If you have an old `plugins.yaml`, copy its contents into `.mcp-me.yaml` under `plugins:` and delete `plugins.yaml`.

## New optional fields (1.0)

### `identity.yaml`

```yaml
headline: "Software engineer · open-source maintainer"
physical:          # opt-in only — never populated by generators
  height: "1.78m"
  weight: "75kg"
  description: "Athletic build, short dark hair"
```

### `interests.yaml`

```yaml
topics:
  - open-source
  - typescript
  - music
```

Generators have been writing `topics` for a while; 1.0 adds official schema support.

## MCP behavior clarifications

### `ask_about_me`

Returns the **full profile JSON as context** for the host LLM to interpret. mcp-me does not run an LLM server-side — your AI client reads the context and answers.

### Stable API

As of 1.0.0, these are stable:

- 8 core YAML schemas
- Core MCP resources (`me://*`), tools (`ask_about_me`, `search_profile`), and prompts
- `McpMePlugin` interface

## Upgrading to 1.1 (writing)

1.1 adds an optional `writing/` directory. Run `mcp-me init --force` in a backup first, or manually add:

```
writing/
├── style.yaml
└── corpus/
    └── _manifest.yaml
```

See [Schema Reference](schema-reference.md) for writing schema details.

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Validation fails on `interests.topics` | Upgrade to 1.0+ (schema now includes `topics`) |
| Plugins not loading | Move config from `plugins.yaml` to `.mcp-me.yaml` |
| `ask_about_me` seems unhelpful | Expected — use your AI client to interpret the returned context |

## Getting help

- [Identity Model](identity-model.md) — full vision and architecture
- [Generator Tiers](generator-tiers.md) — what each generator actually delivers
- [Schema Reference](schema-reference.md) — all YAML fields
