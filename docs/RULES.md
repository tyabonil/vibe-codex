# Available Rules

vibe-codex provides simple, essential rules for development:

## 🔒 Security (`security`)
Prevents committing secrets and sensitive information.
- Scans for API keys, passwords, tokens
- Blocks commits containing hardcoded credentials
- Simple pattern matching: `api_key = "..."`, `password = "..."`

## 📝 Commit Format (`commit-format`)
Enforces conventional commit messages.
- Format: `type(scope): description`
- Types: feat, fix, docs, style, refactor, test, chore, perf, ci, build, revert
- Example: `feat(auth): add login functionality`

## 🧪 Testing (`testing`)
Runs tests before commits (if configured).
- Only runs if `package.json` has a `test` script
- Blocks commit if tests fail
- Note: Can be slow for large test suites

## 📚 Documentation (`documentation`)
Checks for basic documentation.
- Warns if no README.md exists
- Non-blocking (just a warning)

## 🎨 Code Style (`code-style`)
Runs linting checks (if configured).
- Only runs if `package.json` has a `lint` script
- Shows warnings but doesn't block commits

## 🌿 Branch Name Validation (`branch-validation`)
Enforces consistent branch naming conventions.
- Validates branch names before push
- Default patterns: `feature/*`, `fix/*`, `bugfix/*`, `docs/*`, etc.
- Supports issue-based naming: `feature/issue-123-description`
- Configurable via `.vibe-codex.json`
- Max length: 50 characters

## Selecting Rules

During setup, you can choose which rules to enable:
```
✓ 🔒 Security checks (recommended)
✓ 📝 Commit message format
  🧪 Test requirements
  📚 Documentation requirements
  🎨 Code style checks
```

Most projects only need security and commit format rules.