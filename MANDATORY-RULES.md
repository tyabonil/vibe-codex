# 🚨 MANDATORY RULES - ALWAYS FOLLOW THESE

## ⚡ LEVEL 1: SECURITY & SAFETY (NON-NEGOTIABLE)

### 🔐 **NEVER COMMIT SECRETS**
```markdown
# SECURITY RULES (LEVEL 1 - NON-NEGOTIABLE)
- ❌ NEVER commit .env files, API keys, passwords, tokens, or credentials
- ❌ NEVER hardcode secrets in source code
- ✅ ALWAYS use environment variables for sensitive data
- ✅ ALWAYS create .env.example with documented variables
- 🚨 VIOLATION = IMMEDIATE STOP - Do not proceed until fixed
```

### 🔒 **NEVER OVERWRITE ENVIRONMENT FILES**
```markdown  
# ENVIRONMENT PROTECTION (LEVEL 1 - NON-NEGOTIABLE)
- ❌ NEVER overwrite .env files
- ❌ NEVER modify existing environment configurations without explicit permission
- ✅ ALWAYS create .env.example for documentation
- 🚨 VIOLATION = IMMEDIATE STOP - Ask user before proceeding
```

---

## ⚡ LEVEL 2: WORKFLOW INTEGRITY (MANDATORY)

### 🐙 **ALWAYS USE MCP GITHUB API TOOLS FOR REMOTE OPERATIONS**
```markdown
# GITHUB API RULES (LEVEL 2 - MANDATORY)
- ✅ ALWAYS use mcp_github_* tools for ALL remote operations (GitHub API interactions)
- ✅ Use mcp_github_create_branch instead of git checkout -b (remote branch creation)
- ✅ Use mcp_github_push_files instead of git push (remote updates)
- ✅ Use mcp_github_create_pull_request for all PRs (remote PR creation)
- ✅ Use mcp_github_get_file_contents for remote file access
- ✅ Use terminal git commands ONLY for local operations (checkout, status, local pulls)
- ❌ NEVER use terminal for remote operations (push, remote branch creation, PR creation)
- 🚨 FAILURE = Remote operations via terminal cause workflow failures
```

### 🔍 **MANDATORY GITHUB WORKFLOW VALIDATION**
```markdown
# GITHUB WORKFLOW VALIDATION (LEVEL 2 - MANDATORY)
**BEFORE every git action:**
- [ ] Review MANDATORY-RULES.md GitHub workflow section
- [ ] Validate issue exists for this work
- [ ] Confirm using correct branch (never main/master directly)
- [ ] Verify using appropriate MCP GitHub API tools
- [ ] Check: Is this the right workflow step (Issue → Branch → PR → Merge)?

**AFTER every git action:**
- [ ] Verify no workflow violations occurred
- [ ] Confirm proper Issue → Branch → PR → Merge sequence followed
- [ ] Check: Did I use correct MCP API tools vs terminal commands?
- [ ] Document any violations immediately for learning
- [ ] Update memory with lessons learned if violations found

- 🚨 VIOLATION = Complete workflow integrity failure - document and prevent recurrence
```

### 🐧 **ALWAYS PREFER LINUX/POSIX TERMINALS**
```markdown
# TERMINAL PREFERENCE RULES (LEVEL 2 - MANDATORY)
- ✅ ALWAYS prefer Linux/POSIX terminals (bash, zsh, WSL Ubuntu) over PowerShell
- ✅ Use WSL Ubuntu when available on Windows systems
- ✅ Append | cat to commands that might use pagers (git log, git diff)
- ✅ Use non-interactive flags: --yes, --quiet, --no-pager
- ❌ AVOID PowerShell for development commands (hanging issues, PSReadLine errors)
- 🚨 FAILURE = PowerShell hanging, terminal automation failures
```

### 🚧 **IMMEDIATELY ASSIGN BLOCKED ISSUES**
```markdown
# BLOCKED ISSUE ASSIGNMENT (LEVEL 2 - MANDATORY)
- 🚨 IMMEDIATELY assign blocked issues to repository owner
- 🔍 DETECT blocking keywords: "BLOCKED", "depends on", "requires access"
- ❌ NEVER attempt infrastructure, DevOps, or human-authorization work
- ✅ ALWAYS identify 2-3 alternative non-blocked issues
- 🚨 VIOLATION = Wasted time on impossible tasks
```

### 📝 **CREATE ISSUES FOR ALL WORK**
```markdown
# ISSUE TRACKING (LEVEL 2 - MANDATORY)
- ✅ EVERY code change must reference an issue
- ✅ Create issues ≤7 days estimated completion
- ✅ Break large issues into smaller, buildable increments
- ✅ Use P0-BLOCKER → P0-CRITICAL → P1-HIGH → P2-MEDIUM → P3-LOW prioritization
- 🚨 VIOLATION = Work without proper tracking
```

### 🔄 **POST-MERGE WORKFLOW ACTIONS** 
```markdown
# POST-MERGE MANDATORY ACTIONS (LEVEL 2 - MANDATORY)
- ✅ ALWAYS recheck related issues after successful PR merge to preview
- ✅ ALWAYS comment on issues with completion status and close if fully resolved
- ✅ ALWAYS ensure local main and preview branches are 100% aligned with remote
- ✅ ALWAYS use MCP GitHub API for remote operations:
  - Use mcp_github_get_file_contents to verify remote branch states
  - Use mcp_github_list_commits to check synchronization status
- ✅ ALWAYS use terminal for local operations:
  - git checkout main (local branch switch)
  - git checkout preview (local branch switch)
  - git status (verify clean working directory)
  - git pull origin main (local sync from remote)
  - git pull origin preview (local sync from remote)
- ❌ NEVER proceed to next work without branch synchronization
- 🚨 VIOLATION = Branch drift, merge conflicts, and workflow failures
```

