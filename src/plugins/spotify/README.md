# Spotify Plugin

Integrates with the Spotify Web API to provide music taste, top artists, top tracks, and listening history.

## Configuration

Add to your `plugins.yaml`:

```yaml
plugins:
  spotify:
    enabled: true
    client_id_env: "SPOTIFY_CLIENT_ID"
    client_secret_env: "SPOTIFY_CLIENT_SECRET"
    refresh_token_env: "SPOTIFY_REFRESH_TOKEN"
    top_artists_limit: 20          # optional, default: 20
    top_tracks_limit: 20           # optional, default: 20
    recently_played_limit: 20      # optional, default: 20
    time_range: "medium_term"      # optional: short_term (4w), medium_term (6m), long_term (years)
```

## Authentication

This plugin requires Spotify OAuth2 credentials:

1. Create an app at [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Set the redirect URI to `http://localhost:8888/callback`
3. Get your Client ID and Client Secret
4. Obtain a refresh token using the [Authorization Code Flow](https://developer.spotify.com/documentation/web-api/tutorials/code-flow)

Set the environment variables:

```bash
export SPOTIFY_CLIENT_ID="your_client_id"
export SPOTIFY_CLIENT_SECRET="your_client_secret"
export SPOTIFY_REFRESH_TOKEN="your_refresh_token"
```

## Resources

| Resource | URI | Description |
|----------|-----|-------------|
| Top Artists | `me://spotify/top-artists` | Top artists by listening frequency |
| Top Tracks | `me://spotify/top-tracks` | Top tracks by listening frequency |
| Recently Played | `me://spotify/recently-played` | Recently played tracks |

## Tools

| Tool | Description |
|------|-------------|
| `get_spotify_now_playing` | Get the currently playing (or most recently played) track |
| `get_spotify_music_taste` | Get a music taste summary with top genres and artists |
