# RULE-DOC-004: Documentation Update Enforcement

**Category**: Quality  
**Complexity**: Basic  
**Default**: Disabled  
**Hook Type**: Pre-commit  
**Performance Impact**: Low  

## Purpose

Ensure documentation is updated alongside code changes to:
- Keep docs synchronized with implementation
- Prevent documentation drift
- Improve onboarding experience
- Maintain project knowledge base

## Problem It Solves

Common scenario:
1. Developer adds new feature/API
2. Forgets to update README or docs
3. Documentation becomes outdated
4. New developers confused
5. Knowledge lost over time

With this rule:
1. Code changes detected
2. Hook checks for related doc updates
3. Reminds developer to update docs
4. Documentation stays current

## Implementation

### Detection Logic
```bash
# Check if code files changed
# Look for corresponding documentation updates
# Warn if docs might need updates
```

### File Patterns Checked

**Code Changes That Trigger Checks:**
- API endpoints (controllers, routes)
- Configuration files
- Public methods/classes
- CLI commands
- Environment variables
- Database schemas

**Documentation Files:**
- README.md
- docs/*.md
- API.md
- CONFIGURATION.md
- .env.example
- CHANGELOG.md

## Configuration

### Enable in .vibe-codex.json
```json
{
  "rules": {
    "quality": {
      "documentation-enforcement": {
        "enabled": true,
        "options": {
          "strict": false,
          "auto_suggest": true,
          "required_sections": [
            "configuration",
            "api",
            "environment"
          ]
        }
      }
    }
  }
}
```

### Options
- **strict**: Block commit if docs not updated (default: false)
- **auto_suggest**: Suggest which docs might need updates
- **required_sections**: Specific doc sections to check

## Examples

### API Change Detection
```
📚 Documentation Reminder
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
You modified: src/api/users.js

Consider updating:
- docs/API.md (new endpoints?)
- README.md (API examples?)
- CHANGELOG.md (breaking changes?)

To skip this check:
  git commit --no-verify
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### Configuration Change
```
📚 Documentation Reminder
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
You modified: config/app.js

Consider updating:
- CONFIGURATION.md
- .env.example
- README.md (setup instructions?)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## Smart Detection

The hook intelligently detects:

1. **New Files**: Suggests creating documentation
2. **Deleted Files**: Suggests removing references
3. **Major Changes**: Looks for function signature changes
4. **Config Changes**: Checks for new settings
5. **Schema Changes**: Database or API contract updates

## Best Practices

1. **Update Docs First**: Write docs before coding (docs-driven development)
2. **Small Updates**: Even one-line doc updates help
3. **Examples**: Include code examples in docs
4. **Changelog**: Note breaking changes

## Exceptions

Skip documentation check when:
- Only fixing typos
- Internal refactoring (no API change)
- Test file updates
- Development-only changes

## Related Rules
- RULE-DOC-001: README Requirements
- RULE-DOC-002: Inline Documentation
- RULE-DOC-003: Changelog Maintenance