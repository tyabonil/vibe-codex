# LLM-OPTIMIZED RULES (TOKENIZED)

# 🚨 MANDATORY RULES - ALWAYS FOLLOW THESE
## LEVEL 1: SECURITY & SAFETY (NON-NEGOTIABLE)
### 🔐 **NEVER COMMIT SECRETS**
# SECURITY RULES (LEVEL 1 - NON-NEGOTIABLE)
- ❌ NEVER commit .env files, API keys, passwords, tokens, or credentials
- ❌ NEVER hardcode secrets in source code
- ✅ ALWAYS use environment variables for sensitive data
- ✅ ALWAYS create .env.example with documented variables
- 🚨 VIOLATION = IMMEDIATE STOP - Do not proceed until fixed
### 🔒 **NEVER OVERWRITE ENVIRONMENT FILES**
# ENVIRONMENT PROTECTION (LEVEL 1 - NON-NEGOTIABLE)
- ❌ NEVER overwrite .env files
- ❌ NEVER modify existing environment configurations without explicit permission
- ✅ ALWAYS create .env.example for documentation
- 🚨 VIOLATION = IMMEDIATE STOP - Ask user before proceeding
- --
## LEVEL 2: WORKFLOW INTEGRITY (MANDATORY)
### SEQ-1: CREATE OR IDENTIFY AN ISSUE
# STEP 1: ISSUE (MANDATORY)
- ✅ EVERY code change must start with a GitHub issue.
- ✅ If an issue doesn't exist, CREATE ONE.
- ✅ Issues must be small enough to be completed in ≤7 days.
- ✅ Use P0-BLOCKER → P0-CRITICAL → P1-HIGH → P2-MEDIUM → P3-LOW prioritization.
- 🚨 VIOLATION = Work without a tracked issue.
### SEQ-2: CREATE A BRANCH
# STEP 2: BRANCH (MANDATORY)
- ✅ Create a branch from the `preview` branch.
- ✅ Branch name must reference the issue: `feature/issue-{number}-{description}`.
- ✅ Example: `feature/issue-123-add-login-page`.
- 🚨 VIOLATION = Incorrect branch name or branching from `main`.
### SEQ-3: IMPLEMENT AND COMMIT
# STEP 3: COMMIT (MANDATORY)
- ✅ Make small, atomic commits.
- ✅ Commit messages must be clear and descriptive.
- ✅ Reference the issue in your commit messages (e.g., `feat: add login form, resolves #123`).
- 🚨 VIOLATION = Vague or unrelated commits.
### SEQ-4: CREATE A PULL REQUEST
# STEP 4: PULL REQUEST (MANDATORY)
- ✅ Create a Pull Request (PR) as soon as you have made your first commit.
- ✅ The PR title must reference the issue number.
- ✅ The PR body must describe the changes and reference the issue.
- ✅ The PR should target the `preview` branch, NOT `main`.
- 🚨 VIOLATION = Late or incorrectly targeted PRs.
### SEQ-5: ADDRESS FEEDBACK AND MERGE
# STEP 5: REVIEW & MERGE (MANDATORY)
- ✅ Request a review from `@copilot` immediately after creating the PR.
- ✅ Address ALL feedback from reviewers and automated checks.
- ✅ Once approved, merge the PR into the `preview` branch.
- 🚨 VIOLATION = Merging with unaddressed feedback.
### SEQ-6: CLEAN UP
# STEP 6: CLEANUP (MANDATORY)
- ✅ After merging, close the issue if it's fully resolved.
- ✅ Comment on the issue with the resolution and PR link.
- ✅ Delete the feature branch after the PR is merged.
- 🚨 VIOLATION = Leaving stale branches or open issues.
### 🔬 **MANDATORY LLM TOKEN EFFICIENCY OPTIMIZATION**
# LLM TOKEN EFFICIENCY (LEVEL 2 - MANDATORY)
- 🔍 BEFORE creating new rules: Analyze ALL existing files for redundancy
- ❌ NEVER maintain multiple files with duplicate content (>25% overlap)
- ❌ NEVER keep human-oriented summaries/meta-content in LLM-consumed files
- ❌ NEVER include historical/process content that adds no actionable value
- ✅ ALWAYS consolidate redundant content into single authoritative files
- ✅ ALWAYS prioritize token efficiency: 1 comprehensive file > 5 partial files
- ✅ ALWAYS delete legacy files completely superseded by newer comprehensive versions
- ✅ ALWAYS maintain minimal README for human repository usage guidance only
- 📊 TARGET: <40KB total repository size for optimal LLM consumption
- 🚨 VIOLATION = Token waste, increased costs, slower LLM processing
### 🏗️‍♂️ **GIT REMOTE OPERATIONS HIERARCHY**
# GIT REMOTE OPERATIONS (LEVEL 2 - MANDATORY)
- ✅ Use the following hierarchy to interact with git remotes. Try them in order, and if one fails, try the next.
**1. Local `gh` CLI (Preferred)**
- **Check for:** `gh --version`
- **Use for:** `gh pr create`, `gh issue create`, etc.
- **Benefit:** Fast, local, and integrates well with scripts.
**2. MCP Tools**
- **Check for:** Availability of `mcp_github_*` tools.
- **Use for:** `mcp_github_create_pull_request`, `mcp_github_create_issue`, etc.
- **Benefit:** Robust, reliable, and good for complex operations.
**3. Command-line `git` with SSH**
- **Check for:** `git remote -v` shows `git@github.com:...`
- **Use for:** `git push`, `git pull`, etc.
- **Benefit:** Secure and widely used.
**4. Command-line `git` with HTTPS**
- **Check for:** `git remote -v` shows `https://github.com/...`
- **Use for:** `git push`, `git pull`, etc.
- **Benefit:** Works everywhere, but may require authentication.
### 🖥️‍♂️ **ALWAYS PREFER LINUX/POSIX TERMINALS**
# TERMINAL PREFERENCE RULES (LEVEL 2 - MANDATORY)
- ✅ ALWAYS prefer Linux/POSIX terminals (bash, zsh, WSL Ubuntu) over PowerShell
- ✅ Use WSL Ubuntu when available on Windows systems
- ✅ Append | cat to commands that might use pagers (git log, git diff)
- ✅ Use non-interactive flags: --yes, --quiet, --no-pager
- ❌ AVOID PowerShell for development commands (hanging issues, PSReadLine errors)
- 🚨 FAILURE = PowerShell hanging, terminal automation failures
### 🚨 **IMMEDIATELY ASSIGN BLOCKED ISSUES**
# BLOCKED ISSUE ASSIGNMENT (LEVEL 2 - MANDATORY)
- 🚨 IMMEDIATELY assign blocked issues to repository owner
- 🔍 DETECT blocking keywords: "BLOCKED", "depends on", "requires access"
- ❌ NEVER attempt infrastructure, DevOps, or human-authorization work
- ✅ ALWAYS identify 2-3 alternative non-blocked issues
- 🚨 VIOLATION = Wasted time on impossible tasks
### 🤖 **LLM RULE IMPROVEMENT PROCESS**
# LLM RULE IMPROVEMENT (LEVEL 2 - MANDATORY)
- ✅ If you encounter a rule that is unclear, contradictory, or difficult to follow, you MUST suggest an improvement.
- ✅ To do so, open an issue in the `tyabonil/cursor_rules` repository.
- ✅ The issue should clearly describe the problem and suggest a specific change to the rules.
- ✅ This is a mandatory part of the workflow to ensure the rules are always improving.
### 🚀 **MOVE ON TO THE NEXT ISSUE**
# MOVE ON (LEVEL 2 - MANDATORY)
- ✅ While waiting for a PR review or other blocker, you MUST move on to the next available issue.
- ✅ Before starting the new issue, ensure your `preview` branch is up-to-date with the remote.
- ✅ Create a new feature branch from the `preview` branch for the new issue.
- ✅ **Conflict Resolution Strategy:** When your previous PR is approved and merged, you MUST immediately update your current feature branch by rebasing it on the updated `preview` branch (`git rebase origin/preview`). This will prevent merge conflicts.
<<<<<<< HEAD
### 🚨 **PR REMEDIATION PROTOCOL**
# PR REMEDIATION (LEVEL 2 - MANDATORY)
- ✅ If a PR has violations, you MUST address them in the same PR.
- ✅ **Step 1: Read the violations.** Understand what needs to be fixed.
- ✅ **Step 2: Fix the violations.** Make the necessary code changes.
- ✅ **Step 3: Commit the fixes.** Use a clear commit message (e.g., `fix: Address PR violations`).
- ✅ **Step 4: Push the changes.** Push the new commit to the same feature branch.
- ✅ **Step 5: Re-request review.** Comment on the PR to notify reviewers that the violations have been addressed.
- ❌ **DO NOT** close a PR with violations unless you are starting over.
- ❌ **DO NOT** open a new PR for the same issue without closing the old one.
=======
### 🚀 **MOVE ON TO THE NEXT ISSUE**
# MOVE ON (LEVEL 2 - MANDATORY)
- ✅ While waiting for a PR review or other blocker, you MUST move on to the next available issue.
- ✅ Before starting the new issue, ensure your `preview` branch is up-to-date with the remote.
- ✅ Create a new feature branch from the `preview` branch for the new issue.
- ✅ **Conflict Resolution Strategy:** When your previous PR is approved and merged, you MUST immediately update your current feature branch by rebasing it on the updated `preview` branch (`git rebase origin/preview`). This will prevent merge conflicts.
>>>>>>> 8a3b7cf (feat: Refine secret scanner and add 'Move On' rule)
- --
## LEVEL 3: QUALITY GATES (MANDATORY)
### 🧪 **100% TEST COVERAGE REQUIRED**
# TEST COVERAGE (LEVEL 3 - MANDATORY)
- ✅ 100% test coverage for ALL new code where feasibly testable
- ✅ NO exceptions for "working" or "simple" code
- ✅ Tests written using appropriate framework (Jest, RTL, Cypress)
- ✅ Coverage reports required in PR descriptions
- 🚨 VIOLATION = No merge until coverage achieved
### 👨‍💻‍👨‍💻 **ALL COPILOT FEEDBACK MUST BE ADDRESSED**
# COPILOT REVIEW RESPONSE (LEVEL 3 - MANDATORY)
- ✅ ALL Copilot review comments MUST be addressed before merging
- ✅ NO PR merges until feedback resolved
- ✅ Address or explicitly justify ignoring each comment
- ✅ Document resolution approach in PR conversation
- 🚨 VIOLATION = No merge until all feedback addressed
### 🤖 **MANDATORY LLM SELF-REVIEW**
# LLM SELF-REVIEW (LEVEL 3 - MANDATORY)
- ✅ After creating a PR, you MUST perform a self-review.
- ✅ **Step 1: Re-read the Issue.** Does your PR fully address the problem?
- ✅ **Step 2: Update the Issue.** Comment on the issue with your progress and a link to the PR.
- ✅ **Step 3: Review the PR Files.** Read through your own changes with a fresh perspective.
- ✅ **Step 4: Verify Rule Compliance.** Does the PR follow all rules in this document?
- ✅ **Step 5: Comment on Violations.** If you find any violations or areas for improvement, you MUST comment on your own PR to document them.
- ✅ **Step 6: Address All Comments.** You MUST read and address every comment on the PR and the issue, including your own.
- 🚨 VIOLATION = Skipping the self-review process.
### 💬 **MANDATORY PR FEEDBACK RESPONSE - READ AND ADDRESS ALL COMMENTS**
# PR FEEDBACK RESPONSE (LEVEL 3 - MANDATORY)
- ✅ ALWAYS read ALL comments and feedback on PRs you create.
- ✅ ALWAYS address ALL failures (CI/CD, tests, linting, build errors).
- ✅ ALWAYS implement requested fixes or provide explicit justification for not implementing.
- ✅ ALWAYS respond promptly to maintain development velocity.
- ✅ ALWAYS document resolution approach when fixing issues.
**COMPREHENSIVE SCOPE - Address ALL of:**
  - ✅ Human reviewer comments and suggestions.
  - ✅ Automated feedback (linters, formatters, security scans, code quality tools).
  - ✅ CI/CD pipeline failures and build errors.
  - ✅ Test failures and coverage issues.
  - ✅ Security vulnerability alerts and performance warnings.
  - ✅ Copilot review comments (extends existing Level 3 rule).
  - ✅ Any bot or automated tool feedback.
  - ✅ Documentation generation issues and deployment failures.
