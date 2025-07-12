# Issue #276: Migrate legacy/cursor-rules dependencies to new vibe-codex structure

## Session 1 - 2025-07-12

### Goal
Migrate all dependencies on legacy/cursor-rules directory to use the new vibe-codex structure, allowing us to complete the repository cleanup.

### Analysis
Dependencies found during issue #271 work:
1. **GitHub Actions**: `.github/workflows/mandatory-rules-checker.yml` downloads scripts from the repository
2. **Compatibility Wrappers**: `scripts/rule-engine.js`, `scripts/reporter.js`, `scripts/github-client.js`
3. **Tests**: `tests/hooks-integration.test.js` references these files
4. **Documentation**: Multiple references in PROJECT_CONTEXT.md and other docs

### Migration Plan
1. [x] Update GitHub workflow to use new vibe-codex structure or remove if obsolete
   - Deprecated the workflow, now only runs on manual trigger
2. [x] Check if compatibility wrappers are still needed
   - Added deprecation warnings and error handling
3. [x] Update or remove tests that depend on legacy structure
   - Updated hooks-integration.test.js to use vibe-codex
4. [x] Update documentation references
   - Updated PROJECT_CONTEXT.md
   - Created LEGACY-MIGRATION.md guide
5. [ ] Remove legacy directories once all dependencies are migrated

### Work Started
Beginning with analyzing the GitHub Actions workflow to understand what it does and how to migrate it.
## Session 2 - 2025-07-11

### Commit: ff86a31 - 2025-07-11 22:27
```
chore: begin legacy migration work for issue #276

- Created work log with migration plan
- Identified all dependencies that need migration
- Starting with GitHub Actions workflow analysis
```

**Files changed:**
- Added: .vibe-codex/work-logs/issue-276-work.md


### Commit: 811bcee - 2025-07-11 22:33
```
feat: deprecate legacy mandatory-rules-checker system

- Added deprecation warnings to all compatibility wrappers
- Disabled automatic trigger for mandatory-rules-checker workflow
- Updated hooks-integration.test.js to match vibe-codex structure
- Fixed PROJECT_CONTEXT.md to reference new rule system
- Created comprehensive LEGACY-MIGRATION.md guide
- Added proper error handling for missing legacy dependencies

This maintains backward compatibility while encouraging migration to the new modular rule system.
```

**Files changed:**
- Modified: .github/workflows/mandatory-rules-checker.yml
- Modified: .vibe-codex/work-logs/issue-271-work.md
- Modified: .vibe-codex/work-logs/issue-276-work.md
- Added: MANDATORY-RULES.md
- Modified: PROJECT_CONTEXT.md
- Added: docs/LEGACY-MIGRATION.md
- Modified: package.json
- Modified: scripts/github-client.js
- Added: scripts/pr-file-validator.js
- Modified: scripts/reporter.js
- Modified: scripts/rule-engine.js
- Modified: tests/hooks-integration.test.js

