# Getting Started with vibe-codex

Welcome to vibe-codex! This guide will help you get up and running with automated development rules and workflow enforcement in your project.

## Prerequisites

- Node.js 14.0.0 or higher
- Git repository initialized in your project
- npm or yarn package manager

## Quick Start

### 1. Initialize vibe-codex in your project

Navigate to your project directory and run:

```bash
npx vibe-codex init
```

This interactive command will:
- Detect your project type
- Ask which modules you want to enable
- Create a `.vibe-codex.json` configuration file
- Set up Git hooks for automated enforcement

### 2. Understanding the Module System

vibe-codex uses a modular architecture. During initialization, you'll be asked to select from these modules:

- **Core** (Always enabled) - Essential security and workflow rules
- **Testing** - Test coverage and quality rules
- **GitHub** - GitHub-specific features and templates
- **GitHub Workflow** - GitHub Actions validation
- **Deployment** - Deployment configuration checks
- **Documentation** - Documentation standards
- **Patterns** - Code organization best practices

### 3. Your First Validation

After initialization, run a validation to see how your project measures up:

```bash
npx vibe-codex validate
```

This will check your project against all enabled modules and report any violations.

## Configuration Basics

Your `.vibe-codex.json` file controls which modules are enabled and their settings:

```json
{
  "version": "1.0.0",
  "modules": {
    "core": {
      "enabled": true
    },
    "testing": {
      "enabled": true,
      "coverageThreshold": 80
    },
    "github": {
      "enabled": true,
      "requirePRTemplate": true
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

### Adding a New Module

To add a module after initialization:

```bash
npx vibe-codex config add-module testing
```

### Checking Project Status

See which modules are enabled and their current status:

```bash
npx vibe-codex status
```

### Updating vibe-codex

To update to the latest version:

```bash
npm update vibe-codex
# or globally
npm update -g vibe-codex
```

## Customizing Rules

Each module can be customized in `.vibe-codex.json`. For example, to change the test coverage threshold:

```json
{
  "modules": {
    "testing": {
      "enabled": true,
      "coverageThreshold": 90,
      "requireTestFiles": true
    }
  }
}
```

## Integration with CI/CD

vibe-codex works great in CI/CD pipelines. Add this to your workflow:

```yaml
# GitHub Actions example
- name: Validate with vibe-codex
  run: npx vibe-codex validate --ci
```

## Troubleshooting

### Hook Installation Failed

If Git hooks weren't installed automatically:

```bash
npx vibe-codex init --reinstall-hooks
```

### Validation Takes Too Long

For large projects, you can validate specific modules:

```bash
npx vibe-codex validate --modules core,testing
```

### Temporarily Disable Hooks

If you need to bypass hooks temporarily:

```bash
git commit --no-verify
```

⚠️ Use sparingly! Hooks exist to maintain code quality.

## Next Steps

- Read the [Module Documentation](./MODULES.md) to understand each module's rules
- Check out [Configuration Guide](./CONFIGURATION.md) for advanced settings
- See [CLI Reference](./CLI-REFERENCE.md) for all available commands

## Getting Help

- 📚 [Full Documentation](https://github.com/tyabonil/vibe-codex#readme)
- 🐛 [Report Issues](https://github.com/tyabonil/vibe-codex/issues)
- 💬 [Discussions](https://github.com/tyabonil/vibe-codex/discussions)

Happy coding with vibe-codex! 🚀