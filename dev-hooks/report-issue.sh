#!/bin/bash
# Report issues with cursor_rules to the repository

echo "📝 Cursor Rules Issue Reporter"
echo "=============================" 

# Check for GitHub CLI
if ! command -v gh &> /dev/null; then
  echo "❌ Error: GitHub CLI (gh) is required"
  echo "Install from: https://cli.github.com/"
  exit 1
fi

# Issue types menu
echo "Select issue type:"
echo "1. False positive (e.g., overly aggressive secret detection)"
echo "2. Rule clarification needed"
echo "3. Rule is blocking legitimate work"
echo "4. Suggested improvement"
echo "5. Bug in rule implementation"
echo ""

read -p "Enter choice (1-5): " ISSUE_TYPE

case $ISSUE_TYPE in
  1) ISSUE_LABEL="false-positive" 
     ISSUE_PREFIX="False Positive: "
     ;;
  2) ISSUE_LABEL="clarification" 
     ISSUE_PREFIX="Clarification: "
     ;;
  3) ISSUE_LABEL="blocking" 
     ISSUE_PREFIX="Blocking Issue: "
     ;;
  4) ISSUE_LABEL="enhancement" 
     ISSUE_PREFIX="Suggestion: "
     ;;
  5) ISSUE_LABEL="bug" 
     ISSUE_PREFIX="Bug: "
     ;;
  *) echo "Invalid choice"; exit 1 ;;
esac

# Get issue details
read -p "Brief issue title: " ISSUE_TITLE
echo ""
echo "Describe the issue (press Enter twice when done):"
ISSUE_BODY=""
while IFS= read -r line; do
  [ -z "$line" ] && break
  ISSUE_BODY="${ISSUE_BODY}${line}\n"
done

# Get context
CURRENT_BRANCH=$(git branch --show-current 2>/dev/null || echo "unknown")
REPO_NAME=$(basename $(git rev-parse --show-toplevel 2>/dev/null) || echo "unknown")

# Create issue body
FULL_BODY=$(cat << EOF
## Issue Description
${ISSUE_BODY}

## Context
- **Repository**: ${REPO_NAME}
- **Branch**: ${CURRENT_BRANCH}
- **Issue Type**: ${ISSUE_LABEL}

## Expected Behavior
<!-- What should happen instead? -->

## Actual Behavior  
<!-- What is currently happening? -->

## Suggested Fix
<!-- Any ideas on how to improve the rule? -->

---
*Reported via cursor-rules issue reporter*
EOF
)

# Create the issue
echo ""
echo "Creating issue in vibe-codex repository..."

gh issue create \
  --repo tyabonil/vibe-codex \
  --title "${ISSUE_PREFIX}${ISSUE_TITLE}" \
  --body "$FULL_BODY" \
  --label "$ISSUE_LABEL"

echo "✅ Issue created successfully!"
