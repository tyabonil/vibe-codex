# 🤖 LLM Usage Reference - Cursor Rules

**Purpose**: Token-optimized comprehensive reference for AI systems
**Target**: LLM consumption with maximum information density
**Version**: 1.0

---

## SYSTEM OVERVIEW

### Core Architecture
```
cursor_rules/
├── MANDATORY-RULES.md          # Primary rule specification
├── config/
│   ├── rules.json             # Rule engine configuration
│   ├── project-patterns.json  # Configurable workflow patterns
│   └── commit-msg.json        # Commit validation rules
├── hooks/                     # Git enforcement hooks
├── .github/workflows/         # GitHub Actions automation
├── review-bots/              # Automated PR analysis
├── .claude/                  # Claude Code integration
└── llm-specific/            # LLM-specific rule adaptations
```

### Rule Hierarchy
1. **Level 1 - Security**: Non-negotiable (secrets, environment files)
2. **Level 2 - Workflow**: Issue tracking, branching, PRs
3. **Level 3 - Quality**: Testing, review, coverage
4. **Level 4 - Patterns**: Best practices, optimization
5. **Level 5 - Local**: Hooks, development environment

---

## OPERATIONAL PROCEDURES

### Issue-Driven Development Flow
```
1. CREATE_ISSUE → 2. CREATE_BRANCH → 3. IMPLEMENT → 4. CREATE_PR → 5. MERGE → 6. CLEANUP
```

**Step 1: Issue Creation**
- Every code change MUST start with GitHub issue
- Use format: `gh issue create --title "Description" --body "Details"`
- Comment with detailed plan before starting work

**Step 2: Branch Creation**
- Format: `feature/issue-{number}-{description}`
- Base from project's main branch (check config/project-patterns.json)
- Command: `git checkout -b feature/issue-123-add-feature`

**Step 3: Implementation**
- Follow MANDATORY-RULES.md at all levels
- Make atomic commits with clear messages
- Format: `type(scope): description, resolves #123`

**Step 4: PR Management**
- Create PR immediately after first commit
- Target appropriate branch (main/preview - check project config)
- Address ALL automated check failures
- Update issue with PR link

**Step 5: Merge Process**
- Ensure all checks pass
- Merge when approved
- Delete feature branch immediately

**Step 6: Cleanup**
- Close issue with resolution summary
- Update project documentation if needed

### Error Handling Decision Tree
```
ERROR DETECTED
├── SECURITY_VIOLATION → IMMEDIATE_STOP → REMOVE_SECRETS → RETRY
├── WORKFLOW_VIOLATION → READ_RULES → FIX_VIOLATION → CONTINUE
├── SYSTEMIC_ERROR → USE_PR_CHECK_HANDLER → ANALYZE → PROCEED_OR_WAIT
└── CONFIGURATION_ERROR → CHECK_PROJECT_PATTERNS → ADJUST → CONTINUE
```

---

## CONFIGURATION REFERENCE

### Project-Specific Patterns (config/project-patterns.json)
**Check this file first for project-specific workflow settings**

**Available Rulesets**:
- `preview_workflow`: Uses preview branch for testing (enabled: true/false)
- `repository_specific`: Custom repository references (variables configurable)
- `platform_preferences`: Windows/WSL specific settings (enabled: true/false)
- `heartbeat_pattern`: Anti-stall workflow automation (enabled: true/false)
- `github_cli_workflow`: GitHub CLI optimizations (enabled: true/false)
- `copilot_integration`: GitHub Copilot specific features (enabled: true/false)

**Decision Logic**:
```javascript
if (project_patterns.preview_workflow.enabled) {
  base_branch = "preview";
  target_branch = "preview";
  main_promotion = "preview → main";
} else {
  base_branch = "main";
  target_branch = "main";
  main_promotion = "direct to main";
}
```

### Security Patterns (config/rules.json)
**Critical Patterns to Never Commit**:
- `api[_-]?key\s*[=:]\s*['"][A-Za-z0-9]{16,}['"]`
- `password\s*[=:]\s*['"](?!test|mock|fake|example|password|123)\w{8,}['"]`
- `token\s*[=:]\s*['"](?!test|mock|fake|example)\w+['"]`
- `secret\s*[=:]\s*['"](?!test|mock|fake|example|secret)\w{8,}['"]`
- `.env$` (environment files)

### Commit Message Validation
**Required Format**: `type(scope): description`
**Valid Types**: feat, fix, docs, style, refactor, perf, test, build, ci, chore, revert
**Length**: 10-100 characters
**Must Include**: Issue reference when applicable

---

## CLAUDE CODE INTEGRATION

### Context Management Commands
```bash
# Monitor context usage (run frequently)
./.claude/hooks/monitor-context.sh

# Update restart context when usage >75%
./.claude/hooks/update-restart-context.sh

# Analyze PR check failures
./.claude/hooks/pr-check-handler.sh [PR_NUMBER]

# Report cursor_rules issues
./.claude/hooks/report-issue.sh
```

### Session Workflow
1. **Session Start**: Read MANDATORY-RULES.md
2. **Project Check**: Review config/project-patterns.json
3. **Context Monitor**: Check usage periodically
4. **Error Analysis**: Use pr-check-handler for failed checks
5. **Issue Reporting**: Use report-issue for rule problems

---

## COMMAND REFERENCE

