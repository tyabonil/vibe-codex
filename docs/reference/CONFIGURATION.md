# Configuration Guide

## Configuration File

vibe-codex stores configuration in `.vibe-codex.json`:

### Basic Structure
```json
{
  "version": "2.0.0",
  "projectType": "fullstack",
  "modules": {
    "core": { "enabled": true },
    "testing": { 
      "enabled": true,
      "framework": "jest",
      "coverage": {
        "threshold": 80,
        "enforcement": "error"
      }
    }
  }
}
```

## Module Configuration

### Testing Module
```json
{
  "testing": {
    "enabled": true,
    "framework": "jest|vitest|mocha",
    "coverage": {
      "statements": 80,
      "branches": 80,
      "functions": 80,
      "lines": 80
    },
    "patterns": ["**/*.test.js", "**/*.spec.js"],
    "enforcement": "error|warning|info"
  }
}
```

### GitHub Module
```json
{
  "github": {
    "enabled": true,
    "features": {
      "prChecks": true,
      "issueTracking": true,
      "autoMerge": false,
      "branchCleanup": true
    },
    "branch": {
      "pattern": "^(feature|fix|docs|chore)/",
      "protectedBranches": ["main", "develop"]
    }
  }
}
```

### Deployment Module
```json
{
  "deployment": {
    "enabled": true,
    "platform": "vercel|netlify|aws|heroku",
    "environments": ["development", "staging", "production"],
    "checks": {
      "buildSuccess": true,
      "previewDeployment": true,
      "environmentVariables": true
    }
  }
}
```

### Documentation Module
```json
{
  "documentation": {
    "enabled": true,
    "requirements": {
      "readme": true,
      "changelog": true,
      "apiDocs": false,
      "jsdoc": true
    },
    "enforcement": "warning"
  }
}
```

## CLI Configuration Commands

### Interactive configuration
```bash
npx vibe-codex config
```

### View current config
```bash
npx vibe-codex config --list
```

### Set specific values
```bash
npx vibe-codex config --set testing.coverage.threshold 90
npx vibe-codex config --set github.features.autoMerge true
```

### Reset to defaults
```bash
npx vibe-codex config --reset
```

### Import/Export
```bash
npx vibe-codex config --export > team-config.json
npx vibe-codex config --import team-config.json
```

## Environment-Specific Configuration

### Development
```json
{
  "enforcementLevel": "warning",
  "hooks": {
    "pre-commit": true,
    "pre-push": false
  }
}
```

### Production
```json
{
  "enforcementLevel": "error",
  "hooks": {
    "pre-commit": true,
    "pre-push": true
  },
  "modules": {
    "testing": {
      "coverage": { "threshold": 90 }
    }
  }
}
```

## Custom Rules

Add custom rules in `.vibe-codex.json`:

```json
{
  "customRules": [
    {
      "name": "no-console-log",
      "pattern": "console\\.log",
      "message": "Remove console.log statements",
      "severity": "error",
      "files": ["src/**/*.js"]
    }
  ]
}
```

## Ignoring Files

Use `.vibe-codexignore` to exclude files:

```
# Dependencies
node_modules/

# Build outputs
dist/
build/

# Test coverage
coverage/

# Environment files
.env*
```