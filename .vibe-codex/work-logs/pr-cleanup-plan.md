# PR Cleanup Plan - Getting Back on Track

## Current Situation (MESS!)
- PR #250 (Task 1: Rule consolidation) - Ready but has conflicts with preview
- PR #253 (Work tracking rule) - Has massive conflicts with preview  
- PR #255 (Conflict detection) - Created against main instead of preview
- PR #246 & #245 - Old PRs that need review
- Preview branch has ALREADY done the restructuring we were trying to do!

## Root Problem
Preview branch already moved all legacy rules to `legacy/` directory and restructured everything. Our PRs are trying to do work that's already been done! This is what happens when we don't check the current state first.

## What Preview Has Already Done
- Moved all legacy rules to `/legacy/cursor-rules/` and `/legacy/enhanced-rules/`
- Created empty `/rules/` directory (only has `/rules/llm-specific/`)
- Restructured docs into `/docs/` with subdirectories
- Updated hooks and scripts
- BUT: Preview hasn't populated the new rules structure yet!

## What PR #250 Actually Does (Not Redundant!)
- Adds the consolidated rule files to `/rules/` directory
- Creates `rules/registry.json` for the menu system
- Adds organized rules in categories (basic, advanced, security, etc.)
- This is NEEDED work that complements what preview did

## The Real Problem
PR #250 was created BEFORE preview underwent major restructuring:
- Preview moved all vibe-codex/* files to root level
- Preview reorganized docs into subdirectories
- Preview created legacy folders
- PR #250 has 100+ conflicts because it's based on old structure!

## Updated Cleanup Plan

### Phase 1: Close Problematic PRs ✅
1. **PR #255** - Created against wrong branch (main instead of preview)
2. **PR #253** - Has massive conflicts, depends on #250
3. **PR #250** - Has 100+ conflicts due to restructuring

### Phase 2: Recreate PRs Properly
1. **NEW PR for Task 1** (Rule consolidation)
   - Start fresh from current preview
   - Add the /rules/ content that's actually needed
   - Much simpler than trying to resolve 100+ conflicts
2. **NEW PR for Work tracking** (Issue #251)
   - After rule consolidation merges
   - Based on new structure
3. **NEW PR for Conflict detection** (Issue #254)
   - After above are merged
   - Target preview properly

### Phase 3: Proper Task Execution
Following issue #248 tasks IN ORDER:
1. Task 1 (PR #250) - Rule consolidation ✓
2. Task 2 - Missing files from preview
3. Task 3 - File organization
4. Task 4 - Hook consolidation
5. Task 5 - Config system
6. Task 6 - Project context
7. Task 7 - Documentation

We jumped to creating new features (work tracking, conflict detection) without completing the foundation!

## Immediate Actions - COMPLETED ✅

### Step 1: Close the broken PRs ✅
- Closed PR #255 (conflict detection - wrong branch)
- Closed PR #253 (work tracking - massive conflicts)
- Closed PR #250 (rule consolidation - 100+ conflicts)

### Step 2: Created fresh branch from preview ✅
- Created feature/issue-249-rule-consolidation-v2
- Cherry-picked needed files from old PR
- Clean implementation without conflicts

### Step 3: Created new PR ✅
- PR #256 created for rule consolidation
- Targets preview branch correctly
- No conflicts!

## Next Steps

1. **Wait for PR #256 to merge**
   - This is Task 1 from issue #248
   - Foundation for other tasks

2. **After #256 merges, recreate Work Tracking (Issue #251)**
   - Start fresh from updated preview
   - Will be much simpler

3. **After work tracking, recreate Conflict Detection (Issue #254)**
   - Target preview properly this time

## Remaining PRs to Review
- PR #246 - .env.example bypass (old, needs review)
- PR #245 - GitHub Actions compliance (old, needs review)