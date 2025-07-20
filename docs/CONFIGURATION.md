# Configuration Guide

This guide covers all configuration options available in vibe-codex.

## Configuration File

vibe-codex uses a `.vibe-codex.json` file in your project root for configuration. This file is created during initialization but can be edited manually.

## Basic Structure

```json
{
  "version": "2.0.0",
  "projectType": "web",
  "modules": {
    "module-name": {
      "enabled": true,
      "option1": "value1",
      "option2": "value2"
    }
  }
}
```

## Managing Configuration

### Using the CLI

```bash
# View all configuration
npx vibe-codex config --list

# Get specific value
npx vibe-codex config --get testing.coverage.threshold

# Set configuration value
npx vibe-codex config --set testing.coverage.threshold 90

# Reset to defaults
npx vibe-codex config --reset
```

### Direct File Editing

You can also edit the `.vibe-codex.json` file directly. After editing, run validation to ensure your configuration is valid:

```bash
npx vibe-codex validate
```

## Module Configuration

### Core Module

The core module is always enabled and provides essential security and workflow rules.

```json
{
  "modules": {
    "core": {
      "enabled": true,
      "secretPatterns": [
        "custom_secret_pattern"
      ],
      "workflowRules": {
        "requireIssueReference": true,
        "branchNamingPattern": "^(feature|bugfix|hotfix)/issue-\\d+-[\\w-]+$"
      }
    }
  }
}
```

**Options:**
- `secretPatterns`: Additional regex patterns for detecting secrets
- `workflowRules.requireIssueReference`: Enforce issue references in commits
- `workflowRules.branchNamingPattern`: Custom branch naming regex

### Testing Module

Configure test coverage requirements and testing standards.

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
        "branches": 70,
        "statements": 80
      },
      "testFilePattern": "**/*.{test,spec}.{js,ts,jsx,tsx}",
      "requireTestFiles": true,
      "excludePatterns": [
        "**/node_modules/**",
        "**/vendor/**",
        "**/*.config.js"
      ]
    }
  }
}
```

**Options:**
- `framework`: Testing framework (jest, mocha, vitest, etc.)
- `coverage.threshold`: Global minimum coverage percentage
- `coverage.lines/functions/branches/statements`: Specific coverage thresholds
- `testFilePattern`: Glob pattern for identifying test files
- `requireTestFiles`: Whether every source file needs a test
- `excludePatterns`: Files/directories to exclude from checks

### GitHub Workflow Module

GitHub-specific features and requirements.

```json
{
  "modules": {
    "github-workflow": {
      "enabled": true,
      "features": ["pr-checks", "issue-tracking", "auto-labeling"],
      "requirePRTemplate": true,
      "requireIssueTemplates": true,
      "requireCodeOwners": false,
      "requireContributing": true,
      "prLabels": {
        "size/small": { "maxChanges": 50 },
        "size/medium": { "maxChanges": 250 },
        "size/large": { "maxChanges": 1000 }
      }
    }
  }
}
```

**Options:**
- `features`: Array of GitHub features to enable
- `requirePRTemplate`: Enforce pull request template
- `requireIssueTemplates`: Enforce issue templates
- `requireCodeOwners`: Require CODEOWNERS file
- `requireContributing`: Require CONTRIBUTING.md
- `prLabels`: Auto-labeling configuration
- `requirePRTemplate`: Enforce pull request templates
- `requireIssueTemplates`: Enforce issue templates
- `requireCodeOwners`: Require CODEOWNERS file
- `requireContributing`: Require CONTRIBUTING.md
- `templates`: Custom template locations

### GitHub Workflow Module

GitHub Actions and CI/CD configuration.

```json
{
  "modules": {
    "github-workflow": {
      "enabled": true,
      "requireCI": true,
      "requireSecurityScanning": true,
      "requireDependencyUpdates": true,
      "workflowTimeout": 60,
      "requiredWorkflows": [
        "ci",
        "security"
      ]
    }
  }
}
```

**Options:**
- `requireCI`: Enforce CI workflow exists
- `requireSecurityScanning`: Require security scanning (CodeQL, etc.)
- `requireDependencyUpdates`: Require Dependabot or Renovate
- `workflowTimeout`: Maximum workflow runtime in minutes
- `requiredWorkflows`: List of required workflow names

### Deployment Module

Deployment and platform-specific configuration.

```json
{
  "modules": {
    "deployment": {
      "enabled": true,
      "platforms": ["vercel", "netlify", "docker"],
      "requireDockerfile": false,
      "requireBuildScript": true,
      "requireHealthCheck": true,
      "environmentVariables": {
        "required": ["NODE_ENV", "API_URL"],
        "documented": true
      }
    }
  }
}
```

**Options:**
- `platforms`: Target deployment platforms
- `requireDockerfile`: Enforce Dockerfile presence
- `requireBuildScript`: Require build script in package.json
- `requireHealthCheck`: Require health check endpoint
- `environmentVariables`: Environment variable requirements

### Documentation Module

Documentation standards and requirements.

```json
{
  "modules": {
    "documentation": {
      "enabled": true,
      "requiredReadmeSections": [
        "installation",
        "usage",
        "api",
        "contributing"
      ],
      "requireApiDocs": true,
      "requireChangelog": true,
      "requireJsdoc": true,
      "minReadmeLength": 200,
      "changelogFormat": "keepachangelog"
    }
  }
}
```

**Options:**
- `requiredReadmeSections`: Required README.md sections
- `requireApiDocs`: Enforce API documentation
- `requireChangelog`: Require CHANGELOG.md
- `requireJsdoc`: Enforce JSDoc comments
- `minReadmeLength`: Minimum README character count
- `changelogFormat`: Changelog format standard

### Patterns Module

Code organization and quality patterns.

```json
{
  "modules": {
    "patterns": {
      "enabled": true,
      "maxFileLength": 500,
      "maxFunctionLength": 50,
      "maxComplexity": 10,
      "requireIndexFiles": true,
      "enforceNamingConventions": true,
      "fileNaming": {
        "components": "PascalCase",
        "utilities": "camelCase",
        "constants": "UPPER_SNAKE_CASE"
      }
    }
  }
}
```

**Options:**
- `maxFileLength`: Maximum lines per file
- `maxFunctionLength`: Maximum lines per function
- `maxComplexity`: Maximum cyclomatic complexity
- `requireIndexFiles`: Enforce index files in directories
- `enforceNamingConventions`: Enable naming convention checks
- `fileNaming`: Specific naming rules by file type

## Global Configuration

### Environment-Specific Configuration

You can use environment-specific configuration files:

- `.vibe-codex.json` - Default configuration
- `.vibe-codex.development.json` - Development overrides
- `.vibe-codex.production.json` - Production overrides

### Configuration Inheritance

Configurations can extend from a base configuration:

```json
{
  "extends": "@company/vibe-codex-config",
  "modules": {
    "testing": {
      "coverageThreshold": 90
    }
  }
}
```

## CLI Configuration

Some configurations can be overridden via CLI flags:

```bash
# Override module selection
npx vibe-codex validate --modules core,testing