**RESPONSE STANDARDS:**
- ✅ Fix and update PR for all addressable technical issues.
- ✅ Provide clear justification if not implementing a suggestion (with reasoning).
- ✅ Document approach taken to resolve complex issues in PR conversation.
- ✅ Maintain responsive communication to show engagement and professionalism.
- ✅ Update PR description if scope or approach changes based on feedback.
**COLLABORATION REQUIREMENTS:**
- ✅ Acknowledge receipt of feedback promptly.
- ✅ Show respect for reviewer time and expertise.
- ✅ Ask clarifying questions if feedback is unclear.
- ✅ Thank reviewers for their contributions.
- 🚨 VIOLATION = No merge until all feedback addressed
### 💭 **MANDATORY ISSUE THOUGHT PROCESS DOCUMENTATION**
# ISSUE DOCUMENTATION & TRANSPARENCY (LEVEL 3 - MANDATORY)
- ✅ ALWAYS document thought processes as comments while working through issues
- ✅ ALWAYS capture external LLM feedback from consultations on the relevant issue
- ✅ ALWAYS explain reasoning, approaches, and validation steps transparently
- ✅ ALWAYS preserve insights and decision points for future reference
**REQUIRED to capture:**
- ✅ External LLM consultations (ChatGPT, Claude, Gemini, etc.) and their insights
- ✅ Cross-LLM plan validation feedback (enhances Level 4 rule)
- ✅ Decision points, approach changes, and reasoning behind choices
- ✅ Learning insights and validation steps taken
**NOT required (already captured elsewhere):**
- ❌ Copilot PR comments (already in PR conversation)
- ❌ Standard workflow step documentation
**Example format:**
## 💭 **Thought Process Documentation**
### **Analysis:** [your reasoning]
### **External LLM Consultation:** [if applicable]
### **Decision:** [approach chosen and why]
### **Implementation Notes:** [key insights]
- 🎯 PURPOSE: Transparency, learning capture, decision traceability
- 🚨 VIOLATION = Opaque decision-making, lost learning opportunities
### 📚 **ALWAYS UPDATE PROJECT_CONTEXT.md**
# DOCUMENTATION (LEVEL 3 - MANDATORY)
- ✅ Update PROJECT_CONTEXT.md for ANY significant changes
- ✅ Review and create PROJECT_CONTEXT.md if it doesn't exist
- ✅ Document architecture changes, new features, integrations
- ✅ Include implementation approach and reasoning
- 🚨 VIOLATION = Poor project visibility and context loss
- --
## LEVEL 4: DEVELOPMENT PATTERNS (STRONGLY RECOMMENDED)
### 👨‍💻‍🤝‍💻 **CODING STANDARDS**
# CODE QUALITY (LEVEL 4 - STRONGLY RECOMMENDED)
- ✅ Prefer simple solutions over complex ones
- ✅ Avoid code duplication - check for existing similar functionality
- ✅ Environment-aware code (dev/test/prod considerations)
- ✅ Files ≤200-300 lines (refactor when larger)
- ✅ Clean, organized codebase structure
### 🤝 **LLM PLAN VERIFICATION**
# CROSS-LLM VALIDATION (LEVEL 4 - STRONGLY RECOMMENDED)
- ✅ Consult another LLM to verify implementation plans before coding
- ✅ Focus consultation on architecture, approach, and rule compliance
- ✅ Bias towards solutions that follow our mandatory rules (Levels 1-3)
- ✅ Keep interaction inefficient and plan-level only (not code details)
- ✅ Use cross-validation to catch architectural flaws early
- ✅ Remember: Copilot will review code later - this is for plan validation
- ✅ ALWAYS document external LLM feedback on the relevant issue (Level 3 requirement)
- 📝 RECOMMENDED for complex implementations and architectural decisions
- --
## 🚨 ENFORCEMENT CHECKLIST
### **Before Every Action:**
- [ ] Will this commit secrets? (LEVEL 1 - STOP if yes)
- [ ] Will this overwrite environment files? (LEVEL 1 - ASK if yes)
- [ ] Am I following the SEQUENTIAL GITHUB WORKFLOW? (LEVEL 2 - FOLLOW STEPS)
- [ ] Is this work blocked and should be assigned? (LEVEL 2 - ASSIGN if yes)
### **During Issue Work:**
- [ ] **Am I documenting my thought process on the issue?** (LEVEL 3 - DOCUMENT)
- [ ] **Any external LLM consultations to capture?** (LEVEL 3 - DOCUMENT)
### **After Creating Every PR:**
- [ ] **Are ALL comments and feedback on PRs being read?** (LEVEL 3 - READ ALL)
- [ ] **Are ALL failures being addressed?** (LEVEL 3 - FIX ALL)
- [ ] **Are ALL requested fixes being implemented or justified?** (LEVEL 3 - IMPLEMENT)
- [ ] **Am I responding promptly to feedback?** (LEVEL 3 - RESPOND FAST)
- [ ] **Am I documenting resolution approaches?** (LEVEL 3 - DOCUMENT)
### **When PR Receives Feedback:**
- [ ] **Have I read ALL comments (human reviewers, bots, automated feedback)?** (LEVEL 3 - READ ALL)
- [ ] **Have I addressed ALL failures (CI/CD, tests, linting, build errors)?** (LEVEL 3 - FIX ALL)
- [ ] **Have I implemented fixes or provided justification for each suggestion?** (LEVEL 3 - IMPLEMENT/JUSTIFY)
- [ ] **Have I maintained responsive communication?** (LEVEL 3 - COMMUNICATE)
- [ ] **Have I updated PR description if scope changed?** (LEVEL 3 - UPDATE)
### **Before Every Merge:**
- [ ] Is test coverage 100% for new code? (LEVEL 3 - BLOCK if no)
- [ ] Is all Copilot feedback addressed? (LEVEL 3 - BLOCK if no)
- [ ] Is PROJECT_CONTEXT.md updated? (LEVEL 3 - UPDATE if no)
- [ ] **Are thought processes documented on the issue?** (LEVEL 3 - DOCUMENT)
- [ ] **Is ALL PR feedback addressed comprehensively?** (LEVEL 3 - VERIFY)
### **After Every Successful Merge:**
- [ ] Are related issues updated with completion status? (LEVEL 2 - COMMENT/CLOSE)
- [ ] Are local main and preview branches synchronized with remote? (LEVEL 2 - SYNC)
- [ ] Is working directory clean after synchronization? (LEVEL 2 - VERIFY)
### **Success Indicators:**
- ✅ 0 security incidents (Level 1 compliance)
- ✅ 0 workflow failures (Level 2 compliance)
- ✅ 100% quality gate passage (Level 3 compliance)
- ✅ Clean, maintainable codebase (Level 4 compliance)
- ✅ 100% branch synchronization after merges (Level 2 compliance)
- ✅ **Zero GitHub workflow violations** (Level 2 compliance)
- ✅ **Complete thought process transparency** (Level 3 compliance)
- ✅ **100% feedback responsiveness** (Level 3 compliance)
- --
## 🚑 EMERGENCY OVERRIDE PROTOCOL
**ONLY for production-down emergencies:**
1. ✅ Explicit project owner approval required
2. ✅ Technical debt issues MUST be created immediately  
3. ✅ Quality fixes scheduled within 24 hours
4. ✅ Override reason documented in commit message
**NO OVERRIDES ALLOWED for Level 1 (Security) rules - EVER**
- --
## 📚 ATTRIBUTIONS & ACKNOWLEDGMENTS
These rules were developed through research of established coding practices and industry standards. While our specific implementation and hierarchy are original, we acknowledge the foundational work that influenced our approach:
### **Core Software Engineering Principles**
- **Robert C. Martin (Uncle Bob)** - Clean Code principles, SOLID design patterns, TDD practices
  - Source: "Clean Code: A Handbook of Agile Software Craftsmanship"
  - Influence: Clean coding standards, testing approaches, software design principles
