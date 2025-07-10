# Migration Guide

## Migrating from v1.x to v2.x

Version 2.0 introduces a modular architecture and npm-based installation. Here's how to migrate your project.

### Breaking Changes

1. **Installation Method**
   - Old: Clone repository and run bash scripts
   - New: Install via npm/npx

2. **Configuration Format**
   - Old: Multiple config files (`.vibe-codex/`, `rules.json`)
   - New: Single `.vibe-codex.json` file

3. **Command Structure**
   - Old: `./scripts/vibe-codex.sh <command>`
   - New: `npx vibe-codex <command>`

### Migration Steps

#### 1. Backup Current Configuration
```bash
# Save your current rules
cp -r .vibe-codex .vibe-codex-backup
cp rules.json rules.backup.json
```

#### 2. Uninstall v1.x
```bash
# Remove old installation
rm -rf .vibe-codex/
rm -f .git/hooks/pre-commit
rm -f .git/hooks/commit-msg
rm -f .git/hooks/pre-push
```

#### 3. Install v2.x
```bash
npx vibe-codex init
```

#### 4. Migrate Configuration

Old format (v1.x):
```json
{
  "rules": {
    "no-console": true,
    "test-coverage": 80
  },
  "hooks": ["pre-commit", "pre-push"]
}
```

New format (v2.x):
```json
{
  "version": "2.0.0",
  "modules": {
    "core": {
      "enabled": true,
      "rules": {
        "no-console": {
          "enabled": true,
          "severity": "error"
        }
      }
    },
    "testing": {
      "enabled": true,
      "coverage": {
        "threshold": 80
      }
    }
  }
}
```

#### 5. Update CI/CD

Old GitHub Actions:
```yaml
- name: Run vibe-codex
  run: |
    git clone https://github.com/tyabonil/vibe-codex.git
    ./vibe-codex/scripts/check.sh
```

New GitHub Actions:
```yaml
- name: Run vibe-codex
  run: npx vibe-codex validate
```

#### 6. Update Scripts

Old package.json:
```json
{
  "scripts": {
    "check": "./scripts/vibe-codex.sh check"
  }
}
```

New package.json:
```json
{
  "scripts": {
    "check": "npx vibe-codex validate"
  }
}
```

### Feature Mapping

| v1.x Feature | v2.x Equivalent |
|--------------|-----------------|
| `check-all.sh` | `npx vibe-codex validate` |
| `fix-issues.sh` | `npx vibe-codex validate --fix` |
| `install-hooks.sh` | Automatic during `init` |
| `rules.json` | `.vibe-codex.json` modules config |
| Custom rules | Custom modules |

### Common Issues

#### Git Hooks Not Working
```bash
# Reinstall hooks
npx vibe-codex doctor --fix
```

#### Configuration Not Found
```bash
# Generate new config
npx vibe-codex init --force
```

#### Module Errors
```bash
# Check module compatibility
npx vibe-codex update --check
```

## Migrating from ESLint/Prettier

vibe-codex complements existing tools. Here's how to integrate:

### 1. Keep Existing Tools
vibe-codex works alongside ESLint and Prettier:

```json
{
  "modules": {
    "core": {
      "enabled": true,
      "integration": {
        "eslint": true,
        "prettier": true
      }
    }
  }
}
```

### 2. Migrate Rules Gradually

ESLint rule:
```json
{
  "rules": {
    "no-console": "error"
  }
}
```

vibe-codex equivalent:
```json
{
  "modules": {
    "core": {
      "customRules": [{
        "name": "no-console",
        "pattern": "console\\.",
        "severity": "error"
      }]
    }
  }
}
```

### 3. Unified Workflow
```json
{
  "scripts": {
    "lint": "eslint . && npx vibe-codex validate",
    "format": "prettier --write . && npx vibe-codex validate --fix"
  }
}
```

## Migrating from Husky

### 1. Disable Husky Temporarily
```bash
npm uninstall husky
rm -rf .husky
```

### 2. Install vibe-codex
```bash
npx vibe-codex init
```

### 3. Migrate Hook Scripts

Husky pre-commit:
```bash
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"
npm test
```

vibe-codex handles this automatically, but you can customize:
```json
{
  "modules": {
    "testing": {
      "hooks": {
        "pre-commit": {
          "runTests": true
        }
      }
    }
  }
}
```

### 4. Advanced Hook Customization

If you need custom hooks beyond vibe-codex:
```bash
# .vibe-codex/hooks/pre-commit
#!/bin/bash
# Run vibe-codex checks
npx vibe-codex validate --hook pre-commit

# Run custom checks
./scripts/custom-check.sh
```

## Migrating Custom Scripts

### Before (Custom Script)
```bash
#!/bin/bash
# check-pr.sh
if ! grep -q "ISSUE-" <<< "$BRANCH_NAME"; then
  echo "Branch must reference an issue"
  exit 1
fi
```

### After (vibe-codex Module)
```javascript
// custom-modules/issue-reference.js
module.exports = {
  name: 'issue-reference',
  async validate(context) {
    const branch = context.branch;
    if (!branch.match(/ISSUE-\d+/)) {
      return {
        valid: false,
        violations: [{
          level: 2,
          message: 'Branch must reference an issue'
        }]
      };
    }
    return { valid: true, violations: [] };
  }
};
```

Register in config:
```json
{
  "customModules": ["./custom-modules/issue-reference.js"]
}
```

## Version Compatibility

| vibe-codex | Node.js | npm | Git |
|------------|---------|-----|-----|
| 2.x | 14+ | 6+ | 2.13+ |
| 1.x | 12+ | 5+ | 2.0+ |

## Getting Help

1. Run diagnostics: `npx vibe-codex doctor`
2. Check documentation: `npx vibe-codex --help`
3. File an issue: [GitHub Issues](https://github.com/tyabonil/vibe-codex/issues)
4. Join discussions: [GitHub Discussions](https://github.com/tyabonil/vibe-codex/discussions)