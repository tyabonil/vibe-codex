# Issue #13: Implement Anti-Stalling and Heartbeat Protocol

**Description**

I have demonstrated a failure to "move on" to the next issue while waiting for reviews, leading to a stalled state. This indicates the current rules are insufficient to prevent this anti-pattern. This issue tracks the work to create a more robust protocol.

**Acceptance Criteria**

- A new "ANTI-STALLING PROTOCOL" is added to `MANDATORY-RULES.md`.
- The protocol will require the following:
    - If a PR is blocked or under review, I MUST immediately list all open issues and select the next one to work on.
    - If no other issues exist, I MUST create a new issue titled "Heartbeat: Check PR Status and Backlog".
    - The "Heartbeat" issue involves checking the status of all open PRs. If comments are not yet available, the issue is closed, and a new "Heartbeat" issue is immediately created to continue the loop, preventing a stalled state.
- The `RULES-LLM-OPTIMIZED.md` file is updated by running the build script.