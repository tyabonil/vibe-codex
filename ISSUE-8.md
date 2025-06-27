# Issue #8: Refine Rule Engine to Handle `preview` Branch Exceptions

**Description**

The rule engine is currently flagging the `preview` branch for not conforming to the feature branch naming convention, and it is flagging the final PR to `main` as a violation. This is incorrect, as these are special cases in the workflow.

**Acceptance Criteria**

- The `scripts/rule-engine.js` is updated to:
    - Ignore the branch naming violation for the `preview` branch.
    - Ignore the PR target violation when the head branch is `preview` and the base branch is `main`.
- The changes are tested and follow all existing repository rules.