# Issue #5: Introduce Mandatory LLM Self-Review Protocol

**Description**

To improve the quality and rule compliance of LLM contributions, a mandatory self-review step must be introduced. After creating a Pull Request, the LLM must perform a thorough review of its own work before requesting reviews from others.

**Acceptance Criteria**

- A new "MANDATORY LLM SELF-REVIEW" rule is added to `MANDATORY-RULES.md` under "LEVEL 3: QUALITY GATES".
- The rule must require the LLM to verify:
    - The PR directly addresses the issue's requirements.
    - The issue has been updated with progress.
    - The PR adheres to all repository rules.
    - The LLM must comment on its own PR if any violations are found.
    - The LLM must read and address all comments on the PR and the issue.
- The `RULES-LLM-OPTIMIZED.md` file is updated by running the build script.
- The changes are documented and follow all existing repository rules.

**Resolution**

This issue has been addressed. The `MANDATORY-RULES.md` file has been updated with the new "MANDATORY LLM SELF-REVIEW" rule. These changes were consolidated and merged into the `preview` branch as part of the work for Issue #6.

**Status: CLOSED**