# vibe-codex

Smart git hooks for better code quality in 10 seconds.

## Quick Start

```bash
npx vibe-codex
```

Select rules → Install → Done.

## What It Does

vibe-codex helps enforce code quality standards through automated git hooks:

- 🔒 **Security Checks** - Prevents accidental commits of API keys, passwords, and secrets
- 📝 **Commit Format** - Enforces conventional commit messages for better history
- 🧪 **Test Requirements** - Runs tests before commits (optional)
- 📚 **Documentation** - Checks for README.md and basic docs
- 🎨 **Code Style** - Runs linting checks if configured

Most teams start with Security + Commit Format - the rest are optional.

## Installation

### Option 1: NPX (Recommended)
```bash
npx vibe-codex
```

### Option 2: Global Install
```bash
npm install -g vibe-codex
vibe-codex
```

### Option 3: Add to Project
```bash
npm install --save-dev vibe-codex
npx vibe-codex init
```

## Usage

### Interactive Menu
```bash
npx vibe-codex
```

Choose from:
- 🚀 Initialize - Set up hooks in your project
- ⚙️ Configure - Modify rules and settings
- 📋 View - See current configuration
- 🗑️ Uninstall - Remove hooks cleanly

### Direct Commands

**Initialize with defaults:**
```bash
npx vibe-codex init
```

**Change rules:**
```bash
npx vibe-codex config
```

**Remove completely:**
```bash
npx vibe-codex uninstall
```

## Rules Explained

### 🔒 Security (Recommended)
Scans commits for common secret patterns:
- API keys: `api_key = "sk-1234..."`
- Passwords: `password = "secret123"`
- Tokens: `token = "ghp_xxxx..."`
- Prevents committing `.env` files (except `.env.example`)

### 📝 Commit Format (Recommended)
Enforces [Conventional Commits](https://www.conventionalcommits.org/):
```
type(scope): description

feat: add new feature
fix(auth): resolve login bug
docs: update README
```

Valid types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`, `perf`, `ci`, `build`, `revert`

### 🧪 Testing (Optional)
- Runs `npm test` before allowing commits
- Only active if `test` script exists in package.json
- Can slow down commits for large test suites

### 📚 Documentation (Optional)
- Warns if no README.md exists
- Non-blocking - just displays a warning
- Helps maintain basic project documentation

### 🎨 Code Style (Optional)
- Runs `npm run lint` if available
- Shows linting errors but doesn't block commits
- Helps maintain consistent code style

## Configuration

Settings are stored in `.vibe-codex.json`:

```json
{
  "version": "3.0.0",
  "gitHooks": true,
  "githubActions": false,
  "rules": ["security", "commit-format"]
}
```

## Features

### Git Hooks
- **pre-commit**: Runs security, test, and style checks
- **commit-msg**: Validates commit message format
- Backs up existing hooks before installing
- Restores originals on uninstall

### GitHub Actions (Experimental)
- Optional workflow for CI/CD integration
- Runs the same checks on pull requests
- Enable during setup or via config

## Advanced Usage

### Customizing Commit Types
Edit `.vibe-codex.json` to add custom commit types:
```json
{
  "commitTypes": ["feat", "fix", "custom-type"]
}
```

### Skipping Hooks
In emergencies, bypass hooks with:
```bash
git commit --no-verify -m "emergency: fix critical issue"
```

### Project-Specific Rules
Different rules for different projects:
```bash
# Frontend project
npx vibe-codex init  # Enable all rules

# Backend API
npx vibe-codex init  # Just security + commits

# Documentation
npx vibe-codex init  # Just commit format
```

## Troubleshooting

### Hooks Not Running
```bash
# Check if hooks are installed
ls -la .git/hooks/

# Reinstall
npx vibe-codex uninstall
npx vibe-codex init
```

### Tests Timing Out
Disable test rule or increase timeout in package.json:
```json
{
  "scripts": {
    "test": "jest --maxWorkers=2"
  }
}
```

### Permission Errors
```bash
# Fix hook permissions
chmod +x .git/hooks/pre-commit
chmod +x .git/hooks/commit-msg
```

## Philosophy

- **Simple** - Minimal dependencies, straightforward code
- **Fast** - Installs in seconds, runs quickly
- **Flexible** - Choose only the rules you need
- **Non-invasive** - Easy to install, easy to remove

## Documentation

- [Available Rules](docs/RULES.md) - Detailed rule descriptions
- [How Hooks Work](docs/HOOKS.md) - Technical details
- [Configuration](docs/CONFIGURATION.md) - Advanced settings
- [Troubleshooting](docs/TROUBLESHOOTING.md) - Common issues

## Contributing

Issues and PRs welcome! See [CONTRIBUTING.md](CONTRIBUTING.md).

## License

MIT © 2024

---

**Note**: vibe-codex is designed for simplicity. For complex rule systems, consider tools like Husky + lint-staged. For basic quality checks that just work, vibe-codex has you covered.