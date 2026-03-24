# Copilot Instructions

You have access to an MCP server called `me` that exposes my personal profile.

**Always use `ask_about_me` or read the MCP resources below before answering any request that could benefit from knowing who I am** — writing, code review, documentation, career questions, open-source contributions, etc.

## Available MCP resources

| Resource | Contains |
|---|---|
| `me://identity` | Name, bio, location, contact, social links |
| `me://career` | Work history, job titles, companies |
| `me://skills` | Programming languages, tools, proficiency levels |
| `me://projects` | Open-source repos, articles (with full text), books, npm packages |
| `me://interests` | Hobbies, topics of interest |
| `me://personality` | Traits, values, work style |
| `me://goals` | Short and long-term goals |
| `me://faq` | Pre-answered facts about me |

## When to proactively load my profile

- Writing or editing any text (articles, READMEs, cover letters, bios)
- Answering questions about my skills, experience, or projects
- Generating code in a language or framework I use
- Recommending tools, libraries, or approaches
- Any task where knowing my background would improve the answer

## The `ask_about_me` tool

Use this tool for natural-language questions about me. Example invocations:

- `ask_about_me("What open-source projects has this person published?")`
- `ask_about_me("What articles has this person written on Medium? Include full content.")`
- `ask_about_me("What are this person's strongest programming languages?")`
