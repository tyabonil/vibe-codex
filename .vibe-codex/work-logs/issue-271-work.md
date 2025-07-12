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