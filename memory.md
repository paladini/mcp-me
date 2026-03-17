# mcp-me Plugins v1 — Development Memory

## Current State
- Branch: `feat/plugins-v1`
- 3 plugins exist (github, spotify, linkedin) — code written, NO tests, NOT bundled properly
- tsup shows `empty-glob` warning: plugins aren't included in the dist bundle
- Plugin loader uses dynamic `import()` which tsup can't resolve at build time

## Critical Bug: Plugin Bundling
The built-in plugins use `import(`../plugins/${name}/index.js`)` which tsup strips out.
**Fix:** Plugins need explicit imports or a different loading strategy for built-in ones.

---

## Plugin Specifications

### 1. GitHub Plugin (exists, needs: tests + bug fixes)
**Proposal:** Expose GitHub profile, repos, languages, and activity via public API.
**Auth:** Optional token via `GITHUB_TOKEN` env var (higher rate limits).
**Data Types:**
| Resource | URI | Data |
|---|---|---|
| Profile | `me://github/profile` | login, name, bio, repos count, followers, location, company |
| Repos | `me://github/repos` | name, description, url, language, stars, forks, topics |
| Activity | `me://github/activity` | event type, repo, date |
| Languages | `me://github/languages` | language name, repo count (sorted) |
**Tools:** `get_github_repos` (filter by language, min_stars)
**Status:** ✅ Code done → 🔲 Tests → 🔲 Bundle fix

### 2. Spotify Plugin (exists, needs: tests)
**Proposal:** Expose music taste via Spotify Web API — top artists, tracks, listening history.
**Auth:** OAuth2 refresh token flow (`SPOTIFY_CLIENT_ID`, `SPOTIFY_CLIENT_SECRET`, `SPOTIFY_REFRESH_TOKEN`).
**Data Types:**
| Resource | URI | Data |
|---|---|---|
| Top Artists | `me://spotify/top-artists` | name, genres, popularity, url |
| Top Tracks | `me://spotify/top-tracks` | name, artist, album, url |
| Recently Played | `me://spotify/recently-played` | track, artist, album, played_at |
**Tools:** `get_spotify_now_playing` (current/last track), `get_spotify_music_taste` (genre summary)
**Status:** ✅ Code done → 🔲 Tests

### 3. LinkedIn Plugin (exists, needs: tests)
**Proposal:** Parse LinkedIn data export JSON for offline professional history.
**Auth:** None (reads local JSON file).
**Data Types:**
| Resource | URI | Data |
|---|---|---|
| Profile | `me://linkedin/profile` | firstName, lastName, headline, summary, location |
| Experience | `me://linkedin/experience` | title, company, location, dates, description |
| Education | `me://linkedin/education` | school, degree, field, dates |
| Skills | `me://linkedin/skills` | skill names list |
**Tools:** `search_linkedin_data` (keyword search across all exported data)
**Status:** ✅ Code done → 🔲 Tests

---

## Execution Plan

### Phase A: Fix plugin bundling (CRITICAL)
1. Change built-in plugin loading from dynamic glob to explicit registry
2. Verify plugins load correctly at runtime

### Phase B: Test existing plugins
3. GitHub plugin tests (mock fetch, test resources/tools)
4. Spotify plugin tests (mock fetch + token refresh)
5. LinkedIn plugin tests (mock file read)

### Phase C: Verify full pipeline
6. Run: lint → typecheck → test → build
7. Commit and push

---

## Loop Log
- **Loop 1:** Created memory.md, starting Phase A (bundling fix)
- **Loop 2:** Fixed plugin bundling — replaced dynamic `import()` with explicit registry. Build no longer shows `empty-glob` warning.
- **Loop 3:** Wrote 34 plugin tests (12 GitHub, 10 Spotify, 12 LinkedIn). Fixed mock fetch pattern matching (longest-match-first). Fixed unused imports. All 80 tests pass.
- **Loop 4:** Full pipeline verified (lint ✅ typecheck ✅ 80 tests ✅ build ✅). CHANGELOG updated. Ready to commit.
- **Loop 5:** Implemented `mcp-me generate --github <username>` command. Created `src/generator.ts` with GitHub API integration (profile, repos with pagination, languages, topics). Auto-generates 9 YAML files. 13 new tests. Tested with real GitHub data (@paladini: 101 repos). Updated README and CHANGELOG. Total: 93 tests passing.
