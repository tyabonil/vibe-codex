# 📝 Issue Reminder System

## Overview

The Issue Reminder System automates compliance with MANDATORY-RULES.md requirements for issue tracking and communication. It provides non-intrusive reminders to update issues with plans, progress, and PR links at key workflow points.

## System Components

### 1. Git Hooks
- **Pre-commit**: Reminds about issue updates before commits
- **Post-commit**: Reminds about implementation plans after first commits
- **Pre-push**: Reminds about PR creation and issue linking

### 2. GitHub Actions
- **Issue-PR Linking**: Automated validation and reminders for PR-issue connections
- **Non-blocking**: Provides guidance without preventing merges

### 3. Configuration
- **Configurable**: Enable/disable reminders via `config/rules.json`
- **Flexible**: Adjust reminder frequency and behavior

## Rule Compliance Coverage

The system enforces these MANDATORY-RULES.md requirements:

### Level 2: Workflow Integrity
- ✅ **Line 19**: "Before starting work, your first action MUST be to comment on the issue with a detailed plan of action"
- ✅ **Line 20**: "After creating a PR, you MUST comment on the issue with a link to the PR"
- ✅ **Line 21**: "When a PR is blocked, you MUST comment on the issue stating why it is blocked"
- ✅ **Line 22**: "After addressing PR feedback, you MUST comment on the issue summarizing the fixes"
- ✅ **Line 23**: "Before closing an issue, you MUST add a final comment summarizing the resolution and linking to the final PR"

## Installation

The issue reminder hooks are automatically included when you install vibe-codex:

```bash
# Standard installation includes issue reminders
curl -sSL https://raw.githubusercontent.com/tyabonil/vibe-codex/main/install-rule-checker.sh | bash
```

### Manual Installation

If you want to install only the issue reminder components:

```bash
# Copy the hook files
cp hooks/issue-reminder-pre-commit.sh .git/hooks/issue-reminder-pre-commit
cp hooks/issue-reminder-post-commit.sh .git/hooks/issue-reminder-post-commit  
cp hooks/issue-reminder-pre-push.sh .git/hooks/issue-reminder-pre-push

# Make them executable
chmod +x .git/hooks/issue-reminder-*

# Copy GitHub Actions workflow
mkdir -p .github/workflows
cp .github/workflows/issue-pr-linking.yml .github/workflows/
```

## Configuration

### Basic Configuration

Edit `config/rules.json` to customize issue reminder behavior:

```json
{
  "issue_reminders": {
    "enabled": true,
    "reminder_frequency": "daily",
    "check_recent_activity": true,
    "activity_threshold_hours": 24,
    "non_blocking": true,
    "hooks": {
      "pre_commit": true,
      "post_commit": true,
      "pre_push": true
    },
    "github_actions": {
      "enabled": true,
      "auto_remind": true,
      "remove_resolved_reminders": true
    }
  }
}
```

### Environment Variables

You can also configure via environment variables:

```bash
# Enable/disable issue reminders
export ISSUE_REMINDER_ENABLED=true

# Set activity threshold (hours)
export ISSUE_REMINDER_THRESHOLD=24

# Enable/disable activity checking
export ISSUE_REMINDER_CHECK_ACTIVITY=true
```

### Configuration Options

| Option | Default | Description |
|--------|---------|-------------|
| `enabled` | `true` | Master switch for all issue reminders |
| `reminder_frequency` | `"daily"` | How often to show reminders |
| `check_recent_activity` | `true` | Check for recent issue comments |
| `activity_threshold_hours` | `24` | Hours to consider "recent" activity |
| `non_blocking` | `true` | Reminders don't prevent commits/pushes |
| `hooks.pre_commit` | `true` | Enable pre-commit issue reminders |
| `hooks.post_commit` | `true` | Enable post-commit plan reminders |
| `hooks.pre_push` | `true` | Enable pre-push PR reminders |
| `github_actions.enabled` | `true` | Enable GitHub Actions integration |
| `github_actions.auto_remind` | `true` | Automatically add reminder comments |
| `github_actions.remove_resolved_reminders` | `true` | Remove reminders when resolved |

## Workflow Integration

### Developer Workflow

1. **Create Issue Branch**:
   ```bash
   git checkout -b feature/issue-123-add-feature
   ```

2. **First Commit** (triggers reminders):
   ```bash
   git commit -m "feat: start implementing feature"
   # → Post-commit hook reminds about implementation plan
   ```

3. **Push Changes** (triggers reminders):
   ```bash
   git push -u origin feature/issue-123-add-feature
   # → Pre-push hook reminds about PR creation
   ```

4. **Create PR**:
   ```bash
   gh pr create --title "feat: Add new feature (#123)"
   # → GitHub Actions validates issue-PR linking
   ```

5. **Update Issue**:
   ```bash
   gh issue comment 123 --body "Created PR #456: https://github.com/org/repo/pull/456"
   # → Removes automated reminders
   ```

### Reminder Types

#### Pre-commit Reminders
- **When**: Before each commit
- **Checks**: Recent issue activity, branch naming
- **Actions**: Reminds to update issue with progress

#### Post-commit Reminders  
- **When**: After successful commits
- **Checks**: First commit detection, implementation plan existence
- **Actions**: Reminds about detailed planning requirement

#### Pre-push Reminders
- **When**: Before pushing to remote
- **Checks**: PR existence, issue-PR linking
- **Actions**: Reminds about PR creation and linking

#### GitHub Actions Reminders
- **When**: PR creation, issue comments
- **Checks**: Issue-PR link validation
- **Actions**: Adds/removes automated reminder comments

## Command Reference

### Issue Management Commands

