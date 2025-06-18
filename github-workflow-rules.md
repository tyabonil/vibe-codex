# GitHub Workflow Rules

## Core GitHub Rules

```markdown
# Github ALWAYS OBEY THESE RULES 
- If the repo is not initialized, initialize it with appropriate gitignore
- These rules apply to every interaction and always follow them
- ALWAYS Use the Github API if available
- **ALWAYS use MCP GitHub API tools (mcp_github_*) instead of terminal git commands**
- **Never attempt git pull, git push, git commit, or other git terminal commands**
- **ALWAYS treat GitHub main branch as canonical source of truth**
- **ALWAYS sync with main branch before creating new branches or making changes**
- **ALWAYS create appropriate issues for both development work AND infrastructure setup tasks**
- Never merge into main or master
- If there is no "preview" branch, create one - ensure all "ready" issues are merged into "preview"
- Check out a new branch referencing an issue when solving it
- For each new bug or feature either identify an existing open issue or create one
- If the issue is too big, break up the issue into appropriate number of issues 
- Submit an issue to a PR for review by copilot with 100% test coverage
- Review the comments on the issue and resolve them using the same applicable rules
```

## Branch and Issue Management

```markdown
# Branch and Issue Strategy
- **Branch Naming**: feature/issue-{number}-{short-description} or bugfix/issue-{number}-{short-description}
- **Issue Requirements**: Every code change must reference an issue
- **PR Reviews**: Always request Copilot review before human review
- **Test Coverage**: 100% coverage for all new code where feasibly testable
- **Preview Branch**: All completed features merge to preview before main
```

## Infrastructure Issue Creation Requirements

```markdown
# Infrastructure Setup and Blocking Rules

## Always Create Infrastructure Issues
- **Create separate issues for infrastructure setup tasks**
- **Mark development issues as "BLOCKED" when they depend on infrastructure**
- **Clearly identify who is responsible for infrastructure vs development work**
- **Include detailed infrastructure acceptance criteria and validation steps**

## Infrastructure Blocking Protocol
- **When development work is blocked by infrastructure:**
  - Mark the development issue with "⛔️ BLOCKED" status and assign to the repo owner
  - Reference the blocking infrastructure issue number
  - Include timeline expectations for infrastructure completion
  - Provide clear escalation path for infrastructure delays

## Infrastructure Issue Requirements
- **Detailed setup instructions and acceptance criteria**
- **Environment specifications (dev, staging, prod)**
- **Security and compliance requirements**
- **Performance benchmarks and validation steps**
- **Dependencies and prerequisite documentation**

## Infrastructure Validation
- **All infrastructure must be validated before development begins**
- **Include smoke tests and basic functionality verification**
- **Document any known limitations or temporary workarounds**
- **Provide rollback procedures for infrastructure changes**
```

## Main Branch Synchronization Rules

```markdown
# Main Branch Synchronization Protocol

## Always Sync Before Working
- **Check GitHub main branch status before creating any new branches**
- **Treat GitHub main as the single source of truth**
- **Resolve all conflicts in favor of GitHub main branch**
- **Never force push over GitHub main branch**

## Conflict Resolution Process
- **When local differs from GitHub main:**
  1. Fetch latest changes from GitHub main
  2. Resolve conflicts by accepting GitHub main changes
  3. Only override if explicitly authorized by project owner
  4. Document any manual conflict resolutions

## Branch Creation Protocol
- **Always create new branches FROM current GitHub main**
- **Verify main branch is fresh before starting any work**
- **Use GitHub API to ensure consistent branch creation**
- **Never create branches from outdated local main**

## Pre-Work Validation Checklist
- [ ] GitHub main branch fetched and current
- [ ] No local changes that conflict with GitHub main
- [ ] New branch created from fresh GitHub main
- [ ] Infrastructure dependencies identified and resolved
```