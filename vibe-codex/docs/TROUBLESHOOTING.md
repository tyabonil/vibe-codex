# Troubleshooting Guide

## Common Issues

### Installation Issues

#### `npx vibe-codex init` fails

**Symptoms:**
- Command not found
- Network errors
- Permission denied

**Solutions:**

1. **Update npm:**
   ```bash
   npm install -g npm@latest
   ```

2. **Clear npm cache:**
   ```bash
   npm cache clean --force
   ```

3. **Use different registry:**
   ```bash
   npm config set registry https://registry.npmjs.org/
   ```

4. **Check permissions:**
   ```bash
   # macOS/Linux
   sudo npx vibe-codex init
   
   # Windows (run as Administrator)
   npx vibe-codex init
   ```

#### Git hooks not installing

**Symptoms:**
- Hooks directory not found
- Permission errors
- Hooks not executing

**Solutions:**

1. **Check git version:**
   ```bash
   git --version  # Should be 2.13+
   ```

2. **Initialize git repository:**
   ```bash
   git init
   ```

3. **Check hook permissions:**
   ```bash
   chmod +x .git/hooks/*
   ```

4. **Reinstall hooks:**
   ```bash
   npx vibe-codex doctor --fix
   ```

### Configuration Issues

#### Configuration file not found

**Error:** `No vibe-codex configuration found`

**Solutions:**

1. **Check file exists:**
   ```bash
   ls -la .vibe-codex.json
   ```

2. **Create configuration:**
   ```bash
   npx vibe-codex init
   ```

3. **Specify custom path:**
   ```bash
   VIBE_CODEX_CONFIG=./config/vibe-codex.json npx vibe-codex validate
   ```

#### Invalid configuration format

**Error:** `Invalid configuration: <details>`

**Solutions:**

1. **Validate JSON syntax:**
   ```bash
   npx vibe-codex config --list
   ```

2. **Reset to defaults:**
   ```bash
   npx vibe-codex config --reset
   ```

3. **Check schema:**
   ```javascript
   // Valid structure
   {
     "version": "2.0.0",
     "modules": {
       "core": { "enabled": true }
     }
   }
   ```

### Validation Issues

#### False positives

**Symptoms:**
- Rules triggering incorrectly
- Files being checked that shouldn't be

**Solutions:**

1. **Add ignore patterns:**
   ```bash
   # .vibe-codexignore
   node_modules/
   dist/
   *.min.js
   ```

2. **Adjust rule configuration:**
   ```json
   {
     "modules": {
       "core": {
         "rules": {
           "no-console": {
             "enabled": true,
             "exclude": ["src/debug/**"]
           }
         }
       }
     }
   }
   ```

3. **Use conditional rules:**
   ```json
   {
     "environments": {
       "development": {
         "modules": {
           "core": {
             "rules": {
               "no-console": { "enabled": false }
             }
           }
         }
       }
     }
   }
   ```

#### Validation running slowly

**Symptoms:**
- Validation takes > 30 seconds
- High CPU usage
- Memory issues

**Solutions:**

1. **Limit scope:**
   ```bash
   npx vibe-codex validate --module core
   ```

2. **Exclude large directories:**
   ```bash
   # .vibe-codexignore
   coverage/
   build/
   public/assets/
   ```

3. **Run specific hooks:**
   ```bash
   npx vibe-codex validate --hook pre-commit
   ```

### Module Issues

#### Module not loading

**Error:** `Failed to load module: <name>`

**Solutions:**

1. **Check module exists:**
   ```bash
   npx vibe-codex doctor
   ```

2. **Update modules:**
   ```bash
   npx vibe-codex update --modules
   ```

3. **Reinstall vibe-codex:**
   ```bash
   npm uninstall -g vibe-codex
   npm install -g vibe-codex@latest
   ```

#### Custom module errors

**Error:** `Custom module validation failed`

**Solutions:**

1. **Check module syntax:**
   ```javascript
   // Correct module structure
   module.exports = {
     name: 'my-module',
     async validate(context) {
       return { valid: true, violations: [] };
     }
   };
   ```

2. **Debug module:**
   ```bash
   VIBE_CODEX_LOG_LEVEL=debug npx vibe-codex validate
   ```

3. **Test module isolation:**
   ```javascript
   const module = require('./my-module');
   const result = await module.validate({ files: [] });
   console.log(result);
   ```

