# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.1.0] - 2026-07-15

### Added

- **Writing dimension** — `writing/style.yaml` format profiles and `writing/corpus/` for published texts
- **Corpus sync** — Medium, Substack, Blogger, and DEV.to generators write full articles to `writing/corpus/`
- **Writing MCP surface** — Resources `me://writing/style`, `me://writing/corpus`, `me://writing/samples`
- **Writing tools** — `analyze_writing_style`, `search_writing_corpus`, `get_writing_references`
- **Writing prompts** — `describe_my_writing`, `emulate_my_voice`, `rewrite_in_my_voice`
- **CLI commands** — `mcp-me sync-corpus`, `mcp-me analyze-writing`, `--no-corpus` flag on generate
- **Profile completeness** — `get_profile_completeness` tool with domain scores and generator suggestions
- **Open Plugins** — `voice-writer` and `style-analyst` agents, `writing-voice` skill, `match-voice` rule, `/emulate-voice` command

### Changed

- **`ask_about_me`** — Description clarifies it returns context for the host LLM (not server-side Q&A)

## [1.0.0] - 2026-07-15

### Added

- **Stable API declaration** — 8 core YAML schemas, MCP core surface, and `McpMePlugin` interface declared stable
- **Identity fields** — Optional `headline` and `physical` (opt-in) in `identity.yaml`
- **Schema fix** — `interests.topics` officially supported (generators already wrote this field)
- **Documentation** — `docs/identity-model.md`, `docs/generator-tiers.md`, `docs/migration-1.0.md`
- **Integration tests** — CLI, MCP server, and config-generate test suites
- **Plugin tests** — Behavioral tests for devto and wakatime plugins

### Changed

- **Plugin config docs** — Clarified `plugins.yaml` is legacy; use `.mcp-me.yaml`
- **Spotify plugin docs** — Aligned tool/resource names with implementation

## [0.6.0] - 2026-07-09

### Added

- **Default profile directory** — CLI commands (`init`, `serve`, `validate`, `generate`) now default to `~/.mcp-me`; override with `MCP_ME_PROFILE_DIR` or an explicit path argument
- **Official MCP Registry** — `server.json` for publishing to registry.modelcontextprotocol.io; `mcpName` field in `package.json`
- **One-click install** — Cursor deeplink badge and VS Code MCP install link in README; `npm run generate:install-links` script
- **Claude Desktop Extension** — `.mcpb` bundle via `mcpb/manifest.json` and `npm run pack:mcpb`; attached to GitHub Releases
- **npm Trusted Publishing** — CI workflow uses OIDC instead of `NPM_TOKEN`; `publishConfig.provenance` in `package.json`
- **Publishing docs** — `docs/publishing.md` (maintainer guide) and `docs/directory-submissions.md` (visibility checklist)

### Changed

- **README** — Reworked Installation section with one-click badges, zero-config quick start, and updated AI assistant configuration examples
- **Landing page** — Updated `docs/index.html` with one-click install buttons, zero-config commands, v0.6.0, and new FAQ entries
- **LLM docs** — Updated `llms.txt` and `llms-full.txt` with default profile path, one-click install, and MCP config examples
- **Agent instructions guide** — Updated `docs/ai-instructions.md` with zero-config MCP setup section
- **CLI next-steps messages** — Simplified to `mcp-me validate` / `mcp-me serve` without requiring a path

## [0.5.0] - 2026-06-04

### Added

- **PyPI username-based package discovery** — `pypi: your-username` now auto-discovers all packages you own or maintain via the PyPI XMLRPC `user_packages` API, consistent with how `npm`, `rubygems` and `dockerhub` work. Explicit comma-separated names (`pypi: pkg1,pkg2`) continue to work unchanged. Resolved profiles also populate `identity.contact.social` with the user's PyPI profile URL.
- **DockerHub generator** — `dockerhub: your-username` fetches all your published container images with pull counts, star counts, and descriptions.

### Changed

- **`templates/.mcp-me.yaml`** — PyPI entry now documents both usage modes with inline comments.
- **Blogger backup docs** — clarified in the generated `.mcp-me.yaml` template that `--blogger-backup` imports all posts by default when only the XML path is provided, and that the `::author1,author2` suffix is optional for multi-author filtering.

## [0.4.1] - 2026-03-25

### Fixed

- **`mcp-me init` directory templates** — fixed profile initialization when `templates/` contains directories (such as `.github/`). The command now copies directory entries recursively instead of failing with `cp returned EISDIR`.

