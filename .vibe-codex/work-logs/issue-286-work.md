# Issue #286: Add test quality checker

## Summary
Implementing a test quality checker as an optional rule to prevent common test anti-patterns.

## Plan
1. Create test-quality-check.sh script
2. Add test-quality rule option to commands
3. Integrate into pre-commit hook
4. Add tests
5. Update documentation

## Simple Checks to Implement
Based on feedback, keeping it simple with pattern matching:
- No .only() or .skip() in test files
- No console.log in test files (unless wrapped)
- Test descriptions aren't empty
- No commented out tests
- Basic test file naming convention

## Work Log
- Created feature branch: feature/issue-286-test-quality
- Starting implementation...