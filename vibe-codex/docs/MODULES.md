# vibe-codex Modules

## Overview

vibe-codex uses a modular architecture that allows you to enable only the rules and checks relevant to your project. Each module focuses on a specific aspect of development workflow enforcement.

## Core Module

The foundation module that provides essential git workflow and security checks.

### Features
- Pre-commit security scanning
- Sensitive data leak prevention  
- Basic git workflow enforcement
- Commit message validation

### Configuration
```json
{
  "core": {
    "enabled": true,
    "hooks": {
      "pre-commit": true,
      "commit-msg": true
    },
    "security": {
      "scanSecrets": true,
      "blockPatterns": ["private_key", "api_key", "password"]
    }
  }
}
```

### Rules Enforced
- No secrets in commits (API keys, passwords, tokens)
- Proper git workflow (no direct commits to protected branches)
- Valid commit message format

## Testing Module

Enforces test coverage and quality standards.

### Features
- Test coverage thresholds
- Test file naming conventions
- Pre-push test execution
- Coverage report generation

### Configuration
```json
{
  "testing": {
    "enabled": true,
    "framework": "jest",
    "coverage": {
      "statements": 80,
      "branches": 80,
      "functions": 80,
      "lines": 80
    },
    "patterns": {
      "test": ["**/*.test.js", "**/*.spec.js"],
      "exclude": ["node_modules", "dist"]
    },
    "hooks": {
      "pre-push": true
    }
  }
}
```

### Supported Frameworks
- Jest (default)
- Vitest
- Mocha
- Jasmine

## GitHub Module

Integrates with GitHub for PR/Issue workflow automation.

### Features
- PR template enforcement
- Issue linking requirements
- Auto-labeling
- Branch name validation
- PR review automation

### Configuration
```json
{
  "github": {
    "enabled": true,
    "features": {
      "prChecks": true,
      "issueTracking": true,
      "autoLabels": true,
      "branchProtection": true
    },
    "pr": {
      "template": true,
      "minReviewers": 1,
      "blockOnFailingChecks": true
    },
    "branch": {
      "pattern": "^(feature|fix|docs|chore)/",
      "requireIssueNumber": true
    }
  }
}
```

### GitHub Actions
When enabled, installs workflow files for:
- PR compliance checking
- Automated testing
- Code quality gates
- Deployment validations

## Deployment Module

Platform-specific deployment validation and checks.

### Features
- Build success validation
- Environment variable checks
- Preview deployment testing
- Production safeguards

### Configuration
```json
{
  "deployment": {
    "enabled": true,
    "platform": "vercel",
    "environments": {
      "development": {
        "autoMerge": true,
        "requiredChecks": ["build", "test"]
      },
      "production": {
        "autoMerge": false,
        "requiredChecks": ["build", "test", "security", "performance"],
        "requireApproval": true
      }
    }
  }
}
```

### Supported Platforms
- Vercel
- Netlify
- AWS Amplify
- Heroku
- Custom (via configuration)

## Documentation Module

Ensures project documentation standards are maintained.

### Features
- README validation
- API documentation checks
- Changelog enforcement
- Code comment standards

### Configuration
```json
{
  "documentation": {
    "enabled": true,
    "requirements": {
      "readme": {
        "required": true,
        "sections": ["installation", "usage", "api", "contributing"]
      },
      "changelog": {
        "required": true,
        "format": "keepachangelog"
      },
      "code": {
        "jsdoc": true,
        "minCommentRatio": 0.1
      }
    }
  }
}
```

### Documentation Standards
- README must include key sections
- CHANGELOG follows Keep a Changelog format
- JSDoc comments for public APIs
- Inline documentation for complex logic

## Module Development

### Creating Custom Modules

1. **Module Structure**
```javascript
module.exports = {
  name: 'custom-module',
  description: 'My custom module',
  
  async init(config) {
    // Module initialization
  },
  
  async validate(files, config) {
    // Return violations array
    return {
      valid: true,
      violations: []
    };
  },
  
  async fix(violations, config) {
    // Auto-fix violations where possible
  }
};
```

2. **Register Module**
```json
{
  "customModules": [
    "./modules/custom-module.js"
  ]
}
```

### Module API

All modules implement this interface:

```typescript
interface Module {
  name: string;
  description: string;
  enabled: boolean;
  
  init(config: ModuleConfig): Promise<void>;
  validate(context: ValidationContext): Promise<ValidationResult>;
  fix?(violations: Violation[]): Promise<FixResult>;
  getHooks?(): Hook[];
}
```

## Module Interactions

Modules can interact and depend on each other:

```json
{
  "modules": {
    "testing": {
      "enabled": true,
      "dependencies": ["core"]
    },
    "deployment": {
      "enabled": true,
      "dependencies": ["testing", "documentation"]
    }
  }
}
```

## Best Practices

1. **Start with Core** - Always enable the core module
2. **Progressive Enhancement** - Add modules as your project grows
3. **Team Agreement** - Discuss thresholds with your team
4. **Regular Reviews** - Periodically review and adjust rules
5. **Custom Rules** - Create custom modules for domain-specific needs