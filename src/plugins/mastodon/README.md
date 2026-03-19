# Mastodon Plugin

Live Fediverse profile, toots, and engagement stats via the Mastodon API v1.

## Resources

| Resource | URI | Description |
|---|---|---|
| Profile | `me://mastodon/profile` | Username, bio, follower/following counts, toot count |
| Toots | `me://mastodon/toots` | Recent toots with favourites, boosts, replies |

## Tools

| Tool | Description |
|---|---|
| `get_mastodon_posts` | Fetch recent toots with configurable limit and reply filtering |

## Configuration

```yaml
# .mcp-me.yaml
plugins:
  mastodon:
    enabled: true
    handle: user@mastodon.social        # full handle with instance
```

## Auth

No authentication required — uses the public Mastodon API.
