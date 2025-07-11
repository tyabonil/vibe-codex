# Git Hooks

vibe-codex installs simple git hooks to enforce rules.

## Installed Hooks

### pre-commit
Runs before each commit is created.
- Executes security checks
- Runs tests (if enabled)
- Checks documentation (if enabled)
- Runs linting (if enabled)

### commit-msg
Validates the commit message format.
- Checks conventional commit format (if enabled)
- Provides helpful error messages

## How It Works

1. When you run `git commit`, git triggers the hooks
2. Hooks run the checks based on your configuration
3. If checks fail, the commit is blocked
4. Fix the issues and try again

## Manual Testing

Test the pre-commit hook:
```bash
git add .
git commit -m "test"
```

Test the commit-msg hook:
```bash
git commit -m "bad message format"
```

## Bypassing Hooks

In emergencies, you can bypass hooks:
```bash
git commit --no-verify -m "emergency fix"
```

Use sparingly - hooks exist to maintain code quality.

## Uninstalling

To remove hooks:
```bash
npx vibe-codex uninstall
```

This restores any backed-up original hooks.