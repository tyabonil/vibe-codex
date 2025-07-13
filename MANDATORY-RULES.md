# Mandatory Rules - Deprecated

> **⚠️ This legacy system is deprecated. Use vibe-codex instead.**

## Migration Notice

The mandatory rules system has been replaced by vibe-codex's simplified git hooks approach.

### For New Projects:
```bash
npx vibe-codex init
```

### Available Rules in vibe-codex:
- 🔒 Security checks (no secrets, API keys)
- 📝 Commit message format
- 🧪 Test requirements
- 📚 Documentation requirements
- 🎨 Code style checks
- 🌿 Branch name validation
- 🛡️ Dependency safety
- ✨ Test quality
- 📋 Cursor rules
- 📏 Context size monitoring

### Legacy Information:
If you need the old mandatory rules system, see:
- Original rules: `legacy/cursor-rules/MANDATORY-RULES.md`
- Rule engine: `legacy/cursor-rules/rule-engine.js`

## Why This Changed

The mandatory rules system was overly complex for most use cases. vibe-codex provides the same code quality benefits through simple, optional git hooks that teams can enable as needed.

---

**Note**: This file is kept for backward compatibility with existing workflows. New projects should use `npx vibe-codex` directly.