# Generator Tiers

mcp-me registers **329 generators**. Not all fetch live data — this document explains what each tier means so you can set honest expectations.

## Tiers

| Tier | Definition | What you get |
|------|------------|--------------|
| **Verified** | Real public API + behavioral tests | Rich, accurate profile data |
| **Partial** | Real API, structural tests only | Working data, less test coverage |
| **Static** | User input → placeholder link + FAQ | Social link and a FAQ entry, no fetch |

## Verified generators

These have real API integration and behavioral tests:

| Generator | Category | Data populated |
|-----------|----------|----------------|
| `github` | code | identity, skills, projects, career, interests, faq |
| `gitlab` | code | identity, skills, projects, faq |
| `npm` | packages | projects, faq |
| `devto` | writing | identity, projects, skills, faq |
| `medium` | writing | identity, projects, skills, interests, faq |
| `substack` | writing | identity, projects, faq |
| `blogger-backup` | writing | projects, faq (from XML export) |
| `hashnode` | writing | identity, projects, faq |
| `wordpress` | writing | projects, faq |
| `linkedin` | identity | identity, career, skills, faq (JSON export) |
| `goodreads` | interests | interests, faq |
| `stackoverflow` | code | skills, faq |
| `orcid` | learning | career, projects, faq |
| `semantic-scholar` | learning | projects, faq |
| `openlibrary` | writing | projects, interests, faq |
| `youtube` | writing | projects, faq |

## Partial generators

Real APIs with structural/harness tests:

| Generator | Notes |
|-----------|-------|
| `bluesky` | Public AT Protocol API |
| `reddit` | Public JSON endpoints |
| `mastodon` | Public API |
| `hackernews` | Firebase API |
| `npm` | Registry API |
| `wakatime` | Requires API key |
| `gravatar` | Email hash lookup |
| `keybase` | Public API |

## Static generators (~284)

Batch generators in `batch-*.ts` files accept a username or ID and produce:

- A social link in `identity.contact.social`
- A FAQ entry describing presence on that platform
- Sometimes `interests.topics` tags

They do **not** call external APIs. They are useful for documenting your presence across many platforms when you don't need live data.

Examples: `--notion`, `--obsidian`, `--duolingo`, `--peloton`, `--zodiac`, `--mbti`

## Writing generators and corpus (1.1+)

Verified writing generators (Medium, Substack, Blogger, DEV.to) also sync full article text to `writing/corpus/` when corpus sync is enabled (default). Use `--no-corpus` to opt out.

## Choosing generators

1. Start with **Verified** sources you actually use: `--github`, `--devto`, `--medium`
2. Add **Partial** sources for live social presence
3. Use **Static** generators only to document platform links — not for rich data

Run `mcp-me generate --help` to see all available flags grouped by category.
