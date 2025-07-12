# RULE-WFL-008: Issue Grooming and Dependency Check

**Category**: Workflow  
**Complexity**: Advanced  
**Default**: Disabled  
**Hook Type**: Pre-commit  
**Performance Impact**: Low  

## Purpose

Automatically review linked and dependent issues before starting work to ensure holistic planning, avoid rework from missed dependencies, and verify alignment with project architecture.

## Problem It Solves

When working on complex features or external contributions:
- Developers may miss that linked issues have been completed or changed
- Dependencies between issues can cause rework if not checked
- Holistic plans can become outdated as related work progresses
- Context is lost between AI sessions without dependency checks
- **External contributors may suggest implementations that don't align with project structure**
- **Feature requests may bypass the rule/hook system architecture**

This rule ensures you always have the latest context and project alignment before making changes.

## Implementation

### Hook Behavior
```bash
# Pre-commit hook checks for issue dependencies
# Extracts issue number from branch name
# Checks all linked issues for status
# Prompts to review if dependencies found
```

### Checks Performed
1. Extract current issue number from branch
2. Fetch issue body and extract referenced issues (#123 format)
3. Check status of all linked issues
4. Identify meta-issues or parent dependencies
5. **Check for project structure alignment**
6. **Identify external contributors**
7. **Detect implementation suggestions that bypass rule system**
8. Prompt for review if issues found

## Configuration

### Enable in .vibe-codex.json
```json
{
  "rules": {
    "wfl-008": {
      "enabled": true,
      "options": {
        "check_dependencies": true,
        "prompt_on_open_deps": true,
        "auto_update_plan": false
      }
    }
  }
}
```

### Options
- **check_dependencies**: Check linked issue status
- **prompt_on_open_deps**: Show warning if dependencies are open
- **auto_update_plan**: (Future) Automatically update issue description

## Example Output

### Standard Dependency Check
```
🔍 Grooming issue #271 and checking dependencies...
📋 Checking current issue #271...
🔗 Found linked issues:
   - #266: OPEN - Add LLM-specific rules
     ⚠️  Still open - check for dependencies
   - #248: CLOSED - Meta Issue: Consolidate rules
     ✓ Already completed
```

### External Contributor Check
```
🔍 Grooming issue #272 and checking dependencies...
📋 Checking current issue #272...

🎯 PROJECT ALIGNMENT CHECK:
⚠️  Issue suggests implementation but doesn't reference vibe-codex structure
   (Missing: rules/, templates/, hooks/, registry.json)
👤 External contributor - review for project context
📚 Feature request may need rule system integration

⚠️  ISSUE GROOMING RECOMMENDED

📝 PROJECT CONTEXT UPDATE NEEDED:
   This issue may need alignment with vibe-codex architecture:
   - Rules go in /rules/ with registry.json entries
   - Hooks go in /templates/hooks/ or /hooks/
   - Configuration uses .vibe-codex.json format
   - All features should integrate with the rule system

   💡 Example clarification comment:
   """
   Thanks for the suggestion! To align with vibe-codex architecture:
   - This would be implemented as a rule in /rules/[category]/
   - Hook script would go in /templates/hooks/
   - Users would enable via the checkbox menu (npx vibe-codex config)
   - See PROJECT-CONTEXT.md for our architecture approach
   """
```

## Benefits

1. **Prevents Rework**: Catch changed dependencies before coding
2. **Maintains Context**: Ensures holistic plans stay current
3. **Reduces Confusion**: Clear view of what's done vs pending
4. **AI Session Continuity**: Helps AI assistants maintain context

## Prerequisites

- GitHub CLI (`gh`) installed and authenticated
- Working on issue branches (feature/issue-123-description)
- Issues use standard GitHub references (#123)

## Integration

Works best with:
- **WFL-001**: Issue-driven development
- **WFL-005**: Local work tracking
- **WFL-007**: Automatic work log updates

## Best Practices

1. Run grooming at start of each work session
2. Update meta-issues when completing sub-tasks
3. Close issues promptly when work is done
4. Keep issue descriptions current with plans

## Future Enhancements

- Automatic issue description updates
- Dependency graph visualization
- Integration with project boards
- Smart conflict detection between issues