# 📝 Issue Reminder System

The vibe-codex repository includes a comprehensive system to ensure developers maintain proper issue documentation throughout the development lifecycle.

## Overview

The system consists of three components working together:
1. **Git Hooks** - Local reminders during development
2. **GitHub Actions** - Automated PR validation and reminders
3. **PR Template** - Checkbox reminders for developers

## Components

### 1. Git Hooks

Three hooks provide timely reminders:

#### Post-commit Hook (`issue-reminder-post-commit.sh`)
- Triggers after each commit
- Reminds to update issue on first commit
- Provides quick commands to update issues

#### Pre-commit Hook (`issue-reminder-pre-commit.sh`) 
- Checks if working on an issue branch
- Reminds about commit message format
- Non-blocking (informational only)

#### Pre-push Hook (`issue-reminder-pre-push.sh`)
- Reminds to create PR if pushing without one
- Checks for issue linking
- Provides PR creation commands

### 2. GitHub Action (`issue-pr-linking.yml`)

Automated validation that:
- Monitors PR creation and updates
- Checks if linked issue has PR reference
- Posts reminder comments on PRs missing issue links
- Monitors review events and reminds to update issues
- Automatically removes reminders once compliance is met

**Key Features:**
- Non-blocking (won't prevent merging)
- Self-cleaning (removes outdated reminders)
- Handles multiple PR lifecycle events

### 3. PR Template

The pull request template includes:
- Issue update checklist
- Reminders about mandatory updates
- Quick reference to rules

## Installation

### Quick Setup
```bash
# Run the setup script
./setup-issue-reminders.sh
```

### Manual Setup
```bash
# Copy hooks to git directory
cp hooks/issue-reminder-*.sh .git/hooks/
chmod +x .git/hooks/issue-reminder-*
```

### Configuration

Reminders can be configured via environment variables:

```bash
# Disable all reminders temporarily
export ISSUE_REMINDER_ENABLED=false

# Or edit .git/issue-reminders.config
ISSUE_REMINDER_ENABLED=true
REMIND_ON_FIRST_COMMIT=true
REMIND_ON_PUSH=true
```

## Usage Examples

### Typical Workflow

1. **Start work on issue #123**
   ```bash
   git checkout -b feature/issue-123-add-feature
   ```

2. **Make first commit**
   ```bash
   git commit -m "feat: initial implementation"
   # Hook reminds: "Don't forget to update issue #123!"
   ```

3. **Update the issue**
   ```bash
   gh issue comment 123 --body "Started implementation in feature/issue-123-add-feature"
   ```

4. **Push changes**
   ```bash
   git push
   # Hook reminds: "Remember to create a PR and link it to issue #123"
   ```

5. **Create PR**
   - PR template includes checklist
   - GitHub Action validates linking

6. **Receive review**
   - Action posts reminder to update issue with feedback

## Benefits

1. **Maintains Context** - Issues stay updated with current progress
2. **Improves Communication** - Team knows status without checking PRs
3. **Creates Audit Trail** - Historical record of decisions
4. **Reduces Context Switching** - Reminders at natural breakpoints
5. **Self-Documenting** - Issues become comprehensive project logs

## Troubleshooting

### Hooks Not Running
```bash
# Check if hooks are executable
ls -la .git/hooks/
# Should show executable permissions (x)

# Fix permissions
chmod +x .git/hooks/issue-reminder-*
```

### Too Many Reminders
```bash
# Temporarily disable
export ISSUE_REMINDER_ENABLED=false

# Or remove specific hooks
rm .git/hooks/post-commit
```

### GitHub Action Not Working
- Check repository permissions
- Ensure workflow file is in `.github/workflows/`
- Check Actions tab for error logs

## Best Practices

1. **Update issues immediately** when reminded
2. **Be specific** in issue updates
3. **Link all related resources** (PRs, commits, discussions)
4. **Document decisions** and trade-offs
5. **Close loop** - update issue when PR is merged

## Future Enhancements

Potential improvements:
- Slack/email notifications for stale issues
- Analytics on issue update patterns  
- Integration with project boards
- Custom reminder schedules
- Team-specific configurations

---

*The Issue Reminder System helps enforce the MANDATORY-RULES.md requirement that "GitHub issues are the single source of truth for all work."*