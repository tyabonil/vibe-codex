# Rules Directory Structure

This directory contains all available rules for vibe-codex, organized by category and complexity level.

## Directory Organization

- **`/basic/`** - Simple, essential rules that most projects need
  - Quick to understand and implement
  - Minimal performance impact
  - Good starting point for any project

- **`/advanced/`** - Complex rules for sophisticated development workflows
  - May require more setup or configuration
  - Higher performance impact but more comprehensive
  - For teams with mature development processes

- **`/security/`** - Security-focused rules
  - Credential detection
  - OWASP guidelines
  - Security best practices

- **`/workflow/`** - Development workflow rules
  - Git workflow enforcement
  - PR/Issue management
  - Team collaboration patterns

- **`/quality/`** - Code quality rules
  - Testing requirements
  - Documentation standards
  - Code style enforcement

- **`/ai-development/`** - Rules specific to AI-assisted development
  - Context preservation
  - Reward hacking prevention
  - AI agent coordination

- **`/llm-specific/`** - Rules tailored for specific LLM providers
  - Claude-specific patterns
  - GPT-specific patterns
  - Other LLM optimizations

## Rule Format

Each rule file contains:
1. Rule ID and name
2. Category and complexity level
3. Clear description of what it enforces
4. Implementation details
5. Configuration options (if any)

## Using Rules

Rules are selected through the vibe-codex menu system. The installer will:
1. Display available rules by category
2. Show complexity indicators
3. Allow selection via checkboxes
4. Save selections to `.vibe-codex.json`