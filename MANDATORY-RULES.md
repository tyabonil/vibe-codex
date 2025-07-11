# Mandatory Rules for vibe-codex

> Simple rules for maintaining code quality

## Core Rules

### 1. Security
- No hardcoded secrets or API keys
- No passwords in code
- Use environment variables for sensitive data

### 2. Git Workflow  
- Use conventional commit messages (feat:, fix:, docs:, etc.)
- Reference issue numbers in PR descriptions
- Keep commits focused and atomic

### 3. Testing
- Include tests for new features
- Maintain existing test coverage
- Fix failing tests before merging

### 4. Documentation
- Update README when adding features
- Document breaking changes
- Keep documentation simple and clear

## Enforcement

These rules are enforced through:
- Git hooks (pre-commit, commit-msg)
- GitHub Actions checks
- PR review requirements

## Installation

```bash
npx vibe-codex init
```

Select the rules you want to enforce in your project.