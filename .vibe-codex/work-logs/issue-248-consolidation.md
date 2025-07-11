# Issue #248: Clean up and consolidate rules and hooks structure

## Context
Major consolidation effort to fix vibe-codex which has accumulated technical debt from evolving from cursor_rules. The project drifted from comprehensive rule system to oversimplified "5 rules" approach. Need to restore menu-driven installer with all rules accessible.

## Work Completed
- [x] Created PROJECT-CONTEXT.md to anchor project purpose
- [x] Updated issue #248 with comprehensive todo tracking
- [x] Created issue #251 for work tracking rule
- [x] Created issue #252 for documentation update enforcement
- [x] Completed Task 1: Rule consolidation (PR #250)
  - Consolidated ~250+ rules into 30 organized rules
  - Created registry.json for menu system
  - Documented in CONSOLIDATION.md
- [x] Implemented work tracking rule (PR #253)
  - Created rule wfl-005
  - Added to registry and ai-developer preset
  - Dogfooded with own work log

## Remaining Tasks
- [ ] Task 2: Restore missing files from preview branch
- [ ] Task 3: Complete file organization
- [ ] Task 4: Hook consolidation & menu integration
- [ ] Task 5: Configuration system implementation
- [ ] Task 6: Project context integration (updated approach)
- [ ] Task 7: Documentation updates
- [ ] Implement issue #252 (doc update enforcement)

## Key Decisions
- Created PROJECT-CONTEXT.md as flexible north star document
- Made work tracking rule opt-in but included in ai-developer preset
- Organized rules by category with complexity indicators
- Used registry.json for menu system integration

## Current Status
- PR #250 (rule consolidation) - Ready for review
- PR #253 (work tracking) - Ready for review
- Next: Continue with Task 2 after PRs merge

## Notes
- The project demonstrates its own problem - simplified to uselessness
- Work tracking helps maintain context across AI sessions
- Each task should follow full workflow with proper issue creation