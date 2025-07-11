# Troubleshooting

Common issues and solutions.

## Installation Issues

### "Not a git repository"
**Problem**: Running vibe-codex outside a git repo.
**Solution**: Initialize git first: `git init`

### "Command not found: npx"
**Problem**: npx not installed.
**Solution**: Update npm: `npm install -g npm`

## Hook Issues

### "Syntax error" when committing
**Problem**: Hook has syntax error (fixed in v3.0.1).
**Solution**: Update vibe-codex and reinstall hooks.

### Commits are slow
**Problem**: Test rule is running large test suite.
**Solution**: Disable test rule or move tests to CI.

### "Permission denied"
**Problem**: Hook files not executable.
**Solution**: Run `chmod +x .git/hooks/*`

## Configuration Issues

### Rules not working
**Problem**: Configuration out of sync with hooks.
**Solution**: Run `npx vibe-codex init` to reinstall.

### Can't find .vibe-codex.json
**Problem**: Config file deleted or not created.
**Solution**: Run `npx vibe-codex init` to recreate.

## Uninstall Issues

### Hooks still running after uninstall
**Problem**: Manual hook modifications.
**Solution**: Manually remove `.git/hooks/pre-commit` and `.git/hooks/commit-msg`

## Getting Help

1. Check if issue is listed above
2. Try reinstalling: `npx vibe-codex uninstall && npx vibe-codex init`
3. Report issues: https://github.com/tyabonil/vibe-codex/issues