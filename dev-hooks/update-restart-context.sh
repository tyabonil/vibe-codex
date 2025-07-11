#!/bin/bash
# Update RESTART_CONTEXT.md with current state

CURRENT_BRANCH=$(git branch --show-current)
CURRENT_COMMIT=$(git rev-parse --short HEAD)
TIMESTAMP=$(date -u +"%Y-%m-%d %H:%M:%S UTC")

# Get open PRs if gh CLI available
if command -v gh &> /dev/null; then
  OPEN_PRS=$(gh pr list --state open --json number,title,headRefName  < /dev/null |  jq -r '.[] | "- PR #" + (.number|tostring) + ": " + .title')
else
  OPEN_PRS="- Unable to fetch PRs (gh CLI not available)"
fi

# Create restart context
cat > RESTART_CONTEXT.md << EOF
# RESTART CONTEXT

**Last Updated**: $TIMESTAMP
**Current Branch**: $CURRENT_BRANCH
**Current Commit**: $CURRENT_COMMIT

## Current Work State

### Open Pull Requests
$OPEN_PRS

### Modified Files
$(git diff --name-only HEAD~5..HEAD 2>/dev/null | head -10 | sed 's/^/- /')

### Git Status
$(git status --short)

## Next Steps
1. Review open PRs
2. Continue current work on $CURRENT_BRANCH
3. Check for any blocked tasks

---
*Auto-generated by update-restart-context.sh*
EOF

echo "✅ RESTART_CONTEXT.md updated successfully\!"
