# GitLab Plugin

Live GitLab projects, merge requests, and activity via the GitLab REST API v4.

## Resources

| Resource | URI | Description |
|---|---|---|
| Profile | `me://gitlab/profile` | GitLab user profile |
| Projects | `me://gitlab/projects` | Public projects sorted by activity |
| Activity | `me://gitlab/activity` | Recent events (pushes, MRs, comments) |

## Tools

| Tool | Description |
|---|---|
| `get_gitlab_projects` | List projects with optional topic and min_stars filters |

## Configuration

```yaml
# .mcp-me.yaml
plugins:
  gitlab:
    enabled: true
    username: your-username
    instance_url: https://gitlab.com    # or self-hosted GitLab
    token_env: GITLAB_TOKEN             # optional: for private repos
    max_projects: 30
```

## Auth

- **Public data**: No auth needed
- **Private repos/MRs**: Set `token_env` to an env var containing a [Personal Access Token](https://gitlab.com/-/user_settings/personal_access_tokens) with `read_api` scope
