# PROJECT CONTEXT

## Repository Overview

**vibe-codex** - A comprehensive rule enforcement system for AI-powered development, designed to maintain code quality, security, and workflow consistency across projects.

## Project Purpose

This repository provides:
- **Mandatory development rules** for AI-assisted coding
- **Automated enforcement** through git hooks and GitHub Actions
- **AI-specific tooling** for context management and workflow optimization
- **Centralized rule management** for organizations

## Architecture

### Core Components
- **MANDATORY-RULES.md**: Human-readable rule documentation
- **Rule Engine**: Automated validation system (`scripts/rule-engine.js`)
- **GitHub Actions**: Centralized rule checking workflows
- **Git Hooks**: Local pre-commit and commit-msg validation
- **.claude Directory**: AI-assisted development tools
- **Development Workflow Hooks**: Issue progress tracking and PR review automation

### Technology Stack
- **Node.js**: Rule engine and validation scripts
- **GitHub Actions**: CI/CD automation
- **Bash Scripts**: Git hooks and utility tools
- **JSON Configuration**: Rule patterns and settings

## Current Implementation Status

### ✅ Completed Features
- **Core rule engine** with Level 1-2 validation
- **Centralized rule checker** workflow
- **AI-assisted development tools** (.claude directory)
- **Context management system** for Claude Code
- **PR check failure analysis** and reporting
- **Interactive issue reporter** for feedback
- **Post-deployment verification** hooks
- **Issue progress tracking hook** (Issue #169) - Automated issue status updates
- **PR review check hook** (Issue #171) - Compliance violation analysis

### 🚧 In Progress
- **Enhanced pre-commit validation** (Issue #128)
- **Project-specific rule extraction** (Issue #122)
- **Documentation consolidation** (Issue #121)

### 📋 Planned Features
- **Level 3-4 rule validation** (checkLevel3Quality, checkLevel4Patterns)
- **Advanced workflow enforcement** in hooks
- **Rule effectiveness analytics** (Issue #118)

## Key Development Patterns

### Workflow
1. **Issue-driven development** - All work must have GitHub issues
2. **Branch-based workflow** - feature/issue-{number}-{description}
3. **Preview-first deployment** - preview → main promotion
4. **Automated rule enforcement** - Centralized checking

### Security
- **Secret detection** patterns and validation
- **Environment file protection** (.env safety)
- **No hardcoded credentials** policy

### AI Integration
- **Context management** for AI assistants
- **Intelligent error analysis** (systemic vs violations)
- **Automated issue reporting** and feedback loops

## Dependencies

### Core Dependencies
- `@actions/core` and `@actions/github` - GitHub Actions integration
- `marked` - Markdown processing
- Custom rule engine and validation scripts

### Development Dependencies
- `jest` - Testing framework
- `eslint` - Code linting
- GitHub CLI (`gh`) - Issue and PR management

## Environment Configuration

### Required for Full Functionality
- **GitHub repository** with Actions enabled
- **Node.js 18+** for rule engine
- **Git hooks** installed via `install-rule-checker.sh`

### Optional Enhancements
- **Claude Code** integration for AI-assisted development
- **Deployment platforms** (Vercel, Netlify) for post-deploy verification

## Recent Major Changes

### 2025-07-08
- **Added issue progress tracking hook** (Issue #169) for automated GitHub issue updates
- **Added PR review check hook** (Issue #171) for compliance violation analysis
- **Comprehensive test coverage** for both new hooks (35 tests total)
- **Integration tests** verifying npm package compatibility

### 2025-07-05
- **Added .claude directory** with comprehensive AI tooling
- **Implemented context management** for Claude Code sessions
- **Added PR check failure analysis** to reduce false positives
- **Created interactive issue reporter** for user feedback
- **Removed broken rule-checker.yml** workflow (Issue #133)

### Key Decisions
- **Centralized rule management** over local rule copies
- **AI-first development** approach with specialized tooling
- **Comprehensive automation** to reduce manual overhead

## Integration Points

### For Consuming Projects
- Install via `bash install-rule-checker.sh`
- Centralized rules downloaded from this repository
- Local overrides supported via `.cursorrules`

### For Contributors
- Follow mandatory workflow rules
- Use .claude hooks for AI-assisted development
- Update this PROJECT_CONTEXT.md for significant changes

## Support and Documentation

- **Main Documentation**: README.md
- **Rule Reference**: MANDATORY-RULES.md  
- **Installation Guide**: INSTALLATION.md
- **Architecture Details**: README-RULE-CHECKER.md
- **AI Tools Guide**: .claude/README.md

---

*This file should be updated whenever significant changes are made to the repository architecture, implementation approach, or key decisions.*