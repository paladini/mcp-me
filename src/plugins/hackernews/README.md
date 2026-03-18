# Hacker News Plugin

Live Hacker News submissions, comments, and karma.

## Configuration

```yaml
plugins:
  hackernews:
    enabled: true
    username: "pg"
```

No authentication required — uses the public Firebase API.

## Resources

| Resource | URI | Description |
|----------|-----|-------------|
| Profile | `me://hackernews/profile` | Karma, about, submission count |
| Submissions | `me://hackernews/submissions` | Recent story submissions with scores |

## Tools

| Tool | Description |
|------|-------------|
| `get_hn_karma` | Get current karma and submission count |
