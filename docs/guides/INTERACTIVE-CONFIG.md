# Interactive CLI Configuration Guide

The vibe-codex interactive configuration interface provides an intuitive way to set up and manage your project's development workflow rules.

## 🚀 Quick Start

```bash
# Initialize with interactive configuration
npx vibe-codex init

# Open configuration interface
npx vibe-codex config

# View current configuration
npx vibe-codex config --list
```

## 📋 Configuration Commands

### Interactive Configuration

Launch the interactive configuration wizard:

```bash
npx vibe-codex config
```

This will guide you through:
1. Project type selection
2. Module selection
3. Per-module configuration
4. Enforcement level settings
5. Git hooks installation

### Command Options

```bash
# List current configuration
npx vibe-codex config --list

# Set a specific value
npx vibe-codex config --set <key> <value>

# Reset to defaults
npx vibe-codex config --reset

# Export configuration
npx vibe-codex config --export my-config.json

# Import configuration
npx vibe-codex config --import team-config.json

# Preview configuration impact
npx vibe-codex config --preview
```

## 🎯 Project Types

### Web Application
- Frontend frameworks (React, Vue, Angular)
- Browser-based applications
- Single Page Applications (SPAs)

**Default modules**: core, testing, github, documentation, patterns

### API/Backend Service
- REST APIs
- GraphQL services
- Microservices

**Default modules**: core, testing, deployment, documentation

### Full-Stack Application
- Combined frontend and backend
- Monorepo structures
- Integrated applications

**Default modules**: core, testing, github, deployment, documentation, patterns

### npm Library/Package
- Published packages
- Shared libraries
- Open source projects

**Default modules**: core, testing, documentation

### Custom Configuration
- Manual module selection
- Tailored to specific needs

## 📦 Available Modules

### Core Module (Required)
- Basic git workflow rules
- Security best practices
- Documentation requirements
- Commit message standards

### Testing Module
- Framework integration (Jest, Vitest, Mocha)
- Coverage requirements
- Test file conventions
- Snapshot testing rules

**Configuration options**:
```json
{
  "testing": {
    "enabled": true,
    "framework": "jest",
    "coverage": {
      "threshold": 80,
      "perFile": true
    },
    "options": {
      "requireNewFileTests": true,
      "failOnConsole": true,
      "enforceTestNaming": true
    }
  }
}
```

### GitHub Module
- PR status checks
- Issue tracking
- Branch management
- Templates

**Configuration options**:
```json
{
  "github": {
    "enabled": true,
    "features": {
      "prChecks": true,
      "issueTracking": true,
      "autoMerge": false,
      "branchCleanup": true
    },
    "requireIssueReference": true
  }
}
```

### Deployment Module
- Platform-specific rules
- Environment management
- Pre/post deployment checks

**Configuration options**:
```json
{
  "deployment": {
    "enabled": true,
    "platform": "vercel",
    "environments": ["staging", "production"],
    "requireStagingBeforeProduction": true
  }
}
```

### Documentation Module
- README requirements
- API documentation
- Code comments
- Changelog maintenance

**Configuration options**:
```json
{
  "documentation": {
    "enabled": true,
    "requirements": ["readme", "api", "changelog"],
    "autoGenerate": true
  }
}
```

### Patterns Module
- Naming conventions
- File structure
- Code organization
- Best practices

**Configuration options**:
```json
{
  "patterns": {
    "enabled": true,
    "enforce": ["fileNaming", "errorHandling"],
    "namingConvention": "kebab"
  }
}
```

### GitHub Workflow Module
- Actions security
- Workflow optimization
- CI/CD pipelines

**Configuration options**:
```json
{
  "github-workflow": {
    "enabled": true,
    "workflows": ["ci", "security"],
    "security": {
      "pinActions": true,
      "restrictPermissions": true
    }
  }
}
```

## ⚙️ Configuration File Structure

The `.vibe-codex.json` file contains your project configuration:

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
    }
  },
  "enforcementLevel": "error",
  "createdAt": "2024-03-20T10:00:00Z",
  "lastModified": "2024-03-20T10:05:00Z"
}
```

## 🔧 Advanced Configuration

### Setting Individual Values

```bash
# Set test coverage threshold
npx vibe-codex config --set modules.testing.coverage.threshold 90

# Enable a module
npx vibe-codex config --set modules.deployment.enabled true

# Change enforcement level
npx vibe-codex config --set enforcementLevel warning
```

### Custom Rules

Add custom rules to your configuration:

```json
{
  "customRules": [
    {
      "name": "custom-header-check",
      "path": "./rules/custom-header.js",
      "level": 2,
      "severity": "error"
    }
  ]
}
```

### Monorepo Configuration

For monorepo projects:

```json
{
  "monorepo": {
    "enabled": true,
    "packages": ["frontend", "backend", "shared"],
    "sharedConfig": true
  }
}
```

## 🎨 Interactive UI Features

### Visual Feedback
- ✅ Success messages
- ⚠️  Warning indicators
- ❌ Error messages
- 📊 Progress indicators

### Smart Defaults
- Auto-detects framework
- Suggests modules based on project type
- Pre-fills existing values

### Conflict Resolution
When existing configurations are detected:
1. **Merge** - Combine with vibe-codex rules (recommended)
2. **Replace** - Overwrite with vibe-codex rules
3. **Keep** - Maintain existing configuration
4. **View** - See differences

## 📤 Import/Export

### Export Configuration

Share your configuration with your team:

```bash
npx vibe-codex config --export team-config.json
```

### Import Configuration

Import a shared configuration:

```bash
npx vibe-codex config --import team-config.json
```

## 🔍 Configuration Preview

See the impact of your configuration:

```bash
npx vibe-codex config --preview
```

Output:
```
📊 vibe-codex Configuration Preview

Project Type: fullstack
Enforcement: error

📦 Enabled Modules:
  ✓ core
  ✓ testing
  ✓ github
  ✓ deployment

📈 Estimated Impact:
  - Active rules: ~47
  - Git hooks: 6
  - Pre-commit time: ~3 seconds
  - CI pipeline time: ~5 minutes
```

## 🚨 Troubleshooting

### Configuration Not Loading
- Check `.vibe-codex.json` exists in project root
- Validate JSON syntax
- Run `npx vibe-codex doctor`

### Module Not Working
- Ensure module is enabled in configuration
- Check module dependencies
- Verify module-specific settings

### Reset Configuration
If configuration is corrupted:

```bash
npx vibe-codex config --reset
```

## 🔗 Related Documentation

- [Getting Started](./GETTING-STARTED.md)
- [Module Documentation](./MODULES.md)
- [CLI Reference](./CLI-REFERENCE.md)
- [Troubleshooting](./TROUBLESHOOTING.md)