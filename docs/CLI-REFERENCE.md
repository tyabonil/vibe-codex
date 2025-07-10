# CLI Reference

Complete reference for all vibe-codex CLI commands and options.

## Installation

```bash
# One-time use (recommended)
npx vibe-codex <command>

# Global installation
npm install -g vibe-codex
vibe-codex <command>

# Project dependency
npm install --save-dev vibe-codex
npx vibe-codex <command>
```

## Commands

### `init`

Initialize vibe-codex in your project.

```bash
npx vibe-codex init [options]
```

**Options:**
- `--force`: Overwrite existing configuration
- `--modules <modules>`: Comma-separated list of modules to enable
- `--no-hooks`: Skip Git hooks installation
- `--config <path>`: Custom configuration file path
- `--preset <name>`: Use a configuration preset (basic, strict, enterprise)

**Examples:**
```bash
# Interactive initialization
npx vibe-codex init

# Initialize with specific modules
npx vibe-codex init --modules core,testing,github

# Force reinitialize
npx vibe-codex init --force

# Use enterprise preset
npx vibe-codex init --preset enterprise
```

### `validate`

Run validation against configured rules.

```bash
npx vibe-codex validate [options]
```

**Options:**
- `--modules <modules>`: Validate specific modules only
- `--level <number>`: Maximum rule level to enforce (1-5)
- `--fix`: Automatically fix fixable violations
- `--format <format>`: Output format (pretty, json, junit)
- `--output <file>`: Write results to file
- `--ci`: CI mode (fail on warnings)
- `--quiet`: Only show errors
- `--verbose`: Show detailed information

**Examples:**
```bash
# Validate all modules
npx vibe-codex validate

# Validate specific modules
npx vibe-codex validate --modules core,testing

# Auto-fix violations
npx vibe-codex validate --fix

# CI mode with JSON output
npx vibe-codex validate --ci --format json --output results.json

# Validate only high-priority rules
npx vibe-codex validate --level 3
```

### `status`

Show current configuration and module status.

```bash
npx vibe-codex status [options]
```

**Options:**
- `--json`: Output in JSON format
- `--modules`: Show detailed module information
- `--rules`: List all available rules

**Examples:**
```bash
# Show status
npx vibe-codex status

# Detailed module information
npx vibe-codex status --modules

# JSON output for scripts
npx vibe-codex status --json
```

### `config`

Manage vibe-codex configuration.

```bash
npx vibe-codex config <subcommand> [options]
```

**Subcommands:**

#### `config show`
Display current configuration.

```bash
npx vibe-codex config show [--json]
```

#### `config validate`
Validate configuration file.

```bash
npx vibe-codex config validate [--file <path>]
```

#### `config add-module`
Add a module to configuration.

```bash
npx vibe-codex config add-module <module-name> [--options <json>]
```

#### `config remove-module`
Remove a module from configuration.

```bash
npx vibe-codex config remove-module <module-name>
```

#### `config set`
Set a configuration value.

```bash
npx vibe-codex config set <path> <value>
```

**Examples:**
```bash
# Show configuration
npx vibe-codex config show

# Add testing module
npx vibe-codex config add-module testing

# Set coverage threshold
npx vibe-codex config set modules.testing.coverageThreshold 90

# Remove a module
npx vibe-codex config remove-module patterns
```

### `update`

Update vibe-codex hooks and configuration.

```bash
npx vibe-codex update [options]
```

**Options:**
- `--hooks`: Update Git hooks only
- `--check`: Check for updates without applying
- `--force`: Force update even if up to date

**Examples:**
```bash
# Update everything
npx vibe-codex update

# Update hooks only
npx vibe-codex update --hooks

# Check for updates
npx vibe-codex update --check
```

### `migrate`

Migrate from older vibe-codex versions.

```bash
npx vibe-codex migrate [options]
```

**Options:**
- `--from <version>`: Source version (auto-detected if not specified)
- `--dry-run`: Show what would be changed
- `--backup`: Create backup of old configuration

