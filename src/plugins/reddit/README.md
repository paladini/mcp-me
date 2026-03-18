# Reddit Plugin

Live Reddit karma, profile, and recent posts.

## Configuration

```yaml
plugins:
  reddit:
    enabled: true
    username: "your-reddit-username"
```

No authentication required — uses the public Reddit JSON API.

## Resources

| Resource | URI | Description |
|----------|-----|-------------|
| Profile | `me://reddit/profile` | Karma breakdown, account age |
| Posts | `me://reddit/posts` | Recent submissions with scores |

## Tools

| Tool | Description |
|------|-------------|
| `get_reddit_karma` | Get live karma breakdown (post + comment) |
