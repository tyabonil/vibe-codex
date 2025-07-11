# RULE-WFL-006: Pre-Push Conflict Detection

**Category**: Workflow  
**Complexity**: Basic  
**Default**: Enabled  
**Hook Type**: Pre-push  
**Performance Impact**: Low  

## Purpose

Detect merge conflicts BEFORE pushing to remote repositories to:
- Prevent creating PRs that cannot be merged
- Save CI/CD resources
- Reduce review friction
- Maintain clean PR history

## Problem It Solves

Without this rule:
1. Developer pushes branch with conflicts
2. Creates PR
3. CI runs (wasting resources)
4. Review starts
5. Then discovers PR can't be merged
6. Must go back and resolve conflicts
7. Force push breaks review history

With this rule:
1. Developer attempts to push
2. Conflicts detected locally
3. Must resolve before pushing
4. PR is always mergeable

## Implementation

### Hook Behavior
```bash
# Pre-push hook runs before git push
# Checks current branch against target (main/preview)
# Performs dry-run merge to detect conflicts
# Blocks push if conflicts found
```

### Conflict Detection Method
1. Fetches latest target branch
2. Finds merge base
3. Uses `git merge-tree` for dry-run merge
4. Checks for conflict markers
5. Provides clear resolution instructions

## Configuration

### Enable in .vibe-codex.json
```json
{
  "rules": {
    "workflow": {
      "pre-push-conflict-detection": {
        "enabled": true,
        "options": {
          "target_branch": "preview",
          "strict_mode": false,
          "check_all_remotes": false
        }
      }
    }
  }
}
```

### Options
- **target_branch**: Default branch to check against (preview/main)
- **strict_mode**: Also check for non-conflict merge issues
- **check_all_remotes**: Check conflicts for all configured remotes

## Benefits

1. **Early Detection**: Find conflicts before they reach CI/CD
2. **Resource Saving**: No wasted builds on unmergeable code
3. **Better Reviews**: PRs always start in mergeable state
4. **Clear History**: No force-push confusion during reviews

## Example Output

### Success Case
```
🔍 Checking for conflicts with target branch...
Fetching latest preview from origin...
Checking for conflicts with preview...
✅ No conflicts detected with preview
```

### Conflict Detected
```
🔍 Checking for conflicts with target branch...
Fetching latest preview from origin...
Checking for conflicts with preview...

❌ ERROR: Merge conflicts detected with preview!

Your branch has conflicts that must be resolved before pushing.
This prevents creating PRs that cannot be merged.

To fix:
  1. git fetch origin preview
  2. git merge origin/preview
  3. Resolve conflicts
  4. git add <resolved files>
  5. git commit
  6. git push
```

## Bypass (Emergency Only)

If you absolutely must push with conflicts:
```bash
git push --no-verify
```

⚠️ **Warning**: This creates unmergeable PRs and should be avoided.

## Related Rules
- RULE-WFL-002: PR Workflow Enforcement
- RULE-WFL-001: Issue-Driven Development