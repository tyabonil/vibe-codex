# Rule Consolidation Documentation

This document tracks the consolidation of rules from various locations into the new organized structure.

## Summary

Consolidated ~250+ rules from 13 different files into 30 well-organized, deduplicated rules with clear categories and complexity levels.

## Consolidation Mapping

### Basic Rules (from simplified vibe-codex rules)

| Original Location | New Location | Rules |
|------------------|--------------|-------|
| `/MANDATORY-RULES.md` (simple) | `/rules/basic/security.md` | Security rules (3) |
| `/docs/RULES.md` | `/rules/basic/commit-format.md` | Commit format rules (2) |
| `/docs/RULES.md` | `/rules/basic/testing.md` | Testing rules (3) |
| `/docs/RULES.md` | `/rules/basic/documentation.md` | Documentation rules (3) |
| `/docs/RULES.md` | `/rules/basic/code-style.md` | Code style rules (3) |

### Advanced Rules (from legacy cursor-rules)

| Original Location | New Location | Rules |
|------------------|--------------|-------|
| `/legacy/cursor-rules/MANDATORY-RULES.md` | `/rules/advanced/workflow-integrity.md` | Workflow rules (4) |
| `/legacy/cursor-rules/MANDATORY-RULES.md` | `/rules/ai-development/context-preservation.md` | AI development rules (4) |
| `/legacy/enhanced-rules/ENHANCED-MANDATORY-RULES.md` | `/rules/security/owasp-compliance.md` | OWASP security rules (4) |
| `/legacy/enhanced-rules/ENHANCED-MANDATORY-RULES.md` | `/rules/quality/engineering-principles.md` | Engineering principles (4) |

### Eliminated Duplicates

1. **Security Rules**: Merged 5+ versions into comprehensive basic and advanced sets
2. **Workflow Rules**: Consolidated issue-driven development from 4 different files
3. **Testing Requirements**: Unified test-related rules from multiple sources
4. **Documentation Standards**: Combined various doc requirements

### New Additions

1. **Rules Registry** (`/rules/registry.json`): Machine-readable catalog of all rules
2. **Category READMEs**: Clear documentation for each rule category
3. **Preset Configurations**: Pre-defined rule combinations for common use cases

## Key Improvements

### 1. Clear Organization
- Rules now organized by category (security, workflow, quality, etc.)
- Complexity levels clearly marked (basic vs advanced)
- Easy navigation for menu system

### 2. No More Duplicates
- Each rule concept exists in exactly one place
- Clear IDs prevent confusion
- Consolidated similar rules into comprehensive versions

### 3. Preserved Value
- All valuable rules from legacy system preserved
- Complex AI development rules accessible
- OWASP and engineering principles available
- Nothing lost, only organized better

### 4. Menu-Ready Structure
- Registry provides all metadata needed for menu display
- Categories support nested menu navigation
- Presets allow quick selection of rule bundles
- Each rule has performance impact indicator

## Migration Guide

For users of the old cursor_rules system:

1. **Legacy MANDATORY-RULES.md** → See advanced workflow rules + AI development rules
2. **Enhanced rules** → See OWASP compliance + engineering principles
3. **Simple 5 rules** → See basic category rules
4. **Copy-paste templates** → Use presets in registry.json

## Next Steps

With consolidation complete, the menu system can now:
- Display all rules organized by category
- Show complexity and performance impact
- Allow checkbox selection
- Save selections to .vibe-codex.json
- Load preset configurations