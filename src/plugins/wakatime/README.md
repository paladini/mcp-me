# WakaTime Plugin

Live coding activity from WakaTime — today's stats, current project, weekly summary.

## Configuration

```yaml
plugins:
  wakatime:
    enabled: true
    username: "your-wakatime-username"
    # api_key_env: "WAKATIME_API_KEY"  # optional, for private profiles
```

## Resources

| Resource | URI | Description |
|----------|-----|-------------|
| Today | `me://wakatime/today` | Today's coding time, languages, projects |
| Stats | `me://wakatime/stats` | Last 7 days coding summary |

## Tools

| Tool | Description |
|------|-------------|
| `get_wakatime_today` | Get today's coding activity breakdown |
