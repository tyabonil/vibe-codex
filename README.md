# Cursor Rules

A comprehensive rule enforcement system for AI-powered development, designed to maintain code quality, security, and workflow consistency across projects.

## Overview

This repository provides a structured framework for enforcing development best practices through automated git hooks and validation rules. The system is designed to be both comprehensive and efficient, with rules optimized for both human developers and AI assistants.

## 📖 Documentation Navigation

### 👨‍💻 For Human Developers
- **[USAGE-GUIDE.md](./USAGE-GUIDE.md)** - Complete usage guide with examples and scenarios
- **[INSTALLATION.md](./INSTALLATION.md)** - Detailed installation instructions
- **[PROJECT_CONTEXT.md](./PROJECT_CONTEXT.md)** - Repository architecture and decisions

### 🤖 For AI Assistants  
- **[MANDATORY-RULES.md](./MANDATORY-RULES.md)** - Primary rule specification (LLM-optimized)
- **[LLM-USAGE-REFERENCE.md](./LLM-USAGE-REFERENCE.md)** - Technical reference for AI systems
- **[config/project-patterns.json](./config/project-patterns.json)** - Configurable workflow patterns

### 🔧 Component Documentation
- **[.claude/README.md](./.claude/README.md)** - Claude Code integration tools
- **[review-bots/README.md](./review-bots/README.md)** - Automated PR review system
- **[llm-specific/README.md](./llm-specific/README.md)** - LLM-specific adaptations

## Quick Start

### Installation

Install the rule checker with a single command:

```bash
bash install-rule-checker.sh
```

For detailed installation options, see [INSTALLATION.md](./INSTALLATION.md).

### What Gets Installed

The installation script sets up:
- **Pre-commit hooks**: Security scanning and PR health checks
- **Commit message validation**: Ensures Conventional Commits format
- **Configuration files**: Rules and patterns for validation

## Repository Structure

```
cursor_rules/
├── .claude/                  # AI-assisted development tools
│   ├── hooks/               # Claude workflow hooks
│   ├── config/              # Claude-specific configuration
│   └── context/             # Context preservation files
├── config/                   # Configuration files
│   ├── rules.json           # Rule definitions and patterns
│   └── commit-msg.json      # Commit message validation rules
├── copy-paste-rules/        # Ready-to-use rule templates
├── enhanced-rules/          # Advanced rule configurations
├── hooks/                   # Git hooks and utility scripts
├── llm-specific/           # LLM-specific rule adaptations
├── review-bots/            # Automated PR review system
├── scripts/                # Core rule engine and utilities
├── tests/                  # Test suite for rule validation
└── workflow/               # Workflow documentation and patterns
```

## Usage

Once installed, the hooks run automatically:

### Pre-commit Hook

Executes before commit message entry:
-   **Security Scan**: Detects secrets, API keys, and sensitive data
-   **PR Health Check**: Validates PR status and compliance
-   **File Validation**: Ensures code meets quality standards

### Commit Message Hook

Validates commit messages against:
-   Conventional Commits specification
-   Required format: `type(scope): description`
-   Character limits and content requirements

## Features

### Rule Engine

The core rule engine (`scripts/rule-engine.js`) provides:
- Pattern-based rule matching
- Security vulnerability detection
- Code quality validation
- Workflow compliance checks

### Development Workflow Automation

New automated hooks for streamlining development:
- **Issue Progress Tracker**: Automatically update GitHub issues throughout development
- **PR Review Check**: Analyze PR comments for compliance violations before merge

### Review Bots

Automated PR review system with multiple bot personalities:
- **Balance Bot**: Provides balanced, constructive feedback
- **Hater Bot**: Identifies potential issues aggressively
- **White Knight Bot**: Focuses on positive reinforcement

See [review-bots/README.md](./review-bots/README.md) for details.

### LLM-Specific Adaptations

Optimized rules for various AI assistants:
- Claude (Anthropic)
- GPT-4 (OpenAI)
- GitHub Copilot
- Cursor AI
- Cline

See [llm-specific/README.md](./llm-specific/README.md) for model-specific configurations.

### AI-Assisted Development Tools (.claude)

Advanced tooling for AI-powered development workflows:

#### Context Management
```bash
# Check current context usage
./.claude/hooks/monitor-context.sh

# Update restart context when usage is high
./.claude/hooks/update-restart-context.sh
```

