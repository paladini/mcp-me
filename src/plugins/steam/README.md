# Steam Plugin

Live Steam gaming profile — currently playing, game library, and playtime stats.

## Resources

| Resource | URI | Description |
|---|---|---|
| Profile | `me://steam/profile` | Player name, status, currently playing, country |
| Games | `me://steam/games` | Game library sorted by playtime (top 30) |

## Tools

| Tool | Description |
|---|---|
| `get_steam_recent_games` | Get recently played games with playtime |
| `get_steam_playtime` | Get total gaming stats and top 5 most-played games |

## Configuration

```yaml
# .mcp-me.yaml
plugins:
  steam:
    enabled: true
    steam_id: "76561198000000000"        # Steam64 ID or vanity URL name
    api_key_env: STEAM_API_KEY           # optional: for game library data
```

## Auth

- **Profile/status**: Works with Steam64 ID, no API key needed
- **Game library/playtime**: Set `api_key_env` to an env var containing a [Steam Web API key](https://steamcommunity.com/dev/apikey)

## Finding Your Steam ID

1. Go to your Steam profile page
2. The URL contains your vanity name (e.g. `steamcommunity.com/id/myname`) or Steam64 ID
3. Use [steamid.io](https://steamid.io/) to convert between formats
