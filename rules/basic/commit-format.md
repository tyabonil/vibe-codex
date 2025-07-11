# Basic Commit Format Rules

## RULE-CMT-001: Conventional Commit Format

**Category**: Workflow  
**Complexity**: Basic  
**Default**: Enabled  

### Description
Enforces conventional commit message format for consistency and automation.

### Format Required
```
<type>(<scope>): <subject>

<body>

<footer>
```

### Valid Types
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, semicolons, etc)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks
- `perf`: Performance improvements
- `ci`: CI/CD changes
- `build`: Build system changes
- `revert`: Reverting previous commit

### Examples
✅ Good:
- `feat: add user authentication`
- `fix: resolve memory leak in data processor`
- `docs: update README with new API endpoints`
- `fix(auth): correct token expiration logic`

❌ Bad:
- `updated stuff`
- `fix bug`
- `WIP`
- `misc changes`

### Implementation
Commit-msg hook that validates format and provides helpful error messages.

---

## RULE-CMT-002: Issue Reference Required

**Category**: Workflow  
**Complexity**: Basic  
**Default**: Disabled  

### Description
Requires commits to reference an issue number for traceability.

### Valid Formats
- `fixes #123`
- `resolves #123`
- `closes #123`
- `refs #123`
- `see #123`

### Examples
- `feat: add login form, resolves #123`
- `fix: correct validation logic (fixes #456)`

### Configuration
```json
{
  "id": "cmt-002",
  "required": false,
  "allow_no_issue": ["chore", "docs", "style"],
  "keywords": ["fixes", "resolves", "closes", "refs", "see"]
}
```