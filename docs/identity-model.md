# Identity Model

mcp-me is a **complete digital identity layer** for any AI assistant connected via MCP. It aggregates who you are, what you've done, what you know, what you care about, and how you write — all from local YAML files and optional live plugins.

## North star

> **mcp-me transforms any AI from a generic assistant into one that knows you.**

When connected to Claude, Copilot, Cursor, Windsurf, or any MCP client, the agent can answer questions and produce content grounded in your real profile — not generic placeholders.

## Identity domains

| Domain | YAML / Resource | What it covers |
|--------|-----------------|----------------|
| **Who I am** | `identity.yaml` → `me://identity` | Name, bio, headline, location, contact, social links, optional physical attributes |
| **Career** | `career.yaml` → `me://career` | Work experience, education, certifications |
| **Skills** | `skills.yaml` → `me://skills` | Technical/soft skills, tools, programming languages |
| **Projects** | `projects.yaml` → `me://projects` | Open-source, articles, packages, portfolio |
| **Interests** | `interests.yaml` → `me://interests` | Hobbies, topics, music, books, travel |
| **Personality** | `personality.yaml` → `me://personality` | Traits, values, work style, motivations |
| **Goals** | `goals.yaml` → `me://goals` | Short/medium/long-term aspirations |
| **FAQ** | `faq.yaml` → `me://faq` | Pre-answered facts — persistent memory |
| **Writing** | `writing/` → `me://writing/*` | Style profiles, corpus of real texts (1.1+) |
| **Live presence** | Plugins → `me://github/*`, etc. | Real-time data (Spotify, GitHub, Last.fm…) |

Writing is a **first-class dimension** but never isolated — emulated text should cite real experiences, projects, and opinions from the rest of the profile.

## Data flow

```
Sources (APIs, exports, manual YAML, local corpus)
        ↓
  Generators (batch)  +  Manual edits
        ↓
  Profile directory (~/.mcp-me)
        ↓
  mcp-me serve  →  MCP resources, tools, prompts
        ↓
  Any MCP client (agent-agnostic)
```

### Generators vs plugins

| | Generators | Plugins |
|---|-----------|---------|
| **When** | One-time (`mcp-me generate`) | Live during `mcp-me serve` |
| **Output** | Static YAML files | MCP resources/tools on demand |
| **Auth** | Usually none (public APIs) | Sometimes OAuth (Spotify) |

## Agent-agnostic design

Core value lives in the **MCP server** — not in Cursor-specific rules or skills. Open Plugins (rules, skills, agents, commands) are **accelerators** for Cursor users, not requirements.

### Core MCP surface

**Resources:** `me://identity`, `me://career`, `me://skills`, `me://interests`, `me://personality`, `me://goals`, `me://projects`, `me://faq`, plus `me://writing/*` (1.1+)

**Tools:**
- `ask_about_me` — Returns structured profile context for the host LLM to interpret (not server-side Q&A)
- `search_profile` — Keyword search across all profile data
- Writing tools (1.1+): `analyze_writing_style`, `search_writing_corpus`, `get_writing_references`
- `get_profile_completeness` (1.2+) — Profile fill percentage and generator suggestions

**Prompts:** `introduce_me`, `summarize_career`, `technical_profile`, `collaboration_fit`, plus writing prompts (1.1+)

## Privacy

- All profile data stays **local** on your machine
- Sensitive fields (`identity.physical`, etc.) are **opt-in only** — never populated by generators
- Secrets use `_env` suffix keys in `.mcp-me.yaml` — never stored in YAML profile files

## Stable API (1.0+)

The following are declared stable as of mcp-me 1.0.0:

- 8 core YAML schemas (`identity`, `career`, `skills`, `interests`, `personality`, `goals`, `projects`, `faq`)
- Core MCP resources, tools, and prompts listed above
- `McpMePlugin` interface in `src/plugin-engine/types.ts`

See [Migration Guide](migration-1.0.md) for upgrading from 0.x.