#### PR Management
```bash
# Analyze PR check failures (systemic vs violations)
./.claude/hooks/pr-check-handler.sh [PR_NUMBER]

# Report issues with cursor_rules
./.claude/hooks/report-issue.sh
```

#### Deployment Verification
```bash
# Verify deployment after merge
./.claude/hooks/post-deploy.sh [BRANCH]
```

### Development Workflow Hooks

Automated hooks for enhancing development workflows:

#### Issue Progress Tracker
```bash
# Track issue progress throughout development lifecycle
./hooks/issue-progress-tracker.sh <action> <issue_number> [message] [pr_number]

# Examples:
./hooks/issue-progress-tracker.sh start 95 "Beginning work"
./hooks/issue-progress-tracker.sh update 95 "Fixed root cause"
./hooks/issue-progress-tracker.sh link-pr 95 99
./hooks/issue-progress-tracker.sh complete 95 99 "Deployed"
```

#### PR Review Check
```bash
# Automatically analyze PR comments for compliance violations
./hooks/pr-review-check.sh [PR_NUMBER] [options]

# Examples:
./hooks/pr-review-check.sh 99                  # Review specific PR
./hooks/pr-review-check.sh --auto              # Auto-detect from branch
./hooks/pr-review-check.sh 99 --summary        # Summary only
./hooks/pr-review-check.sh --auto --json       # JSON output
```

See [hooks/README.md](./hooks/README.md) for detailed documentation.

## Configuration

### Rules Configuration

Edit `config/rules.json` to customize:
- Security patterns
- Code quality rules
- Workflow requirements
- File naming conventions

### Commit Message Rules

Modify `config/commit-msg.json` to adjust:
- Allowed commit types
- Scope requirements
- Message format validation

### Claude Configuration

Configure AI-assisted development in `.claude/config/settings.json`:
- Context management thresholds
- PR check analysis patterns
- Issue reporting settings

## Testing

Run the test suite:

```bash
npm test
```

Tests cover:
- Rule engine functionality
- Security pattern detection
- Exception handling
- Configuration validation

## Advanced Usage

### Manual Hook Installation

For custom installations:

```bash
# Install specific hooks
cp hooks/pre-commit .git/hooks/
cp hooks/commit-msg .git/hooks/
chmod +x .git/hooks/*
```

### CI/CD Integration

Integrate with GitHub Actions:

```yaml
- name: Run Rule Checker
  run: |
    npm install
    npm run validate
```

### Centralized Rule Management

For organizations managing multiple repositories:

1. **Install centralized workflow**:
   ```bash
   curl -sSL https://raw.githubusercontent.com/tyabonil/cursor_rules/main/install-rule-checker.sh | bash
   ```

2. **Configure repository permissions**:
   - Settings → Actions → General → Workflow permissions: "Read and write permissions"

3. **Benefits**:
   - Always uses latest rules from cursor_rules
   - Centralized updates across all repositories
   - No local rule maintenance required

## Troubleshooting

### Common Issues

1. **Permission Denied**: Ensure hooks have execute permissions
   ```bash
   chmod +x .git/hooks/*
   ```

2. **Hook Not Running**: Verify Git version (2.9+) and hook installation
   ```bash
   ls -la .git/hooks/
   ```

3. **False Positives**: Add exceptions to `config/rules.json`

4. **Context Management**: Use Claude hooks for AI session continuity
   ```bash
   ./.claude/hooks/monitor-context.sh
   ```

## Contributing

We welcome contributions! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes using Conventional Commits
4. Push to your branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

See [PULL_REQUEST.md](./PULL_REQUEST.md) for PR template.

## License

This project is licensed under the MIT License - see [LICENSE](./LICENSE) file for details.

## Related Documentation

- [MANDATORY-RULES.md](./MANDATORY-RULES.md) - Complete rule reference
- [README-RULE-CHECKER.md](./README-RULE-CHECKER.md) - Technical architecture
- [INSTALLATION.md](./INSTALLATION.md) - Detailed installation guide
- [enhanced-rules/](./enhanced-rules/) - Advanced rule configurations
- [workflow/](./workflow/) - Development workflow patterns
- [.claude/README.md](./.claude/README.md) - AI-assisted development tools
