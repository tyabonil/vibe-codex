# Issue #4: Refactor for LLM Ingestion Efficiency

**Description**

The repository currently has multiple, overlapping rule files, which is inefficient for LLM ingestion and creates a risk of inconsistency. This task is to refactor the repository to establish a single, authoritative source of truth for rules and automate the generation of an LLM-optimized version.

**Acceptance Criteria**

- `MANDATORY-RULES.md` is established as the single, complete source of truth for human-readable rules.
- All other redundant rule files (`copy-paste-rules.md`, `copy-paste-templates/*`) are removed.
- A new script is created to automatically generate `RULES-LLM-OPTIMIZED.md` from `MANDATORY-RULES.md`.
- The main `README.md` is updated to reflect this new, streamlined structure.

**Resolution**

This issue has been addressed. The repository has been refactored to have a single source of truth for rules, and the `RULES-LLM-OPTIMIZED.md` file is now auto-generated. These changes were consolidated and merged into the `preview` branch as part of the work for Issue #6.

**Status: CLOSED**