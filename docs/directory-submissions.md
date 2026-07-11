# Directory Submissions Checklist

Track visibility submissions for `mcp-me` across MCP directories and community lists. Update status as submissions are completed.

## Submission Details

Use these details for all directory submissions:

| Field | Value |
|-------|-------|
| **Name** | mcp-me |
| **Title** | mcp-me — Personal Profile for AI |
| **Description** | Expose your personal, professional, educational, and social profile to any AI assistant via MCP. Privacy-first: all data stays local in YAML files. |
| **npm package** | `mcp-me` |
| **MCP Registry name** | `io.github.paladini/mcp-me` |
| **Repository** | https://github.com/paladini/mcp-me |
| **License** | MIT |
| **Transport** | stdio |
| **Install command** | `npx -y mcp-me serve` |
| **Author** | Fernando Paladini |

## Official Registry

| Directory | URL | Status | Notes |
|-----------|-----|--------|-------|
| MCP Registry | https://registry.modelcontextprotocol.io | **Published** | `io.github.paladini/mcp-me` v0.6.0 active (2026-07-10) |

## AI Tool Directories

| Directory | URL | Status | Notes |
|-----------|-----|--------|-------|
| Cursor Directory (Plugin) | https://cursor.directory/plugins/new | **Pushed — login required** | Open Plugins on `main` (a9eb9ab); Auto scan `https://github.com/paladini/mcp-me` after GitHub sign-in |
| Cursor Directory (MCP manual) | https://cursor.directory/mcp/new | Fallback | Manual form if plugin auto-detect is unavailable |
| Glama | https://glama.ai/mcp/servers | **Indexed** | https://glama.ai/mcp/servers/paladini/mcp-me (auto-index + `glama.json`) |
| Smithery | https://smithery.ai/new | **Ready (Chrome)** | Upload `mcp-me.mcpb` at smithery.ai/new after GitHub sign-in; CLI: `smithery mcp publish ./mcp-me.mcpb -n paladini/mcp-me` |
| mcp.so | https://mcp.so/submit | **Ready (Chrome)** | Submit `https://github.com/paladini/mcp-me` after GitHub sign-in; complete draft to publish |
| PulseMCP | https://www.pulsemcp.com | **Pending sync** | Registry active since 2026-07-10; not indexed yet — expect 24–48h auto-sync |

## Community Lists

| List | URL | Status | Notes |
|------|-----|--------|-------|
| awesome-mcp-servers (punkpeye) | https://github.com/punkpeye/awesome-mcp-servers | **Listed** | Already in README |
| awesome-mcp-servers (wong2 / mcpservers.org) | https://github.com/wong2/awesome-mcp-servers | **PR ready** | Branch `add-mcp-me` pushed to fork; open PR in Chrome: https://github.com/paladini/awesome-mcp-servers-1/pull/new/add-mcp-me |
| modelcontextprotocol/servers | https://github.com/modelcontextprotocol/servers | **N/A** | No longer accepts community listings — use MCP Registry instead (already published) |

## awesome-mcp-servers PR Template

```markdown
### mcp-me

- **Description:** Personal profile MCP server — expose your identity, career, skills, projects, and social presence to AI assistants. 329 generators, 13 live plugins, privacy-first local YAML storage.
- **npm:** `mcp-me`
- **Install:** `npx -y mcp-me serve`
- **Repository:** https://github.com/paladini/mcp-me
```

## Post-Publish Verification

After the first `v0.6.0` tag push, verify:

- [x] npm: https://www.npmjs.com/package/mcp-me shows v0.6.0
- [x] MCP Registry: `io.github.paladini/mcp-me` active
- [x] GitHub Release: `mcp-me.mcpb` attached at https://github.com/paladini/mcp-me/releases/tag/v0.6.0
- [x] Glama: https://glama.ai/mcp/servers/paladini/mcp-me returns 200
- [x] awesome-mcp-servers (punkpeye): already listed
- [ ] Cursor deeplink installs successfully (user test)
- [ ] VS Code install link works (user test)
- [ ] Claude Desktop `.mcpb` installs and prompts for profile directory (user test)
- [ ] mcp.so submission (Chrome handoff opened 2026-07-10 — sign in + submit repo URL)
- [ ] Smithery MCPB publish (Chrome handoff opened 2026-07-10 — upload `mcp-me.mcpb`)
- [ ] Cursor Directory plugin submission (Auto GitHub scan at cursor.directory/plugins/new)
- [ ] wong2/awesome-mcp-servers PR (branch ready — click Create PR in Chrome)
- [ ] PulseMCP auto-index (registry active 2026-07-10; not indexed yet — wait 24–48h)

## Social Launch (Optional)

- [ ] Product Hunt launch post drafted
- [ ] Hacker News "Show HN" post drafted
- [ ] Dev.to / blog post about digital identity layer for AI
- [ ] README badges for npm version and MCP Registry
