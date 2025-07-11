# vibe-codex

Simple git hooks in 10 seconds.

## Quick Start

```bash
npx vibe-codex
```

Select rules → Install → Done.

## What It Does

Installs git hooks that:
- 🔒 **Block secrets** - No more accidental API key commits
- 📝 **Check commits** - Enforce consistent commit messages

That's it. No complexity, no magic.

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

## Usage

### Initialize
```bash
npx vibe-codex init
```

### Change Rules
```bash
npx vibe-codex config
```

### Remove
```bash
npx vibe-codex uninstall
```

## Rules

- **Security** - Blocks `password = "secret123"`
- **Commit Format** - Enforces `feat: add feature`
- **Tests** - Runs `npm test` (optional, can be slow)
- **Docs** - Warns if no README
- **Linting** - Runs `npm run lint` (optional)

Most teams just need Security + Commit Format.

## Docs

- [Available Rules](docs/RULES.md)
- [How Hooks Work](docs/HOOKS.md)  
- [Configuration](docs/CONFIGURATION.md)
- [Troubleshooting](docs/TROUBLESHOOTING.md)

## Philosophy

- **Simple** - 2 dependencies, ~700 lines of code
- **Fast** - Installs in seconds
- **Predictable** - No surprises, no magic

## License

MIT