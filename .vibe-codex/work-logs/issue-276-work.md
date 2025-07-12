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
1. [ ] Update GitHub workflow to use new vibe-codex structure or remove if obsolete
2. [ ] Check if compatibility wrappers are still needed
3. [ ] Update or remove tests that depend on legacy structure
4. [ ] Update documentation references
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

