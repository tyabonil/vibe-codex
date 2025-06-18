# Blocked Issue Assignment Rule

**Based on real-world lesson from ODNEP project where AI incorrectly tried to work on blocked infrastructure issues**

## Problem Statement

AI assistants can mistakenly attempt to work on blocked issues that require human intervention, such as:
- Infrastructure setup that requires credentials/accounts
- DevOps configuration requiring system access
- Third-party service setup requiring human authorization
- Business decisions requiring human judgment
- Issues marked as "BLOCKED" by dependencies

This wastes time and violates the principle that **blocked issues should be handled by humans who can unblock them**.

## The Blocked Issue Assignment Rule

### 🚨 **MANDATORY RULE: Blocked Issue Assignment**

```markdown
# Blocked Issue Assignment (MANDATORY)

## When AI Encounters Blocked Issues:
1. **IMMEDIATELY ASSIGN TO USER** - Any issue marked as "BLOCKED" or with blocking dependencies
2. **IDENTIFY THE BLOCKER** - Clearly state what is blocking the issue  
3. **FIND WORKABLE ALTERNATIVES** - Move to next sequential issue that can be completed
4. **CREATE PARALLEL STREAMS** - Identify work that can be done in parallel
5. **NEVER ATTEMPT BLOCKED WORK** - AI must not try to work on blocked issues

## Blocking Issue Detection Keywords:
- "BLOCKED by #[issue]"
- "⚠️ BLOCKED"
- "**BLOCKED**:"
- "Depends on infrastructure setup"
- "Requires human authorization"
- "Needs system access"
- "Blocked until..."
- P0-BLOCKER priority issues

## Assignment Action Required:
- Use GitHub API to assign blocked issues to repository owner
- Add comment explaining why assigned and what's needed to unblock
- Identify alternative work streams to maintain productivity
- Update priority analysis with dependency chain
```

## Implementation Process

### **Step 1: Issue Analysis Protocol**

```markdown
## Before Starting Any Issue Work:

1. **Read Issue Description** - Look for blocking keywords
2. **Check Dependencies** - Verify all prerequisite issues are complete
3. **Assess Technical Scope** - Can this be completed with available tools?
4. **Determine Authorization Needs** - Does this require human access/decisions?
5. **If ANY red flags → ASSIGN TO USER**

## Red Flags for Blocked Issues:
- ❌ Infrastructure/DevOps setup 
- ❌ Third-party service configuration
- ❌ Business strategy decisions
- ❌ Requires system credentials
- ❌ Depends on incomplete issues
- ❌ Marked as "BLOCKED" in title/description
- ❌ P0-BLOCKER without clear completion path
```

### **Step 2: Assignment and Communication**

```markdown
## When Assigning Blocked Issues:

1. **Assign to Repository Owner** via GitHub API
2. **Add Explanatory Comment**:
   ```
   🚨 **BLOCKED ISSUE DETECTED**
   
   This issue has been assigned to you because it requires:
   - [Specific blocking reason]
   
   **What's needed to unblock:**
   - [Specific actions needed]
   
   **Alternative work identified:**
   - Issue #X: [Alternative that can be worked on]
   - Issue #Y: [Another non-blocked option]
   ```
3. **Update Priority Analysis** - Reflect blocking impact on timeline
4. **Identify Parallel Work** - Find productive alternatives
```

### **Step 3: Productivity Maintenance**

```markdown
## Maintaining Development Velocity:

1. **Parallel Work Streams** - Always identify 2-3 non-blocked alternatives
2. **Sequential Backup Plan** - Next logical issue after blocker resolves  
3. **Business vs Technical Split** - Separate blocked infrastructure from workable features
4. **Documentation While Blocked** - Use downtime for documentation/planning
5. **Testing While Blocked** - Improve test coverage on existing code
```

## Real-World Example: ODNEP Project

