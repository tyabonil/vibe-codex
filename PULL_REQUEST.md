# Pull Request: Consolidate All Rule Improvements

**Description**

This Pull Request contains all the consolidated changes from issues #1, #2, #3, #4, #5, and #6. It represents a major refactoring of the `cursor_rules` repository to improve efficiency, clarity, and LLM-friendliness.

**Changes**

- **Stricter Workflow:** The `MANDATORY-RULES.md` file now includes a prescriptive, sequential workflow for LLMs to follow.
- **Git Hierarchy:** The "ALWAYS USE MCP GITHUB API" rule has been replaced with a more flexible, hierarchical approach to git remote operations.
- **LLM Self-Review:** A new "MANDATORY LLM SELF-REVIEW" protocol has been added to improve the quality of LLM contributions.
- **Efficiency Refactor:** The repository has been refactored to have a single source of truth for rules, with an auto-generated, LLM-optimized version.
- **Workflow Correction:** This PR correctly targets the `preview` branch, and all previous workflow violations have been corrected.

**Review**

Please review the changes in the `preview` branch. I have performed a self-review and believe all changes adhere to the repository's rules. I am ready to address any feedback you may have.

**Merge**

Do not merge this Pull Request until it has been reviewed and approved.