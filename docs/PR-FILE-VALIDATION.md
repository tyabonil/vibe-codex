# PR File Validation - Test Coverage for New Code Only

## Overview

The mandatory rules checker now validates test coverage requirements **only for NEW files** added in a pull request. This prevents false positives where pre-existing files without tests would block new PRs.

## Problem Solved

Previously, the compliance checker would flag ALL code files in a PR that didn't have corresponding tests, including:
- Modified existing files
- Files that existed before the PR
- Legacy code being refactored

This created friction for developers who were making small changes to existing code that didn't have tests.

## Solution

The rule engine now:
1. **Only checks files with status: 'added'** - truly new files introduced in the PR
2. **Ignores modified files** - existing code can be updated without requiring new tests
3. **Smart file filtering** - only checks actual code files, not configs or docs

## How It Works

### File Status Detection
```javascript
// Only NEW files are checked
if (file.status !== 'added') return false;
```

### Code File Detection
Recognizes these extensions as code files:
- JavaScript/TypeScript: `.js`, `.jsx`, `.ts`, `.tsx`
- Python: `.py`
- Java: `.java`
- Go: `.go`
- Ruby: `.rb`
- C/C++: `.c`, `.cpp`
- C#: `.cs`

### Excluded Files
- Test files (containing 'test', 'spec', '.test.', '.spec.')
- Files in `node_modules/`, `dist/`, `build/`, `coverage/`
- Documentation files (`.md`)
- Configuration files (`.json`, `.yml`, `.yaml`)

## Examples

### Scenario 1: Modified Existing File (No Violation)
```
PR contains:
- src/existing-feature.js (modified) - 50 lines changed
- No test files

Result: ✅ No violation - modified files don't require new tests
```

### Scenario 2: New Code File Without Tests (Violation)
```
PR contains:
- src/new-feature.js (added) - 100 lines
- No test files

Result: ❌ Violation - new code requires tests
```

### Scenario 3: New Code File With Tests (No Violation)
```
PR contains:
- src/new-feature.js (added) - 100 lines
- tests/new-feature.test.js (added) - 50 lines

Result: ✅ No violation - new code has tests
```

### Scenario 4: New Non-Code Files (No Violation)
```
PR contains:
- README.md (added)
- config/settings.json (added)
- .github/workflows/ci.yml (added)

Result: ✅ No violation - non-code files don't require tests
```

## Benefits

1. **Reduced False Positives** - No more blocking PRs for pre-existing code
2. **Encourages Incremental Improvement** - Developers can update legacy code without being forced to add tests
3. **Focuses on New Code Quality** - Ensures all NEW code has proper test coverage
4. **Better Developer Experience** - Less friction when making small changes

## Troubleshooting

### PR Still Blocked for Test Coverage?

1. **Check file status**: Use `git status` to verify which files are new vs modified
2. **Check file extension**: Ensure your code files use recognized extensions
3. **Check for test files**: Test files must include 'test' or 'spec' in the filename
4. **Check PR diff**: GitHub API must report the file as 'added', not 'modified'

### Debug Information

The rule engine logs helpful information:
```
🔍 Found 2 new code files to check for test coverage
```

This tells you exactly how many new code files were detected that require tests.

## Migration Guide

If you have existing PRs that were blocked:
1. Rerun the checks - they should now pass if only modifying existing files
2. Add tests only for truly NEW code files
3. Consider adding tests for modified files as a best practice (but not required)

## Configuration

This behavior is controlled by the Level 3 Quality Gates in `config/rules.json`:
```json
{
  "level3_quality": {
    "checks": {
      "test_coverage": {
        "enabled": true,
        "require_tests_for_new_code": true
      }
    }
  }
}
```