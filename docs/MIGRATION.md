# Migration Guide

This guide helps you migrate from older versions of vibe-codex or from the monolithic bash-based system to the new modular npm package.

## From Bash Installation to NPM Package

### Overview

The original vibe-codex was installed via bash script and used a monolithic approach. The new version is an npm package with a modular architecture.

### Key Differences

| Old (Bash) | New (NPM) |
|------------|-----------|
| `curl install.sh \| bash` | `npx vibe-codex init` |
| Monolithic rules | Modular rule system |
| Shell scripts | JavaScript/Node.js |
| Manual updates | npm update |
| Fixed rules | Configurable modules |

### Migration Steps

1. **Backup Current Setup**
   ```bash
   # Save your current hooks
   cp -r .git/hooks .git/hooks.backup
   
   # Save any custom configurations
   cp mandatory_rules.md mandatory_rules.backup.md
   ```

2. **Remove Old Installation**
   ```bash
   # Remove old hooks
   rm -f .git/hooks/pre-commit
   rm -f .git/hooks/commit-msg
   rm -f .git/hooks/pre-push
   
   # Remove old files
   rm -f mandatory_rules.md
   rm -f .github/VIBE_CODEX.md
   ```

3. **Install New Version**
   ```bash
   # Initialize vibe-codex
   npx vibe-codex init
   
   # This will:
   # - Create .vibe-codex.json configuration
   # - Install new Git hooks
   # - Set up modular rules
   ```

4. **Configure Modules**
   
   The old monolithic rules are now split into modules:
   
   - **Level 1-2 Rules** → `core` module
   - **Level 3 Rules** → `testing` module
   - **Level 4 Rules** → `github`, `deployment` modules
   - **Level 5 Rules** → `documentation`, `patterns` modules

5. **Update CI/CD**
   
   Old:
   ```yaml
   - run: .git/hooks/pre-push
   ```
   
   New:
   ```yaml
   - run: npx vibe-codex validate --ci
   ```

## Version-to-Version Migration

### From v0.x to v1.0

#### Breaking Changes

1. **Configuration Format**
   - Old: `mandatory_rules.md` or `.vibecodexrc`
   - New: `.vibe-codex.json` with module structure

2. **Command Changes**
   - Old: Direct hook execution
   - New: CLI commands via npx

3. **Rule Structure**
   - Old: Level-based (1-5)
   - New: Module-based with levels within modules

#### Automatic Migration

Run the migration command:

```bash
npx vibe-codex migrate --from 0.x
```

This will:
- Convert old configuration to new format
- Map old rules to appropriate modules
- Update hook installations

#### Manual Migration

If automatic migration fails:

1. **Create New Configuration**
   ```json
   {
     "version": "1.0.0",
     "modules": {
       "core": { "enabled": true },
       "testing": { "enabled": true },
       "github": { "enabled": true },
       "deployment": { "enabled": true },
       "documentation": { "enabled": true },
       "patterns": { "enabled": true }
     }
   }
   ```

2. **Map Old Rules to Modules**
   
   | Old Rule | New Module | New Rule ID |
   |----------|------------|-------------|
   | No secrets | core | SEC-1 |
   | Branch naming | core | WF-2 |
   | Test coverage | testing | TEST-1 |
   | PR template | github | GH-1 |
   | README sections | documentation | DOC-1 |

3. **Update Custom Rules**
   
   Old custom rule:
   ```bash
   # In hooks/pre-commit
   if grep -r "console.log" src/; then
     echo "Remove console.log"
     exit 1
   fi
   ```
   
   New custom rule:
   ```json
   {
     "modules": {
       "patterns": {
         "customRules": [{
           "id": "NO-CONSOLE",
           "pattern": "console\\.log",
           "message": "Remove console.log statements",
           "severity": "error"
         }]
       }
     }
   }
   ```

## Configuration Migration Examples

### Basic Project

Old `.vibecodexrc`:
```
enforce_level=3
skip_tests=false
```

New `.vibe-codex.json`:
```json
{
  "version": "1.0.0",
  "modules": {
    "core": { "enabled": true },
    "testing": {
      "enabled": true,
      "coverageThreshold": 80
    }
  },
  "validation": {
    "enforceLevel": 3
  }
}
```

### Enterprise Project

Old configuration spread across multiple files becomes:

```json
{
  "version": "1.0.0",
  "modules": {
    "core": { "enabled": true },
    "testing": {
      "enabled": true,
      "coverageThreshold": 90,
      "requireTestFiles": true
    },
    "github": {
      "enabled": true,
      "requirePRTemplate": true,
      "requireIssueTemplates": true,
      "requireCodeOwners": true
    },
    "github-workflow": {
      "enabled": true,
      "requireCI": true,
      "requireSecurityScanning": true
    },
    "deployment": {
      "enabled": true,
      "platforms": ["docker"],
      "requireDockerfile": true
    },
    "documentation": {
      "enabled": true,
      "requireApiDocs": true,
      "requireChangelog": true
    },
    "patterns": {
      "enabled": true,
      "maxComplexity": 10
    }
  }
}
```

## Hook Migration

### Old Hooks

```bash
#!/bin/bash
# .git/hooks/pre-commit
source mandatory_rules.sh
check_secrets
check_files
```

### New Hooks

Automatically installed, but internally calls:

```bash
#!/bin/sh
npx vibe-codex validate --hook pre-commit
```

## CI/CD Migration

### GitHub Actions

Old:
```yaml
- name: Check rules
  run: |
    chmod +x .github/scripts/check_rules.sh
    .github/scripts/check_rules.sh
```

New:
```yaml
- name: Validate with vibe-codex
  run: npx vibe-codex validate --ci
```

### GitLab CI

Old:
```yaml
validate:
  script:
    - bash .gitlab/check_mandatory_rules.sh
```

New:
```yaml
validate:
  script:
    - npx vibe-codex validate --ci
```

## Custom Rule Migration

### Shell Script Rules

Old:
```bash
# check_imports.sh
if find . -name "*.js" -exec grep -l "require.*lodash" {} \; | grep -v package.json; then
  echo "Don't use lodash directly"
  exit 1
fi
```

New custom module:
```javascript
// custom-rules.js
export default {
  name: 'custom',
  rules: [{
    id: 'NO-LODASH',
    check: async (context) => {
      const violations = [];
      for (const file of context.files) {
        if (file.content.includes('require') && 
            file.content.includes('lodash') &&
            !file.path.includes('package.json')) {
          violations.push({
            file: file.path,
            message: "Don't use lodash directly"
          });
        }
      }
      return violations;
    }
  }]
};
```

## Rollback Plan

If you need to rollback:

1. **Restore Old Hooks**
   ```bash
   cp -r .git/hooks.backup/* .git/hooks/
   chmod +x .git/hooks/*
   ```

2. **Remove New Configuration**
   ```bash
   rm .vibe-codex.json
   ```

3. **Restore Old Files**
   ```bash
   cp mandatory_rules.backup.md mandatory_rules.md
   ```

## Common Migration Issues

### Issue: Hooks Not Running

Solution:
```bash
npx vibe-codex update --hooks
```

### Issue: Old Rules Not Found

Map old rules to new modules in `.vibe-codex.json`.

### Issue: CI Failing

Update CI configuration to use npx commands.

### Issue: Custom Scripts Breaking

Convert shell scripts to JavaScript modules.

## Getting Help

1. Run diagnostics:
   ```bash
   npx vibe-codex doctor
   ```

2. Check migration status:
   ```bash
   npx vibe-codex migrate --check
   ```

3. File an issue with migration details:
   - Old version
   - Error messages
   - Configuration files