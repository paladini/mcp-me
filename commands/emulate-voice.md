# Emulate Voice

Write content in the user's authentic voice using mcp-me writing corpus.

## Usage

```
/emulate-voice <topic> [--profile personal_blog|tech_news|ironic_thread]
```

## Steps

1. Load writing style from `me://writing/style`
2. Get references via `get_writing_references(topic, profile)`
3. Read samples from `me://writing/samples?profile=<profile>`
4. Invoke `emulate_my_voice` prompt with topic and profile
5. Output the generated text

## Examples

- `/emulate-voice Rust async patterns --profile personal_blog`
- `/emulate-voice AI regulation --profile tech_news`
- `/emulate-voice hot take on tabs vs spaces --profile ironic_thread`
