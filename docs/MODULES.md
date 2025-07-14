# vibe-codex Modules

This document provides detailed information about each module available in vibe-codex.

## Module Overview

vibe-codex uses a modular architecture where each module focuses on a specific aspect of development workflow and code quality. Modules can be enabled or disabled based on your project's needs.

## Core Module

**Always Enabled** | Level 1-2 Rules

The core module provides essential security and workflow rules that should apply to all projects.

### Rules

#### Security Rules (Level 1)

- **SEC-1: No Secrets in Code**
  - Detects API keys, passwords, tokens, and other secrets
  - Patterns: API keys, passwords, tokens, secrets
  - Severity: Error

- **SEC-2: Environment File Protection**
  - Prevents overwriting of .env files
  - Protects: .env, .env.local, .env.production
  - Severity: Error

- **SEC-3: Environment Example File**
  - Ensures .env.example exists when using environment variables
  - Helps developers understand required configuration
  - Severity: Warning

#### Workflow Rules (Level 2)

- **WF-1: Issue-First Development**
  - Every code change must start with a GitHub issue
  - Enforces traceable development
  - Severity: Error

- **WF-2: Branch Naming Convention**
  - Branches must follow: `{type}/issue-{number}-{description}`
  - Types: feature, bugfix, hotfix
  - Severity: Error

- **WF-3: Commit Message Format**
  - Follows conventional commits: `type(scope): description`
  - Types: feat, fix, docs, style, refactor, test, chore
  - Severity: Warning

- **WF-4: PR Title References Issue**
  - Pull request titles must reference issue numbers
  - Format: Must include #123
  - Severity: Error

- **WF-5: Token Efficiency**
  - Detects duplicate content across files
  - Helps reduce LLM token usage
  - Severity: Warning

### Hooks

- **pre-commit**: Checks for secrets before committing
- **commit-msg**: Validates commit message format

## Testing Module

**Optional** | Level 3 Rules

Enforces testing standards and coverage requirements.

### Rules

- **TEST-1: Test Coverage Threshold**
  - Ensures minimum code coverage (default: 80%)
  - Metrics: lines, statements, functions, branches
  - Configurable threshold

- **TEST-2: Test Files Exist**
  - Every source file should have corresponding tests
  - Looks for .test.js, .spec.js patterns
  - Severity: Warning

- **TEST-3: Test Naming Convention**
  - Test descriptions should be clear and meaningful
  - Enforces behavior-driven descriptions
  - Severity: Warning

- **TEST-4: No Skipped Tests**
  - Prevents .skip() or .only() in test files
  - Ensures all tests run
  - Severity: Warning

- **TEST-5: Test File Structure**
  - Tests should use describe blocks
  - Proper setup/teardown for async operations
  - Severity: Info

### Configuration

```json
{
  "testing": {
    "coverageThreshold": 80,
    "testFilePattern": "**/*.{test,spec}.{js,ts}",
    "requireTestFiles": true
  }
}
```

## GitHub Module

**Optional** | Level 4 Rules

GitHub-specific features and best practices.

### Rules

- **GH-1: Pull Request Template**
  - Repository must have PR template
  - Location: .github/pull_request_template.md
  - Auto-fix available

- **GH-2: Issue Templates**
  - Requires bug report and feature request templates
  - Location: .github/ISSUE_TEMPLATE/
  - Auto-fix available

- **GH-3: CODEOWNERS File**
  - Automatic review assignments
  - Location: .github/CODEOWNERS
  - Severity: Info

- **GH-4: Contributing Guidelines**
  - CONTRIBUTING.md must exist
  - Helps onboard contributors
  - Auto-fix available

- **GH-5: GitHub Actions Workflows**
  - Checks for CI/CD workflows
  - Validates workflow configuration
  - Severity: Info

- **GH-6: Security Policy**
  - SECURITY.md for vulnerability reporting
  - Security best practices
  - Severity: Info

### Hooks

- **pre-push**: Prevents direct pushes to main/master branches

## GitHub Workflow Module

**Optional** | Level 4 Rules | Requires: github

Advanced GitHub Actions validation and best practices.

### Rules

- **GHW-1: CI Workflow Exists**
  - Continuous integration workflow required
  - Must trigger on push/pull_request
  - Auto-fix available

- **GHW-2: Workflow Security**
  - No hardcoded secrets
  - Permissions explicitly defined
  - Third-party actions pinned to versions

- **GHW-3: Workflow Timeout**
  - Jobs must have timeout-minutes
  - Prevents runaway workflows
  - Configurable maximum

- **GHW-4: Security Scanning**
  - CodeQL or similar security scanning
  - Automated vulnerability detection
  - Auto-fix available

- **GHW-5: Dependency Updates**
  - Dependabot or Renovate configuration
  - Automated dependency management
  - Auto-fix available

- **GHW-6: Workflow Efficiency**
  - Caching for dependencies
  - Artifact sharing between jobs
  - Performance optimization

## Deployment Module

**Optional** | Level 4 Rules | Requires: core

Deployment configuration and platform-specific validation.

### Rules

- **DEPLOY-1: Environment Variables Documentation**
  - All env vars must be documented
  - Sensitive variables need descriptions
  - README integration

- **DEPLOY-2: Platform Configuration Files**
  - Validates platform-specific configs
  - Supports: Vercel, Netlify, Heroku, AWS, Docker
  - Platform auto-detection

- **DEPLOY-3: Build Configuration**
  - Required build and start scripts
  - Output directory configuration
  - Build artifacts in .gitignore

