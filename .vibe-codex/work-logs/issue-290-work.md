# Issue #290: Add branch name validation hook

## Goal
Implement branch name validation that's currently in dev-hooks but not active.

## Analysis
The hook already exists at `dev-hooks/branch-name-validator.sh`. Need to:
1. Review the existing implementation
2. Integrate it into the vibe-codex system
3. Make it configurable
4. Add tests

## Implementation Plan
1. [ ] Review existing branch-name-validator.sh
2. [ ] Create configurable rule in vibe-codex
3. [ ] Add to pre-commit or post-checkout hook
4. [ ] Update documentation
5. [ ] Add tests

## Work Started
Checking the existing implementation.