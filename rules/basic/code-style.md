# Basic Code Style Rules

## RULE-STY-001: Linting Must Pass

**Category**: Quality  
**Complexity**: Basic  
**Default**: Enabled  

### Description
Ensures code passes linting checks before commit.

### What it runs
- `npm run lint` (if script exists)
- `eslint` (for JavaScript/TypeScript)
- `pylint` or `flake8` (for Python)
- `rubocop` (for Ruby)
- Custom lint command

### Configuration
```json
{
  "id": "sty-001",
  "command": "npm run lint",
  "fix": true,
  "fail_on_warning": false
}
```

### Auto-fix Option
When enabled, attempts to auto-fix issues before failing.

---

## RULE-STY-002: No Console Logs

**Category**: Quality  
**Complexity**: Basic  
**Default**: Enabled  

### Description
Prevents committing debugging console.log statements.

### What it catches
- `console.log()`
- `console.debug()`
- `console.info()`
- `print()` statements in Python (configurable)

### Exceptions
- Test files
- Development scripts
- Logging utilities

### Configuration
```json
{
  "id": "sty-002",
  "patterns": ["console\\.(log|debug|info)"],
  "exclude": ["*.test.js", "*.spec.js", "scripts/*"]
}
```

---

## RULE-STY-003: Consistent File Naming

**Category**: Quality  
**Complexity**: Basic  
**Default**: Disabled  

### Description
Enforces consistent file naming conventions.

### Options
- `kebab-case`: `my-component.js`
- `camelCase`: `myComponent.js`
- `PascalCase`: `MyComponent.js`
- `snake_case`: `my_component.js`

### Configuration
```json
{
  "id": "sty-003",
  "enabled": false,
  "conventions": {
    "*.js": "camelCase",
    "*.jsx": "PascalCase",
    "*.test.js": "kebab-case",
    "*.md": "UPPER-CASE"
  }
}
```