- **DEPLOY-4: Docker Configuration**
  - Multi-stage builds recommendation
  - Non-root user enforcement
  - Health check requirements

- **DEPLOY-5: Health Check Endpoint**
  - Application health monitoring
  - Required endpoints: /health, /status
  - Framework detection

### Supported Platforms

- **Vercel**: vercel.json validation
- **Netlify**: netlify.toml validation
- **Heroku**: Procfile validation
- **Docker**: Dockerfile best practices
- **AWS**: CloudFormation/SAM validation

## Documentation Module

**Optional** | Level 5 Rules

Documentation standards and completeness.

### Rules

- **DOC-1: README Completeness**
  - Required sections validation
  - Minimum length requirements
  - Code examples in usage section

- **DOC-2: API Documentation**
  - Public APIs must be documented
  - JSDoc or separate API.md
  - Comprehensive coverage

- **DOC-3: Changelog Maintenance**
  - CHANGELOG.md following Keep a Changelog
  - Version history tracking
  - Recent updates check

- **DOC-4: Code Comments**
  - Functions and classes need documentation
  - File-level documentation
  - JSDoc/TSDoc format

- **DOC-5: License File**
  - LICENSE file required
  - Open source compliance
  - Severity: Error

### Required README Sections

1. Installation
2. Usage
3. API (if applicable)
4. Contributing
5. License

## Patterns Module

**Optional** | Level 5 Rules

Code organization and architecture patterns.

### Rules

- **PATTERN-1: File Organization**
  - Logical directory structure
  - Maximum nesting depth
  - Separation of concerns

- **PATTERN-2: File Length**
  - Maximum lines per file (default: 500)
  - Encourages modular code
  - Configurable threshold

- **PATTERN-3: Function Complexity**
  - Cyclomatic complexity limits
  - Function length limits
  - Maintainability focus

- **PATTERN-4: Naming Conventions**
  - camelCase for variables
  - PascalCase for classes
  - UPPER_SNAKE_CASE for constants

- **PATTERN-5: Index Files**
  - Directories should have index files
  - Clean exports management
  - Module organization

- **PATTERN-6: Import Organization**
  - Grouped by type (external, internal, relative)
  - Consistent ordering
  - No unnecessary gaps

### Best Practices Enforced

- Consistent code style
- Modular architecture
- Clear naming conventions
- Organized imports
- Reasonable file sizes

## Module Dependencies

Some modules depend on others:

```
github-workflow → github
deployment → core
```

Dependencies are automatically enabled when you enable a module that requires them.

## Creating Custom Modules

You can create custom modules for your organization:

```javascript
import { RuleModule } from 'vibe-codex/lib/modules/base.js';

export class CustomModule extends RuleModule {
  constructor() {
    super({
      name: 'custom',
      version: '1.0.0',
      description: 'Custom rules for our team',
      dependencies: ['core'],
      options: {}
    });
  }

  async loadRules() {
    this.registerRule({
      id: 'CUSTOM-1',
      name: 'Custom Rule',
      description: 'Description',
      level: 5,
      category: 'custom',
      severity: 'warning',
      check: async (context) => {
        // Implementation
        return [];
      }
    });
  }
}
```

## Module Lifecycle

1. **Initialization**: Module is loaded and configured
2. **Rule Registration**: Rules are registered with the validator
3. **Hook Registration**: Git hooks are set up
4. **Validation**: Rules are executed during validation
5. **Reporting**: Results are formatted and displayed

## Performance Considerations

- Modules are loaded on-demand
- Rules are executed in parallel where possible
- Caching is used for expensive operations
- File system access is minimized

## Advanced Hooks (Optional)

Advanced hooks provide additional automation for development workflows. These are opt-in features that can be installed during initialization or added later.

### Available Hook Categories

#### Issue Tracking
Automates issue management throughout development:
- **issue-progress-tracker.sh**: Automatically tracks and updates issue progress
- **issue-reminder-pre-commit.sh**: Reminds to update issues before commits
- **issue-reminder-post-commit.sh**: Prompts for issue updates after commits
- **issue-reminder-pre-push.sh**: Validates issue status before pushing

#### PR Management
Enforces pull request best practices:
- **pr-health-check.sh**: Validates PR health before push
- **pr-review-check.sh**: Ensures required reviews are present
- **pre-issue-close.sh**: Validates issue closure requirements

#### Quality Gates
Enforces code quality standards:
- **test-coverage-validator.sh**: Ensures test coverage meets thresholds
- **security-pre-commit.sh**: Runs security checks before commits

#### Context Management
Keeps project documentation current:
- **monitor-context.sh**: Updates PROJECT_CONTEXT.md automatically

### Installing Advanced Hooks

```bash
# During initialization
npx vibe-codex init --with-advanced-hooks "issue-tracking,quality-gates"

# Interactive selection
npx vibe-codex init  # Choose when prompted

# All categories
npx vibe-codex init --with-advanced-hooks "issue-tracking,pr-management,quality-gates,context-management"
```

### Configuration

Advanced hooks respect the same configuration patterns as regular hooks:
- Can be skipped with `SKIP_VIBE_CODEX=1`
- Configuration via `.vibe-codex.json`
- Compatible with existing git hooks

## Troubleshooting Modules

### Module Not Loading

1. Check module is enabled in configuration
2. Verify dependencies are enabled
3. Check for syntax errors in custom modules

### Rules Not Running

1. Verify rule level matches enforcement level
2. Check if rule is disabled in configuration
3. Ensure file patterns match

### Performance Issues

1. Disable unnecessary modules
2. Use ignore patterns for large directories
3. Run validation on specific modules only