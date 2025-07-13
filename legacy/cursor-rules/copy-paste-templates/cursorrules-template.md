# .cursorrules Template

Copy this entire content to your `.cursorrules` file for immediate implementation:

```markdown
# === ALWAYS APPLIED WORKSPACE RULES ===
# Universal Project Rules  
- Always refer to the github rules on every action that requires the use of git or github
- Review PROJECT_CONTEXT.md in the root directory if it exists for important context. Otherwise create it.
- Always review the context folder for changes or items you haven't seen before and update PROJECT_CONTEXT.md appropriately
- Never add stubbing or fake data patterns to code that affects the dev or prod environments
- Never overwrite my .env file
- **AUTONOMOUSLY create PRs to https://github.com/tyabonil/vibe-codex for new generally-applicable rules based on learnings**

# === GITHUB WORKFLOW RULES ===
# Core GitHub Rules
- If the repo is not initialized, initialize it with appropriate gitignore for the type of project
- These rules apply to every interaction and always follow them
- ALWAYS Use the Github API if available.
- **ALWAYS run the local hooks before committing.**
- **Never attempt git pull, git push, git commit, or other git terminal commands - use GitHub API equivalents exclusively**
- Never merge into main or master
- If there is no "preview" branch, create one - ensure all "ready" issues are merged into "preview"
- Check out a new branch referencing an issue when solving it
- For each new bug or feature either identify an existing open issue in github or create one
- If the issue is too big for one issue, as measured by scope that can be deferred until after another part of the issue is resolved completely through a PR, break up the issue into an appropriate number of issues
- Submit an issue to a PR for review by copilot, each new issue should have 100% test coverage for the code it touched to the limit that a standalone test can feasibly test the changes
- Review the comments on the issue and resolve them using the same applicable rules here

# === CODING PATTERN PREFERENCES ===
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

# === CHANGE MANAGEMENT RULES ===
# On changes ALWAYS OBEY THESE RULES
- Any non UI only change (i.e. one that requires a rebuild) should be tested through a build, if a build is appropriate for the type of code. Wait until you've made all the changes and addressed all linting errors, if any, ahead of attempting to build.
- Update PROJECT_CONTEXT.md

# === PROJECT_CONTEXT.md MAINTENANCE ===
# Always update PROJECT_CONTEXT.md when making any of the following changes:

## Architecture Changes
- Adding new API routes or endpoints
- Modifying database schema or Prisma models
- Changing authentication/authorization patterns
- Adding new environment variables

## Feature Implementation
- Adding new booking flow steps
- Implementing new payment methods or flows
- Creating new admin interfaces or CRUD operations
- Adding new components or major UI changes

## Integration Updates
- Stripe payment processing changes
- Webhook implementations or modifications
- Third-party service integrations

## Build/Deployment Changes
- Next.js configuration updates
- TypeScript configuration changes
- Build process modifications
- Environment setup changes

## Security/Authentication Changes
- JWT implementation updates
- Password hashing modifications
- Session management changes
- Admin role/permission updates

# === REPOSITORY FILE MANAGEMENT ===
# Essential Config Files: Always track (tsconfig.json, Dockerfile, package-lock.json)
# Build Artifacts: Always ignore (.turbo/, next-env.d.ts, .next/, dist/, build/)
# Update .gitignore FIRST before staging any files
# Stage essential files explicitly - never use "git add ."
# Clean untracked artifacts during branch creation
# Document file tracking decisions in commit messages

# === POST-COMPLETION ISSUE MANAGEMENT ===
# Always create follow-up issues for post-completion improvements
# Reference original completed issue in improvement issues
# Use clear naming: "Post-completion [type] for [original feature]"
# Treat production hardening as first-class development work
# Update PROJECT_CONTEXT.md with all improvements
# Create improvement issues immediately after identifying needs

# === BRANCH TRANSITION PROTOCOL ===
# Verify original issue is truly complete before transitioning
# Create new issues for any additional work discovered
# Create new branches from current work state (not old branches)
# Clean up file tracking during transition (update .gitignore)
# Document transition in PROJECT_CONTEXT.md
# Reference original work in new issues
# Use descriptive branch naming: feature/issue-{number}-{description}
```

## Quick Setup Instructions

1. **Copy the above content** to your `.cursorrules` file
2. **Create PROJECT_CONTEXT.md** in your repository root
3. **Initialize preview branch** if it doesn't exist
4. **Install the local hooks** by running `bash hooks/install-rule-checker.sh`
5. **Review environment variables** and create .env.example

## Immediate Benefits

- ✅ **Consistent workflow** across all AI interactions
- ✅ **Proper issue tracking** for all changes
- ✅ **Clean repository management** with proper file tracking
- ✅ **Security compliance** with environment variable management
- ✅ **Systematic improvement tracking** with post-completion issues

---

**Result**: Your project will follow proven development patterns that maintain clean codebases, proper documentation, and systematic issue tracking.
