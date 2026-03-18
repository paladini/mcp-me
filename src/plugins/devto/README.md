# DEV.to Plugin

Live article stats and latest posts from DEV.to.

## Configuration

```yaml
plugins:
  devto:
    enabled: true
    username: "your-devto-username"
    # api_key_env: "DEVTO_API_KEY"  # optional, for higher rate limits
```

## Resources

| Resource | URI | Description |
|----------|-----|-------------|
| Articles | `me://devto/articles` | Latest articles with reactions and comments |
| Stats | `me://devto/stats` | Aggregate stats (total articles, reactions, comments) |

## Tools

| Tool | Description |
|------|-------------|
| `get_devto_latest` | Get most recent articles (configurable limit) |
