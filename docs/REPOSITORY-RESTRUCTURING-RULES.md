# Repository Restructuring Rules

## Overview

Major repository restructuring can cause significant disruption to ongoing development work. To prevent merge conflicts and lost work, strict rules govern when and how repository restructuring can be performed.

## What Constitutes Repository Restructuring?

Repository restructuring is defined as:

1. **Directory-level movements** - Moving files between root-level directories
2. **Mass file movements** - Moving or deleting more than 20 files
3. **Package structure changes** - Reorganizing the fundamental structure of the project
4. **Core directory renaming** - Renaming directories like `src`, `lib`, `app`, etc.

## Mandatory Requirements

### Before Starting Restructuring

1. **Review ALL open pull requests**
   - Use `gh pr list --state open` to see all open PRs
   - Each PR must be either merged or closed

2. **Create a restructuring announcement issue**
   - Title: "RESTRUCTURING: [Description of changes]"
   - Body must include:
     - Reason for restructuring
     - Timeline for completion
     - List of directories/files affected
     - Migration guide for developers

3. **Ensure no active development branches**
   - All feature branches must be merged or deleted
   - Use `git branch -r` to check remote branches

4. **Target preview branch first**
   - Restructuring PRs must target `preview`, not `main`
   - This allows testing before affecting production

### During Restructuring

1. **Document all file mappings**
   - Create a `RESTRUCTURING.md` or similar file
   - List every moved file: `old/path/file.js → new/path/file.js`
   - Include any renamed files

2. **Coordinate with team**
   - Post updates in team channels
   - Schedule restructuring during low-activity periods

3. **Preserve git history**
   - Use `git mv` for file movements
   - Avoid delete + recreate patterns

## Automated Enforcement

The mandatory rules checker will:

1. **Detect restructuring attempts** by analyzing:
   - Number of moved/renamed files
   - Directory-level changes
   - Mass deletions

2. **Block PRs that violate rules**:
   - Restructuring with open PRs → BLOCKER violation
   - Missing documentation → MANDATORY violation
   - No announcement issue → BLOCKER violation

3. **Provide guidance** on fixing violations:
   - Lists all open PRs that need resolution
   - Shows example file mapping format
   - Links to this documentation

## Example Restructuring Documentation

```markdown
# Project Restructuring - Moving to Monorepo

## File Mappings

### Core Application
- `src/index.js` → `packages/app/src/index.js`
- `src/components/*` → `packages/app/src/components/*`
- `src/utils/*` → `packages/shared/src/utils/*`

### Configuration
- `config/webpack.js` → `packages/app/config/webpack.js`
- `.env.example` → `packages/app/.env.example`

### Tests
- `tests/*` → `packages/app/tests/*`
- `jest.config.js` → `packages/app/jest.config.js`

## Deleted Files
- `old-scripts/*` - Obsolete build scripts
- `legacy/*` - Deprecated code

## Migration Guide

1. Update import paths in your PRs
2. Run `npm install` in the new package directories
3. Update CI/CD configurations
```

## Best Practices

1. **Plan restructuring carefully**
   - Consider the impact on all team members
   - Time it to minimize disruption

2. **Communicate early and often**
   - Give at least 48 hours notice
   - Provide clear migration instructions

3. **Test thoroughly**
   - Ensure all tests pass after restructuring
   - Verify build processes work correctly

4. **Consider gradual migration**
   - Break large restructuring into smaller phases
   - This reduces risk and merge conflicts

## Recovery from Violations

If your restructuring PR is blocked:

1. **Check for open PRs**: `gh pr list --state open`
2. **Work with PR authors** to merge or close their work
3. **Add documentation** if missing
4. **Create announcement issue** if not already done
5. **Rerun checks** after addressing all violations