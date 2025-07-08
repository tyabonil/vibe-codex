# Git Hooks

This directory contains automated git hooks that enhance the development workflow.

## Issue Progress Tracker (`issue-progress-tracker.sh`)

Automates issue status updates throughout the development lifecycle.

## PR Review Check (`pr-review-check.sh`)

Automatically fetches and analyzes PR comments for compliance violations.

### Issue Progress Tracker Usage

```bash
./hooks/issue-progress-tracker.sh <action> <issue_number> [message] [pr_number]
```

#### Actions

- `start <issue_number> [message]` - Mark issue as started
- `update <issue_number> <message>` - Add progress update  
- `link-pr <issue_number> <pr_number>` - Link PR to issue
- `complete <issue_number> <pr_number> [message]` - Mark issue complete
- `validate <issue_number>` - Validate issue exists and format
- `auto <action>` - Auto-detect issue from branch for commit/push hooks

#### Examples

```bash
# Start work on an issue
./hooks/issue-progress-tracker.sh start 95 "Beginning work on privacy checkbox fix"

# Add a progress update
./hooks/issue-progress-tracker.sh update 95 "Identified root cause: checkbox styling issue"

# Link a PR to the issue
./hooks/issue-progress-tracker.sh link-pr 95 99

# Complete the issue when PR is merged
./hooks/issue-progress-tracker.sh complete 95 99 "Fix deployed successfully"

# Auto-mode for git hooks
./hooks/issue-progress-tracker.sh auto commit
./hooks/issue-progress-tracker.sh auto push
```

### PR Review Check Usage

```bash
./hooks/pr-review-check.sh [PR_NUMBER] [options]
```

#### Options

- `--auto` - Auto-detect current PR from branch
- `--summary` - Show summary only (no interactive prompts)
- `--violations-only` - Show only compliance violations
- `--json` - Output results in JSON format

#### Examples

```bash
# Review PR #99
./hooks/pr-review-check.sh 99

# Auto-detect PR from current branch
./hooks/pr-review-check.sh --auto

# Show violations summary for PR #99
./hooks/pr-review-check.sh 99 --summary

# Show only violations
./hooks/pr-review-check.sh --auto --violations-only

# Get JSON output for automation
./hooks/pr-review-check.sh 99 --json
```

### Integration with Git Hooks

You can integrate this with git hooks for automatic updates:

```bash
# In .git/hooks/post-commit
#!/bin/bash
./hooks/issue-progress-tracker.sh auto commit

# In .git/hooks/pre-push  
#!/bin/bash
./hooks/issue-progress-tracker.sh auto push
```

### Testing

The hook includes comprehensive tests in `tests/issue-progress-tracker.test.js` that verify:

- Help and usage output
- Input validation for all actions
- Auto-mode functionality
- Error handling scenarios

Run tests with:
```bash
npm test -- tests/issue-progress-tracker.test.js
```