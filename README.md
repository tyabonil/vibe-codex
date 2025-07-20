# vibe-codex

> Command-line tool to install and manage development rules, git hooks, and workflow automation

> **Version 0.8.0** - Major breaking changes: Removed interactive mode. All commands now require explicit CLI arguments.

[![npm version](https://img.shields.io/npm/v/vibe-codex.svg)](https://www.npmjs.com/package/vibe-codex)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Downloads](https://img.shields.io/npm/dm/vibe-codex.svg)](https://www.npmjs.com/package/vibe-codex)

## 🚀 Quick Start

```bash
# Initialize with default modules for your project type
npx vibe-codex init --type=web --preset

# Or specify modules explicitly
npx vibe-codex init --type=fullstack --modules=core,testing,github-workflow,deployment
```

## 📋 What is vibe-codex?

vibe-codex automatically enforces development best practices through:
- 🔒 Pre-commit security checks
- 🧪 Test coverage requirements  
- 📝 Documentation standards
- 🔄 PR/Issue workflow automation
- 🚀 Deployment validations

## 💻 Installation

### One-time use (recommended)
```bash
npx vibe-codex init --type=<project-type> --modules=<module-list>
```

### Global installation
```bash
npm install -g vibe-codex
vibe-codex init --type=<project-type> --modules=<module-list>
```

### As project dependency
```bash
npm install --save-dev vibe-codex
```

## 🎯 Command-Line Usage

### Initialize in your project

vibe-codex now requires explicit configuration via command-line arguments:

```bash
# Minimal setup (core module only)
npx vibe-codex init --type=web --minimal

# Use preset modules for project type
npx vibe-codex init --type=fullstack --preset

# Specify exact modules
npx vibe-codex init --type=api --modules=core,testing,github-workflow

# Install all available modules
npx vibe-codex init --type=library --modules=all

# With advanced hooks
npx vibe-codex init --type=web --modules=all --with-advanced-hooks=issue-tracking,pr-health
```

#### Required Arguments

One of the following module configurations is required:
- `--modules=<list>` - Comma-separated list of modules to install
- `--modules=all` - Install all available modules
- `--minimal` - Install only the core module
- `--preset` - Use default modules for the project type

#### Available Options

- `-t, --type <type>` - Project type: `web`, `api`, `fullstack`, `library` (default: auto-detect)
- `-m, --minimal` - Create minimal configuration (core module only)
- `--modules <list>` - Comma-separated list of modules or "all"
- `--preset` - Use default modules for project type
- `--with-advanced-hooks <list>` - Comma-separated list of advanced hook categories
- `--no-git-hooks` - Skip git hook installation
- `-f, --force` - Overwrite existing configuration

#### Available Modules

- `core` - Essential security & workflow rules (always included)
- `github-workflow` - PR templates, issue tracking
- `testing` - Test coverage, framework rules  
- `deployment` - Platform-specific deployment checks
- `documentation` - README, architecture docs standards
- `patterns` - Code organization patterns

### Validate your project
```bash
# Run validation
npx vibe-codex validate

# With auto-fix
npx vibe-codex validate --fix

# Check specific modules
npx vibe-codex validate --module testing --module github-workflow
```

### Update to latest rules
```bash
npx vibe-codex update
```

### Configure modules
```bash
# View current configuration
npx vibe-codex config --list

# Set configuration value
npx vibe-codex config --set testing.coverage.threshold 90
```

## ⚙️ Configuration

vibe-codex uses a `.vibe-codex.json` file for configuration:

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

## 📦 Module Presets by Project Type

### Web Projects
- core, github-workflow, testing, documentation

### API Projects  
- core, github-workflow, testing, documentation

### Fullstack Projects
- core, github-workflow, testing, deployment, documentation

### Library Projects
- core, github-workflow, documentation

## 🔧 Advanced Hooks

Advanced hooks provide additional automation:

- `pr-health` - PR health checks and auto-labeling
- `issue-tracking` - Issue update reminders and tracking
- `commit-analysis` - Commit message analysis
- `dependency-tracking` - Dependency update tracking

## 🚫 Breaking Changes in v0.8.0

- **Removed all interactive prompts** - All configuration must be provided via CLI arguments
- **Removed inquirer dependency** - No more interactive mode
- **Required explicit module configuration** - Must specify modules via CLI flags
- **Command structure changes** - Some commands now require different arguments

## 📚 Documentation

- [Configuration Guide](./docs/CONFIGURATION.md)
- [Available Rules](./docs/RULES.md)
- [Custom Rules](./docs/CUSTOM-RULES.md)
- [CI/CD Integration](./docs/CI-CD.md)

## 🤝 Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for development setup and guidelines.

## 📄 License

MIT