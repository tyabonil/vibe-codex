# vibe-codex

> Automated development rules and workflow enforcement for modern software teams

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
npx vibe-codex init --type fullstack --github-actions
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

- **Core** - Basic git workflow and security (always enabled)
- **Testing** - Test frameworks and coverage requirements
- **GitHub** - PR/Issue automation and workflows
- **Deployment** - Platform-specific deployment checks
- **Documentation** - README and documentation standards

## 🛠️ Commands

- `init` - Initialize vibe-codex in your project
- `config` - Manage configuration interactively
- `validate` - Run validation checks
- `update` - Update to latest rules
- `status` - Show installation status

## 📖 Documentation

- [Getting Started](./docs/GETTING-STARTED.md)
- [Configuration Guide](./docs/CONFIGURATION.md)
- [Available Modules](./docs/MODULES.md)
- [CLI Reference](./docs/CLI-REFERENCE.md)
- [Troubleshooting](./docs/TROUBLESHOOTING.md)

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) for details.

## 📄 License

MIT © Ty Yabonil

---

Made with ❤️ by developers, for developers