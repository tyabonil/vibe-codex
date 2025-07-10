# CLI Reference

## Commands

### `init`
Initialize vibe-codex in your project.

```bash
npx vibe-codex init [options]
```

#### Options
- `--type <type>` - Project type (frontend, backend, fullstack, mobile)
- `--skip-github-actions` - Skip GitHub Actions setup
- `--skip-git-hooks` - Skip git hooks installation
- `--config <path>` - Use custom configuration file
- `--force` - Overwrite existing configuration

#### Examples
```bash
# Interactive setup
npx vibe-codex init

# Quick setup for fullstack project
npx vibe-codex init --type fullstack

# Initialize without GitHub Actions
npx vibe-codex init --skip-github-actions

# Use team configuration
npx vibe-codex init --config team-config.json
```

### `validate`
Check your project against configured rules.

```bash
npx vibe-codex validate [options]
```

#### Options
- `--module <modules...>` - Validate specific modules only
- `--level <level>` - Minimum violation level to report (1-5)
- `--fix` - Attempt to auto-fix violations
- `--json` - Output results as JSON
- `--verbose` - Show detailed validation information
- `--hook <hook>` - Run validation for specific git hook

#### Examples
```bash
# Validate entire project
npx vibe-codex validate

# Validate only testing module
npx vibe-codex validate --module testing

# Auto-fix violations
npx vibe-codex validate --fix

# Output JSON for CI/CD
npx vibe-codex validate --json

# Validate for pre-commit hook
npx vibe-codex validate --hook pre-commit
```

### `config`
Manage vibe-codex configuration.

```bash
npx vibe-codex config [options]
```

#### Options
- `--list` - Show current configuration
- `--set <key=value>` - Set configuration value
- `--get <key>` - Get specific configuration value
- `--reset` - Reset to default configuration
- `--export` - Export configuration to stdout
- `--import <file>` - Import configuration from file

#### Examples
```bash
# Interactive configuration
npx vibe-codex config

# View current config
npx vibe-codex config --list

# Set test coverage threshold
npx vibe-codex config --set testing.coverage.threshold=90

# Export for team sharing
npx vibe-codex config --export > team-config.json

# Import team config
npx vibe-codex config --import team-config.json
```

### `update`
Update vibe-codex rules and modules.

```bash
npx vibe-codex update [options]
```

#### Options
- `--check` - Check for updates without installing
- `--force` - Force update even if no changes
- `--modules` - Update modules only
- `--rules` - Update rules only

#### Examples
```bash
# Update everything
npx vibe-codex update

# Check for updates
npx vibe-codex update --check

# Update modules only
npx vibe-codex update --modules
```

### `doctor`
Diagnose vibe-codex installation issues.

```bash
npx vibe-codex doctor [options]
```

#### Options
- `--fix` - Attempt to fix issues automatically
- `--verbose` - Show detailed diagnostic information

#### Examples
```bash
# Run diagnostics
npx vibe-codex doctor

# Auto-fix issues
npx vibe-codex doctor --fix
```

### `disable`
Temporarily disable vibe-codex checks.

```bash
npx vibe-codex disable [options]
```

#### Options
- `--duration <minutes>` - Disable for specific duration
- `--module <modules...>` - Disable specific modules only
- `--reason <reason>` - Provide reason for disabling

#### Examples
```bash
# Disable for 30 minutes
npx vibe-codex disable --duration 30 --reason "Hotfix deployment"

# Disable testing module
npx vibe-codex disable --module testing
```

### `enable`
Re-enable vibe-codex checks.

```bash
npx vibe-codex enable [options]
```

#### Options
- `--module <modules...>` - Enable specific modules only

#### Examples
```bash
# Enable all modules
npx vibe-codex enable

# Enable testing module
npx vibe-codex enable --module testing
```

## Global Options

These options work with all commands:

- `--help` - Show help information
- `--version` - Show version information
- `--quiet` - Suppress output
- `--no-color` - Disable colored output
- `--debug` - Show debug information

## Environment Variables

### `VIBE_CODEX_CONFIG`
Path to custom configuration file.
```bash
VIBE_CODEX_CONFIG=/path/to/config.json npx vibe-codex validate
```

### `VIBE_CODEX_DISABLE`
Disable vibe-codex without uninstalling.
```bash
VIBE_CODEX_DISABLE=1 git commit -m "Emergency fix"
```

### `VIBE_CODEX_LOG_LEVEL`
Set logging verbosity (debug, info, warn, error).
```bash
VIBE_CODEX_LOG_LEVEL=debug npx vibe-codex validate
```

### `VIBE_CODEX_CI`
Optimize behavior for CI environments.
```bash
VIBE_CODEX_CI=true npx vibe-codex validate
```

## Exit Codes

- `0` - Success
- `1` - Validation failed (violations found)
- `2` - Configuration error
- `3` - Module error
- `4` - File system error
- `5` - Network error
- `10` - Unknown error

## Configuration Paths

vibe-codex looks for configuration in this order:

1. Command line `--config` option
2. `VIBE_CODEX_CONFIG` environment variable
3. `.vibe-codex.json` in current directory
4. `.vibe-codex.json` in project root
5. `.vibe-codexrc` file
6. `vibe-codex` field in `package.json`

## Hook Integration

### Git Hooks
When git hooks are installed, these commands run automatically:

- **pre-commit**: `vibe-codex validate --hook pre-commit`
- **commit-msg**: `vibe-codex validate --hook commit-msg`
- **pre-push**: `vibe-codex validate --hook pre-push`

### NPM Scripts
Add to your `package.json`:

```json
{
  "scripts": {
    "validate": "vibe-codex validate",
    "validate:fix": "vibe-codex validate --fix",
    "precommit": "vibe-codex validate --hook pre-commit",
    "prepush": "vibe-codex validate --hook pre-push"
  }
}
```

## Advanced Usage

### Custom Module Validation
```bash
# Validate with custom module
npx vibe-codex validate --module ./custom-rules.js
```

### CI/CD Integration
```bash
# GitHub Actions
- name: Validate Code
  run: npx vibe-codex validate --json > validation-report.json

# Jenkins
sh 'npx vibe-codex validate --level 3'
```

### Programmatic Usage
```javascript
const { validate } = require('vibe-codex');

async function checkCode() {
  const result = await validate({
    module: ['testing'],
    fix: true
  });
  
  console.log(`Found ${result.violations.length} violations`);
}
```