- **Kent Beck** - Simple Design rules, Test-Driven Development methodology
  - Source: "Extreme Programming Explained", "Test Driven Development: By Example"
  - Influence: Simple design principles, TDD Three Laws concept
### **Security Standards & Practices**
- **OWASP (Open Web Application Security Project)** - Web application security guidelines
  - Source: OWASP Top 10, OWASP Security Practices
  - Influence: Security vulnerability patterns, input validation practices
### **AI-First Development Research**
Research conducted on established AI development repositories (used for inspiration, not direct copying):
- **PatrickJS/awesome-cursorrules** (28.6k⭐) - Comprehensive Cursor-specific patterns
- **Kristories/awesome-guidelines** (10.1k⭐) - Industry coding standards compilation
- **JuanCrg90/Clean-Code-Notes** (6k⭐) - Clean Code principles documentation
- **grapeot/devin.cursorrules** (5.7k⭐) - AI-first development patterns
- **kinopeee/cursorrules** (790⭐) - Agent autonomy and loop prevention patterns
### **Testing Methodologies**
- **F.I.R.S.T Principles** - Fast, Independent, Repeatable, Self-Validating, Timely
  - Source: Established testing community practices
  - Influence: Test quality standards and approaches
### **Workflow & Process Patterns**
- **GitHub Flow** - Branch-based development workflow
- **GitLab Flow** - Issue tracking and branch management patterns
- **Agile/Scrum Practices** - Issue prioritization (P0-P3), sprint planning concepts
### **Disclaimer**
All rules in this document represent our own synthesis, adaptation, and original implementation of these established principles. No content was copied verbatim from any source. These attributions acknowledge the intellectual foundations that informed our rule development process.
- --
*This hierarchy ensures that the most critical rules are impossible to miss and violations are immediately apparent.*
