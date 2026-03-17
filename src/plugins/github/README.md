# GitHub Plugin

Integrates with the GitHub API to provide repository, contribution, language, and activity data.

## Configuration

Add to your `plugins.yaml`:

```yaml
plugins:
  github:
    enabled: true
    username: "your-github-username"
    token_env: "GITHUB_TOKEN"       # optional, env var with your GitHub token
    include_forks: false             # optional, default: false
    max_repos: 30                    # optional, default: 30
```

## Authentication

A GitHub token is **optional** but recommended to avoid rate limits. Create a [Personal Access Token](https://github.com/settings/tokens) with `public_repo` scope and set it as an environment variable:

```bash
export GITHUB_TOKEN="ghp_your_token_here"
```

## Resources

| Resource | URI | Description |
|----------|-----|-------------|
| Profile | `me://github/profile` | GitHub user profile |
| Repos | `me://github/repos` | Public repositories |
| Activity | `me://github/activity` | Recent public events |
| Languages | `me://github/languages` | Programming languages used |

## Tools

| Tool | Description |
|------|-------------|
| `get_github_repos` | List repos, optionally filtered by language or minimum stars |
