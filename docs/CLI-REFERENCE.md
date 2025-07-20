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

Initialize vibe-codex in your project with the specified modules and configuration.

```bash
npx vibe-codex init --type=<type> [options]
```

**Required (one of):**
- `--modules=<list>` - Comma-separated list of modules to install
- `--modules=all` - Install all available modules
- `--minimal` - Install only the core module
- `--preset` - Use default modules for the project type

**Options:**
- `-t, --type <type>` - Project type: `web`, `api`, `fullstack`, `library` (default: auto-detect)
- `--with-advanced-hooks <list>` - Comma-separated list of advanced hook categories
- `--no-git-hooks` - Skip git hook installation
- `-f, --force` - Overwrite existing configuration

**Examples:**
```bash
# Minimal setup
npx vibe-codex init --type=web --minimal

# Use preset for fullstack project
npx vibe-codex init --type=fullstack --preset

# Specify exact modules
npx vibe-codex init --type=api --modules=core,testing,github-workflow

# Install all modules with advanced hooks
npx vibe-codex init --type=library --modules=all --with-advanced-hooks=pr-health,issue-tracking
```

### `validate`

Run validation against configured rules.

```bash
npx vibe-codex validate [options]
```

**Options:**
- `--fix` - Automatically fix violations where possible
- `--module <name>` - Validate specific module only (can be used multiple times)
- `--verbose` - Show detailed validation output
- `--format <format>` - Output format (pretty, json, junit)
- `--output <file>` - Write results to file
- `--ci` - CI mode (fail on warnings)

**Examples:**
```bash
# Run all validations
npx vibe-codex validate

# Auto-fix violations
npx vibe-codex validate --fix

# Check specific modules
npx vibe-codex validate --module testing --module github-workflow

# CI mode with JSON output
npx vibe-codex validate --ci --format json --output results.json
```

### `update`

Update to the latest rule definitions and hook templates.

```bash
npx vibe-codex update [options]
```

**Options:**
- `--check` - Check for updates without applying them
- `--force` - Force update even if no changes detected

### `config`

View and modify configuration settings.

```bash
npx vibe-codex config <command> [options]
```

**Commands:**
- `--list` - List all configuration
- `--get <key>` - Get configuration value
- `--set <key> <value>` - Set configuration value
- `--reset` - Reset to default configuration

**Examples:**
```bash
# View all configuration
npx vibe-codex config --list

# Get specific value
npx vibe-codex config --get testing.coverage.threshold

# Set configuration value
npx vibe-codex config --set testing.coverage.threshold 90

# Reset configuration
npx vibe-codex config --reset
```

### `update-issue`

Update GitHub issue with work summary.

```bash
npx vibe-codex update-issue --issue=<number> --message=<message> [options]
```

**Required:**
- `--issue <number>` - GitHub issue number to update
- `--message <message>` - Update message (or use --file)

**Options:**
- `--file <path>` - Read update message from file
- `--close` - Close the issue after updating

**Examples:**
```bash
# Simple update
npx vibe-codex update-issue --issue=123 --message="Completed initial implementation"

# Update from file
npx vibe-codex update-issue --issue=123 --file=./update.md

# Update and close
npx vibe-codex update-issue --issue=123 --message="Fixed and tested" --close
```

### `doctor`

Diagnose common issues with vibe-codex setup.

```bash
npx vibe-codex doctor [options]
```

**Options:**
- `--fix` - Attempt to fix issues automatically
- `--verbose` - Show detailed diagnostic information

### `version`

Display vibe-codex version information.

```bash
npx vibe-codex version
```

## Available Modules

- `core` - Essential security & workflow rules (always included)
- `github-workflow` - PR templates, issue tracking, GitHub Actions
- `testing` - Test coverage requirements, testing frameworks
- `deployment` - Platform-specific deployment checks
- `documentation` - README standards, architecture docs
- `patterns` - Code organization patterns
- `quality` - Code quality checks, linting

## Advanced Hook Categories

When using `--with-advanced-hooks`, you can specify:

- `pr-health` - PR health monitoring and auto-labeling
- `issue-tracking` - Issue update reminders and work logging
- `commit-analysis` - Commit message standards and analysis
- `dependency-tracking` - Dependency updates and security scanning
- `test-quality` - Test quality and anti-pattern detection
- `doc-updates` - Documentation update requirements

## Configuration File

vibe-codex uses `.vibe-codex.json` for configuration:

```json
{
  "version": "2.0.0",
  "projectType": "fullstack",
  "modules": {
    "core": { "enabled": true },
    "testing": {
      "enabled": true,
      "framework": "jest",
      "coverage": { "threshold": 80 }
    },
    "github-workflow": {
      "enabled": true,
      "features": ["pr-checks", "issue-tracking"]
    }
  }
}
```

## Environment Variables

- `VIBE_CODEX_CONFIG` - Custom configuration file path
- `VIBE_CODEX_CI` - Enable CI mode
- `SKIP_VIBE_CODEX` - Skip all vibe-codex hooks
- `NO_COLOR` - Disable colored output
- `DEBUG` - Enable debug output (set to `vibe-codex:*`)

## Exit Codes

- `0` - Success
- `1` - Validation failed or general error
- `2` - Configuration error
- `3` - Module loading error
- `4` - Hook installation error
- `5` - Invalid command or options

## CI/CD Integration

### GitHub Actions

```yaml
- name: Validate with vibe-codex
  run: npx vibe-codex validate --ci --format json --output results.json
```

### GitLab CI

```yaml
validate:
  script:
    - npx vibe-codex validate --ci
```

### Jenkins

```groovy
stage('Validate') {
  steps {
    sh 'npx vibe-codex validate --ci'
  }
}
```

## Troubleshooting

### Debug Mode

```bash
DEBUG=vibe-codex:* npx vibe-codex validate
```

### Bypass Hooks

```bash
SKIP_VIBE_CODEX=1 git commit -m "Emergency fix"
```

### Common Issues

1. **"Module configuration required"** - Use `--modules`, `--minimal`, or `--preset` flag
2. **"Git hooks not installed"** - Run `npx vibe-codex update --hooks`
3. **"Configuration version mismatch"** - Run `npx vibe-codex migrate`