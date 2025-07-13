#!/bin/bash
set -euo pipefail
# Check PR status and compliance

echo "📊 Checking PR status and compliance..."
echo ""

# Check for gh CLI
if ! command -v gh &> /dev/null; then
  echo "⚠️  GitHub CLI not available, skipping PR checks"
  exit 0
fi

# Get current branch
CURRENT_BRANCH=$(git branch --show-current)
echo "🌿 Current branch: ${CURRENT_BRANCH}"
echo ""

# Get open PRs
echo "🔍 Checking open PRs..."
OPEN_PRS=$(gh pr list --state open --json number,title,headRefName,updatedAt)

# Count PRs
PR_COUNT=$(echo "$OPEN_PRS"  < /dev/null |  jq '. | length')
echo "📈 Open PRs: ${PR_COUNT}"

# Check for stale PRs (>7 days)
SEVEN_DAYS_AGO=$(date -u -d '7 days ago' +%Y-%m-%dT%H:%M:%SZ 2>/dev/null || date -u -v-7d +%Y-%m-%dT%H:%M:%SZ)
STALE_PRS=$(echo "$OPEN_PRS" | jq --arg date "$SEVEN_DAYS_AGO" '[.[] | select(.updatedAt < $date)]')
STALE_COUNT=$(echo "$STALE_PRS" | jq '. | length')

if [ "$STALE_COUNT" -gt 0 ]; then
  echo ""
  echo "⚠️  Found ${STALE_COUNT} stale PRs (>7 days old):"
  echo "$STALE_PRS" | jq -r '.[] | "  - PR #" + (.number|tostring) + ": " + .title + " (branch: " + .headRefName + ")"'
  echo ""
  echo "📌 Recommendation: Close or update stale PRs before creating new ones"
fi

# Check if current branch has a PR
CURRENT_PR=$(echo "$OPEN_PRS" | jq --arg branch "$CURRENT_BRANCH" '.[] | select(.headRefName == $branch)')
if [ -n "$CURRENT_PR" ]; then
  PR_NUMBER=$(echo "$CURRENT_PR" | jq -r '.number')
  echo ""
  echo "✅ Current branch has PR #${PR_NUMBER}"
  
  # Check for compliance violations in comments
  COMMENTS=$(gh pr view "$PR_NUMBER" --json comments -q '.comments[].body' | grep -c "BLOCKED" || true)
  if [ "$COMMENTS" -gt 0 ]; then
    echo "❌ PR #${PR_NUMBER} has compliance violations that need to be fixed"
  fi
fi

echo ""
echo "✅ PR status check complete"

# Exit with error if too many stale PRs
if [ "$STALE_COUNT" -gt 3 ]; then
  echo ""
  echo "❌ Too many stale PRs. Please clean up before proceeding."
  exit 1
fi
