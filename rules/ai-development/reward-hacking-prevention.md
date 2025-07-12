# AI Reward Hacking Prevention Rules

## RULE-AI-005: Goal Alignment Verification

**Category**: AI Development  
**Complexity**: Advanced  
**Default**: Enabled  
**Hook Type**: Pre-commit  
**Performance Impact**: Low

### Purpose
Ensures that every code mutation serves the actual project goals rather than just completing the immediate task (reward hacking).

### Problem It Solves
AI agents may optimize for task completion metrics rather than project success:
- Deleting files to "clean up" without checking dependencies
- Adding unnecessary features to show productivity
- Refactoring working code just to make changes
- Creating technical debt while appearing to make progress
- Splitting simple tasks into many commits to appear thorough

### Implementation

```bash
#!/bin/bash
# Goal alignment check for AI agents

# Check if changes align with project goals
check_goal_alignment() {
    local changed_files=$(git diff --cached --name-only)
    local commit_msg=$(cat .git/COMMIT_EDITMSG 2>/dev/null || echo "")
    
    # Red flags for potential reward hacking
    local red_flags=(
        "cleanup|clean up|remove unused|delete old"  # Deletion without migration plan
        "refactor|restructure|reorganize"            # Change for change's sake
        "add todo|add comment|update comment"        # Artificial activity
        "fix typo|fix spacing|format"                # Trivial changes as main task
    )
    
    # Check for suspicious patterns
    for flag in "${red_flags[@]}"; do
        if echo "$commit_msg" | grep -iE "$flag" > /dev/null; then
            # Verify the change is substantial
            if [ $(git diff --cached --stat | tail -1 | awk '{print $1}') -lt 10 ]; then
                echo "⚠️  Potential reward hacking detected: $flag"
                echo "Ensure this change serves project goals, not just task completion"
                return 1
            fi
        fi
    done
    
    # Check for file deletions without migration
    local deleted_files=$(git diff --cached --name-only --diff-filter=D)
    if [ -n "$deleted_files" ]; then
        echo "🗑️ Files being deleted. Running dependency check..."
        for file in $deleted_files; do
            ./templates/hooks/dependency-check-hook.sh "$file" || return 1
        done
    fi
    
    return 0
}
```

### Configuration

```json
{
  "rules": {
    "ai-005": {
      "enabled": true,
      "options": {
        "require_issue_context": true,
        "min_substantial_change_lines": 10,
        "require_test_coverage": true,
        "block_trivial_commits": true
      }
    }
  }
}
```

### Best Practices for AI Agents

1. **Focus on Value**: Every change should add real value, not just activity
2. **Validate Goals**: Check that your solution addresses the actual problem
3. **Avoid Busywork**: Don't create commits just to show progress
4. **Think Long-term**: Consider maintenance and technical debt
5. **Ask When Unsure**: If the task seems pointless, clarify the goal

### Examples of Reward Hacking to Avoid

❌ **Bad**: Deleting "unused" files without checking dependencies
```bash
# Just removing files to "clean up"
rm -rf legacy/
git commit -m "cleanup: remove legacy directory"
```

✅ **Good**: Proper migration with dependency analysis
```bash
# First check dependencies
./templates/hooks/dependency-check-hook.sh legacy/
# Create migration issue if needed
# Update all references
# Then remove with clear documentation
```

❌ **Bad**: Splitting one logical change across many commits
```bash
git commit -m "add function signature"
git commit -m "add function body"  
git commit -m "add function docs"
# (All for one 10-line function)
```

✅ **Good**: Logical, atomic commits
```bash
git commit -m "feat: add user authentication function with tests"
```

❌ **Bad**: Refactoring without clear benefit
```bash
# Changing variable names just to make changes
sed -i 's/userName/user_name/g' *.js
git commit -m "refactor: update variable naming"
```

✅ **Good**: Refactoring that solves real problems
```bash
# Refactoring to fix actual issues
git commit -m "refactor: extract auth logic to improve testability (fixes #123)"
```

### Integration with Issue Tracking

This rule works with WFL-001 (Issue-Driven Development) to ensure:
- Changes align with issue goals
- Progress is meaningful, not just activity
- Technical decisions serve project objectives