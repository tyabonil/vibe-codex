# Issue #9: Refine Secret Scanner and Add "Move On" Rule

**Description**

The secret scanner is still being triggered by test files. This needs to be refined to be less sensitive to test data.

Additionally, a new rule needs to be added to instruct the LLM to move on to the next available issue while waiting for PR reviews or other blockers, and to have a strategy for handling potential merge conflicts.

**Acceptance Criteria**

- The `scripts/rule-engine.js` is updated to be less sensitive to secrets in test files.
- A new "MOVE ON TO THE NEXT ISSUE" rule is added to `MANDATORY-RULES.md` under "LEVEL 2: WORKFLOW INTEGRITY".
- The new rule includes a conflict resolution strategy.
- The `RULES-LLM-OPTIMIZED.md` file is updated by running the build script.
- The changes are tested and follow all existing repository rules.