## [0.4.0] - 2026-03-25

### Changed

- **Medium generator** — now uses a 4-tier fetch strategy to retrieve all published articles instead of only the last 10 from RSS: (1) unofficial JSON endpoint (`?format=json`) extracts the full post list with word counts, subtitles, and tags, **with full pagination** via `payload.paging.path` + `payload.paging.next`; (2) sitemap XML extraction for robust URL discovery; (3) HTML scraping parses `__NEXT_DATA__`, Apollo state, or raw `href` links as fallback; (4) RSS is used only as a last resort (capped at 10 by Medium). Removed the hard-coded `.slice(0, 10)` limit and updated request headers to browser-like values to reduce 403 blocks.
- **Generator docs and templates** — documentation now covers the native `--blogger-backup` generator in English, including what it is for, how to obtain a Blogger XML export, and how to filter multi-author backups.

### Added

- **Blogger XML backup generator** — added a native `--blogger-backup` generator that reads a local Blogger XML export, optionally filters posts by author name/email using `path::author1,author2,...` syntax, imports matching posts into `projects.yaml` with `category: article`, preserves labels as tags, and adds archive summary FAQ entries.

## [0.2.8] - 2026-03-23

### Added

- **VS Code (GitHub Copilot) setup docs** — added MCP configuration instructions for VS Code in the README "Configure Your AI Assistant" section

### Fixed

- **Writing RSS generators** — `Medium` and `Substack` now preserve article/newsletter body text from RSS feeds, normalize Medium `@username` inputs, and add richer writing summaries instead of storing titles only
- **Goodreads generator depth** — reader mode now stores read books as projects (with ratings, shelves, review summaries, dates), and author mode now captures richer published-book stats (book URLs, ratings, rating counts, bio)
- **Single source of truth for version** — both `src/server.ts` and `src/cli.ts` now import `version` from `package.json` instead of hard-coding it, preventing CLI/server version skew
- **`--force` flag now respected** — `generateProfile` previously overwrote existing YAML files unconditionally; now skips files that already exist and only overwrites when `--force` is passed
- **CLI shebang restored** — `tsup.config.ts` re-adds `#!/usr/bin/env node` banner for `dist/cli.js` so `mcp-me` runs correctly after install on Unix
- **Plugin test harness** — removed duplicated `BUILTIN_FACTORIES` list; harness now imports `BUILTIN_REGISTRY` directly from `src/plugin-engine/loader.ts` (single source of truth)
- **Plugin test harness** — replaced `__dirname` (unavailable in ESM) with `fileURLToPath(import.meta.url)` + `dirname()`
- **Plugin test harness** — LinkedIn minimal config now uses `os.tmpdir()` instead of a hardcoded `/tmp` path for Windows compatibility
- **Plugin test harness** — plugin count assertion upgraded from `>= 8` to exact `toBe(13)` to catch accidental removals
- **Generator test harness** — replaced `__dirname` with `fileURLToPath(import.meta.url)` + `dirname()`
- **Generator test harness** — generator count assertion upgraded from `>= 32` to exact `toBe(328)` to catch registration regressions

### Changed

- **`src/plugin-engine/loader.ts`** — `BUILTIN_REGISTRY` is now exported as a named export (used by the plugin test harness)
- **`src/plugin-engine/index.ts`** — re-exports `BUILTIN_REGISTRY` for external consumers

- **Robust generator fixes** — fixed bugs and upgraded APIs
  - **Medium RSS**: Fixed CDATA tags leaking into YAML output (`<![CDATA[topic]]>` → `topic`)
  - **Gravatar**: Migrated from deprecated JSON API to v3 REST API (SHA256) — now extracts job_title, company, pronouns, verified_accounts, interests, languages
  - **Goodreads**: Fixed ID parsing for composite IDs like `12345.Name` (extracts numeric part)
  - **Strava**: Now requires `STRAVA_TOKEN` env var with clear error message (Strava API requires OAuth)
- **LinkedIn generator** (`--linkedin <json-path>`) — reads LinkedIn data export (JSON) to populate career, skills, education, identity
- **Complete `.mcp-me.yaml` template** — lists all registered generators and all built-in plugins with full config options
- **Unified `.mcp-me.yaml` config file** — separates configuration from profile data
  - `generators:` section replaces CLI flags: `mcp-me generate ./profile` reads sources automatically
  - `plugins:` section replaces `plugins.yaml` (backward compatible — old `plugins.yaml` still works)
  - Template generated by `mcp-me init` with all sources commented out
  - CLI flags still work as override when provided
