#!/bin/bash
# vibe-codex issue work log auto-update hook
# Automatically appends commit info to work logs

# Get current branch and extract issue number
BRANCH=$(git branch --show-current)
ISSUE_NUM=$(echo "$BRANCH" | grep -oE '[0-9]+' | head -1)

# Skip if not on an issue branch
if [ -z "$ISSUE_NUM" ]; then
  exit 0
fi

# Check for work log
LOG_DIR=".vibe-codex/work-logs"
LOG_FILE="${LOG_DIR}/issue-${ISSUE_NUM}-work.md"

# Only proceed if work log exists
if [ ! -f "$LOG_FILE" ]; then
  exit 0
fi

# Get commit message
COMMIT_MSG=$(git log -1 --pretty=%B)
COMMIT_HASH=$(git rev-parse --short HEAD)
TIMESTAMP=$(date +"%Y-%m-%d %H:%M")

# Check if we need to add a new session header
LAST_DATE=$(grep -E "^## Session .* - [0-9]{4}-[0-9]{2}-[0-9]{2}" "$LOG_FILE" | tail -1 | grep -oE "[0-9]{4}-[0-9]{2}-[0-9]{2}$")
TODAY=$(date +%Y-%m-%d)

# Append to work log
{
  echo ""
  
  # Add new session header if it's a new day
  if [ "$LAST_DATE" != "$TODAY" ]; then
    SESSION_NUM=$(grep -c "^## Session" "$LOG_FILE")
    SESSION_NUM=$((SESSION_NUM + 1))
    echo "## Session $SESSION_NUM - $TODAY"
    echo ""
  fi
  
  echo "### Commit: $COMMIT_HASH - $TIMESTAMP"
  echo "\`\`\`"
  echo "$COMMIT_MSG"
  echo "\`\`\`"
  echo ""
  
  # Add files changed summary
  echo "**Files changed:**"
  git diff-tree --no-commit-id --name-status -r HEAD | while read status file; do
    case $status in
      A) echo "- Added: $file" ;;
      M) echo "- Modified: $file" ;;
      D) echo "- Deleted: $file" ;;
      R*) echo "- Renamed: $file" ;;
    esac
  done
  echo ""
} >> "$LOG_FILE"

echo "📝 Updated work log for issue #${ISSUE_NUM}"

# Also update GitHub issue if configured
if [ -f ".vibe-codex.json" ] && command -v gh &> /dev/null; then
  # Check if auto-update is enabled in config
  AUTO_UPDATE=$(jq -r '.rules."wfl-005".options.auto_update_issue // false' .vibe-codex.json 2>/dev/null)
  
  if [ "$AUTO_UPDATE" = "true" ]; then
    # Create a brief update for the issue
    UPDATE="Progress update - Commit \`$COMMIT_HASH\`: $COMMIT_MSG"
    
    # Post comment to issue
    gh issue comment "$ISSUE_NUM" --body "$UPDATE" 2>/dev/null && \
      echo "📌 Updated GitHub issue #${ISSUE_NUM}"
  fi
fi

exit 0