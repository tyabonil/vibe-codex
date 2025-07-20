# Getting Started with vibe-codex

Welcome to vibe-codex! This guide will help you get up and running with automated development rules and workflow enforcement in your project.

## Prerequisites

- Node.js 16.0.0 or higher
- Git repository initialized in your project
- npm or yarn package manager

## Quick Start

### 1. Initialize vibe-codex in your project

Navigate to your project directory and run one of these commands:

```bash
# Minimal setup (core module only)
npx vibe-codex init --type=web --minimal

# Use preset modules for your project type
npx vibe-codex init --type=fullstack --preset

# Specify exact modules
npx vibe-codex init --type=api --modules=core,testing,github-workflow

# Install all available modules
npx vibe-codex init --type=library --modules=all
```

This command will:
- Create a `.vibe-codex.json` configuration file
- Set up Git hooks for automated enforcement
- Install the specified modules for your project

### 2. Understanding the Module System

vibe-codex uses a modular architecture. Available modules include:

- **core** - Essential security and workflow rules (always included)
- **testing** - Test coverage and quality rules
- **github-workflow** - GitHub-specific features and templates
- **deployment** - Deployment configuration checks
- **documentation** - Documentation standards
- **patterns** - Code organization best practices
- **quality** - Code quality and linting rules

### 3. Your First Validation

After initialization, run a validation to see how your project measures up:

```bash
npx vibe-codex validate
```

To automatically fix violations where possible:

```bash
npx vibe-codex validate --fix
```

## Command-Line Usage

All vibe-codex commands require explicit configuration via CLI arguments:

### Initialization Examples

```bash
# Web project with common modules
npx vibe-codex init --type=web --modules=core,testing,github-workflow,documentation

# API project with preset
npx vibe-codex init --type=api --preset

# Full-stack project with all modules and advanced hooks
npx vibe-codex init --type=fullstack --modules=all --with-advanced-hooks=pr-health,issue-tracking
```

### Configuration Management

```bash
# View current configuration
npx vibe-codex config --list

# Get specific setting
npx vibe-codex config --get testing.coverage.threshold

# Update setting
npx vibe-codex config --set testing.coverage.threshold 90
```

## Configuration File

Your `.vibe-codex.json` file controls which modules are enabled and their settings:

```json
{
  "version": "2.0.0",
  "projectType": "fullstack",
  "modules": {
    "core": {
      "enabled": true
    },
    "testing": {
      "enabled": true,
      "framework": "jest",
      "coverage": {
        "threshold": 80
      }
    },
    "github-workflow": {
      "enabled": true,
      "features": ["pr-checks", "issue-tracking"]
    }
  }
}
```

## Working with Git Hooks

vibe-codex automatically installs Git hooks to enforce rules at key points:

- **pre-commit**: Checks for secrets, validates file changes
- **commit-msg**: Ensures commit messages follow conventions
- **pre-push**: Runs tests and comprehensive validation

If a hook fails, you'll see clear error messages explaining what needs to be fixed.

## Common Workflows

### Checking Project Status

```bash
npx vibe-codex validate
```

### Validating Specific Modules

```bash
npx vibe-codex validate --module testing --module documentation
```

### Updating vibe-codex

```bash
# Update to latest rules and hooks
npx vibe-codex update

# Check for updates without applying
npx vibe-codex update --check
```

## Module Presets by Project Type

When using `--preset`, these modules are installed:

- **Web Projects**: core, github-workflow, testing, documentation
- **API Projects**: core, github-workflow, testing, documentation
- **Fullstack Projects**: core, github-workflow, testing, deployment, documentation
- **Library Projects**: core, github-workflow, documentation

## Advanced Hooks

Add advanced automation with `--with-advanced-hooks`:

- `pr-health` - PR health monitoring and auto-labeling
- `issue-tracking` - Issue update reminders and work logging
- `commit-analysis` - Commit message standards
- `dependency-tracking` - Dependency updates and security

Example:
```bash
npx vibe-codex init --type=web --preset --with-advanced-hooks=pr-health,issue-tracking
```

## Integration with CI/CD

vibe-codex works seamlessly in CI/CD pipelines:

```yaml
# GitHub Actions
- name: Validate with vibe-codex
  run: npx vibe-codex validate --ci

# GitLab CI
validate:
  script:
    - npx vibe-codex validate --ci --format json
```

## Troubleshooting

### Common Issues

1. **"Module configuration required"** 
   - Solution: Use `--modules`, `--minimal`, or `--preset` flag

2. **Git hooks not working**
   - Solution: `npx vibe-codex update --hooks`

3. **Validation failures in CI**
   - Solution: Run `npx vibe-codex validate --fix` locally first

### Temporarily Disable Hooks

If you need to bypass hooks temporarily:

```bash
SKIP_VIBE_CODEX=1 git commit -m "Emergency fix"
```

⚠️ Use sparingly! Hooks exist to maintain code quality.

### Debug Mode

For detailed logging:

```bash
DEBUG=vibe-codex:* npx vibe-codex validate
```

## Migration from v0.6

If you're upgrading from v0.6 (interactive mode), see the [Migration Guide](./MIGRATION-v0.8.md).

## Next Steps

- Read the [CLI Reference](./CLI-REFERENCE.md) for all available commands
- Check out [Module Documentation](./MODULES.md) to understand each module's rules
- See [Configuration Guide](./CONFIGURATION.md) for advanced settings

## Getting Help

- 📚 [Full Documentation](https://github.com/tyabonil/vibe-codex#readme)
- 🐛 [Report Issues](https://github.com/tyabonil/vibe-codex/issues)
- 💬 [Discussions](https://github.com/tyabonil/vibe-codex/discussions)

Happy coding with vibe-codex! 🚀