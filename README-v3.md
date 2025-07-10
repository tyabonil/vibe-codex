# vibe-codex v3

> Simple CLI tool to install development rules and git hooks

## Quick Start

```bash
npx vibe-codex
```

This opens an interactive menu where you can:
- Initialize vibe-codex in your project
- Configure rules and hooks
- View current settings
- Uninstall when needed

## What is vibe-codex?

vibe-codex is a lightweight tool that helps enforce development best practices through:
- **Git hooks** - Pre-commit and commit-msg validation
- **GitHub Actions** - Optional CI/CD checks
- **Simple configuration** - Text-based menus, no complex setup

## Installation

### One-time use (recommended)
```bash
npx vibe-codex
```

### Global installation
```bash
npm install -g vibe-codex
vibe-codex
```

## Available Rules

- 🔒 **Security checks** - Prevents committing secrets and API keys
- 📝 **Commit format** - Enforces conventional commit messages
- 🧪 **Test requirements** - Runs tests before commits
- 📚 **Documentation** - Ensures README exists
- 🎨 **Code style** - Runs linting checks

## Usage

### Interactive Mode (Recommended)

Just run:
```bash
npx vibe-codex
```

You'll see a menu like this:
```
What would you like to do?
❯ 🚀 Initialize vibe-codex in this project
  ⚙️  Configure rules and hooks
  📋 View current configuration
  🗑️  Uninstall vibe-codex
  ─────────────
  ❌ Exit
```

### Command Line

```bash
# Initialize with defaults
npx vibe-codex init

# Configure interactively
npx vibe-codex config

# Remove vibe-codex
npx vibe-codex uninstall

# Show help
npx vibe-codex help
```

## Configuration

vibe-codex stores its configuration in `.vibe-codex.json`:

```json
{
  "version": "3.0.0",
  "gitHooks": true,
  "githubActions": false,
  "rules": ["security", "commit-format"],
  "created": "2024-01-10T10:00:00.000Z"
}
```

## Git Hooks

When enabled, vibe-codex installs:

### pre-commit
- Security scanning for secrets
- Test execution (if configured)
- Documentation checks
- Code style validation

### commit-msg
- Validates commit message format
- Ensures conventional commits

## GitHub Actions

When enabled, creates `.github/workflows/vibe-codex.yml` with checks that run on:
- Push to main/master/develop
- Pull requests

## Migration from v2

If you have an existing vibe-codex v2 installation:

```bash
node scripts/migrate-to-v3.js
```

This will:
- Backup your old configuration
- Convert to the new format
- Clean up old files

## Minimal Dependencies

vibe-codex v3 uses only 2 dependencies:
- `chalk` - Terminal colors
- `inquirer` - Interactive prompts

## License

MIT