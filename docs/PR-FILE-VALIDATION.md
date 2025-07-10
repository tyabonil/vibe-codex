# PR File Validation

## Overview

The compliance checker has been updated to only validate files that are part of a pull request's changes, rather than checking the entire codebase. This prevents false positives where pre-existing files without tests would block new PRs.

## Problem Statement

Previously, the compliance checker would:
- Check ALL files in the repository for test coverage
- Flag pre-existing files without tests as violations
- Block PRs even when the new code had proper tests
- Create unnecessary friction for contributors

## Solution

The updated rule engine now:
1. **Only validates NEW files** - Only files with status `added` are checked for test coverage
2. **Ignores modified files** - Existing files that are modified don't require new tests
3. **Smart file filtering** - Only actual code files require tests
4. **Test file detection** - Automatically detects if test files exist for new code

## How It Works

### File Status Filtering

The rule engine checks the `status` field of each file in the PR:
- `added` - New files that require test coverage
- `modified` - Existing files (not checked)
- `removed` - Deleted files (not checked)
- `renamed` - Moved files (not checked)

### Code File Detection

Only files with these extensions require tests:
- `.js`, `.jsx` - JavaScript files
- `.ts`, `.tsx` - TypeScript files  
- `.py` - Python files
- `.java` - Java files
- `.go` - Go files
- `.rb` - Ruby files

### Excluded Files

These files are automatically excluded from test requirements:
- Test files (containing `test` or `spec` in the name)
- Documentation files (`.md`)
- Configuration files (`.json`, `.yml`, `.yaml`, `.config.`)
- Text files (`.txt`)

### Test Association

The checker looks for test files that match the base name of the code file:
- `component.js` → `component.test.js` or `component.spec.js`
- `utils.ts` → `utils.test.ts` or `utils.spec.ts`

## Examples

### Example 1: New Feature (Requires Tests)
```javascript
// PR contains:
src/new-feature.js (status: added) - NEW CODE FILE
```
**Result**: ❌ Violation - Missing tests for 1 new code file

### Example 2: New Feature with Tests
```javascript
// PR contains:
src/new-feature.js (status: added)
src/new-feature.test.js (status: added)
```
**Result**: ✅ Pass - Tests included

### Example 3: Modified Existing File
```javascript
// PR contains:
src/existing-feature.js (status: modified)
```
**Result**: ✅ Pass - Modified files don't require new tests

### Example 4: Configuration Changes
```javascript
// PR contains:
package.json (status: added)
.github/workflows/test.yml (status: added)
README.md (status: added)
```
**Result**: ✅ Pass - Non-code files don't require tests

## Benefits

1. **Reduced False Positives** - Only checks files actually being added
2. **Better Developer Experience** - Clear, actionable feedback
3. **Encourages Best Practices** - Ensures new code has tests
4. **Gradual Improvement** - Doesn't penalize legacy code
5. **Smart Detection** - Understands different file types

## Migration Impact

This change affects how the compliance checker evaluates PRs:
- Existing PRs blocked by pre-existing file violations will now pass
- Only NEW code files added in a PR require tests
- Modified files no longer trigger test coverage violations

## Troubleshooting

### "Missing tests for new code files" error

This means you've added new code files without tests. To resolve:
1. Check which files are listed in the violation
2. Add test files for each new code file
3. Ensure test files are included in the same PR

### Tests not detected

Make sure your test files:
- Have `test` or `spec` in the filename
- Are included in the same PR as the code files
- Match the base name of the code file

## Configuration

The test coverage check is part of Level 3 (Quality Gates) and is MANDATORY. It cannot be disabled, but it now only applies to new files added in the PR.