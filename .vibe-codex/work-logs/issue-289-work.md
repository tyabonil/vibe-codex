# Issue #289: Add context monitoring for large file changes

## Summary
Implementing context monitoring as an optional rule to warn about large changes that might exceed AI context windows.

## Plan
1. Create context-size-check.sh script ✓
2. Add context-size rule option to commands ✓
3. Integrate into pre-commit hook ✓
4. Add tests ✓
5. Update documentation ✓

## Implementation Details
- Monitor total lines changed ✓
- Check number of files changed ✓
- Warn about files >1000 lines ✓
- Configurable thresholds ✓
- Simple line counting, no complex analysis ✓

## Work Log
- Created feature branch: feature/issue-289-context-monitoring
- Created context-size-check.sh script with configurable thresholds
- Added context-size rule to lib/commands.js (both init and config menus)
- Integrated into lib/installer.js for pre-commit hook generation
- Updated README.md with detailed documentation
- Updated docs/RULES.md with rule description
- Created comprehensive tests in test/context-size.test.js
- All tests passing

## Completed
All functionality implemented and tested. Ready to commit and create PR.