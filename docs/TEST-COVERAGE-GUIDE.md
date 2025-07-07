# 🧪 Test Coverage Guide

## Overview

The cursor_rules repository enforces 100% test coverage for all new code. This guide helps you meet these requirements efficiently.

## Quick Start

### 1. Install Test Coverage Validator
```bash
# Copy the pre-push hook
cp hooks/test-coverage-validator.sh .git/hooks/pre-push
chmod +x .git/hooks/pre-push
```

### 2. Check Coverage Before Push
The hook automatically runs when you `git push`, but you can test manually:
```bash
./hooks/test-coverage-validator.sh
```

## Coverage Requirements

### What Needs Testing
- ✅ All new functions and methods
- ✅ All branches (if/else, switch cases)
- ✅ Error handling code
- ✅ Edge cases (null, undefined, empty)
- ✅ Async operations

### Coverage Metrics
- **Branches**: 100%
- **Functions**: 100%
- **Lines**: 100%
- **Statements**: 100%

## Framework Support

### JavaScript/TypeScript

#### Jest (Recommended)
```javascript
// package.json
"scripts": {
  "test": "jest",
  "test:coverage": "jest --coverage"
}

// jest.config.js
module.exports = {
  coverageThreshold: {
    global: {
      branches: 100,
      functions: 100,
      lines: 100,
      statements: 100
    }
  }
};
```

#### Vitest
```javascript
// vite.config.js
export default {
  test: {
    coverage: {
      lines: 100,
      functions: 100,
      branches: 100,
      statements: 100
    }
  }
}
```

### Python
```python
# pytest.ini
[tool:pytest]
addopts = --cov=src --cov-report=term-missing --cov-fail-under=100
```

### Go
```bash
go test -cover -coverprofile=coverage.out ./...
go tool cover -html=coverage.out
```

## Test File Conventions

### JavaScript/TypeScript
```
src/
  utils.js          → src/__tests__/utils.test.js
  utils.js          → src/utils.test.js
  components/Button.jsx → components/__tests__/Button.test.jsx
```

### Python
```
src/
  module.py         → src/test_module.py
  module.py         → tests/test_module.py
```

## Writing Effective Tests

### 1. Test Structure (AAA Pattern)
```javascript
it('should calculate total correctly', () => {
  // Arrange
  const items = [{ price: 10 }, { price: 20 }];
  
  // Act
  const total = calculateTotal(items);
  
  // Assert
  expect(total).toBe(30);
});
```

### 2. Test All Branches
```javascript
// Function with branches
function processValue(value) {
  if (value > 100) {
    return 'high';
  } else if (value > 50) {
    return 'medium';
  } else {
    return 'low';
  }
}

// Tests covering all branches
describe('processValue', () => {
  it('returns high for values > 100', () => {
    expect(processValue(101)).toBe('high');
  });
  
  it('returns medium for values 51-100', () => {
    expect(processValue(75)).toBe('medium');
  });
  
  it('returns low for values <= 50', () => {
    expect(processValue(25)).toBe('low');
  });
});
```

### 3. Test Error Cases
```javascript
it('should throw error for invalid input', () => {
  expect(() => parseConfig(null)).toThrow('Config cannot be null');
  expect(() => parseConfig('')).toThrow('Config cannot be empty');
});
```

### 4. Test Async Code
```javascript
it('should fetch user data', async () => {
  const userData = await fetchUser(123);
  expect(userData.id).toBe(123);
});

it('should handle fetch errors', async () => {
  await expect(fetchUser(-1)).rejects.toThrow('User not found');
});
```

## Using Test Generator

Generate test templates for new files:
```bash
node scripts/test-generator-helper.js src/myModule.js jest
```

This creates a test template with:
- Proper imports
- Test structure
- Coverage checklist
- TODO items for implementation

## Common Patterns

### Mocking
```javascript
// Mock external dependencies
jest.mock('./api');

it('should handle API errors', async () => {
  api.fetchData.mockRejectedValue(new Error('Network error'));
  
  await expect(processData()).rejects.toThrow('Network error');
});
```

### Testing React Components
```javascript
import { render, screen, fireEvent } from '@testing-library/react';

it('should handle click events', () => {
  const handleClick = jest.fn();
  render(<Button onClick={handleClick}>Click me</Button>);
  
  fireEvent.click(screen.getByText('Click me'));
  expect(handleClick).toHaveBeenCalledTimes(1);
});
```

## Troubleshooting

### "No test file found"
Create test file following naming conventions:
- `module.test.js` or `module.spec.js`
- Place in same directory or `__tests__` folder

### "Coverage below threshold"
Run coverage report to see what's missing:
```bash
npm test -- --coverage
```

Look for:
- Uncovered lines (red in report)
- Missing branch coverage (if/else not tested)
- Untested functions

### "Framework not detected"
Ensure test framework is in package.json:
```json
{
  "devDependencies": {
    "jest": "^27.0.0"
  }
}
```

## Best Practices

1. **Write Tests First (TDD)**
   - Write failing test
   - Implement feature
   - Make test pass

2. **Test Behavior, Not Implementation**
   - ✅ `expect(result).toBe(30)`
   - ❌ `expect(internalVariable).toBe(10)`

3. **Use Descriptive Test Names**
   - ✅ `it('should return null when user is not found')`
   - ❌ `it('test 1')`

4. **Keep Tests Independent**
   - Each test should run in isolation
   - Use beforeEach/afterEach for setup/cleanup

5. **Test Edge Cases**
   - Empty arrays/strings
   - Null/undefined values
   - Maximum/minimum values
   - Boundary conditions

## Configuration Options

### Environment Variables
```bash
# Disable coverage check (not recommended)
export TEST_COVERAGE_ENABLED=false

# Change threshold (default: 100)
export TEST_COVERAGE_THRESHOLD=80
```

### Project Configuration
```json
// config/project-patterns.json
{
  "testing": {
    "framework": "jest",
    "coverage_threshold": 100,
    "exclude_patterns": ["*.config.js", "*.setup.js"]
  }
}
```

## CI/CD Integration

The test coverage validator integrates with:
- Pre-push hooks (local validation)
- PR checks (automated validation)
- GitHub Actions (CI pipeline)

---

*Remember: Well-tested code is reliable code. The 100% coverage requirement ensures quality and maintainability.*