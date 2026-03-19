# YouTube Plugin

Live YouTube channel data — recent videos, channel stats, and search. Falls back to RSS feed when no API key is provided.

## Resources

| Resource | URI | Description |
|---|---|---|
| Channel | `me://youtube/channel` | Channel info and statistics (requires API key) |
| Videos | `me://youtube/videos` | Recent videos with titles, dates, descriptions |

## Tools

| Tool | Description |
|---|---|
| `get_youtube_videos` | Get recent videos with configurable limit |

## Configuration

```yaml
# .mcp-me.yaml
plugins:
  youtube:
    enabled: true
    channel_id: UCxxxxxxx
    api_key_env: YOUTUBE_API_KEY        # optional: for full channel stats
    max_videos: 20
```

## Auth

- **Videos list**: No auth needed (uses public RSS feed as fallback)
- **Channel stats**: Set `api_key_env` to an env var containing a [YouTube Data API v3 key](https://console.cloud.google.com/apis/credentials)
