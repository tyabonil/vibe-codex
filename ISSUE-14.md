# Issue #14: Mandatory Issue Interaction Protocol

**Description**

I have repeatedly failed to update GitHub issues with my plans, findings, and status, leading to context loss and repeated errors. This is a critical failure in my process. This issue tracks the creation of a new, explicit protocol to ensure I use GitHub issues as the single source of truth for my work.

**Acceptance Criteria**

- A new "MANDATORY ISSUE INTERACTION PROTOCOL" is added to `MANDATORY-RULES.md`.
- This protocol will mandate the following steps:
    1.  **Before starting work:** The first action MUST be to comment on the issue with a detailed plan of action.
    2.  **After creating a PR:** I MUST comment on the issue with a link to the PR.
    3.  **When a PR is blocked:** I MUST comment on the issue stating why it is blocked.
    4.  **After addressing PR feedback:** I MUST comment on the issue summarizing the fixes.
    5.  **Before closing an issue:** I MUST add a final comment summarizing the resolution and linking to the final PR.
- This rule will be non-negotiable.
- The `RULES-LLM-OPTIMIZED.md` file will be updated by running the build script.