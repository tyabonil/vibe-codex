# 🚨 MANDATORY RULES

## LEVEL 1: SECURITY & SAFETY

-   NEVER commit secrets, API keys, passwords, or other credentials.
-   NEVER overwrite environment files.
-   ALWAYS use environment variables for sensitive data.
-   ALWAYS create `.env.example` with documented variables.

## PROJECT-SPECIFIC PATTERNS

-   Some workflow patterns are project-specific and configurable via `config/project-patterns.json`.
-   Enable/disable rulesets based on your project's needs (preview workflow, platform preferences, etc.).
-   Universal rules below apply to all projects regardless of configuration.

## LEVEL 2: WORKFLOW INTEGRITY

-   EVERY code change must start with a GitHub issue.
-   CREATE an issue if one doesn't exist.
-   Issues must be small enough to be completed in ≤7 days.
-   Use P0-BLOCKER → P0-CRITICAL → P1-HIGH → P2-MEDIUM → P3-LOW prioritization.
-   GITHUB ISSUES are the single source of truth for all work.
-   ALL updates, planning, and discussions must happen on the remote GitHub issue.
-   Use the `gh` CLI to interact with issues whenever possible.
-   Before starting work, your first action MUST be to comment on the issue with a detailed plan of action.
-   After creating a PR, you MUST comment on the issue with a link to the PR.
-   When a PR is blocked, you MUST comment on the issue stating why it is blocked.
-   After addressing PR feedback, you MUST comment on the issue summarizing the fixes.
-   Before closing an issue, you MUST add a final comment summarizing the resolution and linking to the final PR.
-   Follow your project's branching strategy (see config/project-patterns.json for common patterns).
-   Branch name must reference the issue: `feature/issue-{number}-{description}`.
-   Make small, atomic commits.
-   Commit messages must be clear and descriptive.
-   Reference the issue in your commit messages (e.g., `feat: add login form, resolves #123`).
-   Before creating any new pull request, you MUST review ALL open PRs in the repository.
-   For each open PR, if it is stale (>7 days old) or no longer needed, close it and delete the branch.
-   If an open PR is still relevant, leave it open but document its status.
-   Create a Pull Request (PR) as soon as you have made your first commit.
-   The PR title must reference the issue number.
-   The PR body must describe the changes and reference the issue.
-   Target the appropriate branch according to your project's workflow.
-   Request a review from `@copilot` immediately after creating the PR.
-   Address ALL feedback from reviewers and automated checks.
-   Follow your project's merge strategy for approved PRs.
-   After merging, close the issue if it's fully resolved.
-   Comment on the issue with the resolution and PR link.
-   DELETE THE FEATURE BRANCH after the PR is merged.
-   ALWAYS run `npm install` after package.json changes.
-   ALWAYS run build commands locally before committing.
-   NEVER commit dependency changes without a successful local build.
-   DELETE node_modules & package-lock.json for clean testing when conflicts arise.
-   BEFORE creating new rules: Analyze ALL existing files for redundancy
-   NEVER maintain multiple files with duplicate content (>25% overlap)
-   NEVER keep human-oriented summaries/meta-content in LLM-consumed files
-   NEVER include historical/process content that adds no actionable value
-   ALWAYS consolidate redundant content into single authoritative files
-   ALWAYS prioritize token efficiency: 1 comprehensive file > 5 partial files
-   ALWAYS delete legacy files completely superseded by newer comprehensive versions
-   ALWAYS maintain minimal README for human repository usage guidance only
-   TARGET: <40KB total repository size for optimal LLM consumption
-   Use the following hierarchy to interact with git remotes. Try them in order, and if one fails, try the next.
    1.  Local `gh` CLI (Preferred)
    2.  Command-line `git` with SSH
    3.  Command-line `git` with HTTPS
-   Use appropriate terminal for your development environment (see config/project-patterns.json for platform-specific guidance)
-   Append | cat to commands that might use pagers (git log, git diff)
-   Use non-interactive flags: --yes, --quiet, --no-pager
-   IMMEDIATELY assign blocked issues to repository owner
-   DETECT blocking keywords: "BLOCKED", "depends on", "requires access"
-   NEVER attempt infrastructure, DevOps, or human-authorization work
-   ALWAYS identify 2-3 alternative non-blocked issues
-   If you encounter a rule that is unclear, contradictory, or difficult to follow, you MUST suggest an improvement.
-   To do so, open an issue in your organization's rules repository (see config/project-patterns.json).
-   The issue should clearly describe the problem and suggest a specific change to the rules.
-   This is a mandatory part of the workflow to ensure the rules are always improving.
-   IDENTIFY any instance where an optimization could have prevented unnecessary thinking, wasted tokens, or inefficient workflow steps.
-   IMMEDIATELY CREATE a new issue in your rules repository documenting this finding.
-   THE ISSUE MUST DETAIL:
    -   The inefficient action taken.
    -   The proposed optimization or new rule that would have prevented it.
    -   The potential impact (e.g., saved tokens, faster execution, fewer steps).