### Git Operations
```bash
# Issue Management
gh issue create --title "Title" --body "Description"
gh issue comment {number} --body "Update message"
gh issue close {number}

# Branch Management
git checkout -b feature/issue-{number}-{description}
git push -u origin feature/issue-{number}-{description}

# PR Management
gh pr create --title "Title" --body "Description"
gh pr merge {number} --merge --delete-branch

# Branch Cleanup
git branch -d feature/issue-{number}-{description}
```

### Rule Validation
```bash
# Manual rule check
npm run validate

# Security scan
./.claude/hooks/security-scan.sh

# PR health check
./.claude/hooks/pr-health-check.sh
```

---

## ERROR PATTERNS & SOLUTIONS

### Security Violations
**Pattern**: Secret detected in code
**Solution**: 
1. Remove hardcoded value
2. Add to environment variables
3. Use `process.env.VARIABLE_NAME`
4. Update .env.example with documented variable

### Workflow Violations
**Pattern**: Missing issue reference
**Solution**:
1. Create GitHub issue if none exists
2. Reference in commit: `resolves #123` or `fixes #123`
3. Update PR description with issue link

### Systemic Errors
**Pattern**: GitHub Actions timeout/network errors
**Solution**:
1. Run `./.claude/hooks/pr-check-handler.sh [PR_NUMBER]`
2. If systemic error confirmed, proceed with merge
3. If real violation, fix before proceeding

### Context Overrun
**Pattern**: Claude context usage >75%
**Solution**:
1. Run `./.claude/hooks/update-restart-context.sh`
2. Use generated RESTART_CONTEXT.md for session continuation
3. Preserve current work state and context

---

## INTEGRATION PATTERNS

### GitHub Actions Integration
**Check Status**: Look for green checkmarks on PRs
**Failed Checks**: Use pr-check-handler to analyze
**Systemic vs Violations**: Network/timeout = systemic, rule failures = violations

### Review Bot Integration
**Available Bots**: Balance Bot, Hater Bot, White Knight Bot
**Response Pattern**: Address all bot feedback or explicitly justify ignoring
**Integration**: Bots run automatically on PR creation

### IDE Integration
**Cursor IDE**: Native optimization for AI assistant workflows
**VS Code**: Conventional Commits extension recommended
**Git Hooks**: Automatic validation on commit

---

## DECISION MATRICES

### Branch Strategy Decision
```
IF project_patterns.preview_workflow.enabled:
  base_branch = "preview"
  pr_target = "preview"
  production_path = "preview → main"
ELSE:
  base_branch = "main"
  pr_target = "main"
  production_path = "direct to main"
```

### Error Response Decision
```
IF error_type == "SECURITY":
  action = "IMMEDIATE_STOP"
  fix = "REMOVE_SECRETS"
ELIF error_type == "SYSTEMIC":
  action = "ANALYZE_WITH_PR_HANDLER"
  fix = "PROCEED_IF_CONFIRMED_SYSTEMIC"
ELIF error_type == "WORKFLOW":
  action = "READ_MANDATORY_RULES"
  fix = "FOLLOW_SPECIFIED_PROCEDURE"
```

### Context Management Decision
```
IF context_usage >= 75%:
  action = "UPDATE_RESTART_CONTEXT"
  next_step = "PREPARE_SESSION_HANDOFF"
ELIF context_usage >= 50%:
  action = "MONITOR_MORE_FREQUENTLY"
  next_step = "CONTINUE_WITH_AWARENESS"
ELSE:
  action = "CONTINUE_NORMAL_OPERATION"
  next_step = "PERIODIC_MONITORING"
```

---

## OPTIMIZATION GUIDELINES

### Token Efficiency
- Prioritize MANDATORY-RULES.md as primary reference
- Use project-patterns.json for configuration decisions
- Reference component READMEs only when needed
- Minimize external documentation reading

### Performance Patterns
- Use `gh` CLI over web interface when possible
- Batch git operations when appropriate
- Run security scans before complex operations
- Use parallel operations for independent tasks

### Error Prevention
- Always check project configuration before assuming workflow
- Validate branch strategy from project-patterns.json
- Use .claude/ tools for session management
- Monitor context usage proactively

---

## QUICK REFERENCE

### Essential Files Priority
1. **MANDATORY-RULES.md** - Primary rule specification
2. **config/project-patterns.json** - Project-specific workflow configuration
3. **USAGE-GUIDE.md** - Human-readable comprehensive guide
4. **PROJECT_CONTEXT.md** - Repository architecture and decisions

### Critical Commands
```bash
# Check project workflow configuration
cat config/project-patterns.json

# Monitor Claude context
./.claude/hooks/monitor-context.sh

# Create issue-driven branch
gh issue create --title "Task" --body "Description"
git checkout -b feature/issue-{number}-{description}

# Standard commit with issue reference
git commit -m "feat: implement feature, resolves #{number}"
```

### Emergency Procedures
**Blocked by systemic error**: Use `./.claude/hooks/pr-check-handler.sh`
**Context overflow**: Use `./.claude/hooks/update-restart-context.sh`
**Rule uncertainty**: Reference MANDATORY-RULES.md decision trees
**Configuration unclear**: Check config/project-patterns.json

---

**Last Updated**: 2025-07-05
**Version**: 1.0
**Target**: LLM consumption with maximum operational efficiency