- **284 batch generators** bringing total to 328 registered generators for `mcp-me generate`
  - **Gaming (19):** speedrun, retroachievements, boardgamegeek, itch.io, rawg, osu, minecraft, roblox, league of legends, valorant, fortnite, apex, overwatch, csgo, pokemon go, moxfield, dndbeyond, board game arena, nexusmods
  - **Music (18):** soundcloud, bandcamp, discogs, genius, mixcloud, listenbrainz, setlist.fm, splice, beatstars, distrokid, audius, songkick, musixmatch, soundtrap, rateyourmusic, kompoz, ultimate guitar, spotify artist
  - **Creative (19):** deviantart, artstation, pixiv, behance, flickr, 500px, sketchfab, society6, redbubble, codepen, observablehq, glitch, codesandbox, replit, figma, canva, openprocessing, shadertoy, three.js
  - **Fitness & Sports (19):** strava, garmin, myfitnesspal, peloton, runkeeper, habitica, alltrails, parkrun, zwift, komoot, fitocracy, coros, espn fantasy, transfermarkt, sofascore, f1, cricket, marathon, yoga
  - **Food & Travel (18):** untappd, vivino, yelp, happycow, allrecipes, cookpad, tripadvisor, nomadlist, foursquare, geocaching, polarsteps, wikiloc, atlas obscura, roame, couchsurfing, beeradvocate, buymeacoffee, whiskybase
  - **Learning & Science (19):** duolingo, coursera, edx, udemy, skillshare, codecademy, freecodecamp, khan academy, brilliant, pluralsight, memrise, ankiweb, italki, lingq, treehouse, researchgate, zenodo, arxiv, google scholar
  - **Entertainment (19):** tmdb, trakt, simkl, tvtime, mydramalist, mubi, storygraph, librarything, bookwyrm, mangadex, novelupdates, podchaser, goodpods, pocketcasts, anchor, podbean, wattpad, royalroad, ao3
  - **Social (19):** tumblr, pinterest, tiktok, instagram, twitter, lemmy, lobsters, tildes, discord, telegram, signal, matrix, linkedin, facebook, snapchat, whatsapp, wechat, line, vk
  - **Maker & Nature (19):** thingiverse, printables, instructables, hackaday, hackster, tindie, adafruit, arduino, inaturalist, ebird, plantnet, zooniverse, gbif, gardenate, observation.org, raspberry pi, home assistant, oshwa, mushroom observer
  - **Finance & Crypto (19):** etherscan, ens, opensea, mirror, farcaster, lens, gitcoin, debank, zora, tradingview, stocktwits, seekingalpha, ko-fi, patreon, gumroad, lemon squeezy, indie hackers, acquire, pioneer
  - **Code Extra (19):** codeforces, atcoder, topcoder, project euler, codingame, dmoj, kattis, rubygems, packagist, nuget, hex.pm, pub.dev, cocoapods, maven, sourcehut, wandb, dagshub, gitea, forgejo
  - **Video (19):** vimeo, dailymotion, peertube, odysee, kick, bilibili, rumble, nebula, floatplane, streamlabs, loom, substack video, youtube shorts, reels, clipchamp, davinci resolve, adobe portfolio, cargo collective, read.cv
  - **Productivity (19):** notion, obsidian publish, raindrop, are.na, pinboard, todoist, linear, grailed, depop, vinted, etsy, shopify, producthunt maker, typefully, convertkit, buttondown, revue, polywork, bio link
  - **Weird & Fun (20):** zodiac, mbti, enneagram, hogwarts house, d&d alignment, color palette, timezone, languages spoken, diet, sleep schedule, coffee/tea, ide, os, keyboard, desk setup, dotfiles, /now page, /uses page, personal site, pronouns
  - **Misc (19):** waze, openstreetmap, wikipedia, stack exchange, meetup, eventbrite, luma, speakerdeck, slideshare, calendly, cal.com, giphy, gravatar profile, about.me, humans.txt, webring, indieweb, mastodon verify, keyoxide
- **Generator factory** (`src/generators/factory.ts`) — `createGenerator()`, `createRssGenerator()`, `createStaticGenerator()` for defining generators in ~10 lines instead of ~60
- **24 generator categories** expanded from 6: gaming, music, creative, fitness, food, travel, learning, science, finance, maker, social, entertainment, podcasts, photography, sports, nature, productivity, crypto
- **10 new generators** expanded the early generator set (historical milestone in this unreleased section)
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
