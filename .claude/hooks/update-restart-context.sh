#!/bin/bash

# Update RESTART_CONTEXT.md with current work state
# Run this when context usage is high to preserve continuity

echo "📝 Updating RESTART_CONTEXT.md"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check if we're in a git repository
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo "❌ Not in a git repository"
    exit 1
fi

RESTART_FILE=".claude/context/RESTART_CONTEXT.md"
mkdir -p .claude/context

# Get current state
CURRENT_BRANCH=$(git branch --show-current)
MODIFIED_FILES=$(git status --porcelain | wc -l)
STAGED_FILES=$(git diff --cached --name-only)
OPEN_PRS=$(gh pr list --state open 2>/dev/null || echo "Unable to fetch PRs")

# Create RESTART_CONTEXT.md
cat > "$RESTART_FILE" << EOF
# RESTART CONTEXT

Generated on: $(date)

## Current Work State

### Branch Information
- Current branch: \`$CURRENT_BRANCH\`
- Modified files: $MODIFIED_FILES

### Git Status
\`\`\`
$(git status --short)
\`\`\`

### Recent Commits
\`\`\`
$(git log --oneline -10)
\`\`\`

### Open Pull Requests
\`\`\`
$OPEN_PRS
\`\`\`

### Staged Files
$(if [ -n "$STAGED_FILES" ]; then
    echo "\`\`\`"
    echo "$STAGED_FILES"
    echo "\`\`\`"
else
    echo "No files staged"
fi)

## Quick Resume Commands

\`\`\`bash
# Switch to working branch
git checkout $CURRENT_BRANCH

# Check status
git status

# View open PRs
gh pr list --state open

# Continue work on current issue
# TODO: Add specific commands based on current work
\`\`\`

## Context Notes

Add any important context here before switching sessions:
- Current task:
- Blocking issues:
- Next steps:
EOF

echo "✅ RESTART_CONTEXT.md updated at: $RESTART_FILE"
echo ""
echo "📋 Current state captured:"
echo "   - Branch: $CURRENT_BRANCH"
echo "   - Modified files: $MODIFIED_FILES"
echo "   - Open PRs: $(echo "$OPEN_PRS" | grep -c "OPEN" || echo "0")"
echo ""
echo "💡 Remember to add specific notes about your current task!"