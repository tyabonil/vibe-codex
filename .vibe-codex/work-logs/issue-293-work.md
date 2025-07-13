# Issue #293: Add cursor rules update checker

## Summary
Implementing a cursor rules checker as an optional rule to help teams keep their .cursorrules file up to date.

## Plan
1. Create cursor-rules-check.sh script
2. Add cursor-rules rule option to commands
3. Integrate into pre-commit hook
4. Add tests
5. Update documentation

## Implementation Details
- Check if .cursorrules exists
- Compare against a template or check for required sections
- Warn if file is missing or outdated
- Simple implementation - just file existence and basic content checks

## Work Log
- Created feature branch: feature/issue-293-cursor-rules
- Starting implementation...