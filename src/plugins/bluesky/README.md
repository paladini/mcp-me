# Bluesky Plugin

Live Bluesky/AT Protocol feed — recent posts, profile, follower stats.

## Configuration

```yaml
plugins:
  bluesky:
    enabled: true
    handle: "alice.bsky.social"
```

No authentication required — uses the public AT Protocol API.

## Resources

| Resource | URI | Description |
|----------|-----|-------------|
| Profile | `me://bluesky/profile` | Full profile data |
| Feed | `me://bluesky/feed` | Recent posts with likes/reposts |

## Tools

| Tool | Description |
|------|-------------|
| `get_bluesky_posts` | Get recent posts (configurable limit) |
