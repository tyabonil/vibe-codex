# Workflow: Issue Work Tracking

## RULE-WFL-005: Local Issue Work Tracking

**Category**: Workflow  
**Complexity**: Basic  
**Default**: Disabled  

### Description
Maintains local markdown files to track work progress on issues, preserving context across sessions and preventing lost work or forgotten tasks.

### Purpose
- **Context Preservation**: Maintain detailed work history
- **AI Assistant Support**: Helps AI understand previous work
- **Team Handoffs**: Clear documentation for collaboration
- **Progress Tracking**: Know exactly what's done and what remains

### File Structure
```
.vibe-codex/
└── work-logs/
    ├── issue-123-add-feature.md
    ├── issue-456-fix-bug.md
    └── issue-789-refactor-code.md
```

### File Template
```markdown
# Issue #{number}: {title}

## Context
{Brief description of what this issue is about}

## Work Completed
- [x] Task 1
- [x] Task 2
- [ ] Task 3 (in progress)

## Remaining Tasks
- [ ] Task 4
- [ ] Task 5

## Key Decisions
- Decision 1: Reasoning
- Decision 2: Reasoning

## Blockers
- Blocker 1: Description

## Notes
- Important observations
- Links to relevant docs
```

### Implementation

#### Automatic Creation
When enabled, creates work log when:
- Creating issue branch
- First commit on issue branch
- Running `vibe-codex track-issue {number}`

#### Pre-commit Hook
```bash
# Check if on issue branch
if [[ "$branch" =~ issue-([0-9]+) ]]; then
  issue_num="${BASH_REMATCH[1]}"
  work_log=".vibe-codex/work-logs/issue-${issue_num}-*.md"
  
  if [ ! -f $work_log ]; then
    echo "⚠️  No work log found for issue #${issue_num}"
    echo "Create with: vibe-codex track-issue ${issue_num}"
  elif [ $(find $work_log -mtime +1) ]; then
    echo "⚠️  Work log is stale (>1 day old)"
    echo "Consider updating: $work_log"
  fi
fi
```

### Configuration
```json
{
  "id": "wfl-005",
  "enabled": false,
  "auto_create": true,
  "stale_warning_days": 1,
  "template": "default",
  "remind_on_commit": true
}
```

### Benefits
1. **Never Lose Context**: All work documented locally
2. **Better PRs**: Use work log to write comprehensive PR descriptions
3. **Easy Handoffs**: Next person knows exactly where you left off
4. **AI-Friendly**: Provides full context for AI assistants

### Example Usage

Starting work on issue #123:
```bash
$ git checkout -b feature/issue-123-add-auth
$ vibe-codex track-issue 123
✅ Created: .vibe-codex/work-logs/issue-123-add-auth.md

$ git commit -m "feat: initial auth setup"
ℹ️  Remember to update: .vibe-codex/work-logs/issue-123-add-auth.md
```

### Integration with Other Rules
- Works with `wfl-001` (Issue-Driven Development)
- Complements `ai-001` (Project Context Alignment)
- Supports `wfl-002` (PR Workflow) by providing PR content