# Suggested Rules Files for Project Implementation

## Overview
This document consolidates all workflow rules, coding patterns, and development guidelines established in the cursor enabled project. Copy and paste relevant sections to existing projects for consistent development practices.

---

## Core Always-Applied Workspace Rules

### Universal Project Rules
```markdown
# Always on every prompt ALWAYS OBEY THESE RULES 
- Always refer to the github rules on every action that requires the use of git or github
- Review PROJECT_CONTEXT.md in the root directory if it exists for important context. Otherwise create it.
- Always review the context folder for changes or items you haven't seen before and update PROJECT_CONTEXT.md appropriately
- Never add stubbing or fake data patterns to code that affects the dev or prod environments
- Never overwrite my .env file
```

### Coding Pattern Preferences
```markdown
# Coding pattern preferences
- Always prefer simple solutions
- Avoid duplication of code whenever possible, which means checking for other areas of the codebase that might already have similar code and functionality
- Write code that takes into account the different environments: dev, test, and prod
- You are careful to only make changes that are requested or you are confident are well understood and related to the change being requested
- When fixing an issue or bug, do not introduce a new pattern or technology without first exhausting all options for the existing implementation. And if you finally do this, make sure to remove the old implementation afterwards so we don't have duplicate logic.
- Keep the codebase very clean and organized
- Avoid writing scripts in files if possible, especially if the script is likely only to be run once
- Avoid having files over 200-300 lines of code. Refactor at that point.
- Mocking data is only needed for tests, never mock data for dev or prod
```

### Change Management Rules
```markdown
# On changes ALWAYS OBEY THESE RULES 
- Any non UI only change (i.e. one that requires a rebuild) should be tested through a build, if a build is appropriate for the type of code. Wait until you've made all the changes and addressed all linting errors, if any, ahead of attempting to build.
- Update PROJECT_CONTEXT.md
```

---

## GitHub Workflow Rules

### Core GitHub Rules
```markdown
# Github ALWAYS OBEY THESE RULES 
- If the repo is not initialized, initialize it with appropriate gitignore for the type of project
- These rules apply to every interaction and always follow them
- ALWAYS Use the Github API if available.
- **ALWAYS use MCP GitHub API tools (mcp_github_*) instead of terminal git commands for all repository operations**
- **Never attempt git pull, git push, git commit, or other git terminal commands - use GitHub API equivalents exclusively**
- **ALWAYS treat GitHub main branch as canonical source of truth - resolve conflicts in favor of remote main**
- **ALWAYS sync with main branch before creating new branches or making any changes**
- **ALWAYS create appropriate issues for both development work AND infrastructure setup tasks**
- Never merge into main or master
- If there is no "preview" branch, create one - ensure all "ready" issues are merged into "preview"
- Check out a new branch referencing an issue when solving it
- For each new bug or feature either identify an existing open issue in github or create one
- If the issue is too big for one issue, as measured by scope that can be deferred until after another part of the issue is resolved completely through a PR, break up the issue into an appropriate number of issues 
- Submit an issue to a PR for review by copilot, each new issue should have 100% test coverage for the code it touched to the limit that a standalone test can feasibly test the changes
- Review the comments on the issue and resolve them using the same applicable rules here
```

### Branch and Issue Management
```markdown
# Branch and Issue Strategy
- **Branch Naming**: feature/issue-{number}-{short-description} or bugfix/issue-{number}-{short-description}
- **Issue Requirements**: Every code change must reference an issue
- **PR Reviews**: Always request Copilot review before human review
- **Test Coverage**: 100% coverage for all new code where feasibly testable
- **Preview Branch**: All completed features merge to preview before main
```

---

## Infrastructure Workflow Rules

