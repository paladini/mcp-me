# AI Agent Instructions

AI coding assistants like GitHub Copilot, Windsurf (Cascade), Cline, and others support **instruction files** — special Markdown files you place in your project that tell the AI how to behave in that workspace.

Combined with mcp-me, these files instruct AI agents to **automatically consult your personal profile** before responding. The result is an assistant that already knows your skills, projects, and career context without you repeating yourself in every conversation.

---

## How it works

1. You install mcp-me and configure it in your AI assistant (one-click for Cursor/VS Code, or `mcp-me serve` via MCP config).
2. You run `mcp-me init` once to create your profile in `~/.mcp-me`.
3. You drop an instruction file into your project (or globally).
4. The AI reads the instruction file on startup and knows to call `ask_about_me` when context about you would help.

Instead of writing:

> "I use Python and TypeScript. I work at Acme Corp. I maintain several open-source projects. Write me a README for this project."

You just write:

> "Write me a README for this project."

...and the AI fetches your profile automatically.

---

## MCP Server Setup

mcp-me defaults to `~/.mcp-me` — no profile path is required in MCP config.

### One-click install

Use the install badges in the [README](../README.md#one-click-install) for Cursor and VS Code. For Claude Desktop, install the `.mcpb` bundle from [GitHub Releases](https://github.com/paladini/mcp-me/releases/latest).

### Manual MCP config

```json
{
  "mcpServers": {
    "me": {
      "command": "npx",
      "args": ["-y", "mcp-me", "serve"]
    }
  }
}
```

VS Code uses the `"servers"` key (see [README](../README.md#vs-code-github-copilot)). Override the profile location with `MCP_ME_PROFILE_DIR` if needed.

---

## AGENTS.md

`AGENTS.md` is read by a growing number of AI agents out of the box, including:

| Agent | Notes |
|---|---|
| **Windsurf (Cascade)** | Reads `AGENTS.md` in the workspace or parent directories |
| **OpenAI Codex** | Official AGENTS.md support |
| **Cline** | Reads `AGENTS.md` when present |
| **Copilot (experimental)** | Some configurations support AGENTS.md |

### Setup

1. Copy the template to your project root:

```bash
cp "$(npm root -g)/mcp-me/templates/AGENTS.md" ./AGENTS.md
```

Or if you cloned the repo:

```bash
cp /path/to/mcp-me/templates/AGENTS.md ./AGENTS.md
```

2. That's it. The next time an agent opens your project, it will see the instructions.

### Template

```markdown
# Agent Instructions

You have access to an MCP server called `me` that exposes my personal profile.

**Always use `ask_about_me` or read the MCP resources below before answering any
request that could benefit from knowing who I am** — writing, code review,
documentation, career questions, open-source contributions, etc.

## Available MCP resources

| Resource | Contains |
|---|---|
| `me://identity` | Name, bio, location, contact, social links |
| `me://career` | Work history, job titles, companies |
| `me://skills` | Programming languages, tools, proficiency levels |
| `me://projects` | Open-source repos, articles, books, npm packages |
| `me://interests` | Hobbies, topics of interest |
| `me://personality` | Traits, values, work style |
| `me://goals` | Short and long-term goals |
| `me://faq` | Pre-answered facts about me |
| `me://writing/style` | Writing format profiles and voice guide (1.1+) |
| `me://writing/corpus` | Published texts manifest (1.1+) |
| `me://writing/samples` | Writing excerpts by format profile (1.1+) |

## Writing and voice (1.1+)

For writing tasks, also use these MCP tools and prompts:

| Tool / Prompt | When to use |
|---|---|
| `get_writing_references(topic, profile)` | Find corpus excerpts before drafting |
| `analyze_writing_style(profile?)` | Stats on tone, sentence length, vocabulary |
| `search_writing_corpus(query)` | Keyword search across local `.md` files |
| `emulate_my_voice` prompt | Generate text in my voice for a topic |
| `rewrite_in_my_voice` prompt | Rewrite text to match my style |
| `get_profile_completeness` | See what's missing from my profile |

**Note:** `ask_about_me` returns structured profile context for the host LLM to interpret — mcp-me does not run an LLM server-side.

## When to proactively load my profile

- Writing or editing any text (articles, READMEs, cover letters, bios)
- Answering questions about my skills, experience, or projects
- Generating code in a language or framework I use
- Recommending tools, libraries, or approaches
- Any task where knowing my background would improve the answer

## The `ask_about_me` tool

Use this tool for natural-language questions about me. Example invocations:

- `ask_about_me("What open-source projects has this person published?")`
- `ask_about_me("What are this person's strongest programming languages?")`
```

---

## GitHub Copilot (`copilot-instructions.md`)

GitHub Copilot reads `.github/copilot-instructions.md` inside any repository when the file is present. This applies to both VS Code (with the Copilot extension) and GitHub.com Copilot Chat.

### Setup

1. Create the `.github/` directory in your project if it doesn't exist:

```bash
mkdir -p .github
```

2. Copy the template:

```bash
cp "$(npm root -g)/mcp-me/templates/.github/copilot-instructions.md" .github/copilot-instructions.md
```

3. Make sure mcp-me is configured in `.vscode/mcp.json` with zero-config args: `["-y", "mcp-me", "serve"]` (see the [main README](../README.md#configure-your-ai-assistant) for the full VS Code setup).

### Global instructions (all projects)

You can also set instructions that apply globally to every VS Code workspace:

1. Open VS Code Settings (`Ctrl+Shift+P` → "Preferences: Open User Settings (JSON)").
2. Add:

```json
{
  "github.copilot.chat.codeGeneration.instructions": [
    {
      "text": "You have access to an MCP server called `me`. Always use `ask_about_me` before answering requests about my skills, career, or projects."
    }
  ]
}
```

---

## What improves with agent instructions

Without agent instructions, each new conversation starts from zero. With mcp-me + instruction files, the AI gains persistent context across all your projects and sessions.

| Task | Without mcp-me | With mcp-me + instructions |
|---|---|---|
| Write a README | Generic template | Tailored to your stack and style |
| Cover letter | Asks for your background | Reads your career and projects automatically |
| Code review | No context on your conventions | Knows your preferred languages and tools |
| Career advice | Generic guidance | Based on your actual experience and goals |
| Article editing | No context on your voice | Knows your writing history and audience |
| Tech recommendations | Generic | Aligned with your current stack |

---

## Combining with other project rules

You can freely combine mcp-me instructions with your own project-specific rules in the same file. For example, an `AGENTS.md` that covers both:

```markdown
# Agent Instructions

## My identity (via mcp-me)

You have access to an MCP server called `me`. Always use `ask_about_me` before
answering any request that could benefit from knowing who I am.

## Project conventions

- Use TypeScript strict mode
- Follow the existing folder structure
- Run `npm test` after every change
```

---

## Template files location

After installing mcp-me, the ready-to-use templates are at:

```
$(npm root -g)/mcp-me/templates/
  AGENTS.md                         ← for Windsurf, Cline, Codex, etc.
  .github/copilot-instructions.md   ← for GitHub Copilot
```

Or in the mcp-me source repository under [`templates/`](https://github.com/paladini/mcp-me/tree/main/templates).
