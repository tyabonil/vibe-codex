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

## 🛡️ Dependency Safety (`dependency-safety`)
Checks for known vulnerabilities in project dependencies.
- Scans package-lock.json, yarn.lock, pnpm-lock.yaml
- Supports npm audit, yarn audit, pnpm audit
- Also checks Python (pip-audit) and Ruby (bundle-audit) if tools installed
- Blocks commits when critical/high vulnerabilities found
- Shows vulnerability count by severity

## ✨ Test Quality (`test-quality`)
Prevents common test anti-patterns and maintains test suite reliability.
- Blocks: `.only()`, `.skip()`, empty test descriptions
- Warns: console statements, commented tests, misplaced test files
- Supports: *.test.js, *.spec.js, *.test.ts, *.spec.ts, test_*.py, *_spec.rb
- Helps catch focused tests before they reach CI
- Ensures meaningful test descriptions

## 📏 Context Size Monitoring (`context-size`)
Warns about large changes that might exceed AI context windows.
- Monitors file sizes (default: >1000 lines per file)
- Tracks total changes (default: >5000 lines total)
- Counts files changed (default: >20 files)
- Configurable thresholds via .vibe-codex.json
- Non-blocking warnings with helpful tips
- Helps maintain AI-friendly, reviewable commits

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