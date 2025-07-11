# Issue #254: Add pre-PR conflict check to prevent massive merge conflicts

## Context
Discovered while working on PR #253 that we don't check for merge conflicts before creating PRs. This led to a PR with massive conflicts that couldn't be merged.

## Work Completed
- [x] Created issue #254 with clear problem statement
- [x] Created feature branch
- [x] Implemented pre-push hook template
- [x] Created rule documentation
- [x] Added to rules registry
- [x] Added to standard preset

## Remaining Tasks
- [x] Test the hook locally (it works!)
- [ ] Create PR targeting main (preview has too many conflicts)
- [ ] Update PR #253 after this merges
- [ ] Consider adding manual check-merge command later

## Key Decisions
- Using pre-push hook to catch conflicts early
- Also providing manual command for flexibility
- Making it a warning, not a blocker (can override)

## Notes
- This directly addresses the problem that caused PR #253 to fail
- Supports PROJECT-CONTEXT.md goal of smooth workflow
- Should save significant time and frustration