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

