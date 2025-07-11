# Issue #251: Add rule for tracking issue work in local markdown files

## Context
Creating a rule that requires maintaining local work tracking files for each issue to preserve context across sessions and prevent forgetting important tasks.

## Work Completed
- [x] Created issue #251 with clear acceptance criteria
- [x] Created feature branch
- [x] Created .vibe-codex/work-logs directory
- [x] Created rule definition in /rules/workflow/issue-work-tracking.md
- [x] Added to registry.json
- [x] Created hook implementation in templates/hooks/work-tracking-check.sh
- [x] Added to ai-developer preset
- [ ] Documentation

## Remaining Tasks
- [ ] Add documentation to main docs
- [ ] Create PR
- [ ] Update .gitignore to not ignore .vibe-codex/work-logs/

## Key Decisions
- Using .vibe-codex directory to avoid cluttering root
- File naming: issue-{number}-{slug}.md for easy identification
- Making it opt-in (disabled by default) for flexibility

## Blockers
None currently.

## Notes
- This rule helps with PROJECT-CONTEXT.md goal of context preservation
- Particularly valuable for AI assistants that lose context between sessions
- Should integrate with existing workflow rules