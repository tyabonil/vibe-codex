# 🧹 Branch Cleanup Guide

## Overview

The vibe-codex repository includes an automated branch cleanup system that maintains a clean, organized repository by removing merged feature branches automatically.

## Quick Start

### Installation
```bash
# Install all cleanup automation
./setup-branch-cleanup.sh
```

### Manual Cleanup
```bash
# Interactive cleanup
./scripts/cleanup-branches.sh

# Preview what would be deleted
./scripts/cleanup-branches.sh --dry-run

# Cleanup without prompts
./scripts/cleanup-branches.sh --force
```

## Components

### 1. Manual Cleanup Script (`scripts/cleanup-branches.sh`)

Comprehensive script for cleaning up both local and remote branches.

#### Features
- **Safe deletion** - Only removes merged branches
- **Dry-run mode** - Preview changes before executing
- **Interactive mode** - Confirm each deletion
- **Force mode** - Cleanup without prompts
- **PR verification** - Checks GitHub PR merge status
- **Protected branches** - Never deletes main/preview/master

#### Usage Examples
```bash
# Basic interactive cleanup
./scripts/cleanup-branches.sh

# Dry run to see what would be deleted
./scripts/cleanup-branches.sh --dry-run

# Force cleanup without prompts
./scripts/cleanup-branches.sh --force

# Only clean local branches
./scripts/cleanup-branches.sh --local-only

# Only clean remote branches
./scripts/cleanup-branches.sh --remote-only
```

#### Configuration
```bash
# Environment variables
export DRY_RUN=true                    # Same as --dry-run
export INTERACTIVE=false               # Same as --no-interactive  
export FORCE=true                      # Same as --force
export CLEANUP_REMOTE=false            # Same as --local-only
```

### 2. Post-merge Hook (`hooks/post-merge-cleanup.sh`)

Automatically runs after git merges to clean up merged branches.

#### Features
- **Automatic trigger** - Runs after merge commits
- **Smart detection** - Only runs on main/preview branches
- **Safe cleanup** - Preserves protected branches
- **PR integration** - Uses GitHub CLI to verify merges

#### Configuration
```bash
# Disable automatic cleanup
export BRANCH_CLEANUP_ENABLED=false

# Configuration file: .git/branch-cleanup.config
BRANCH_CLEANUP_ENABLED=true
AUTO_DELETE_MERGED=true
PRESERVE_RECENT_DAYS=7
```

### 3. GitHub Action (`.github/workflows/branch-cleanup.yml`)

Automated remote branch cleanup via GitHub Actions.

#### Triggers
- **PR merge** - Automatically deletes branch when PR is merged
- **Weekly schedule** - Runs every Sunday at 2 AM UTC
- **Manual dispatch** - Can be triggered manually with dry-run option

#### Features
- **Immediate cleanup** - Deletes branch right after PR merge
- **Bulk cleanup** - Weekly cleanup of all merged branches
- **Safety checks** - Protects main branches
- **Reporting** - Generates cleanup statistics

## Safety Features

### Protected Branches
These branches are never deleted:
- `main`
- `master` 
- `preview`
- `develop`
- `staging`
- `production`

### Merge Verification
Branches are only deleted if:
1. **Git merge check** - Branch is merged into main/preview
2. **PR verification** - Associated PR is marked as merged
3. **Not current branch** - Currently checked out branch is preserved

### Confirmation Options
- **Interactive mode** - Prompts for each branch deletion
- **Dry-run mode** - Shows what would be deleted without action
- **Force mode** - Bulk deletion with safety checks

## Workflow Integration

### Typical Developer Workflow
1. **Create feature branch** - `git checkout -b feature/issue-123-new-feature`
2. **Develop and commit** - Normal development process
3. **Create PR** - Push and create pull request
4. **PR gets merged** - GitHub Action deletes remote branch automatically
5. **Pull main updates** - Post-merge hook cleans up local branch

