# 📝 Issue Update Guidelines

## Overview

GitHub issues serve as the "running context" for all development work. This guide ensures issues remain up-to-date throughout the development lifecycle.

## When to Update Issues

### 1. Starting Work
**When:** Immediately after creating a feature branch  
**What to include:**
- Branch name created
- Initial implementation plan
- Any assumptions or dependencies

**Example:**
```markdown
Starting work on branch `feature/issue-123-user-auth`.

**Plan:**
1. Create login form component
2. Implement JWT authentication
3. Add session management
4. Write comprehensive tests

Will use existing API endpoints from backend team.
```

### 2. First Commit
**When:** After making your first commit  
**What to include:**
- Progress update
- Any discovered complexities
- Changes to original plan

**Example:**
```markdown
First commit pushed. Started with login form UI.

**Progress:**
- ✅ Created LoginForm component
- ✅ Added form validation
- 🔄 Working on styling

**Note:** Discovered we need to handle OAuth as well, not mentioned in original requirements.
```

### 3. Creating PR
**When:** Immediately after creating pull request  
**What to include:**
- PR number and link
- Summary of implementation
- Any deviations from plan

**Example:**
```markdown
Created PR #456: https://github.com/org/repo/pull/456

**Implementation Summary:**
- Implemented JWT + OAuth authentication
- Added remember me functionality
- Created comprehensive test suite
- Updated documentation

**Changes from original plan:**
- Added OAuth support (Google, GitHub)
- Included password reset flow
```

### 4. Review Feedback
**When:** After receiving PR review comments  
**What to include:**
- Summary of feedback
- Planned changes
- Any blockers

**Example:**
```markdown
PR #456 received review feedback.

**Requested Changes:**
- Add rate limiting to login attempts
- Improve error messages
- Add loading states

**Working on:** Implementing rate limiting with Redis
**Blocked by:** Need Redis connection details from DevOps
```

### 5. PR Merged/Closed
**When:** After PR is merged or closed  
**What to include:**
- Final status
- What was delivered
- Any follow-up needed

**Example:**
```markdown
✅ PR #456 merged!

**Delivered:**
- Complete authentication system
- OAuth integration (Google, GitHub)
- Rate limiting
- Comprehensive tests (100% coverage)

**Follow-up needed:**
- Monitor performance in production
- Add Facebook OAuth if requested
```

## Automated Updates

The vibe-codex system provides automatic updates for:

### PR Creation
```markdown
## 🔗 Pull Request Created

PR #456 has been created to address this issue.

**PR Details:**
- Title: feat: implement user authentication
- Branch: `feature/issue-123-user-auth`
- Status: ✅ Ready for review
- Link: https://github.com/org/repo/pull/456
```

### PR Closure
```markdown
## ✅ Pull Request Merged

PR #456 has been successfully merged!

**Merge Details:**
- Merged by: @johndoe
- Merged at: 2024-01-15 10:30 AM
- Commits: 12
- Changes: +500 -50
```

## Best Practices

### 1. Be Specific
- ❌ "Working on it"
- ✅ "Implemented user model with email validation, working on password hashing"

### 2. Include Context
- ❌ "Found a bug"
- ✅ "Found race condition in session handling when multiple tabs are open"

### 3. Document Decisions
- ❌ "Changed the approach"
- ✅ "Switched from localStorage to secure cookies for token storage due to XSS concerns"

### 4. Link Resources
- Include links to:
  - Related PRs
  - Documentation
  - External discussions
  - Design decisions

### 5. Use Checklists
Track progress visually:
```markdown
**Implementation Progress:**
- [x] User model
- [x] Authentication logic
- [x] Login UI
- [ ] Password reset
- [ ] Remember me
```

## Templates

### Daily Progress Update
```markdown
## Progress Update - [Date]

**Completed:**
- Item 1
- Item 2

**In Progress:**
- Item 3 (70% complete)

**Blockers:**
- Waiting for API documentation

**Next:**
- Complete Item 3
- Start Item 4
```

### Technical Decision
```markdown
## Technical Decision: [Topic]

**Options Considered:**
1. Option A - Pros/Cons
2. Option B - Pros/Cons

**Decision:** Option A

**Reasoning:** [Explanation]

**Impact:** [What this means for the project]
```

## Benefits

1. **Knowledge Preservation** - Decisions and context aren't lost
2. **Team Alignment** - Everyone knows current status
3. **Onboarding** - New developers understand history
4. **Debugging** - Historical context helps solve issues
5. **Compliance** - Audit trail for changes

## Anti-Patterns to Avoid

### 1. Update Bombs
❌ No updates for days, then a wall of text

✅ Regular, concise updates as you work

### 2. Vague Updates
❌ "Made some changes"

✅ "Refactored auth middleware to use async/await pattern"

### 3. Missing Context
❌ "Fixed the bug"

✅ "Fixed race condition in session cleanup that caused logouts"

### 4. No Follow-Through
❌ Mention blocker, never update when resolved

✅ "Blocked by X" → "X resolved, continuing with implementation"

## Integration with Tools

### Git Hooks
```bash
# Post-commit reminder
"📝 Don't forget to update issue #123 with your progress!"
```

### PR Template
```markdown
## Issue Update Checklist
- [ ] Updated issue with PR link
- [ ] Documented any changes from plan
- [ ] Listed what was delivered
```

### GitHub Actions
- Automatic PR creation notifications
- Review feedback reminders
- Merge/close notifications

## Summary

Keeping issues updated is not bureaucracy—it's communication. Your future self and your team will thank you for maintaining clear, comprehensive issue histories.

**Remember:** The issue is the story of your feature. Make it a good one! 📖