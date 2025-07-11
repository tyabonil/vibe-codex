# RULE-WFL-005: Local Issue Work Tracking

**Category**: Workflow  
**Complexity**: Basic  
**Default**: Disabled  
**Hook Type**: Pre-commit  
**Performance Impact**: Low  

## Purpose

Track work on issues in local markdown files to:
- Preserve context across AI assistant sessions
- Document decision rationale and exploration
- Create a searchable history of issue work
- Help onboard new contributors

## Implementation

### Directory Structure
```
.vibe-codex/
├── work-logs/
│   ├── issue-123-work.md
│   ├── issue-124-work.md
│   └── pr-cleanup-plan.md
```

### Work Log Format
```markdown
# Issue #123: Feature Implementation

## Session 1 - 2024-07-11
### Goal
Implement user authentication

### Approach
- Researched existing auth patterns
- Decided on JWT tokens

### Files Modified
- src/auth/jwt.js
- src/middleware/auth.js

### Next Steps
- Add refresh token logic
- Write tests

## Session 2 - 2024-07-12
...
```

### Hook Implementation
```bash
#!/bin/bash
# Check if work log exists for current branch issue
BRANCH=$(git branch --show-current)
ISSUE_NUM=$(echo "$BRANCH" | grep -oE '[0-9]+' | head -1)

if [ -n "$ISSUE_NUM" ]; then
  LOG_FILE=".vibe-codex/work-logs/issue-${ISSUE_NUM}-work.md"
  if [ ! -f "$LOG_FILE" ]; then
    echo "⚠️  No work log found for issue #${ISSUE_NUM}"
    echo "Create: $LOG_FILE"
    echo "Consider: git add $LOG_FILE"
  fi
fi
```

## Configuration

### Enable in .vibe-codex.json
```json
{
  "rules": {
    "workflow": {
      "issue-work-tracking": {
        "enabled": true,
        "options": {
          "directory": ".vibe-codex/work-logs",
          "require_logs": false,
          "auto_create": true
        }
      }
    }
  }
}
```

## Benefits

1. **Context Preservation**: Never lose track of why decisions were made
2. **AI Assistant Friendly**: New sessions can read previous work
3. **Team Communication**: Share exploration and dead ends
4. **Issue History**: See full journey from problem to solution

## Examples

### Starting Work on New Issue
```bash
# Create work log
echo "# Issue #123: Add User Authentication" > .vibe-codex/work-logs/issue-123-work.md
echo "" >> .vibe-codex/work-logs/issue-123-work.md
echo "## Session 1 - $(date +%Y-%m-%d)" >> .vibe-codex/work-logs/issue-123-work.md
```

### AI Assistant Handoff
```markdown
## Session 3 - 2024-07-11
### Current State
- JWT implementation complete
- Tests passing for happy path
- Need to handle edge cases

### Blockers
- Refresh token rotation not working
- See error in src/auth/refresh.js:45

### For Next Session
1. Fix refresh token rotation
2. Add rate limiting
3. Update documentation
```

## Related Rules
- RULE-WFL-001: Issue-Driven Development
- RULE-DOC-002: Inline Documentation
- RULE-AI-002: Context Management