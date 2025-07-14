# vibe-codex

> Automated development rules and workflow enforcement for modern software teams

> **Migration Notice**: This repository has evolved from the original `mandatory-rules-checker` project. If you were using the legacy system, please see the [migration guide](docs/LEGACY-MIGRATION.md). Legacy compatibility is maintained temporarily in the `legacy/` and `scripts/` directories.

[![npm version](https://img.shields.io/npm/v/vibe-codex.svg)](https://www.npmjs.com/package/vibe-codex)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Downloads](https://img.shields.io/npm/dm/vibe-codex.svg)](https://www.npmjs.com/package/vibe-codex)

## 🚀 Quick Start

```bash
npx vibe-codex init
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
npx vibe-codex init
```

### Global installation
```bash
npm install -g vibe-codex
vibe-codex init
```

### As project dependency
```bash
npm install --save-dev vibe-codex
```

## 🎯 Basic Usage

### Initialize in your project
```bash
cd your-project
npx vibe-codex init

# With options
npx vibe-codex init --type fullstack --minimal

# With advanced hooks
npx vibe-codex init --with-advanced-hooks "issue-tracking,pr-management"
```

### Configure modules
```bash
npx vibe-codex config
```

### Validate your project
```bash
npx vibe-codex validate
```

### Update to latest rules
```bash
npx vibe-codex update
```

## ⚙️ Configuration

vibe-codex uses a `.vibe-codex.json` file for configuration:

```json
{
  "modules": {
    "testing": {
      "framework": "jest",
      "coverage": { "threshold": 80 }
    },
    "github": {
      "features": ["pr-checks", "issue-tracking"]
    }
  }
}
```

See [Configuration Guide](./docs/CONFIGURATION.md) for all options.

## 📦 Available Modules

- **Core** - Basic git workflow and security
- **Testing** - Test frameworks and coverage
- **GitHub** - PR/Issue automation
- **Deployment** - Platform-specific checks
- **Documentation** - README and docs standards

### 🔧 Advanced Hooks (Optional)

Additional development workflow automation:

- **Issue Tracking** - Automatic issue updates and progress tracking
- **PR Management** - PR health checks and review enforcement
- **Quality Gates** - Test coverage and security validations
- **Context Management** - Keep project documentation up to date

Install during init or with: `npx vibe-codex init --with-advanced-hooks "issue-tracking,quality-gates"`

See [Modules Guide](./docs/MODULES.md) for details.

## 📚 Documentation

- [Getting Started](./docs/GETTING-STARTED.md) - Installation and setup guide
- [Configuration](./docs/CONFIGURATION.md) - Configuration options
- [CLI Reference](./docs/CLI-REFERENCE.md) - Command line usage
- [API Reference](./docs/API.md) - Programmatic usage
- [Modules](./docs/MODULES.md) - Available modules
- [Migration Guide](./docs/MIGRATION.md) - Upgrading from v1.x
- [Troubleshooting](./docs/TROUBLESHOOTING.md) - Common issues

## 🤝 Contributing

See [CONTRIBUTING.md](https://github.com/tyabonil/vibe-codex/blob/main/CONTRIBUTING.md)

## 📄 License

MIT © vibe-codex contributors