#!/bin/bash
# Work Tracking Check Hook
# Reminds developers to update work tracking files for issues

# Get current branch name
branch=$(git branch --show-current)

# Check if on issue branch
if [[ "$branch" =~ issue-([0-9]+) ]]; then
  issue_num="${BASH_REMATCH[1]}"
  
  # Look for work log file
  work_log=$(find .vibe-codex/work-logs -name "issue-${issue_num}-*.md" 2>/dev/null | head -1)
  
  if [ -z "$work_log" ]; then
    echo "⚠️  No work tracking file found for issue #${issue_num}"
    echo "   Create one with: vibe-codex track-issue ${issue_num}"
    echo "   Or manually create: .vibe-codex/work-logs/issue-${issue_num}-description.md"
    echo ""
    echo "   Work tracking helps preserve context across sessions."
    # Don't block commit, just warn
  elif [ -f "$work_log" ]; then
    # Check if file is stale (modified more than 1 day ago)
    if [ $(find "$work_log" -mtime +1 2>/dev/null) ]; then
      echo "⚠️  Work tracking file is stale (>1 day old): $work_log"
      echo "   Consider updating it with recent progress."
    fi
  fi
fi

exit 0