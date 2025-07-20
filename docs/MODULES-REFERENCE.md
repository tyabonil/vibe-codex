# Modules Reference

Complete reference for all vibe-codex modules and their validation rules.

## Core Module

**Always enabled** - Provides essential security and workflow validation.

### Rules

#### SEC-001: No Secrets in Code
- Scans for API keys, passwords, tokens, and private keys
- Checks all code files except test directories
- **Fix**: Move secrets to environment variables

#### SEC-002: Environment File Security
- Ensures `.env` files are in `.gitignore`
- **Fix**: Add `.env` to `.gitignore`

#### WORKFLOW-001: Branch Naming Convention
- Validates branch names follow pattern: `type/issue-number-description`
- Types: feature, fix, docs, chore, refactor
- **Fix**: Rename branch to follow convention

#### GIT-001: Git Repository
- Ensures project is a git repository
- **Fix**: Run `git init`

#### GIT-002: Remote Configuration
- Checks for configured git remote
- **Fix**: Add remote with `git remote add origin <url>`

### Configuration

```json
{
  "modules": {
    "core": {
      "enabled": true,
      "secretPatterns": ["custom_pattern"],
      "branchPattern": "^(feature|fix)/issue-\\d+-.*$"
    }
  }
}
```

## Testing Module

Enforces test coverage and quality standards.

### Rules

#### TEST-001: Test Directory Exists
- Checks for test directory (test/, tests/, __tests__, spec/)
- **Fix**: Create test directory and add tests

#### TEST-002: Test Script Configured
- Ensures `package.json` has test script
- **Fix**: Add test script to package.json

#### TEST-003: Coverage Threshold
- Validates test coverage meets threshold
- **Fix**: Add more tests to improve coverage

### Configuration

```json
{
  "modules": {
    "testing": {
      "enabled": true,
      "framework": "jest",
      "coverage": {
        "threshold": 80,
        "lines": 80,
        "functions": 80,
        "branches": 70
      }
    }
  }
}
```

## GitHub Workflow Module

GitHub-specific features and automation.

### Rules

#### GH-001: Pull Request Template
- Checks for PR template in `.github/`
- **Fix**: Create `.github/pull_request_template.md`

#### GH-002: Issue Templates
- Checks for issue templates in `.github/ISSUE_TEMPLATE/`
- **Fix**: Create issue templates

### Features

- **pr-checks**: Automated PR validation
- **issue-tracking**: Issue update reminders
- **auto-labeling**: Automatic PR labels based on size/type

### Configuration

```json
{
  "modules": {
    "github-workflow": {
      "enabled": true,
      "features": ["pr-checks", "issue-tracking"],
      "requirePRTemplate": true,
      "requireIssueTemplates": true
    }
  }
}
```

## Documentation Module

Ensures proper project documentation.

### Rules

#### DOC-001: README Required
- Checks for README.md file
- **Fix**: Create README.md with project information

#### DOC-002: Documentation Directory
- Checks for docs/ directory
- **Fix**: Create docs/ directory for documentation

### Configuration

```json
{
  "modules": {
    "documentation": {
      "enabled": true,
      "requireReadme": true,
      "requireDocs": true,
      "requireChangelog": false
    }
  }
}
```

## Deployment Module

Platform-specific deployment validation.

### Rules

#### DEPLOY-001: Platform Configuration
- Validates deployment configuration files
- Supports: Vercel, Netlify, AWS, Heroku
- **Fix**: Create appropriate config file

### Configuration

```json
{
  "modules": {
    "deployment": {
      "enabled": true,
      "platform": "vercel",
      "validateConfig": true
    }
  }
}
```

## Quality Module

Code quality and linting standards.

### Rules

#### QA-001: No Console Statements
- Scans for console.log/debug/error in production code
- **Fix**: Remove console statements

#### QA-002: No Debugger Statements
- Scans for debugger statements
- **Fix**: Remove debugger statements

#### QA-003: TODO Comments
- Warns about TODO/FIXME/HACK comments
- **Fix**: Address or remove TODO comments

#### QUALITY-001: Linter Configuration
- Checks for ESLint or similar configuration
- **Fix**: Add linter configuration

### Configuration

```json
{
  "modules": {
    "quality": {
      "enabled": true,
      "linter": "eslint",
      "allowConsoleInTests": true,
      "maxTodoComments": 10
    }
  }
}
```

## Patterns Module

Code organization and architecture patterns.

### Rules

#### PATTERN-001: Project Structure
- Validates standard project structure
- **Fix**: Organize files according to pattern

### Configuration

```json
{
  "modules": {
    "patterns": {
      "enabled": true,
      "structure": "mvc",
      "srcDirectory": "src",
      "testDirectory": "test"
    }
  }
}
```

## Module Presets

When using `--preset` during initialization:

### Web Projects
- core, github-workflow, testing, documentation

### API Projects
- core, github-workflow, testing, documentation

### Fullstack Projects
- core, github-workflow, testing, deployment, documentation

### Library Projects
- core, github-workflow, documentation

## Custom Module Development

You can create custom modules by placing them in a `.vibe-codex/modules/` directory:

```javascript
// .vibe-codex/modules/custom-module.js
module.exports = {
  name: 'custom',
  description: 'Custom validation rules',
  
  async validate(context) {
    const violations = [];
    
    // Your validation logic here
    
    return {
      violations,
      warnings: [],
      passed: []
    };
  }
};
```

## Rule Severity Levels

- **Error**: Must be fixed (blocks commits/pushes)
- **Warning**: Should be fixed (doesn't block by default)
- **Info**: Suggestions for improvement

## Disabling Rules

To disable specific rules:

```json
{
  "modules": {
    "core": {
      "enabled": true,
      "disabledRules": ["WORKFLOW-001"]
    }
  }
}
```

## Module Dependencies

Some modules depend on others:

- `deployment` requires `testing`
- `patterns` requires `documentation`

Dependencies are automatically enabled during initialization.