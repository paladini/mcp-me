# Last.fm Plugin

Live Last.fm listening data — now playing, recent scrobbles, and top artists/tracks.

## Resources

| Resource | URI | Description |
|---|---|---|
| Profile | `me://lastfm/profile` | User profile info and stats |
| Recent | `me://lastfm/recent` | Recent scrobbles with now-playing indicator |
| Top Artists | `me://lastfm/top-artists` | Top artists by play count (12-month default) |

## Tools

| Tool | Description |
|---|---|
| `get_lastfm_now_playing` | Check what the user is currently listening to |
| `get_lastfm_top` | Get top artists or tracks for a configurable time period |

## Configuration

```yaml
# .mcp-me.yaml
plugins:
  lastfm:
    enabled: true
    username: your-username
    api_key_env: LASTFM_API_KEY         # optional: for full scrobble data
```

## Auth

- **Basic data**: Works without API key for public profiles
- **Full data**: Set `api_key_env` to an env var containing a [Last.fm API key](https://www.last.fm/api/account/create)
