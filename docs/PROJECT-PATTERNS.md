# 🔧 Project-Specific Rule Patterns

## Overview

The cursor_rules repository provides universal rules that apply to all projects, plus configurable project-specific patterns in `config/project-patterns.json`. This allows you to enable workflow patterns that fit your project's needs while maintaining the core mandatory rules.

## Available Rulesets

### 1. Preview Workflow (`preview_workflow`)
**Default:** Disabled

Git flow pattern using a `preview` branch for testing before merging to `main`.

**When to enable:**
- Your project uses a preview/staging environment
- You want an extra validation step before production
- Your team follows a three-tier deployment strategy (feature → preview → main)

**Rules included:**
- Base all development work on `preview` branch instead of `main`
- Target PRs to `preview` branch first
- Only merge to `main` from `preview`
- Keep feature branches up-to-date with `preview`

### 2. Repository-Specific (`repository_specific`)
**Default:** Disabled

Configurable references to your organization's rules repository.

**Configuration:**
```json
{
  "rulesets": {
    "repository_specific": {
      "enabled": true,
      "variables": {
        "rules_repository": "your-org/your-rules",
        "rules_repository_short": "your-rules"
      }
    }
  }
}
```

### 3. Platform Preferences (`platform_preferences`)
**Default:** Disabled

Platform-specific terminal and tooling preferences.

**When to enable:**
- Your team primarily uses Windows/WSL
- You have specific terminal requirements
- You want to standardize development environments

**Rules included:**
- Prefer Linux/POSIX terminals over PowerShell
- Use WSL Ubuntu on Windows systems
- Avoid PowerShell for development commands

### 4. Heartbeat Pattern (`heartbeat_pattern`)
**Default:** Disabled

Anti-stall pattern for maintaining development momentum when no other work is available.

**When to enable:**
- You have automated AI assistants that need continuous work
- You want to prevent development pipeline stalls
- Your workflow requires active monitoring of PR status

**Rules included:**
- Create "Heartbeat" issues when no other work exists
- Automatic PR status checking and backlog management

### 5. GitHub CLI Workflow (`github_cli_workflow`)
**Default:** Enabled

Workflow patterns optimized for GitHub CLI usage.

**Rules included:**
- Prefer `gh` CLI for repository interactions
- Fallback hierarchy: gh CLI → git SSH → git HTTPS
- Use gh CLI for issue management

### 6. Copilot Integration (`copilot_integration`)
**Default:** Disabled

GitHub Copilot-specific workflow integration.

**When to enable:**
- Your team uses GitHub Copilot for code review
- You want automated review requests

**Rules included:**
- Request review from `@copilot` immediately after creating PRs

## Configuration

### Enabling Rulesets

Edit `config/project-patterns.json`:

```json
{
  "rulesets": {
    "preview_workflow": {
      "enabled": true
    },
    "platform_preferences": {
      "enabled": true  
    }
  }
}
```

### Custom Variables

Some rulesets support custom variables:

```json
{
  "rulesets": {
    "repository_specific": {
      "enabled": true,
      "variables": {
        "rules_repository": "your-company/development-rules",
        "rules_repository_short": "development-rules"
      }
    }
  }
}
```

## Integration with Rule Engine

The rule engine will automatically check `config/project-patterns.json` and apply enabled rulesets during validation. Disabled rulesets are completely ignored, making the rules truly optional.

## Best Practices

1. **Start Minimal**: Begin with only essential rulesets enabled
2. **Team Alignment**: Ensure all team members understand enabled patterns
3. **Documentation**: Document your project's enabled rulesets in your README
4. **Regular Review**: Periodically review enabled rulesets as your project evolves

## Migration Guide

If you're coming from hard-coded project-specific rules:

1. Review your current workflow patterns
2. Identify which patterns from `project-patterns.json` match your needs
3. Enable appropriate rulesets in your configuration
4. Update any local documentation to reference the new patterns
5. Test the configuration with a small change first

This approach maintains rule consistency while providing the flexibility needed for diverse project types.