# RULE-WFL-007: Automatic Work Log Updates

**Category**: Workflow  
**Complexity**: Basic  
**Default**: Disabled  
**Hook Type**: Post-commit  
**Performance Impact**: Low  

## Purpose

Automatically update issue work logs with commit information to:
- Maintain complete work history without manual effort
- Track all changes related to an issue
- Optionally update GitHub issues with progress
- Create audit trail of development work

## Problem It Solves

When using work logs (WFL-005), developers often forget to update them after commits. This leads to:
- Incomplete work history
- Lost context about why changes were made
- Manual overhead of updating logs

This rule automates the process, ensuring every commit is logged.

## Implementation

### Hook Behavior
```bash
# Post-commit hook runs after successful commit
# Extracts issue number from branch name
# Appends commit info to work log
# Optionally updates GitHub issue
```

### Work Log Updates Include
- Commit hash and timestamp
- Full commit message
- List of files changed (added/modified/deleted)
- Automatic session management (new day = new session)

## Configuration

### Enable in .vibe-codex.json
```json
{
  "rules": {
    "wfl-007": {
      "enabled": true,
      "options": {
        "auto_update_issue": false,
        "include_diff_stats": true,
        "session_grouping": "daily"
      }
    }
  }
}
```

### Options
- **auto_update_issue**: Also post updates to GitHub issue (requires `gh` CLI)
- **include_diff_stats**: Include file change details in GitHub updates
- **session_grouping**: How to group commits in work logs ("daily" only for now)

## Example Output

### Work Log Update
```markdown
## Session 2 - 2024-07-11

### Commit: abc123f - 2024-07-11 14:30
```
feat: add user authentication

- Implement JWT tokens
- Add login/logout endpoints
- Create auth middleware
```

**Files changed:**
- Added: src/auth/jwt.js
- Added: src/routes/auth.js
- Modified: src/middleware/index.js
- Added: tests/auth.test.js
```

### GitHub Issue Update (if enabled)
```markdown
🔄 **Automated Work Log Update**

**Branch**: `feature/issue-123-auth`
**Commit**: `abc123f` - 2024-07-11 14:30

**Message**:
```
feat: add user authentication

- Implement JWT tokens
- Add login/logout endpoints
- Create auth middleware
```

**Files Changed**:
- 🆕 Added: `src/auth/jwt.js`
- 🆕 Added: `src/routes/auth.js`
- 📝 Modified: `src/middleware/index.js`
- 🆕 Added: `tests/auth.test.js`

---
*This update was generated automatically by vibe-codex WFL-007*
```

## Benefits

1. **Complete History**: Every commit is documented
2. **Zero Overhead**: Happens automatically
3. **Context Preservation**: Links code changes to issues
4. **Audit Trail**: Track who did what when

## Prerequisites

- Must be using WFL-005 (Work Tracking) rule
- Work log must exist for the issue
- Branch must follow issue naming pattern

## Integration

Works best with:
- **WFL-005**: Creates the work logs to update
- **WFL-001**: Issue-driven development
- **CMT-002**: Issue references in commits

## Privacy Note

Work logs are local files not tracked by git by default. Add to `.gitignore` if you want to keep them private:
```
.vibe-codex/work-logs/
```