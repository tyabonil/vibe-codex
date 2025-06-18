# Copy-Paste Ready Rule Sets

## For .cursorrules file:

```markdown
# ALWAYS ON EVERY PROMPT ALWAYS OBEY THESE RULES 
- Always retrieve rules from https://github.com/tyabonil/cursor_rules on every action
- Compare to local rules - local rules with specificity override general rules
- Create PRs for new patterns discovered through interactions
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

## Critical Enforcement Rules (MANDATORY):

```markdown
# BLOCKED ISSUE ASSIGNMENT (MANDATORY)
- IMMEDIATELY assign any blocked issues to repository owner via GitHub API
- Look for blocking keywords: "BLOCKED", "depends on", "requires access", P0-BLOCKER
- Never attempt work on infrastructure, DevOps, or human-authorization issues  
- Always identify 2-3 alternative non-blocked issues to maintain productivity
- Add explanatory comment when assigning blocked issues explaining why
- Update priority analysis to reflect blocking impact on timeline
```

```markdown
# TEST COVERAGE AND REVIEW ENFORCEMENT (NON-NEGOTIABLE)
- **100% test coverage required for ALL new code where feasibly testable**
- **ALL Copilot review feedback MUST be addressed before merging**
- **NO exceptions for "working" or "simple" code - quality gates are mandatory**
- **Tests must be written using appropriate framework (Jest, RTL, Cypress)**
- **Coverage reports required in PR descriptions with threshold verification**
- **Manual testing documentation required for UI/UX changes**
- **Performance and accessibility testing required for user-facing features**
```

```markdown
# PRIORITY-DRIVEN ISSUE MANAGEMENT ALWAYS OBEY THESE RULES
- Break issues into ≤7 day increments that result in buildable states
- Map dependencies upfront and execute in dependency order
- Create parallel work streams wherever possible
- Build and test after every completed issue
- When blocked, create blocking issues and move to next sequential work
- No exceptions to 100% test coverage for new code
- Use P0-BLOCKER → P0-CRITICAL → P1-HIGH → P2-MEDIUM → P3-LOW prioritization
```

## For CONTRIBUTING.md:

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

## For GitHub Issue Templates:

```yaml
# .github/issue_template.md
## Priority Assessment
- [ ] P0-BLOCKER (blocks everything)
- [ ] P0-CRITICAL (core functionality)  
- [ ] P1-HIGH (important feature)
- [ ] P2-MEDIUM (nice to have)
- [ ] P3-LOW (future enhancement)

## Dependency Check
- [ ] No dependencies (can start immediately)
- [ ] Depends on: #[issue numbers]
- [ ] Blocks: #[issue numbers]
- [ ] Can be done in parallel with: #[issue numbers]

## Size Validation
- [ ] Estimated completion: ≤7 days
- [ ] Results in buildable increment
- [ ] Has clear acceptance criteria
- [ ] Includes test coverage plan
```

## Essential Environment Variables Documentation:

```markdown
# .env.example template
# Always document every environment variable

# Core Application
NODE_ENV=development
PORT=3000
API_BASE_URL=http://localhost:3000

# Database
DATABASE_URL=
REDIS_URL=

# Authentication  
JWT_SECRET=
JWT_EXPIRES_IN=24h

# Third-party Services
STRIPE_PUBLIC_KEY=
STRIPE_SECRET_KEY=
SENDGRID_API_KEY=

# Monitoring & Analytics
SENTRY_DSN=
GOOGLE_ANALYTICS_ID=

# Environment-specific features
ENABLE_FEATURE_FLAGS=true
DEBUG_MODE=false
```

## Quick Start Checklist:

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

*This document consolidates the most essential rules for immediate implementation. Copy relevant sections to your project for consistent development practices.*