# Workflow: Pre-PR Conflict Check

## RULE-WFL-006: Pre-Push Conflict Detection

**Category**: Workflow  
**Complexity**: Basic  
**Default**: Enabled  

### Description
Detects merge conflicts with target branch before pushing, preventing creation of unmergeable PRs.

### Purpose
- **Save Time**: Catch conflicts before PR creation
- **Reduce Rework**: Fix conflicts locally before pushing
- **Smooth Workflow**: Avoid blocked PRs
- **Stay Current**: Encourages keeping branches up-to-date

### How It Works
1. Before push, fetches target branch
2. Simulates merge to detect conflicts
3. Warns about conflicts found
4. Provides resolution instructions
5. Allows override if needed

### Configuration
```json
{
  "id": "wfl-006",
  "enabled": true,
  "target_branch": "preview",
  "block_on_conflicts": false,
  "check_before": ["push", "pr"]
}
```

### Git Configuration
```bash
# Set custom target branch (default: preview)
git config vibe-codex.targetBranch main

# Block push on conflicts (default: warn only)
git config vibe-codex.blockOnConflicts true
```

### Example Output

#### No Conflicts
```
🔍 Checking for conflicts with preview branch...
✅ No conflicts detected with preview
```

#### Conflicts Detected
```
🔍 Checking for conflicts with preview branch...
❌ Merge conflicts detected with preview!

   Your branch will have conflicts when creating a PR.
   This will make the PR unmergeable without resolution.

   To resolve:
   1. Merge latest preview:
      git fetch origin preview
      git merge origin/preview

   2. Or rebase on preview:
      git fetch origin preview
      git rebase origin/preview

   3. To push anyway (not recommended):
      git push --no-verify

⚠️  Proceeding with push despite conflicts...
   Consider resolving before creating PR.
```

### Manual Check Command
```bash
# Check for conflicts without pushing
vibe-codex check-merge

# Check against specific branch
vibe-codex check-merge main
```

### Benefits
1. **Prevents Unmergeable PRs**: No more "This PR has conflicts"
2. **Early Detection**: Fix conflicts while context is fresh
3. **Cleaner History**: Resolve conflicts before they reach PR
4. **Time Savings**: Avoid creating doomed PRs

### When to Disable
- Experimental branches that expect conflicts
- When working with multiple target branches
- If using a different merge strategy

### Integration with Other Rules
- Works with `wfl-001` (Issue-Driven Development)
- Complements `wfl-002` (PR Workflow)
- Supports clean git history