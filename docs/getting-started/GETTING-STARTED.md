# Getting Started with vibe-codex

## Prerequisites
- Node.js 14 or higher
- Git repository initialized
- npm or yarn package manager

## Installation Steps

### 1. Run the initializer
```bash
npx vibe-codex init
```

### 2. Follow the interactive setup
The CLI will guide you through:
- Selecting your project type
- Choosing modules to install
- Configuring thresholds and rules

### 3. Commit the changes
```bash
git add .
git commit -m "Add vibe-codex configuration"
```

## What Gets Installed?

### Git Hooks
- `pre-commit` - Runs security and lint checks
- `commit-msg` - Validates commit messages
- `pre-push` - Runs tests and coverage

### GitHub Actions (optional)
- `.github/workflows/vibe-codex.yml` - Automated PR checks
- `.github/workflows/deploy-check.yml` - Deployment validation

### Configuration Files
- `.vibe-codex.json` - Your module configuration
- `PROJECT_CONTEXT.md` - Project documentation template

## Next Steps
- Run `npx vibe-codex validate` to check compliance
- Customize rules in `.vibe-codex.json`
- Add team-specific rules in `custom-rules/`