# Migration Guide: v0.6 to v0.8

This guide helps you migrate from vibe-codex v0.6.x (interactive mode) to v0.8.x (command-line first).

## Breaking Changes

### 1. No More Interactive Mode

**Before (v0.6):**
```bash
npx vibe-codex init
# Interactive prompts would appear
```

**After (v0.8):**
```bash
# Must specify all options via CLI
npx vibe-codex init --type=web --modules=core,testing,github-workflow
```

### 2. Required Module Configuration

The `init` command now requires explicit module configuration:

```bash
# Option 1: Specify exact modules
npx vibe-codex init --type=api --modules=core,testing

# Option 2: Use preset for project type
npx vibe-codex init --type=fullstack --preset

# Option 3: Minimal setup
npx vibe-codex init --type=web --minimal

# Option 4: Install all modules
npx vibe-codex init --type=library --modules=all
```

### 3. Config Command Changes

**Before (v0.6):**
```bash
npx vibe-codex config
# Interactive menu would appear
```

**After (v0.8):**
```bash
# List configuration
npx vibe-codex config --list

# Get specific value
npx vibe-codex config --get testing.coverage.threshold

# Set value
npx vibe-codex config --set testing.coverage.threshold 90
```

### 4. Update-Issue Command Changes

**Before (v0.6):**
```bash
npx vibe-codex update-issue 123
# Would prompt for message
```

**After (v0.8):**
```bash
# Must provide message via CLI
npx vibe-codex update-issue --issue=123 --message="Completed implementation"

# Or from file
npx vibe-codex update-issue --issue=123 --file=./update.md
```

## Migration Steps

### Step 1: Update vibe-codex

```bash
npm install -g vibe-codex@latest
# or
npm install --save-dev vibe-codex@latest
```

### Step 2: Update Configuration File

The configuration file format remains the same (`.vibe-codex.json`), but ensure it has the correct version:

```json
{
  "version": "2.0.0",
  "projectType": "your-project-type",
  "modules": {
    // your modules
  }
}
```

### Step 3: Update Scripts

Update any scripts that use vibe-codex commands:

**package.json:**
```json
{
  "scripts": {
    // Before
    "setup": "vibe-codex init",
    "validate": "vibe-codex validate",
    
    // After
    "setup": "vibe-codex init --type=web --preset",
    "validate": "vibe-codex validate",
    "validate:fix": "vibe-codex validate --fix"
  }
}
```

### Step 4: Update CI/CD

**GitHub Actions:**
```yaml
# Before
- run: npx vibe-codex@0.6 init
  
# After  
- run: npx vibe-codex@latest init --type=web --preset --force
```

### Step 5: Update Git Hooks

Re-install git hooks to ensure they use the latest version:

```bash
npx vibe-codex update --hooks
```

## Common Migration Scenarios

### Scenario 1: Simple Web Project

```bash
# v0.6 (interactive)
npx vibe-codex init
# Selected: web, core + testing + github

# v0.8 equivalent
npx vibe-codex init --type=web --modules=core,testing,github-workflow
```

### Scenario 2: Full-Stack with All Features

```bash
# v0.6 (interactive)
npx vibe-codex init
# Selected: fullstack, all modules

# v0.8 equivalent
npx vibe-codex init --type=fullstack --modules=all
```

### Scenario 3: API with Advanced Hooks

```bash
# v0.6 (interactive)
npx vibe-codex init
# Selected: api, selected modules, advanced hooks

# v0.8 equivalent
npx vibe-codex init --type=api --preset --with-advanced-hooks=pr-health,issue-tracking
```

## Automation Scripts

### Migration Helper Script

Save this as `migrate-vibe-codex.sh`:

```bash
#!/bin/bash

# Read existing config
if [ -f ".vibe-codex.json" ]; then
  PROJECT_TYPE=$(node -e "console.log(require('./.vibe-codex.json').projectType || 'web')")
  MODULES=$(node -e "
    const config = require('./.vibe-codex.json');
    const modules = Object.keys(config.modules || {})
      .filter(m => config.modules[m].enabled !== false);
    console.log(modules.join(','));
  ")
  
  echo "Detected project type: $PROJECT_TYPE"
  echo "Detected modules: $MODULES"
  
  # Re-initialize with v0.8
  npx vibe-codex@latest init --type=$PROJECT_TYPE --modules=$MODULES --force
else
  echo "No existing configuration found. Please run:"
  echo "npx vibe-codex init --type=<type> --modules=<modules>"
fi
```

## Troubleshooting

### Error: "Module configuration required"

You must specify modules when running init:
```bash
# Wrong
npx vibe-codex init --type=web

# Correct
npx vibe-codex init --type=web --preset
# or
npx vibe-codex init --type=web --modules=core,testing
```

### Error: "Unknown option '--interactive'"

Interactive mode has been removed. Use explicit CLI options instead.

### Git Hooks Not Working

Re-install hooks after migration:
```bash
npx vibe-codex update --hooks
```

## Benefits of v0.8

1. **CI/CD Friendly** - No interactive prompts blocking automation
2. **Scriptable** - All commands can be scripted and automated
3. **Faster** - No waiting for interactive prompts
4. **Explicit** - Clear command-line arguments show exactly what's happening
5. **Composable** - Easy to chain commands in scripts

## Need Help?

- Check the [CLI Reference](./CLI-REFERENCE.md) for all available options
- Review [Configuration Guide](./CONFIGURATION.md) for module settings
- Report issues at [GitHub Issues](https://github.com/tyabonil/vibe-codex/issues)