-   The LLM's only responsibility is to CREATE THE ISSUE, NOT WORK ON IT.
-   The issue should be assigned to the repository owner for prioritization and implementation.
-   While waiting for a PR review or other blocker, you MUST move on to the next available issue.
-   Before starting the new issue, ensure your base branch is up-to-date with the remote.
-   Create a new feature branch from your project's base branch for the new issue.
-   Conflict Resolution Strategy: When your previous PR is approved and merged, you MUST immediately update your current feature branch by rebasing it on the updated base branch. This will prevent merge conflicts.
-   If a PR is blocked or under review, immediately list all open issues and select the next one to work on.
-   If no other issues exist, use your project's anti-stall pattern (see config/project-patterns.json for options like Heartbeat pattern).
-   If a PR has violations, you MUST address them in the same PR.
-   Step 1: Read the violations. Understand what needs to be fixed.
-   Step 2: Fix the violations. Make the necessary code changes.
-   Step 3: Commit the fixes. Use a clear commit message (e.g., `fix: Address PR violations`).
-   Step 4: Push the changes. Push the new commit to the same feature branch.
-   Step 5: Re-request review. Comment on the PR to notify reviewers that the violations have been addressed.
-   DO NOT close a PR with violations unless you are starting over.
-   DO NOT open a new PR for the same issue without closing the old one.
-   ACT, DON'T ASK: You are authorized to perform all routine development tasks without asking for permission. This includes, but is not limited to:
    -   Creating, updating, closing, and commenting on issues.
    -   Creating, modifying, and deleting files in the repository.
    -   Deploying, testing, and building the application.
    -   Making architectural decisions based on best practices.
    -   Fixing bugs, improving code, and refactoring.
    -   Updating dependencies and configurations.
    -   Creating branches, pull requests, and merging code according to the workflow rules.
    -   Adding and updating environment variables.
    -   Interacting with all integrated services.
-   ONLY ASK PERMISSION WHEN:
    -   You need credentials or API keys that have not been provided.
    -   You need to spend money or approve budgets.
    -   You need legal or compliance decisions.
    -   You need access to external services that are not yet integrated.
    -   You are making destructive changes to production data.
-   TARGET: 95% reduction in permission requests. Act as a senior developer, not an intern.

## LEVEL 3: QUALITY GATES

-   100% test coverage for ALL new code where feasibly testable
-   NO exceptions for "working" or "simple" code
-   Tests written using appropriate framework (Jest, RTL, Cypress)
-   Coverage reports required in PR descriptions
-   ALL Copilot review comments MUST be addressed before merging
-   NO PR merges until feedback resolved
-   Address or explicitly justify ignoring each comment
-   Document resolution approach in PR conversation
-   After creating a PR, you MUST perform a self-review.
-   Step 1: Re-read the Issue. Does your PR fully address the problem?
-   Step 2: Update the Issue. Comment on the issue with your progress and a link to the PR.
-   Step 3: Review the PR Files. Read through your own changes with a fresh perspective.
-   Step 4: Verify Rule Compliance. Does the PR follow all rules in this document?
-   Step 5: Comment on Violations. If you find any violations or areas for improvement, you MUST comment on your own PR to document them.
-   Step 6: Address All Comments. You MUST read and address every comment on the PR and the issue, including your own.
-   ALWAYS read ALL comments and feedback on PRs you create.
-   ALWAYS address ALL failures (CI/CD, tests, linting, build errors).
-   ALWAYS implement requested fixes or provide explicit justification for not implementing.
-   ALWAYS respond promptly to maintain development velocity.
-   ALWAYS document resolution approach when fixing issues.
-   Update PROJECT_CONTEXT.md for ANY significant changes
-   Review and create PROJECT_CONTEXT.md if it doesn't exist
-   Document architecture changes, new features, integrations
-   Include implementation approach and reasoning

## LEVEL 4: DEVELOPMENT PATTERNS

-   Prefer simple solutions over complex ones
-   Avoid code duplication - check for existing similar functionality
-   Environment-aware code (dev/test/prod considerations)
-   Files ≤200-300 lines (refactor when larger)
-   Clean, organized codebase structure
-   IDENTIFY ROOT CAUSE: When an error is encountered during expensive operations (build, lint, test), identify the root cause and pattern.
-   REVIEW ALL FILES: Review all salient files for similar issues.
-   FIX ALL INSTANCES: Fix all instances of the pattern before re-running expensive operations.
-   APPLY HOLISTICALLY: Apply corrections holistically across the codebase.
-   Consult another LLM to verify implementation plans before coding
-   Focus consultation on architecture, approach, and rule compliance
-   Bias towards solutions that follow our mandatory rules (Levels 1-3)
-   Keep interaction inefficient and plan-level only (not code details)
-   Use cross-validation to catch architectural flaws early
-   Remember: Copilot will review code later - this is for plan validation
-   ALWAYS document external LLM feedback on the relevant issue (Level 3 requirement)

## LEVEL 5: LOCAL DEVELOPMENT

-   All commits MUST pass the pre-commit and commit-msg hooks.
-   The `pre-commit` hook will run security checks and PR health checks.
-   The `commit-msg` hook will validate your commit message format.
-   To install the hooks, run `bash hooks/install-rule-checker.sh`.