### Team Workflow
1. **Weekly cleanup** - GitHub Action runs scheduled cleanup
2. **Manual cleanup** - Team members can run cleanup script as needed
3. **Repository maintenance** - Clean, organized branch structure

## Configuration Options

### Global Settings
```bash
# .git/branch-cleanup.config
BRANCH_CLEANUP_ENABLED=true           # Enable/disable automation
AUTO_DELETE_MERGED=true               # Auto-delete merged branches
PRESERVE_RECENT_DAYS=7                # Keep branches modified in last N days
CONFIRM_BEFORE_DELETE=false           # Ask before each deletion
```

### Environment Variables
```bash
export BRANCH_CLEANUP_ENABLED=false   # Disable all automation
export DRY_RUN=true                   # Always run in dry-run mode
export INTERACTIVE=false              # Never prompt for confirmation
```

### GitHub Action Configuration
```yaml
# .github/workflows/branch-cleanup.yml
on:
  schedule:
    - cron: '0 2 * * 0'  # Weekly on Sunday at 2 AM UTC
```

## Troubleshooting

### Hook Not Running
```bash
# Check if hook is installed and executable
ls -la .git/hooks/post-merge
chmod +x .git/hooks/post-merge

# Check configuration
cat .git/branch-cleanup.config
```

### Script Permission Errors
```bash
# Make scripts executable
chmod +x scripts/cleanup-branches.sh
chmod +x setup-branch-cleanup.sh
```

### GitHub CLI Issues
```bash
# Install GitHub CLI
# macOS: brew install gh
# Ubuntu: sudo apt install gh

# Authenticate
gh auth login
```

### Branch Not Deleting
Common reasons:
- Branch is protected
- Branch is not fully merged
- Branch is currently checked out
- No associated merged PR

### GitHub Action Not Running
- Check workflow permissions in repository settings
- Verify GITHUB_TOKEN has necessary permissions
- Check Action logs for error details

## Best Practices

### 1. Regular Cleanup
- Use automated cleanup for consistency
- Run manual cleanup when needed
- Review dry-run output before bulk operations

### 2. Branch Naming
- Follow consistent naming conventions
- Use descriptive branch names
- Include issue numbers for automatic tracking

### 3. PR Workflow
- Always create PRs for feature branches
- Merge (don't just close) PRs when work is complete
- Delete source branch when merging

### 4. Safety First
- Use dry-run mode when uncertain
- Keep backups of important uncommitted work
- Understand what branches will be deleted

## Monitoring and Reporting

### Manual Reports
```bash
# Show current branch status
git branch -a

# Show recently merged branches
gh pr list --state merged --limit 10

# Count branches by type
git branch -r | grep -c "feature/"
```

### Automated Reports
The GitHub Action generates weekly reports including:
- Total branch count
- Feature branch count  
- Old branch identification
- Cleanup statistics

## Advanced Usage

### Custom Branch Patterns
Modify the cleanup script to handle custom branch patterns:
```bash
# Edit scripts/cleanup-branches.sh
# Add custom patterns to PROTECTED_BRANCHES
PROTECTED_BRANCHES="main master preview develop staging production custom-*"
```

### Integration with Other Tools
```bash
# Use with other git hooks
# Add to existing post-merge hook:
source hooks/post-merge-cleanup.sh
```

## Uninstallation

### Remove All Components
```bash
# Remove hooks
rm .git/hooks/post-merge

# Remove configuration
rm .git/branch-cleanup.config

# Disable GitHub Action
# Comment out or delete .github/workflows/branch-cleanup.yml
```

### Selective Removal
```bash
# Disable only automatic cleanup
export BRANCH_CLEANUP_ENABLED=false

# Keep manual cleanup script available
# (scripts/cleanup-branches.sh remains functional)
```

---

*Keeping your repository clean and organized improves developer productivity and reduces confusion about active vs completed work.*