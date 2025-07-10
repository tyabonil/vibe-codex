# Troubleshooting Guide

This guide helps you resolve common issues with vibe-codex.

## Installation Issues

### npm/npx Command Not Found

**Problem:** `npx vibe-codex` returns "command not found"

**Solutions:**
1. Ensure Node.js and npm are installed:
   ```bash
   node --version
   npm --version
   ```

2. Update npm to the latest version:
   ```bash
   npm install -g npm@latest
   ```

3. Clear npm cache:
   ```bash
   npm cache clean --force
   ```

### Permission Errors

**Problem:** Permission denied when installing globally

**Solutions:**
1. Use npx (recommended):
   ```bash
   npx vibe-codex init
   ```

2. Fix npm permissions:
   ```bash
   npm config set prefix ~/.npm-global
   export PATH=~/.npm-global/bin:$PATH
   ```

3. Use a Node version manager (nvm, n)

## Configuration Issues

### Configuration File Not Found

**Problem:** "Configuration file not found" error

**Solutions:**
1. Run initialization:
   ```bash
   npx vibe-codex init
   ```

2. Check file exists:
   ```bash
   ls -la .vibe-codex.json
   ```

3. Specify config path:
   ```bash
   npx vibe-codex validate --config path/to/config.json
   ```

### Invalid Configuration

**Problem:** "Invalid configuration" error

**Solutions:**
1. Validate configuration:
   ```bash
   npx vibe-codex config validate
   ```

2. Check JSON syntax:
   ```bash
   npx json -f .vibe-codex.json
   ```

3. Reset to defaults:
   ```bash
   npx vibe-codex init --force
   ```

## Git Hook Issues

### Hooks Not Running

**Problem:** Git hooks don't execute on commit/push

**Solutions:**
1. Check hook installation:
   ```bash
   ls -la .git/hooks/
   ```

2. Reinstall hooks:
   ```bash
   npx vibe-codex update --hooks
   ```

3. Check hook permissions:
   ```bash
   chmod +x .git/hooks/pre-commit
   chmod +x .git/hooks/commit-msg
   ```

4. Verify Git version:
   ```bash
   git --version  # Should be 2.9.0 or higher
   ```

### Hook Failures

**Problem:** Commits blocked by failing hooks

**Solutions:**
1. See detailed error:
   ```bash
   npx vibe-codex validate
   ```

2. Fix issues:
   ```bash
   npx vibe-codex validate --fix
   ```

3. Temporarily bypass (use sparingly):
   ```bash
   git commit --no-verify
   ```

## Validation Issues

### Validation Takes Too Long

**Problem:** Validation runs slowly on large projects

**Solutions:**
1. Validate specific modules:
   ```bash
   npx vibe-codex validate --modules core,testing
   ```

2. Add ignore patterns:
   ```json
   {
     "ignore": [
       "**/node_modules/**",
       "**/build/**",
       "**/dist/**"
     ]
   }
   ```

3. Run on changed files only:
   ```bash
   npx vibe-codex validate --changed
   ```

### False Positives

**Problem:** Rules flagging valid code

**Solutions:**
1. Disable specific rules:
   ```json
   {
     "modules": {
       "patterns": {
         "disabledRules": ["PATTERN-3"]
       }
     }
   }
   ```

2. Add exceptions:
   ```json
   {
     "modules": {
       "core": {
         "secretPatterns": {
           "exclude": ["example_key", "mock_secret"]
         }
       }
     }
   }
   ```

3. Use inline comments (if supported):
   ```javascript
   // vibe-codex-disable-next-line
   const apiKey = 'example_key';
   ```

## Module Issues

### Module Not Found

**Problem:** "Module 'x' not found" error

**Solutions:**
1. Check available modules:
   ```bash
   npx vibe-codex status --modules
   ```

2. Verify module name:
   ```bash
   npx vibe-codex config show
   ```

3. Enable module:
   ```bash
   npx vibe-codex config add-module testing
   ```

