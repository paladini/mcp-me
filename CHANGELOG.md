# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- **300 batch generators** bringing total to 342 data sources for `mcp-me generate`
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
