# 📖 Cursor Rules - Complete Usage Guide

## Table of Contents
- [Quick Start (5 Minutes)](#quick-start-5-minutes)
- [System Overview](#system-overview)
- [Use Cases & Scenarios](#use-cases--scenarios)
- [Component Deep Dive](#component-deep-dive)
- [Configuration & Customization](#configuration--customization)
- [Advanced Integration](#advanced-integration)
- [Troubleshooting](#troubleshooting)
- [LLM Integration](#llm-integration)

---

## Quick Start (5 Minutes)

### 1. Install the Rule System
```bash
# One-command installation
curl -sSL https://raw.githubusercontent.com/tyabonil/vibe-codex/main/install-rule-checker.sh | bash
```

### 2. Test the Installation
```bash
# Make a test commit to verify hooks are working
echo "test" > test.txt
git add test.txt
git commit -m "test: verify rule system installation"
```

### 3. Verify Components
- ✅ **Pre-commit hook**: Security scanning and PR health checks
- ✅ **Commit message validation**: Conventional Commits format
- ✅ **Rule engine**: Automated compliance checking

**🎉 You're ready!** The system will now automatically enforce rules on every commit.

---

## System Overview

### What is Cursor Rules?
A comprehensive rule enforcement system designed for AI-powered development that maintains code quality, security, and workflow consistency across projects.

### Core Architecture
```
┌─────────────────────────────────────────────────────────────────┐
│                    Cursor Rules Ecosystem                       │
├─────────────────────────────────────────────────────────────────┤
│  📋 Rules Layer                                                │
│  ├── MANDATORY-RULES.md (LLM-optimized)                       │
│  ├── Project-specific patterns (configurable)                  │
│  └── Enhanced rules (advanced configurations)                  │
├─────────────────────────────────────────────────────────────────┤
│  🔧 Enforcement Layer                                          │
│  ├── Git Hooks (pre-commit, commit-msg)                       │
│  ├── GitHub Actions (centralized checking)                    │
│  └── Review Bots (automated PR analysis)                      │
├─────────────────────────────────────────────────────────────────┤
│  🤖 AI Integration Layer                                       │
│  ├── .claude/ (Claude Code integration)                       │
│  ├── LLM-specific adaptations                                 │
│  └── Context management tools                                 │
├─────────────────────────────────────────────────────────────────┤
│  ⚙️  Configuration Layer                                        │
│  ├── config/ (rules, patterns, commit validation)             │
│  ├── Project-specific settings                                │
│  └── Environment variables                                    │
└─────────────────────────────────────────────────────────────────┘
```

### Key Benefits
- **Automated Quality**: Every commit meets quality standards
- **Security First**: Prevents secrets and vulnerabilities from entering codebase
- **AI-Optimized**: Designed for both human developers and AI assistants
- **Configurable**: Adaptable to different project types and workflows
- **Centralized**: Consistent rules across teams and repositories

---

## Use Cases & Scenarios

### 🏢 Enterprise Teams
**Scenario**: Large organization with multiple repositories and development teams.

**Implementation**:
1. **Centralized Rule Management**:
   ```bash
   # Install in all repositories
   curl -sSL https://raw.githubusercontent.com/tyabonil/vibe-codex/main/install-rule-checker.sh | bash
   ```

2. **Configure Organization Patterns**:
   - Enable `preview_workflow` for staging environments
   - Configure `repository_specific` with your organization's rules repo
   - Enable `github_cli_workflow` for consistent tooling

3. **Benefits**:
   - Consistent quality across all projects
   - Automated compliance checking
   - Reduced code review overhead
   - Standardized workflows

### 👨‍💻 Solo Developers
**Scenario**: Individual developer working on personal or client projects.

**Implementation**:
1. **Basic Setup**:
   ```bash
   # Install in your project
   bash install-rule-checker.sh
   ```

2. **Minimal Configuration**:
   - Keep default settings for most patterns
   - Enable `platform_preferences` if using Windows/WSL
   - Customize security patterns for your tech stack

3. **Benefits**:
   - Automated quality checking
   - Security vulnerability prevention
   - Professional commit standards
   - AI assistant optimization

### 🤖 AI-Assisted Development
**Scenario**: Teams using AI assistants (Claude, GPT-4, Copilot) for development.

**Implementation**:
1. **Enhanced AI Integration**:
   ```bash
   # Install with AI tools
   bash install-rule-checker.sh
   # AI tools are automatically included
   ```

2. **Configure AI Patterns**:
   - Enable `copilot_integration` for GitHub Copilot
   - Use `.claude/` tools for Claude Code
   - Configure LLM-specific rules in `llm-specific/`

3. **Benefits**:
   - Context management for AI sessions
   - Automated PR analysis
   - AI-optimized rule presentation
   - Intelligent error detection

### 🎯 Open Source Projects
**Scenario**: Public repositories with community contributions.

**Implementation**:
1. **Community-Friendly Setup**:
   ```bash
   # Install with GitHub Actions
   curl -sSL https://raw.githubusercontent.com/tyabonil/vibe-codex/main/install-rule-checker.sh | bash
   ```

2. **Configure for Contributors**:
   - Enable `github_cli_workflow` for issue management
   - Configure clear error messages and documentation
   - Set up automated review bots

3. **Benefits**:
   - Consistent contribution quality
   - Automated onboarding for new contributors
   - Reduced maintainer burden
   - Professional project standards

### 📊 Issue & PR Management
**Scenario**: Teams needing automated issue tracking and PR compliance checking.

**Implementation**:
1. **Issue Progress Tracking**:
   ```bash
   # Start work on an issue
   ./hooks/issue-progress-tracker.sh start 95 "Beginning implementation"
   
   # Update progress
   ./hooks/issue-progress-tracker.sh update 95 "Fixed root cause"
   
   # Link PR when ready
   ./hooks/issue-progress-tracker.sh link-pr 95 99
   
   # Complete when merged
   ./hooks/issue-progress-tracker.sh complete 95 99 "Successfully deployed"
   ```

2. **PR Review Automation**:
   ```bash
   # Check PR for compliance violations
   ./hooks/pr-review-check.sh --auto
   
   # Get detailed violation summary
   ./hooks/pr-review-check.sh 99 --summary
   
   # Export for CI/CD integration
   ./hooks/pr-review-check.sh 99 --json
   ```

3. **Git Hook Integration**:
   ```bash
   # Add to .git/hooks/post-commit
   ./hooks/issue-progress-tracker.sh auto commit
   
   # Add to .git/hooks/pre-push
   ./hooks/issue-progress-tracker.sh auto push
   ```

4. **Benefits**:
   - Automated issue status updates
   - Never miss compliance violations
   - Streamlined workflow tracking
   - Reduced manual overhead

---

## Component Deep Dive

### 📋 Rules System

#### MANDATORY-RULES.md
**Purpose**: LLM-optimized comprehensive rule set
**Structure**:
- Level 1: Security & Safety (non-negotiable)
- Level 2: Workflow Integrity (process rules)
- Level 3: Quality Gates (testing and review)
- Level 4: Development Patterns (best practices)
- Level 5: Local Development (hooks and tools)

**Usage**: Primary reference for AI assistants and automated systems

#### Project-Specific Patterns (config/project-patterns.json)
**Purpose**: Configurable workflow patterns for different project types
**Available Patterns**:
- `preview_workflow`: Git flow with staging branch
- `repository_specific`: Configurable repository references
- `platform_preferences`: Windows/WSL specific settings
- `heartbeat_pattern`: Anti-stall workflow automation
- `github_cli_workflow`: GitHub CLI optimizations
- `copilot_integration`: GitHub Copilot specific features

**Configuration Example**:
```json
{
  "rulesets": {
    "preview_workflow": { "enabled": true },
    "github_cli_workflow": { "enabled": true },
    "platform_preferences": { "enabled": false }
  }
}
```

### 🔧 Enforcement Components

#### Git Hooks
**Pre-commit Hook** (`hooks/pre-commit`):
- Security scanning (secrets detection)
- PR health checking
- File validation
- Build verification (when configured)

**Commit Message Hook** (`hooks/commit-msg`):
- Conventional Commits validation
- Issue reference checking
- Format standardization

**Issue Progress Tracker** (`hooks/issue-progress-tracker.sh`):
- Automated GitHub issue status updates
- Progress tracking throughout development lifecycle
- Integration with git hooks for automatic updates
- Actions: start, update, link-pr, complete, validate

**PR Review Check** (`hooks/pr-review-check.sh`):
- Automatic PR comment analysis for compliance violations
- Multiple output formats (summary, JSON, violations-only)
- Auto-detection from current branch
- Interactive mode with resolution suggestions

**Installation**: Automatic via `install-rule-checker.sh`

#### GitHub Actions
**Centralized Rule Checker** (`.github/workflows/mandatory-rules-checker.yml`):
- Runs on all PRs
- Validates rule compliance
- Provides detailed feedback
- Blocks non-compliant merges

**Review Bots** (automated PR analysis):
- Balance Bot: Constructive feedback
- Hater Bot: Aggressive issue detection
- White Knight Bot: Positive reinforcement

### 🤖 AI Integration Tools

#### .claude/ Directory
**Purpose**: Claude Code specific integration tools

**Key Components**:
- `monitor-context.sh`: Track Claude context usage
- `pr-check-handler.sh`: Analyze PR failures (systemic vs violations)
- `report-issue.sh`: Interactive issue reporting
- `update-restart-context.sh`: Context preservation

**Usage**:
```bash
# Check context usage
./.claude/hooks/monitor-context.sh

# Analyze PR check failures
./.claude/hooks/pr-check-handler.sh [PR_NUMBER]

# Report vibe-codex issues
./.claude/hooks/report-issue.sh
```

#### LLM-Specific Adaptations
**Purpose**: Optimized rules for different AI assistants

**Available Adaptations**:
- Claude (Anthropic): `llm-specific/claude-anthropic-rules.md`
- GPT-4 (OpenAI): `llm-specific/gpt4-openai-rules.md`
- GitHub Copilot: `llm-specific/github-copilot-rules.md`
- Cursor AI: `llm-specific/cursor-ai-rules.md`
- Cline: `llm-specific/cline-rules.md`

---

## Configuration & Customization

### Basic Configuration Files

#### config/rules.json
**Purpose**: Core rule engine configuration
**Key Settings**:
```json
{
  "rules": {
    "level1_security": {
      "checks": {
        "secrets_detection": { "patterns": [...] },
        "env_files_protection": { "patterns": [...] }
      }
    },
    "level2_workflow": {
      "checks": {
        "issue_reference": { "patterns": [...] },
        "branch_naming": { "required_patterns": [...] }
      }
    }
  }
}
```

#### config/commit-msg.json
**Purpose**: Commit message validation rules
**Configuration**:
```json
{
  "types": ["feat", "fix", "docs", "style", "refactor", "test", "chore"],
  "scopes": [],
  "maxLength": 100,
  "minLength": 10
}
```

### Advanced Customization

#### Custom Security Patterns
Add organization-specific secret detection:
```json
{
  "rules": {
    "level1_security": {
      "checks": {
        "secrets_detection": {
          "patterns": [
            "your-org-api-key\\s*[=:]\\s*['\"][A-Za-z0-9]{32}['\"]",
            "custom-token\\s*[=:]\\s*['\"]\\w+['\"]"
          ]
        }
      }
    }
  }
}
```

#### Custom Workflow Patterns
Create project-specific workflow rules in `config/project-patterns.json`:
```json
{
  "rulesets": {
    "custom_deployment": {
      "enabled": true,
      "description": "Custom deployment workflow",
      "rules": [
        "All deployments must go through staging first",
        "Production deployments require manual approval"
      ]
    }
  }
}
```

---

## Advanced Integration

### CI/CD Integration

#### GitHub Actions
```yaml
name: Rule Compliance
on: [push, pull_request]
jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Install Rules
        run: |
          curl -sSL https://raw.githubusercontent.com/tyabonil/vibe-codex/main/install-rule-checker.sh | bash
      - name: Validate Rules
        run: npm run validate
```

#### GitLab CI
```yaml
validate_rules:
  stage: test
  script:
    - curl -sSL https://raw.githubusercontent.com/tyabonil/vibe-codex/main/install-rule-checker.sh | bash
    - npm run validate
  rules:
    - if: $CI_PIPELINE_SOURCE == "push"
    - if: $CI_PIPELINE_SOURCE == "merge_request_event"
```

### IDE Integration

#### VS Code
1. Install recommended extensions:
   - Conventional Commits
   - GitLens
   - Error Lens

2. Add to `.vscode/settings.json`:
   ```json
   {
     "git.inputValidation": "warn",
     "conventionalCommits.autoComplete": true
   }
   ```

#### Cursor IDE
The rules are natively optimized for Cursor IDE with AI assistant integration.

### Team Adoption Strategy

#### Phase 1: Foundation (Week 1)
1. Install in pilot repository
2. Configure basic rules
3. Train team on new workflows
4. Gather initial feedback

#### Phase 2: Expansion (Week 2-3)
1. Roll out to additional repositories
2. Customize rules based on feedback
3. Add project-specific patterns
4. Implement team-specific configurations

#### Phase 3: Optimization (Week 4+)
1. Analyze rule effectiveness
2. Optimize patterns based on violations
3. Add advanced integrations
4. Document lessons learned

---

## Troubleshooting

### Common Issues

#### 1. Hooks Not Running
**Symptoms**: Commits succeed without validation
**Solutions**:
```bash
# Check hook installation
ls -la .git/hooks/

# Verify permissions
chmod +x .git/hooks/pre-commit
chmod +x .git/hooks/commit-msg

# Reinstall hooks
bash install-rule-checker.sh
```

#### 2. False Positive Secret Detection
**Symptoms**: Legitimate code flagged as secrets
**Solutions**:
1. Add exceptions to `config/rules.json`:
   ```json
   {
     "exceptions": [
       "test_api_key_not_real",
       "mock_password_example"
     ]
   }
   ```

2. Use proper environment variable patterns:
   ```javascript
   // ❌ Will trigger detection
   const apiKey = "sk-1234567890abcdef";
   
   // ✅ Correct pattern
   const apiKey = process.env.API_KEY;
   ```

#### 3. Commit Message Validation Errors
**Symptoms**: Valid-looking commits rejected
**Solutions**:
1. Use conventional commit format:
   ```bash
   # ✅ Correct formats
   git commit -m "feat: add user authentication"
   git commit -m "fix(api): resolve timeout issue"
   git commit -m "docs: update installation guide"
   
   # ❌ Incorrect formats
   git commit -m "Added new feature"
   git commit -m "fixed bug"
   ```

#### 4. GitHub Actions Failures
**Symptoms**: Rule compliance checks fail in CI
**Solutions**:
1. Check repository permissions:
   - Settings → Actions → General → Workflow permissions: "Read and write permissions"

2. Verify secrets are properly set:
   - `GITHUB_TOKEN` should be automatically available
   - Custom tokens should be added to repository secrets

#### 5. Claude Context Issues
**Symptoms**: AI assistant losing context or making errors
**Solutions**:
```bash
# Monitor context usage
./.claude/hooks/monitor-context.sh

# Update restart context when needed
./.claude/hooks/update-restart-context.sh

# Report issues with rules
./.claude/hooks/report-issue.sh
```

### Debug Mode
Enable detailed logging for troubleshooting:
```bash
# Set debug environment variable
export DEBUG_CURSOR_RULES=true

# Run with verbose output
git commit -m "test: debug mode" --verbose
```

### Support Resources
- **Documentation**: This guide and component READMEs
- **Issues**: [GitHub Issues](https://github.com/tyabonil/vibe-codex/issues)
- **Discussions**: [GitHub Discussions](https://github.com/tyabonil/vibe-codex/discussions)
- **Contributing**: [PULL_REQUEST.md](./PULL_REQUEST.md)

---

## LLM Integration

### For AI Assistants
This section provides guidance for AI assistants working with vibe-codex.

#### Primary Reference Documents
1. **MANDATORY-RULES.md**: Complete rule reference (LLM-optimized)
2. **LLM-USAGE-REFERENCE.md**: Technical integration guide
3. **config/project-patterns.json**: Configurable workflow patterns

#### Key Integration Points
1. **Rule Compliance**: Always follow MANDATORY-RULES.md
2. **Issue Management**: Use GitHub issues for all work tracking
3. **Branch Management**: Follow project's branching strategy
4. **Commit Standards**: Use Conventional Commits format
5. **Security**: Never commit secrets or sensitive data

#### Context Management
Use `.claude/` tools for Claude Code sessions:
- Monitor context usage regularly
- Update restart context when needed
- Report rule issues through proper channels

#### Error Handling
1. **Systemic Errors**: Use PR check handler to distinguish from violations
2. **Rule Violations**: Address immediately, don't proceed
3. **Configuration Issues**: Check project-patterns.json for settings
4. **Documentation Gaps**: Report missing information via issues

### For Human Developers Working with AI
#### Best Practices
1. **Clear Instructions**: Provide context about project-specific configurations
2. **Error Guidance**: Help AI assistants understand when errors are systemic vs violations
3. **Context Preservation**: Use Claude tools to maintain session continuity
4. **Quality Verification**: Review AI-generated code for rule compliance

#### Integration Workflow
1. AI assistant reads MANDATORY-RULES.md for current session
2. Checks project-patterns.json for project-specific settings
3. Follows established workflow patterns
4. Uses .claude/ tools for context management
5. Reports issues through proper channels

---

## Next Steps

### Getting Started
1. ✅ **Install the system**: Run the quick start commands
2. ✅ **Test basic functionality**: Make a test commit
3. ✅ **Explore components**: Review the architecture overview
4. ✅ **Configure for your project**: Customize patterns and rules

### Advanced Usage
1. **Integrate with CI/CD**: Add GitHub Actions or GitLab CI
2. **Team Adoption**: Follow the team adoption strategy
3. **Custom Rules**: Add project-specific patterns
4. **Monitor Effectiveness**: Track rule compliance and violations

### Contributing
1. **Report Issues**: Use GitHub issues for bugs or feature requests
2. **Suggest Improvements**: Contribute to rule refinement
3. **Share Patterns**: Submit useful project-specific configurations
4. **Help Documentation**: Improve guides based on your experience

### Staying Updated
- **Watch the Repository**: Get notified of updates
- **Review Releases**: Check changelog for new features
- **Update Regularly**: Keep your installation current
- **Participate in Discussions**: Join the community conversation

---

**📚 Additional Resources**:
- [LLM-USAGE-REFERENCE.md](./LLM-USAGE-REFERENCE.md) - Technical reference for AI systems
- [MANDATORY-RULES.md](./MANDATORY-RULES.md) - Complete rule specification
- [PROJECT_CONTEXT.md](./PROJECT_CONTEXT.md) - Repository architecture and decisions
- [Component Documentation](./hooks/README.md) - Detailed component guides