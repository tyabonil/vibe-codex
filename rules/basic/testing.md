# Basic Testing Rules

## RULE-TST-001: Tests Must Pass

**Category**: Quality  
**Complexity**: Basic  
**Default**: Disabled (can be slow)  

### Description
Ensures all tests pass before allowing commits.

### What it runs
- `npm test` (if package.json exists)
- `yarn test` (if yarn.lock exists)
- `pytest` (if Python project)
- Custom test command from configuration

### Configuration
```json
{
  "id": "tst-001",
  "enabled": false,
  "command": "npm test",
  "timeout": 300,
  "allow_skip": ["WIP", "wip", "draft"]
}
```

### Performance Note
Running tests on every commit can slow down development. Consider:
- Enabling only for main branch pushes
- Running only affected tests
- Using pre-push instead of pre-commit

---

## RULE-TST-002: Test Coverage Threshold

**Category**: Quality  
**Complexity**: Basic  
**Default**: Disabled  

### Description
Ensures code coverage doesn't drop below configured threshold.

### Configuration
```json
{
  "id": "tst-002",
  "enabled": false,
  "threshold": {
    "statements": 80,
    "branches": 70,
    "functions": 80,
    "lines": 80
  }
}
```

---

## RULE-TST-003: No Skipped Tests

**Category**: Quality  
**Complexity**: Basic  
**Default**: Enabled  

### Description
Prevents committing code with skipped or focused tests.

### What it catches
- `it.skip()`
- `test.skip()`
- `describe.skip()`
- `it.only()`
- `test.only()`
- `fdescribe()`
- `fit()`

### Why it matters
- Skipped tests hide potential issues
- Focused tests prevent full test suite from running
- Can accidentally disable important test coverage

### Implementation
Pre-commit hook that scans test files for skip/only patterns.