# Use different config file
npx vibe-codex validate --config .vibe-codex.prod.json

# CI mode (fail on warnings)
npx vibe-codex validate --ci
```

## Advanced Configuration

### Custom Rules

Add custom validation rules to any module:

```json
{
  "modules": {
    "core": {
      "customRules": [
        {
          "id": "CUSTOM-1",
          "pattern": "console\\.log",
          "message": "Remove console.log statements",
          "severity": "error"
        }
      ]
    }
  }
}
```

### Hook Configuration

Customize Git hook behavior:

```json
{
  "hooks": {
    "pre-commit": {
      "enabled": true,
      "runValidation": true,
      "modules": ["core", "patterns"]
    },
    "pre-push": {
      "enabled": true,
      "runTests": true,
      "runFullValidation": true
    }
  }
}
```

### Ignore Patterns

Global ignore patterns for all modules:

```json
{
  "ignore": [
    "**/build/**",
    "**/dist/**",
    "**/*.min.js",
    "**/vendor/**"
  ]
}
```

## Validation Levels

Configure which rule levels to enforce:

```json
{
  "validation": {
    "enforceLevel": 3,
    "treatWarningsAsErrors": false,
    "allowedViolations": {
      "DOC-1": 5,
      "PATTERN-2": 10
    }
  }
}
```

## Module Dependencies

Some modules depend on others. Dependencies are automatically enabled:

- `github-workflow` requires `github`
- `deployment` requires `core`

## Disabling Specific Rules

Disable individual rules without disabling the entire module:

```json
{
  "modules": {
    "patterns": {
      "enabled": true,
      "disabledRules": ["PATTERN-3", "PATTERN-5"]
    }
  }
}
```

## Configuration Validation

vibe-codex validates your configuration on load. To test your configuration:

```bash
npx vibe-codex config validate
```

## Examples

### Minimal Configuration

```json
{
  "version": "1.0.0",
  "modules": {
    "core": {
      "enabled": true
    }
  }
}
```

### Strict Configuration

```json
{
  "version": "1.0.0",
  "modules": {
    "core": { "enabled": true },
    "testing": {
      "enabled": true,
      "coverageThreshold": 95
    },
    "github": {
      "enabled": true,
      "requirePRTemplate": true,
      "requireIssueTemplates": true,
      "requireCodeOwners": true
    },
    "documentation": {
      "enabled": true,
      "requireJsdoc": true,
      "minReadmeLength": 500
    },
    "patterns": {
      "enabled": true,
      "maxComplexity": 5,
      "maxFileLength": 300
    }
  },
  "validation": {
    "treatWarningsAsErrors": true
  }
}
```

## Migration from Older Versions

If migrating from pre-1.0.0 versions, use the migration command:

```bash
npx vibe-codex migrate
```

This will convert your old configuration to the new modular format.