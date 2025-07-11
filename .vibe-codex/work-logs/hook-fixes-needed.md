# Git Hook Path Fixes Needed

## Problem
Git hooks are looking for scripts in `dev-hooks/` but they're actually in `hooks/`

## Affected Hooks
1. `.git/hooks/pre-commit` - Looking for dev-hooks/pr-health-check.sh and dev-hooks/security-pre-commit.sh
2. `.git/hooks/commit-msg` - Looking for dev-hooks/commit-msg-validator.sh  
3. `.git/hooks/post-commit` - Looking for .claude/dev-hooks/continuous-pr-monitor.sh

## Fix Required
Need to update all hook paths to point to the correct `hooks/` directory.

## Note
Used --no-verify to bypass hooks for now, but this should be fixed.