---

## ⚡ LEVEL 3: QUALITY GATES (MANDATORY)

### 🧪 **100% TEST COVERAGE REQUIRED**
```markdown
# TEST COVERAGE (LEVEL 3 - MANDATORY)
- ✅ 100% test coverage for ALL new code where feasibly testable
- ✅ NO exceptions for "working" or "simple" code
- ✅ Tests written using appropriate framework (Jest, RTL, Cypress)
- ✅ Coverage reports required in PR descriptions
- 🚨 VIOLATION = No merge until coverage achieved
```

### 👁️ **ALWAYS REQUEST COPILOT REVIEW**
```markdown
# COPILOT REVIEW REQUEST (LEVEL 3 - MANDATORY)
- ✅ ALWAYS request Copilot review for every PR using mcp_github_request_copilot_review
- ✅ Request review IMMEDIATELY after PR creation, before any merging
- ✅ NO exceptions - every code change must get Copilot review
- 🚨 VIOLATION = PR created without Copilot review request
```

### 👁️ **ALL COPILOT FEEDBACK MUST BE ADDRESSED**
```markdown
# COPILOT REVIEW RESPONSE (LEVEL 3 - MANDATORY)
- ✅ ALL Copilot review comments MUST be addressed before merging
- ✅ NO PR merges until feedback resolved
- ✅ Address or explicitly justify ignoring each comment
- ✅ Document resolution approach in PR conversation
- 🚨 VIOLATION = No merge until all feedback addressed
```

### 📊 **ALWAYS UPDATE PROJECT_CONTEXT.md**
```markdown
# DOCUMENTATION (LEVEL 3 - MANDATORY)
- ✅ Update PROJECT_CONTEXT.md for ANY significant changes
- ✅ Review and create PROJECT_CONTEXT.md if it doesn't exist
- ✅ Document architecture changes, new features, integrations
- ✅ Include implementation approach and reasoning
- 🚨 VIOLATION = Poor project visibility and context loss
```

---

## ⚡ LEVEL 4: DEVELOPMENT PATTERNS (STRONGLY RECOMMENDED)

### 🏗️ **CODING STANDARDS**
```markdown  
# CODE QUALITY (LEVEL 4 - STRONGLY RECOMMENDED)
- ✅ Prefer simple solutions over complex ones
- ✅ Avoid code duplication - check for existing similar functionality
- ✅ Environment-aware code (dev/test/prod considerations)
- ✅ Files ≤200-300 lines (refactor when larger)
- ✅ Clean, organized codebase structure
```

### 🌿 **BRANCH MANAGEMENT**
```markdown
# BRANCH WORKFLOW (LEVEL 4 - STRONGLY RECOMMENDED)  
- ✅ Never merge into main/master - use preview branch
- ✅ Create branch referencing issue: feature/issue-{number}-{description}
- ✅ Clean branch transitions with proper file management
- ✅ Document transitions in PROJECT_CONTEXT.md
```

### 🤝 **LLM PLAN VERIFICATION**
```markdown
# CROSS-LLM VALIDATION (LEVEL 4 - STRONGLY RECOMMENDED)
- ✅ Consult another LLM to verify implementation plans before coding
- ✅ Focus consultation on architecture, approach, and rule compliance
- ✅ Bias towards solutions that follow our mandatory rules (Levels 1-3)
- ✅ Keep interaction inefficient and plan-level only (not code details)
- ✅ Use cross-validation to catch architectural flaws early
- ✅ Remember: Copilot will review code later - this is for plan validation
- 📝 RECOMMENDED for complex implementations and architectural decisions
```

---

## 🚀 ENFORCEMENT CHECKLIST

### **Before Every Action:**
- [ ] Will this commit secrets? (LEVEL 1 - STOP if yes)
- [ ] Will this overwrite environment files? (LEVEL 1 - ASK if yes)
- [ ] Should I use MCP GitHub API instead of terminal git? (LEVEL 2 - YES)
- [ ] **Have I reviewed GitHub workflow rules?** (LEVEL 2 - REVIEW first)
- [ ] **Is there an issue for this work?** (LEVEL 2 - CREATE if no)
- [ ] **Am I using the correct branch (not main)?** (LEVEL 2 - VERIFY)
- [ ] Is this work blocked and should be assigned? (LEVEL 2 - ASSIGN if yes)

### **After Every Git Action:**
- [ ] **Did I follow the proper Issue → Branch → PR → Merge workflow?** (LEVEL 2 - VERIFY)
- [ ] **Did I use correct MCP tools vs terminal commands?** (LEVEL 2 - VERIFY)
- [ ] **Any violations occurred that need documenting?** (LEVEL 2 - DOCUMENT)

### **Before Every Merge:**
- [ ] Is test coverage 100% for new code? (LEVEL 3 - BLOCK if no)
- [ ] Was Copilot review requested for this PR? (LEVEL 3 - REQUEST if no)
- [ ] Is all Copilot feedback addressed? (LEVEL 3 - BLOCK if no)  
- [ ] Is PROJECT_CONTEXT.md updated? (LEVEL 3 - UPDATE if no)

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

---

## 📋 EMERGENCY OVERRIDE PROTOCOL

**ONLY for production-down emergencies:**
1. ✅ Explicit project owner approval required
2. ✅ Technical debt issues MUST be created immediately  
3. ✅ Quality fixes scheduled within 24 hours
4. ✅ Override reason documented in commit message

**NO OVERRIDES ALLOWED for Level 1 (Security) rules - EVER**

---

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

---

*This hierarchy ensures that the most critical rules are impossible to miss and violations are immediately apparent.*