### Git Hook Issues

#### Hooks not running

**Symptoms:**
- Commits succeed without checks
- No vibe-codex output

**Solutions:**

1. **Check hook files exist:**
   ```bash
   ls -la .git/hooks/
   ```

2. **Test hooks manually:**
   ```bash
   .git/hooks/pre-commit
   ```

3. **Check for conflicts:**
   ```bash
   # Look for other hook managers
   cat .git/hooks/pre-commit
   ```

4. **Reinstall hooks:**
   ```bash
   npx vibe-codex doctor --fix
   ```

#### Hooks failing incorrectly

**Symptoms:**
- Commits blocked when they shouldn't be
- Error messages don't match changes

**Solutions:**

1. **Run validation manually:**
   ```bash
   npx vibe-codex validate --verbose
   ```

2. **Temporarily bypass:**
   ```bash
   git commit --no-verify -m "Emergency fix"
   ```

3. **Debug hook:**
   ```bash
   DEBUG=* git commit -m "Test"
   ```

### CI/CD Issues

#### GitHub Actions failing

**Error:** `vibe-codex command not found`

**Solutions:**

1. **Use npx:**
   ```yaml
   - run: npx vibe-codex validate
   ```

2. **Install locally:**
   ```yaml
   - run: npm install vibe-codex
   - run: ./node_modules/.bin/vibe-codex validate
   ```

3. **Cache dependencies:**
   ```yaml
   - uses: actions/cache@v3
     with:
       path: ~/.npm
       key: ${{ runner.os }}-npm-${{ hashFiles('**/package-lock.json') }}
   ```

#### Docker build failures

**Issue:** vibe-codex not available in container

**Solution:**
```dockerfile
# Install in Docker
RUN npm install -g vibe-codex
RUN vibe-codex init --skip-git-hooks
```

### Performance Issues

#### Slow validation

**Solutions:**

1. **Profile performance:**
   ```bash
   time npx vibe-codex validate --module core
   ```

2. **Use parallel processing:**
   ```json
   {
     "performance": {
       "parallel": true,
       "maxWorkers": 4
     }
   }
   ```

3. **Cache results:**
   ```json
   {
     "cache": {
       "enabled": true,
       "ttl": 300
     }
   }
   ```

### Debug Mode

Enable detailed debugging:

```bash
# Maximum verbosity
DEBUG=* VIBE_CODEX_LOG_LEVEL=debug npx vibe-codex validate

# Specific module debug
DEBUG=vibe-codex:testing npx vibe-codex validate --module testing

# Save debug output
DEBUG=* npx vibe-codex validate 2> debug.log
```

## Getting Help

### Self-Diagnosis

1. **Run doctor command:**
   ```bash
   npx vibe-codex doctor --verbose
   ```

2. **Check version compatibility:**
   ```bash
   npx vibe-codex --version
   node --version
   npm --version
   git --version
   ```

3. **Generate diagnostic report:**
   ```bash
   npx vibe-codex doctor --report > diagnostic.json
   ```

### Community Support

1. **Search existing issues:**
   - [GitHub Issues](https://github.com/tyabonil/vibe-codex/issues)

2. **Ask questions:**
   - [GitHub Discussions](https://github.com/tyabonil/vibe-codex/discussions)

3. **Report bugs:**
   - Include diagnostic report
   - Provide minimal reproduction
   - List steps to reproduce

### Emergency Bypass

If you need to temporarily disable vibe-codex:

```bash
# Disable for one command
VIBE_CODEX_DISABLE=1 git commit -m "Emergency fix"

# Disable for session
export VIBE_CODEX_DISABLE=1

# Disable specific module
npx vibe-codex disable --module testing --duration 60
```

## FAQ

**Q: Can I use vibe-codex with existing tools?**
A: Yes, vibe-codex complements ESLint, Prettier, and other tools.

**Q: How do I update rules without updating vibe-codex?**
A: Use `npx vibe-codex update --rules` to update rules only.

**Q: Can I run vibe-codex in a monorepo?**
A: Yes, configure each package individually or use a root configuration.

**Q: How do I exclude generated files?**
A: Add patterns to `.vibe-codexignore` file.

**Q: Can I create custom violation levels?**
A: Use custom modules to define your own violation severity.