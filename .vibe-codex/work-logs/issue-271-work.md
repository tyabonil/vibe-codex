# Issue #271: Harmonize repository structure and integrate LLM-specific rules

## Session 1 - 2025-07-11

### Goal
Harmonize repository structure by removing duplicates, organizing LLM rules, and ensuring all rules are accessible through the installer.

### Grooming Results
- Issue #266 (LLM rules) is still open - combining with this work
- This is a meta-issue that includes LLM rule integration
- Need to preserve existing LLM content while restructuring

### Plan (from issue description)
1. Structure Harmonization
   - Move /llm-specific/ content to /rules/llm-specific/
   - Remove MANDATORY-RULES.md files
   - Clean up legacy directories
   - Standardize file names

2. LLM Rule Integration  
   - Format existing LLM rules properly
   - Add to registry.json
   - Test with installer

3. Validation
   - Ensure no orphaned rules
   - Test installer access
   - Update documentation

### Work Started
- Created branch feature/issue-271-harmonization
- Enhanced grooming hook for project alignment
- Ready to start harmonization
### Commit: 8eab744 - 2025-07-11 21:47
```
feat: enhance issue grooming hook for project alignment

- Added project structure alignment checks
- Detect external contributors and misaligned implementations
- Provide guided remediation for architecture compliance
- Enable WFL-007 with GitHub issue updates in config

This ensures all contributions align with vibe-codex architecture.
```

**Files changed:**
- Modified: .vibe-codex.json
- Added: .vibe-codex/work-logs/issue-266-work.md
- Added: .vibe-codex/work-logs/issue-271-work.md
- Added: rules/llm-specific/README.md
- Added: rules/llm-specific/claude-anthropic-rules.md
- Added: rules/llm-specific/claude-rules.md
- Added: rules/llm-specific/cline-rules.md
- Added: rules/llm-specific/cursor-ai-rules.md
- Added: rules/llm-specific/github-copilot-rules.md
- Added: rules/llm-specific/gpt4-openai-rules.md
- Added: rules/workflow/issue-grooming.md
- Added: templates/hooks/issue-grooming-hook.sh


### Commit: fafddc1 - 2025-07-11 22:18
```
feat: add dependency safety and reward hacking prevention rules

- Added WFL-009 (Dependency Safety Check) to prevent deletion of files with active dependencies
- Added AI-005 (Goal Alignment Verification) to prevent AI reward hacking
- Created dependency-check-hook.sh that checks all branches and working directory
- Discovered legacy directories have active dependencies (GitHub Actions, tests)
- Created issue #276 to properly migrate legacy dependencies
- Downgraded chalk and ora to v4/v5 for CommonJS compatibility
- Verified all 12 LLM rules are properly registered and files exist

This work demonstrates why we need these safety rules - I almost deleted
critical files without checking dependencies first.
```

**Files changed:**
- Added: .vibe-codex-backup/2025-07-12T02-15-53-715Z/.vibe-codex.json
- Added: .vibe-codex-backup/2025-07-12T02-15-53-715Z/PROJECT_CONTEXT.md
- Added: .vibe-codex-backup/2025-07-12T02-15-53-715Z/hooks/commit-msg
- Added: .vibe-codex-backup/2025-07-12T02-15-53-715Z/hooks/issue-worklog-update.sh
- Added: .vibe-codex-backup/2025-07-12T02-15-53-715Z/hooks/post-commit
- Added: .vibe-codex-backup/2025-07-12T02-15-53-715Z/hooks/post-merge
- Added: .vibe-codex-backup/2025-07-12T02-15-53-715Z/hooks/pre-commit
- Added: .vibe-codex-backup/2025-07-12T02-15-53-715Z/hooks/pre-push
- Added: .vibe-codex-backup/2025-07-12T02-15-53-715Z/manifest.json
- Modified: .vibe-codex/work-logs/issue-271-work.md
- Deleted: MANDATORY-RULES.md
- Modified: config/commit-msg.json
- Deleted: config/project-patterns.json
- Deleted: legacy/enhanced-rules/COMPARISON-MATRIX.md
- Deleted: legacy/enhanced-rules/ENHANCED-MANDATORY-RULES.md
- Deleted: legacy/enhanced-rules/RESEARCH-SUMMARY.md
- Deleted: llm-specific/README.md
- Deleted: llm-specific/claude-anthropic-rules.md
- Deleted: llm-specific/cline-rules.md
- Deleted: llm-specific/cursor-ai-rules.md
- Deleted: llm-specific/github-copilot-rules.md
- Deleted: llm-specific/gpt4-openai-rules.md
- Modified: package.json
- Added: rules/ai-development/reward-hacking-prevention.md
- Deleted: rules/llm-specific/claude-anthropic-rules.md
- Modified: rules/registry.json
- Added: rules/workflow/dependency-safety-check.md
- Added: templates/hooks/dependency-check-hook.sh

