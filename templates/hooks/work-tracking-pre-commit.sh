#!/bin/bash
# vibe-codex work tracking pre-commit hook
# Checks if work log exists for current issue

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

# Create directory if it doesn't exist
if [ ! -d "$LOG_DIR" ]; then
  mkdir -p "$LOG_DIR"
fi

# Check if work log exists
if [ ! -f "$LOG_FILE" ]; then
  echo "📝 Work Tracking Reminder"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "You're working on issue #${ISSUE_NUM} but no work log exists."
  echo ""
  echo "Consider creating: $LOG_FILE"
  echo "This helps preserve context across AI sessions."
  echo ""
  echo "Example content:"
  echo "  # Issue #${ISSUE_NUM}: [Title]"
  echo "  "
  echo "  ## Session 1 - $(date +%Y-%m-%d)"
  echo "  ### Goal"
  echo "  [What you're trying to accomplish]"
  echo "  "
  echo "  ### Approach"
  echo "  [How you're solving it]"
  echo ""
  echo "To create it now:"
  echo "  echo '# Issue #${ISSUE_NUM}: [Title]' > $LOG_FILE"
  echo "  git add $LOG_FILE"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  
  # Ask if they want to continue
  read -p "Continue without work log? (y/N) " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    exit 1
  fi
else
  # Check if work log is staged or modified
  if git diff --cached --name-only | grep -q "$LOG_FILE"; then
    echo "✅ Work log updated for issue #${ISSUE_NUM}"
  elif git diff --name-only | grep -q "$LOG_FILE"; then
    echo "⚠️  Work log modified but not staged: $LOG_FILE"
    echo "Consider: git add $LOG_FILE"
  fi
fi

exit 0