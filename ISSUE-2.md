# Issue #2: Hierarchical Approach for Git Remote Operations

**Description**

The current rule, "ALWAYS USE MCP GITHUB API TOOLS FOR REMOTE OPERATIONS," is too restrictive. It should be replaced with a hierarchical approach that allows the LLM to choose the most optimal method for interacting with git remotes, based on availability and context.

**Acceptance Criteria**

- The `MANDATORY-RULES.md` file is updated to reflect a new hierarchical approach for git remote operations.
- The new hierarchy should be:
  1. Local `gh` CLI
  2. MCP tools
  3. Command-line `git` with SSH
  4. Command-line `git` with HTTPS
- The `rule-engine.js` script is updated to reflect these changes, if necessary.
- The changes are documented and follow all existing repository rules.

**Resolution**

This issue has been addressed. The `MANDATORY-RULES.md` file has been updated with the new git remote operations hierarchy. These changes were consolidated and merged into the `preview` branch as part of the work for Issue #6.

**Status: CLOSED**