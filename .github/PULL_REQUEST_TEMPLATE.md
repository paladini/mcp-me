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

## Plugin Checklist (if adding a plugin)

- [ ] Plugin implements the `McpMePlugin` interface
- [ ] Plugin has a `schema.ts` with Zod config validation
- [ ] Plugin has a `README.md` with setup instructions
- [ ] Plugin exports a default factory function
- [ ] Plugin is registered in `BUILTIN_PLUGINS` (if built-in)
- [ ] Plugin config example added to `templates/plugins.yaml`
