# Issue #1: Stricter Enforcement of GitHub Workflow for LLMs

**Description**

LLMs are failing to consistently follow GitHub workflow rules, including:
- Creating, updating, and closing issues.
- Referencing issues in PRs.
- Following the correct sequence of operations (issue -> branch -> commit -> PR).

This task is to modify the `cursor_rules` repository to enforce these workflows more strictly and provide clearer guidance to LLMs.

**Acceptance Criteria**

- The `MANDATORY-RULES.md` file is updated with a more prescriptive, sequential workflow.
- The `rule-engine.js` script is updated to reflect stricter checks where possible.
- The changes are documented and follow all existing repository rules.

**Resolution**

This issue has been addressed. The `MANDATORY-RULES.md` file has been updated with a new sequential workflow, and the `rule-engine.js` script has been updated to enforce it. These changes were consolidated and merged into the `preview` branch as part of the work for Issue #6.

**Status: CLOSED**