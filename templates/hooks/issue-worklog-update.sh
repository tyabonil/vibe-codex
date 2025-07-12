#!/bin/bash
# vibe-codex issue work log auto-update hook
# Automatically appends commit info to work logs

set -euo pipefail

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
  # Check if auto-update is enabled in config (checking both .vibe-codex.json and .vibe-codex-test.json)
  CONFIG_FILE=".vibe-codex.json"
  if [ -f ".vibe-codex-test.json" ]; then
    CONFIG_FILE=".vibe-codex-test.json"
  fi
  
  AUTO_UPDATE=$(jq -r '.rules."wfl-007".options.auto_update_issue // false' "$CONFIG_FILE" 2>/dev/null)
  INCLUDE_DIFF=$(jq -r '.rules."wfl-007".options.include_diff_stats // true' "$CONFIG_FILE" 2>/dev/null)
  
  if [ "$AUTO_UPDATE" = "true" ]; then
    # Build GitHub comment
    UPDATE="🔄 **Automated Work Log Update**"
    UPDATE+="\n\n**Branch**: \`$BRANCH\`"
    UPDATE+="\n**Commit**: \`$COMMIT_HASH\` - $TIMESTAMP"
    UPDATE+="\n\n**Message**:"
    UPDATE+="\n\`\`\`"
    UPDATE+="\n$COMMIT_MSG"
    UPDATE+="\n\`\`\`"
    
    # Add file changes if configured
    if [ "$INCLUDE_DIFF" = "true" ]; then
      UPDATE+="\n\n**Files Changed**:"
      while IFS=$'\t' read -r status file; do
        case $status in
          A) UPDATE+="\n- 🆕 Added: \`$file\`" ;;
          M) UPDATE+="\n- 📝 Modified: \`$file\`" ;;
          D) UPDATE+="\n- 🗑️ Deleted: \`$file\`" ;;
          R*) UPDATE+="\n- 📋 Renamed: \`$file\`" ;;
        esac
      done < <(git diff-tree --no-commit-id --name-status -r HEAD)
    fi
    
    UPDATE+="\n\n---"
    UPDATE+="\n*This update was generated automatically by vibe-codex WFL-007*"
    
    # Post comment to issue
    if echo -e "$UPDATE" | gh issue comment "$ISSUE_NUM" --body-file - 2>&1; then
      echo "📌 Updated GitHub issue #${ISSUE_NUM}"
    else
      echo "⚠️  Failed to update GitHub issue #${ISSUE_NUM}"
    fi
  fi
fi

exit 0