### Module Dependencies

**Problem:** "Module requires 'x' to be enabled"

**Solutions:**
1. Enable required module:
   ```bash
   npx vibe-codex config add-module github
   ```

2. Check dependencies:
   ```json
   {
     "modules": {
       "github": { "enabled": true },
       "github-workflow": { "enabled": true }
     }
   }
   ```

## Platform-Specific Issues

### Windows

**Problem:** Path-related errors on Windows

**Solutions:**
1. Use forward slashes in config:
   ```json
   {
     "ignore": ["src/vendor/**"]
   }
   ```

2. Run in Git Bash or WSL

3. Set Git autocrlf:
   ```bash
   git config core.autocrlf true
   ```

### macOS

**Problem:** Command not found after global install

**Solutions:**
1. Add npm global to PATH:
   ```bash
   echo 'export PATH="$PATH:$(npm config get prefix)/bin"' >> ~/.zshrc
   source ~/.zshrc
   ```

2. Use Homebrew Node:
   ```bash
   brew install node
   ```

### Linux

**Problem:** EACCES permission errors

**Solutions:**
1. Change npm's default directory:
   ```bash
   mkdir ~/.npm-global
   npm config set prefix '~/.npm-global'
   echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.bashrc
   source ~/.bashrc
   ```

## CI/CD Issues

### GitHub Actions

**Problem:** Validation fails in CI but passes locally

**Solutions:**
1. Use CI mode:
   ```yaml
   - run: npx vibe-codex validate --ci
   ```

2. Match Node version:
   ```yaml
   - uses: actions/setup-node@v4
     with:
       node-version-file: '.nvmrc'
   ```

3. Cache dependencies:
   ```yaml
   - uses: actions/cache@v3
     with:
       path: ~/.npm
       key: ${{ runner.os }}-node-${{ hashFiles('**/package-lock.json') }}
   ```

### Docker

**Problem:** vibe-codex not found in Docker

**Solutions:**
1. Install in Dockerfile:
   ```dockerfile
   RUN npm install -g vibe-codex
   ```

2. Use npx:
   ```dockerfile
   RUN npx vibe-codex validate --ci
   ```

3. Copy configuration:
   ```dockerfile
   COPY .vibe-codex.json .
   ```

## Common Error Messages

### "No git repository found"

**Solution:**
```bash
git init
```

### "Cannot read property 'enabled' of undefined"

**Solution:** Fix malformed configuration:
```bash
npx vibe-codex init --force
```

### "ENOENT: no such file or directory"

**Solution:** Ensure you're in the project root:
```bash
pwd  # Check current directory
cd /path/to/project
```

### "Module version mismatch"

**Solution:** Update vibe-codex:
```bash
npm update vibe-codex
```

## Getting Help

### Enable Debug Logging

```bash
DEBUG=vibe-codex:* npx vibe-codex validate
```

### Run Diagnostics

```bash
npx vibe-codex doctor --verbose
```

### Check System Information

```bash
npx envinfo --system --binaries --npmPackages vibe-codex
```

### Report Issues

1. Check existing issues: https://github.com/tyabonil/vibe-codex/issues
2. Create minimal reproduction
3. Include debug output
4. Submit new issue with:
   - vibe-codex version
   - Node.js version
   - Operating system
   - Error messages
   - Configuration file

## Quick Fixes

### Reset Everything

```bash
# Remove configuration
rm .vibe-codex.json

# Remove hooks
rm .git/hooks/pre-commit
rm .git/hooks/commit-msg
rm .git/hooks/pre-push

# Reinitialize
npx vibe-codex init
```

### Update Everything

```bash
# Update vibe-codex
npm update vibe-codex

# Update configuration
npx vibe-codex migrate

# Update hooks
npx vibe-codex update --hooks
```

### Disable Temporarily

```bash
# Skip all hooks
export SKIP_VIBE_CODEX=1

# Skip specific modules
npx vibe-codex validate --modules core
```