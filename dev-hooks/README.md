# Development Hooks

This directory contains complex hooks used for the development of vibe-codex itself.

## ⚠️ Important Note

These hooks are **NOT** installed by the `npx vibe-codex` tool. They are only for developers working on the vibe-codex project.

## Purpose

These hooks enforce strict development workflows for contributors:
- PR workflow enforcement
- Issue tracking and updates
- Branch naming conventions
- Complex security checks
- Test coverage validation
- And more...

## For vibe-codex Users

If you're using `npx vibe-codex` to install hooks in your project, you can ignore this directory. The tool installs simple, lightweight hooks that focus on:
- Basic security (no secrets)
- Commit message validation
- Optional test running

## For vibe-codex Contributors

To use these development hooks:
1. They are already installed in `.git/hooks/`
2. They reference scripts in this directory
3. Run `bash dev-hooks/update-dev-hooks.sh` if paths need updating

## Hook List

### Workflow Enforcement
- `pr-health-check.sh` - Validates PR status
- `enforce-pr-workflow.sh` - Enforces PR-based development
- `branch-name-validator.sh` - Validates branch naming

### Issue Management
- `issue-progress-tracker.sh` - Tracks issue progress
- `issue-reminder-*.sh` - Various issue reminder hooks
- `pre-issue-close.sh` - Validates before closing issues

### Code Quality
- `enhanced-pre-commit.sh` - Comprehensive pre-commit checks
- `security-pre-commit.sh` - Advanced security scanning
- `test-coverage-validator.sh` - Ensures test coverage

### Utilities
- `install-*.sh` - CLI tool installers
- `monitor-context.sh` - Context monitoring
- `update-restart-context.sh` - Context management

### Maintenance
- `post-merge-cleanup.sh` - Cleans up after merges
- `update-dev-hooks.sh` - Updates hook paths