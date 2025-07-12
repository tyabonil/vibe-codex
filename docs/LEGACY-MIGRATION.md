# Legacy System Migration Guide

## Overview
This guide helps migrate from the legacy mandatory-rules-checker system to the new vibe-codex modular rule system.

## What's Changing

### Deprecated Components
1. **MANDATORY-RULES.md** → Replaced by modular rules in `/rules/`
2. **scripts/rule-engine.js** → Use vibe-codex CLI
3. **scripts/reporter.js** → Integrated into vibe-codex
4. **scripts/github-client.js** → Integrated into vibe-codex
5. **legacy/cursor-rules/** → Will be removed after migration

### New Components
1. **vibe-codex CLI** - Main command-line interface
2. **rules/registry.json** - Central rule registry
3. **Modular rule system** - Rules organized by category
4. **Interactive configuration** - Menu-driven setup

## Migration Steps

### For GitHub Actions

Replace the old workflow that downloads scripts:

```yaml
# OLD - Don't use this
- name: Download MANDATORY Rules and Scripts
  run: |
    curl -o scripts/rule-engine.js ...
    curl -o MANDATORY-RULES.md ...
```

With the new approach:

```yaml
# NEW - Use vibe-codex directly
- name: Setup vibe-codex
  run: |
    npm install -g vibe-codex
    vibe-codex check --pr ${{ github.event.pull_request.number }}
```

### For Local Development

1. **Install vibe-codex**:
   ```bash
   npm install -g vibe-codex
   # or locally
   npm install --save-dev vibe-codex
   ```

2. **Initialize in your project**:
   ```bash
   vibe-codex init
   ```

3. **Remove old hooks** (if any):
   ```bash
   rm -f .git/hooks/mandatory-rules-*
   ```

### For CI/CD Pipelines

Update your CI configuration:

```yaml
# Example for GitHub Actions
jobs:
  vibe-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm install -g vibe-codex
      - run: vibe-codex check
```

## Rule Mapping

| Old Rule Location | New Rule Location |
|-------------------|-------------------|
| MANDATORY-RULES.md Level 1 | `/rules/basic/security.md` |
| MANDATORY-RULES.md Level 2 | `/rules/workflow/*.md` |
| MANDATORY-RULES.md Level 3 | `/rules/quality/*.md` |
| MANDATORY-RULES.md Level 4 | `/rules/advanced/*.md` |

## API Changes

### Old API
```javascript
const RuleEngine = require('mandatory-rules-checker');
const engine = new RuleEngine();
engine.checkLevel1Security(files);
```

### New API
```javascript
const { VibeCodex } = require('vibe-codex');
const vibe = new VibeCodex();
await vibe.check({ 
  rules: ['sec-001', 'sec-002'],
  files: files 
});
```

## Timeline

1. **Now**: Both systems work (compatibility mode)
2. **Next Release**: Legacy system deprecated with warnings
3. **Future**: Legacy system removed completely

## Getting Help

- Issues: https://github.com/tyabonil/vibe-codex/issues
- Migration Issue: #276
- Documentation: `/docs/`

## Frequently Asked Questions

### Q: Do I need to migrate immediately?
A: No, compatibility wrappers are in place, but you should plan to migrate soon.

### Q: Will my existing GitHub Actions break?
A: Not immediately. The deprecated workflow will show warnings but continue to work temporarily.

### Q: How do I know which rules to enable?
A: Run `vibe-codex init` for an interactive menu to select rules based on your project type.