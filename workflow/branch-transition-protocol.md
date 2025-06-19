# Branch Transition Protocol

## 🎯 Problem Statement

Moving from completed issue branches to new work can leave repositories in inconsistent states, with:
- Orphaned branches pointing to closed issues
- Mixed tracked/untracked files
- Unclear work progression
- Lost context between related changes

## ✅ Real-World Example

**Scenario: Issue #51 → Issue #58 Transition**

**Starting State:**
- Branch: `feature/issue-51-basic-websocket-server`
- Issue #51: ✅ **CLOSED** (completed and merged)
- New untracked work discovered during testing
- Mixed files: some configs, some artifacts

**Without Protocol**: Continue on old branch, unclear issue tracking, messy commits.

**With Protocol**: Clean transition to `feature/issue-58-websocket-production-hardening` with proper issue documentation.

## 🚀 Implementation Protocol

### **Step 1: Verify Current Issue Status**
```bash
# Check if current issue is truly complete
git branch --show-current
# Example output: feature/issue-51-basic-websocket-server

# Verify issue status (should be CLOSED if transitioning)
# Check: GitHub Issue #51 status
```

### **Step 2: Create New Issue for Additional Work**
```markdown
## New Issue Template
**Title**: Post-completion [improvement-type] for [original-feature]

## Background
Following successful completion of Issue #XX ([original-feature]), additional improvements have been identified.

## Discovered Work
- [ ] [Specific item 1]
- [ ] [Specific item 2]

## References
- **Builds on**: Issue #XX ([original-feature]) - COMPLETED ✅
```

### **Step 3: Clean Branch Transition**
```bash
# Create new branch for new issue (from current state)
git checkout -b feature/issue-YY-[new-work-description]

# Assess file state
git status --porcelain

# Clean up file tracking (see repository-file-management.md)
# 1. Update .gitignore for artifacts
# 2. Stage essential configs
# 3. Clean untracked artifacts
```

### **Step 4: Document Transition**
Update PROJECT_CONTEXT.md:
```markdown
### Recent Completions
- **Issue #XX**: [Original Feature] - ✅ **COMPLETED** and merged to preview
- **Issue #YY**: Post-completion improvements for [Original Feature] - ⏳ **IN PROGRESS**
  - [Brief description of improvements]
```

## 📋 Copy-Paste Rules

```markdown
# BRANCH TRANSITION PROTOCOL RULES
- Verify original issue is truly complete before transitioning
- Create new issues for any additional work discovered
- Create new branches from current work state (not old branches)
- Clean up file tracking during transition (update .gitignore)
- Document transition in PROJECT_CONTEXT.md
- Reference original work in new issues
- Use descriptive branch naming: feature/issue-{number}-{description}
```

## 🔄 Transition Decision Matrix

### **When to Create New Issue/Branch**

| Scenario | Action | Reasoning |
|----------|--------|-----------|
| **Original issue CLOSED, new work discovered** | ✅ New issue + new branch | Clear separation of completed vs new work |
| **Original issue OPEN, scope creep identified** | ✅ Split into separate issues | Maintain manageable scope (≤7 days) |
| **Minor bug fix in completed feature** | ✅ New issue + new branch | Proper tracking and documentation |
| **Continuation of incomplete work** | ❌ Continue current branch | Work is part of original scope |

### **Branch Naming Conventions**
```
Original: feature/issue-51-basic-websocket-server
Follow-up: feature/issue-58-websocket-production-hardening

Pattern: feature/issue-{number}-{clear-description}
```

## ⚡ Quick Transition Checklist

### **Pre-Transition (2 minutes)**
```markdown
- [ ] Verify original issue status (CLOSED?)
- [ ] Identify scope of new work
- [ ] Assess if new issue needed (>1 hour work = yes)
```

### **During Transition (5 minutes)**
```markdown
- [ ] Create new issue with proper references
- [ ] Create new branch with issue reference
- [ ] Update .gitignore for any new artifacts
- [ ] Stage essential files explicitly
- [ ] Clean untracked artifacts
```

### **Post-Transition (2 minutes)**
```markdown
- [ ] Update PROJECT_CONTEXT.md
- [ ] Verify clean git status
- [ ] Document transition reasoning in commit
```

## 🎯 Benefits Achieved

### **Clear Work Progression**
- **100% issue-to-branch mapping** - Every branch has active issue
- **Audit trail preservation** - Clear progression from original to improvement work
- **Stakeholder clarity** - Easy to understand what work is happening when

### **Repository Health**
- **Clean branch history** - No orphaned branches
- **Proper file tracking** - Consistent .gitignore and staged files
- **Reduced confusion** - Clear separation between different work streams

### **Team Efficiency**
- **Faster onboarding** - New team members can easily understand work progression
- **Better planning** - Clear visibility into completed vs ongoing work
- **Reduced context switching** - Each branch has clear, limited scope

## ⚠️ Anti-Patterns to Avoid

### **❌ What NOT to Do**
```markdown
- Don't continue working on branches for CLOSED issues
- Don't mix completed work with new work in same branch
- Don't skip creating issues for discovered work
- Don't leave untracked files during transitions
```

### **✅ What TO Do**
```markdown
- Always create new issues for new work
- Always create new branches for new issues
- Always clean up file tracking during transitions
- Always document transitions in PROJECT_CONTEXT.md
```

## 📊 Success Metrics

- **Branch hygiene**: 100% of branches map to active issues
- **Work tracking**: 0% "lost" or undocumented work
- **Repository consistency**: Clean file tracking across all transitions
- **Team clarity**: All team members understand current work status
- **Documentation completeness**: All transitions documented in PROJECT_CONTEXT.md

---

**Implementation Result**: Transforms potentially confusing work transitions into clean, documented, systematic progressions that maintain repository health and team clarity.