### Infrastructure Issue Creation Requirements
```markdown
# Infrastructure Setup and Blocking Rules

## Always Create Infrastructure Issues
- **Create separate issues for infrastructure setup tasks**
- **Mark development issues as "BLOCKED" when they depend on infrastructure**
- **Clearly identify who is responsible for infrastructure vs development work**
- **Include detailed infrastructure acceptance criteria and validation steps**

## Infrastructure Blocking Protocol
- **When development work is blocked by infrastructure:**
  - Mark the development issue with "⚠️ BLOCKED" status and assign to the repo owner
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

### Main Branch Synchronization Rules
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

---

## PROJECT_CONTEXT.md Maintenance Rules

### Always Update PROJECT_CONTEXT.md When Making:

```markdown
## PROJECT_CONTEXT.md Maintenance Rule

**ALWAYS update PROJECT_CONTEXT.md when making any of the following changes:**

1. **Architecture Changes**
   - Adding new API routes or endpoints
   - Modifying database schema or Prisma models
   - Changing authentication/authorization patterns
   - Adding new environment variables

2. **Feature Implementation**
   - Adding new booking flow steps
   - Implementing new payment methods or flows
   - Creating new admin interfaces or CRUD operations
   - Adding new components or major UI changes

3. **Integration Updates**
   - Stripe payment processing changes
   - Webhook implementations or modifications
   - Third-party service integrations

4. **Build/Deployment Changes**
   - Next.js configuration updates
   - TypeScript configuration changes
   - Build process modifications
   - Environment setup changes

5. **Security/Authentication Changes**
   - JWT implementation updates
   - Password hashing modifications
   - Session management changes
   - Admin role/permission updates

**Format for updates:**
- Update relevant sections with accurate technical details
- Include implementation approach and reasoning
- Document any breaking changes or migration notes
- Update implementation status checklist
- Add to development notes if applicable

**Rule enforcement:**
- Before completing any major feature or fix, review PROJECT_CONTEXT.md
- Ensure documentation reflects current state of implementation
- Include specific technical details, not just high-level descriptions
- Update both the overview and detailed sections as needed
```

---

## Technical Development Rules

### Performance and Quality Standards
```markdown
# Technical Excellence Rules

## Rule 1: Performance First
- Always optimize for <50ms overlay rendering time
- Minimize DOM manipulation
- Use CSS transforms over layout changes
- Implement virtual scrolling for large overlays
- Cache style calculations
- No performance impact on host applications

## Rule 2: Enterprise Security by Design
- Build with enterprise requirements from day one:
- No data leaves customer environment without explicit consent
- All overlay code runs in isolated sandbox
- Implement Content Security Policy compliance
- Log all actions for audit trails
- AES-256 encryption for data at rest and in transit

## Rule 3: Style Harmony Priority
- Visual integration is critical for user acceptance:
- Extract and inherit host site typography automatically
- Match color schemes using computed styles
- Maintain brand consistency >95% compliance
- Cross-browser compatibility (Chrome, Safari, Edge, Firefox)
```

### Code Quality Guidelines
```markdown
# Code Quality Standards

## File Organization
- Keep files under 200-300 lines maximum
- Separate concerns into logical modules
- Use consistent naming conventions
- Maintain clear folder structure

## Testing Requirements
- Unit tests for all business logic
- Integration tests for API endpoints
- E2E tests for critical user flows
- 100% test coverage for new features

## Documentation Standards
- JSDoc comments for all public functions
- README files for all major modules
- API documentation for all endpoints
- Architecture decision records (ADRs) for major decisions
```

---

## AI-Assisted Development Guidelines

### VIBE Coding Integration Rules
```markdown
# AI Development Optimization

## Cursor/AI Tool Usage
- Use AI tools for rapid prototyping and initial implementation
- Always review and test AI-generated code before committing
- Leverage AI for code review and optimization suggestions
- Use AI for documentation generation and updates

## VIBE Coding Workflow
1. Generate initial code structure with AI
2. Review for security and performance implications
3. Test in isolated environment
4. Iterate based on testing results
5. Document implementation decisions

## Quality Assurance for AI Code
- Manual review of all AI-generated business logic
- Security scan of AI-generated code
- Performance testing of AI implementations
- User acceptance testing of AI-generated interfaces
```

---

## Environment and Deployment Rules

### Environment Management
```markdown
# Environment Configuration

## Environment Separation
- **Development**: Local development with mock data
- **Testing**: Automated testing environment
- **Staging**: Production-like environment for final testing
- **Production**: Live environment with real data