### **Problem Scenario:**
AI attempted to work on Issue #32 "Infrastructure Setup" which was:
- P0-BLOCKER priority
- Required Vercel account setup
- Needed human authorization for cloud resources
- Blocked 8 other dependent issues (#25-31)

### **Mistake Made:**
AI tried to start development work instead of recognizing the blocking nature and assigning to user.

### **Correct Application of Rule:**
1. ✅ **Detected blocking keywords**: "BLOCKED: Development work blocked until this infrastructure is set up"
2. ✅ **Assigned to user**: Issues #32, #35, #25-31 assigned to @tyabonil  
3. ✅ **Identified alternatives**: Issue #41 (process improvement) was workable
4. ✅ **Maintained productivity**: Worked on priority-driven issue management instead

### **Result:**
- User handles infrastructure setup (proper person with access)
- AI continues productive work on non-blocked issues
- No time wasted on impossible tasks
- Clear separation of human vs AI responsibilities

## Copy-Paste Ready Rules

### **For .cursorrules:**

```markdown
# Blocked Issue Assignment (MANDATORY)
- IMMEDIATELY assign any blocked issues to repository owner via GitHub API
- Look for blocking keywords: "BLOCKED", "depends on", "requires access", P0-BLOCKER
- Never attempt work on infrastructure, DevOps, or human-authorization issues  
- Always identify 2-3 alternative non-blocked issues to maintain productivity
- Add explanatory comment when assigning blocked issues explaining why
- Update priority analysis to reflect blocking impact on timeline
```

### **For Team Workflows:**

```markdown
# Daily Blocked Issue Check
1. Review all P0-BLOCKER issues for blocking status
2. Assign any newly blocked issues to appropriate person
3. Identify parallel work streams for blocked team members  
4. Update project timeline to reflect blocking dependencies
5. Communicate blocking issues in daily standup
6. Track blocked time and unblocking actions needed
```

## Enforcement and Quality Control

### **Automated Checks:**
- GitHub webhooks to detect "BLOCKED" keywords in issues
- Automatic assignment rules for P0-BLOCKER issues
- Notification system for blocking dependencies
- Dashboard showing blocked issues and responsible assignees

### **Human Review Points:**
- Weekly review of blocked issues and unblocking progress
- Sprint planning includes blocking dependency analysis  
- Retrospectives identify blocking patterns for prevention
- Team training on recognizing and handling blocked work

## Success Metrics

### **Before Implementation:**
- AI wastes time on impossible/blocked tasks
- Unclear responsibility for infrastructure work
- Productivity loss when hitting blockers
- Delayed recognition of dependency issues

### **After Implementation:**
- Zero AI time wasted on blocked issues
- Clear human/AI responsibility separation
- Maintained productivity through parallel work
- Proactive blocking detection and assignment
- Faster unblocking through proper assignment

## Prevention Categories

### **Always Assign to Human:**
1. **Infrastructure & DevOps**: Cloud setup, CI/CD, deployment configuration
2. **Third-Party Services**: API account setup, service configuration, vendor management
3. **Business Decisions**: Strategy, pricing, legal, compliance, partnerships
4. **System Access**: Database setup, credential management, security configuration
5. **Authorization Required**: Payment setup, enterprise contracts, admin access

### **AI Can Work On:**
1. **Code Implementation**: Features with clear requirements and no external dependencies
2. **Documentation**: README files, API docs, code comments, tutorials  
3. **Testing**: Unit tests, integration tests, test coverage improvement
4. **Refactoring**: Code organization, performance optimization, bug fixes
5. **Analysis**: Code review, architecture planning, dependency mapping

---

## Implementation Timeline

- **Immediate**: Add rule to all cursor_rules repositories
- **Week 1**: Train AI assistants on blocking detection keywords
- **Week 2**: Implement automated blocking detection webhooks
- **Week 3**: Review and refine blocking categories based on experience
- **Ongoing**: Monitor blocking patterns and improve detection accuracy

**This rule prevents AI from wasting time on impossible tasks while ensuring proper human assignment for blocking issues.**