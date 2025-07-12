# Implementation Plan for Issues 263-266

## Overview
Plan to implement the remaining vibe-codex enhancements following our own rules.

## Priority Order (Based on Dependencies)

### 1. Issue #264 - Update Configuration System (FIRST)
**Why First**: Other issues depend on having a working config system
- Define .vibe-codex.json schema
- Update config loader to use registry.json
- This enables menu to save/load configs

### 2. Issue #263 - Implement Checkbox Menu (SECOND)
**Why Second**: Needs config system to save selections
- Build interactive menu using registry.json
- Implement category navigation
- Save selections using new config format

### 3. Issue #265 - Update README (THIRD)
**Why Third**: Document what we built in #263-264
- Update to show menu-driven approach
- Document configuration format
- Show all available rules

### 4. Issue #266 - Add LLM-Specific Rules (FOURTH)
**Why Last**: Additional content, not blocking
- Create rules for Claude, GPT-4, Copilot
- Add to registry.json
- Enhance the rule catalog

---

## Implementation Approach (Following Our Rules)

### For Each Issue:
1. Create feature branch: `feature/issue-XXX-description`
2. Create work log in `.vibe-codex/work-logs/`
3. Implement with tests
4. Update documentation
5. Create PR to preview branch
6. Ensure all checks pass

### Rule Compliance:
- **WFL-001**: Issue-driven development ✓
- **WFL-005**: Track work in local files ✓
- **WFL-006**: Check conflicts before push ✓
- **DOC-004**: Update docs with code ✓

## Technical Details

### Issue #264 - Configuration System
```json
{
  "version": "1.0.0",
  "preset": "custom",
  "rules": {
    "sec-001": { "enabled": true },
    "wfl-005": { 
      "enabled": true,
      "options": {...}
    }
  }
}
```

### Issue #263 - Menu Structure
```
vibe-codex Configuration
├── Security Rules
│   ├── [x] No Secrets (sec-001)
│   └── [x] Env Protection (sec-002)
├── Workflow Rules
│   ├── [x] Issue-Driven (wfl-001)
│   └── [ ] PR Enforcement (wfl-002)
```

### Issue #265 - README Sections
1. Overview with 30+ rules
2. Interactive menu demo
3. Configuration examples
4. Rule categories

### Issue #266 - LLM Rules Structure
```
/rules/llm-specific/
├── claude-rules.md
├── gpt4-rules.md
├── copilot-rules.md
└── general-llm-rules.md
```

## Estimated Timeline
- Issue #264: 2-3 hours (config system)
- Issue #263: 3-4 hours (menu UI)
- Issue #265: 1 hour (documentation)
- Issue #266: 2 hours (rule creation)

Total: ~10 hours of focused work

## Success Criteria
- [ ] Users can select rules via interactive menu
- [ ] Configuration persists to JSON
- [ ] README accurately reflects capabilities
- [ ] LLM-specific rules available
- [ ] All tests pass
- [ ] All PRs merged to preview