## Environment Rules
- Never use production data in dev/test environments
- Environment-specific configuration files
- Secure secret management for all environments
- Automated deployment pipelines for consistency

## Data Management
- No fake/mock data in production
- Test data only in testing environments
- Proper data backup and recovery procedures
- GDPR/compliance requirements in all environments
```

---

## Compliance and Security Rules

### Regulatory Compliance
```markdown
# Compliance Framework

## Data Privacy Requirements
- GDPR compliance for EU users
- SOC2 compliance for enterprise customers
- Industry-specific compliance (HIPAA, etc.)
- Regular compliance audits and updates

## Security Standards
- Multi-tenant isolation
- Zero-knowledge architecture where applicable
- Regular security assessments
- Incident response procedures

## Audit Requirements
- Complete activity logging
- Audit trail for all data access
- Regular compliance reporting
- Third-party security assessments
```

---

## User Story and Development Patterns

### User Story Templates
```markdown
# User Story Standards

## Epic Structure
Epic: [High-level feature description]

## User Story Format
As a [persona]
I want [goal]
So that [benefit]

## Acceptance Criteria Template
- Given [context]
- When [action]
- Then [outcome]

## Definition of Done
- [ ] Code implemented and reviewed
- [ ] Tests written and passing
- [ ] Documentation updated
- [ ] Security review completed
- [ ] Performance benchmarks met
- [ ] Accessibility standards met
```

---

## Implementation Checklist

### Before Starting New Project
```markdown
# New Project Setup Checklist

## Repository Setup
- [ ] Initialize git repository
- [ ] Create appropriate .gitignore
- [ ] Set up branch protection rules
- [ ] Create initial PROJECT_CONTEXT.md
- [ ] Set up issue templates

## Development Environment
- [ ] Configure CI/CD pipeline
- [ ] Set up testing framework
- [ ] Configure linting and formatting
- [ ] Set up security scanning
- [ ] Configure performance monitoring

## Documentation
- [ ] Create README with setup instructions
- [ ] Document architecture decisions
- [ ] Set up API documentation
- [ ] Create contribution guidelines
- [ ] Document deployment procedures
```

---

## Copy-Paste Ready Rule Sets

### For .cursorrules file:
```markdown
# Always on every prompt ALWAYS OBEY THESE RULES 
- Always refer to the github rules on every action that requires the use of git or github
- Review PROJECT_CONTEXT.md in the root directory if it exists for important context. Otherwise create it.
- Always review the context folder for changes or items you haven't seen before and update PROJECT_CONTEXT.md appropriately
- Never add stubbing or fake data patterns to code that affects the dev or prod environments
- Never overwrite my .env file
- Always prefer simple solutions
- Avoid duplication of code whenever possible
- Write code that takes into account different environments: dev, test, and prod
- Keep the codebase very clean and organized
- Avoid having files over 200-300 lines of code. Refactor at that point.
- **ALWAYS use MCP GitHub API tools (mcp_github_*) instead of terminal git commands**
- **ALWAYS create appropriate issues for both development work AND infrastructure setup tasks**
- **ALWAYS treat GitHub main branch as canonical source of truth**
- **ALWAYS sync with main branch before creating new branches or making changes**
- **Mark development issues as BLOCKED when dependent on infrastructure**
- Never merge into main or master
- Update PROJECT_CONTEXT.md for any significant changes
```

### For CONTRIBUTING.md:
```markdown
# Contributing Guidelines

## Development Workflow
1. Create issue for new features/bugs
2. Create branch referencing issue number
3. Implement changes following coding standards
4. Write/update tests (100% coverage required)
5. Update PROJECT_CONTEXT.md if applicable
6. Submit PR with Copilot review
7. Address review feedback
8. Merge to preview branch first
9. Deploy to production after validation

## Code Standards
- Files must be under 200-300 lines
- No duplicate code across codebase
- Environment-aware implementations
- Security-first approach
- Performance optimization required
```

---

*This document consolidates all established workflow rules and can be customized per project while maintaining core standards and best practices.*
