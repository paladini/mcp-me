## Description

<!-- Brief description of the changes -->

## Type of Change

- [ ] 🐛 Bug fix
- [ ] ✨ New feature
- [ ] 🔌 New plugin
- [ ] 📝 Documentation
- [ ] ♻️ Refactor
- [ ] 🧪 Tests
- [ ] 🔧 Chore

## Checklist

- [ ] I have read the [Contributing Guidelines](CONTRIBUTING.md)
- [ ] My code follows the project's code style
- [ ] I have added tests for my changes
- [ ] All existing tests pass (`npm test`)
- [ ] Type checking passes (`npm run typecheck`)
- [ ] Linting passes (`npm run lint`)
- [ ] I have updated `CHANGELOG.md`
- [ ] I have updated documentation if needed

## Generator Checklist (if adding a generator)

- [ ] Generator implements the `GeneratorSource` interface
- [ ] Generator is registered in `src/generators/index.ts`
- [ ] Generator uses a valid `GeneratorCategory`
- [ ] Generator passes the generator test harness (`npm test`)

## Plugin Checklist (if adding a plugin)

- [ ] Plugin implements the `McpMePlugin` interface
- [ ] Plugin has a `schema.ts` with Zod config validation
- [ ] Plugin has a `README.md` with setup instructions
- [ ] Plugin exports a default factory function
- [ ] Plugin is registered in `src/plugin-engine/loader.ts` `BUILTIN_REGISTRY`
- [ ] Plugin config example added to `templates/.mcp-me.yaml`
- [ ] Plugin passes the plugin test harness (`npm test`)