```bash
# Comment on issue with implementation plan
gh issue comment 123 --body "**Implementation Plan**
- Analysis of requirements
- Proposed approach and timeline  
- Testing strategy
- Risk mitigation"

# Link PR to issue
gh issue comment 123 --body "Created PR #456: https://github.com/org/repo/pull/456"

# Update progress
gh issue comment 123 --body "Progress update: Completed authentication module"

# Summarize resolution
gh issue comment 123 --body "**Resolution Summary**
- Implemented feature X with approach Y
- All tests passing
- Documentation updated
- Ready for production"
```

### Hook Testing Commands

```bash
# Test pre-commit reminder
hooks/issue-reminder-pre-commit.sh

# Test post-commit reminder  
hooks/issue-reminder-post-commit.sh

# Test pre-push reminder
hooks/issue-reminder-pre-push.sh
```

## Troubleshooting

### Common Issues

#### 1. Reminders Not Showing
**Symptoms**: No reminder messages during git operations
**Solutions**:
- Check if reminders are enabled: `grep -A5 issue_reminders config/rules.json`
- Verify hooks are executable: `ls -la .git/hooks/issue-reminder-*`
- Check environment variables: `echo $ISSUE_REMINDER_ENABLED`

#### 2. GitHub API Errors
**Symptoms**: "gh CLI not authenticated" messages
**Solutions**:
- Authenticate GitHub CLI: `gh auth login`
- Check authentication: `gh auth status`
- Verify repository access: `gh repo view`

#### 3. False Positive Reminders
**Symptoms**: Reminders show even when issue is updated
**Solutions**:
- Check activity threshold: increase `activity_threshold_hours` in config
- Verify issue comments are from correct user account
- Use proper keywords in comments ("plan", "implementation", etc.)

#### 4. Branch Name Not Recognized
**Symptoms**: "Branch doesn't follow issue convention" warnings
**Solutions**:
- Use correct format: `feature/issue-123-description`
- Check branch naming patterns in `config/rules.json`
- Ensure issue number matches existing GitHub issue

### Debug Mode

Enable detailed logging for troubleshooting:

```bash
# Enable debug output
export DEBUG_ISSUE_REMINDERS=true

# Test with verbose output
hooks/issue-reminder-pre-commit.sh
```

### Configuration Validation

Validate your configuration:

```bash
# Check configuration syntax
python -m json.tool config/rules.json

# Test issue reminder settings
node -e "console.log(JSON.parse(require('fs').readFileSync('config/rules.json')).issue_reminders)"
```

## Best Practices

### For Developers

1. **Use Descriptive Branch Names**:
   ```bash
   # ✅ Good
   git checkout -b feature/issue-123-add-user-authentication
   
   # ❌ Bad  
   git checkout -b feature-branch
   ```

2. **Update Issues Regularly**:
   - Comment with implementation plan before coding
   - Update progress at major milestones
   - Link PRs immediately after creation
   - Summarize resolution when closing

3. **Respond to Reminders Promptly**:
   - Address reminders as they appear
   - Don't accumulate multiple pending updates
   - Use provided command examples for consistency

### For Teams

1. **Consistent Workflow**:
   - Train team on issue-driven development
   - Establish templates for implementation plans
   - Use standard PR linking format

2. **Configuration Management**:
   - Adjust reminder frequency based on team velocity
   - Customize activity threshold for team workflow
   - Monitor and optimize based on feedback

3. **Integration Monitoring**:
   - Review GitHub Actions results regularly
   - Address systematic reminder issues
   - Update configuration based on team feedback

## Integration with Other Tools

### IDE Integration

**VS Code**: Add to `.vscode/tasks.json`:
```json
{
  "tasks": [
    {
      "label": "Update Issue Progress", 
      "type": "shell",
      "command": "gh issue comment ${input:issueNumber} --body '${input:progressUpdate}'"
    }
  ]
}
```

**Cursor IDE**: Natural integration with AI assistant for automated issue updates.

### CI/CD Integration

**GitHub Actions**: The issue-PR linking workflow integrates automatically.

**GitLab CI**: Add to `.gitlab-ci.yml`:
```yaml
issue_reminder_check:
  stage: validate
  script:
    - hooks/issue-reminder-pre-commit.sh
  allow_failure: true
```

### Automation Tools

**Zapier/Make**: Set up automated issue updates based on external triggers.

**GitHub CLI Scripts**: Create custom automation for common update patterns.

## Metrics and Analytics

### Tracking Compliance

Monitor issue update compliance:

```bash
# Check recent issue activity
gh issue list --state all --json number,title,updatedAt,comments

# Analyze PR-issue linking
gh pr list --state all --json number,title,body | jq '.[] | select(.body | contains("#"))'
```

### Team Dashboard

Create dashboards to track:
- Issue update frequency
- PR-issue linking compliance  
- Implementation plan quality
- Resolution documentation completeness

## Future Enhancements

### Planned Features

1. **AI-Powered Updates**: Integration with AI assistants for automatic progress updates
2. **Smart Templates**: Context-aware templates for different update types
3. **Team Analytics**: Dashboard for tracking team compliance and patterns
4. **Integration APIs**: REST APIs for external tool integration

### Customization Options

1. **Custom Reminder Messages**: Personalized reminder templates
2. **Role-Based Reminders**: Different reminders for different team roles
3. **Project-Specific Rules**: Per-project reminder configuration
4. **Advanced Scheduling**: Time-based and event-based reminder triggers

---

**📋 Related Documentation**:
- [MANDATORY-RULES.md](../MANDATORY-RULES.md) - Core rule specification
- [USAGE-GUIDE.md](../USAGE-GUIDE.md) - Complete system usage guide
- [PROJECT_CONTEXT.md](../PROJECT_CONTEXT.md) - Repository architecture details