**Examples:**
```bash
# Auto-detect and migrate
npx vibe-codex migrate

# Dry run
npx vibe-codex migrate --dry-run

# Migrate with backup
npx vibe-codex migrate --backup
```

### `doctor`

Diagnose common issues with vibe-codex setup.

```bash
npx vibe-codex doctor [options]
```

**Options:**
- `--fix`: Attempt to fix issues automatically
- `--verbose`: Show detailed diagnostic information

**Examples:**
```bash
# Run diagnostics
npx vibe-codex doctor

# Fix issues automatically
npx vibe-codex doctor --fix
```

## Global Options

These options work with all commands:

- `--help, -h`: Show help information
- `--version, -v`: Show version number
- `--config, -c <path>`: Use custom configuration file
- `--cwd <path>`: Run in different directory
- `--no-color`: Disable colored output
- `--debug`: Enable debug logging

## Environment Variables

- `VIBE_CODEX_CONFIG`: Default configuration file path
- `VIBE_CODEX_MODULES`: Default modules to enable
- `VIBE_CODEX_LEVEL`: Default enforcement level
- `VIBE_CODEX_CI`: Enable CI mode
- `NO_COLOR`: Disable colored output
- `DEBUG`: Enable debug output (set to `vibe-codex:*`)

## Exit Codes

- `0`: Success
- `1`: Validation failed or general error
- `2`: Configuration error
- `3`: Module loading error
- `4`: Hook installation error
- `5`: Invalid command or options

## Configuration File Formats

vibe-codex looks for configuration in this order:

1. `.vibe-codex.json`
2. `.vibe-codex.js`
3. `.vibe-codex.yml`
4. `vibe-codex` property in `package.json`
5. `.vibe-codexrc`

## Hook Commands

Git hooks installed by vibe-codex use these commands internally:

```bash
# Pre-commit hook
npx vibe-codex validate --hook pre-commit

# Commit-msg hook
npx vibe-codex validate --hook commit-msg --message <file>

# Pre-push hook
npx vibe-codex validate --hook pre-push
```

## Advanced Usage

### Custom Module Paths

Load custom modules from specific paths:

```bash
npx vibe-codex validate --module-path ./custom-modules
```

### Parallel Execution

Run validations in parallel:

```bash
npx vibe-codex validate --parallel --jobs 4
```

### Incremental Validation

Only validate changed files:

```bash
npx vibe-codex validate --staged  # Only staged files
npx vibe-codex validate --changed # All changed files
```

### Integration with Other Tools

```bash
# With lint-staged
npx vibe-codex validate --staged --fix

# With husky
npx vibe-codex validate --hook pre-commit

# In Docker
docker run -v $(pwd):/app node:18 npx vibe-codex validate
```

## Troubleshooting

### Debug Mode

Enable detailed logging:

```bash
DEBUG=vibe-codex:* npx vibe-codex validate
```

### Bypass Hooks

Skip vibe-codex hooks temporarily:

```bash
SKIP_VIBE_CODEX=1 git commit -m "Emergency fix"
```

### Reset Configuration

Start fresh with configuration:

```bash
npx vibe-codex init --force
```

### Check Installation

Verify vibe-codex is properly installed:

```bash
npx vibe-codex doctor
```

## Examples

### Basic Workflow

```bash
# Initialize in a new project
cd my-project
npx vibe-codex init

# Run validation
npx vibe-codex validate

# Fix issues
npx vibe-codex validate --fix

# Check status
npx vibe-codex status
```

### CI/CD Integration

```yaml
# GitHub Actions
- name: Validate with vibe-codex
  run: npx vibe-codex validate --ci --format json --output results.json

# GitLab CI
validate:
  script:
    - npx vibe-codex validate --ci
```

### Custom Configuration

```bash
# Use different config for production
npx vibe-codex validate --config .vibe-codex.prod.json

# Validate with strict settings
npx vibe-codex validate --level 5 --ci
```