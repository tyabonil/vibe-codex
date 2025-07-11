# Advanced Workflow Integrity Rules

## RULE-WFL-001: Issue-Driven Development

**Category**: Workflow  
**Complexity**: Advanced  
**Default**: Disabled  

### Description
Enforces that every code change starts with a GitHub issue, ensuring traceability and planning.

### Requirements
1. **Issue First**: Create issue before any code changes
2. **Issue Sizing**: Issues must be completable in ≤7 days
3. **Priority Labels**: Use P0-BLOCKER → P0-CRITICAL → P1-HIGH → P2-MEDIUM → P3-LOW
4. **Single Source**: GitHub issues are the source of truth

### Workflow
1. Create/find issue
2. Comment implementation plan on issue
3. Create branch: `feature/issue-{number}-{description}`
4. Make commits referencing issue
5. Create PR linking to issue
6. Update issue with PR link
7. Close issue only after PR merged

### Configuration
```json
{
  "id": "wfl-001",
  "enforce_issue_first": true,
  "max_issue_days": 7,
  "require_priority_label": true,
  "branch_pattern": "^(feature|fix|chore)/issue-\\d+-.*$"
}
```

---

## RULE-WFL-002: PR Workflow Enforcement

**Category**: Workflow  
**Complexity**: Advanced  
**Default**: Disabled  

### Description
Comprehensive PR workflow to maintain code quality and team collaboration.

### Requirements
1. **Early PR**: Create PR after first commit
2. **PR Title**: Must reference issue number
3. **PR Body**: Describe changes and reference issue
4. **Target Branch**: Follow project branching strategy
5. **Review Request**: Request review immediately
6. **Address Feedback**: Respond to all comments
7. **Update Issue**: Comment on issue when PR is ready/blocked/merged

### Pre-PR Checklist
- Review ALL open PRs first
- Close stale PRs (>7 days)
- Document status of relevant PRs

### Configuration
```json
{
  "id": "wfl-002",
  "require_issue_ref": true,
  "auto_request_review": ["@copilot"],
  "stale_pr_days": 7,
  "target_branch_rules": {
    "feature/*": "preview",
    "fix/*": "main",
    "hotfix/*": "main"
  }
}
```

---

## RULE-WFL-003: Anti-Stall Patterns

**Category**: Workflow  
**Complexity**: Advanced  
**Default**: Disabled  

### Description
Prevents development stalls and ensures continuous progress.

### Patterns Enforced
1. **Maximum Think Time**: 15 minutes max for any decision
2. **Implementation First**: Prototype before perfect planning
3. **Incremental Progress**: Small, working commits
4. **Fail Fast**: Quick validation of approaches
5. **Context Switching**: Clear handoff documentation

### Stall Indicators
- No commits for >2 hours during active work
- Repeated failed attempts without pivoting
- Analysis paralysis in comments/discussions
- Waiting for "perfect" solution

### Implementation
- Heartbeat commits every 30-60 minutes
- Progress updates on issues
- WIP PRs for visibility

---

## RULE-WFL-004: Terminal and Git Configuration

**Category**: Workflow  
**Complexity**: Advanced  
**Default**: Disabled  

### Description
Enforces specific terminal and git configurations for consistency.

### Requirements
1. **No Interactive Editors**: Git operations must not open editors
2. **Absolute Paths**: Use full paths in commands and scripts
3. **Proper Escaping**: Quote paths with spaces
4. **Non-Interactive Mode**: All commands must be scriptable

### Git Configuration
```bash
git config --global core.editor "true"
git config --global commit.gpgsign false
git config --global pull.rebase false
```

### Common Patterns
```bash
# ✅ Good: Non-interactive commit
git commit -m "feat: add feature"

# ❌ Bad: Opens editor
git commit

# ✅ Good: Quoted path
cd "/path/with spaces/project"

# ❌ Bad: Unquoted path
cd /path/with spaces/project
```