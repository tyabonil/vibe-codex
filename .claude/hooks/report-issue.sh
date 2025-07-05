#!/bin/bash

# Interactive issue reporter for cursor_rules feedback
# Helps users report issues with rules directly from their repository

echo "🚨 Cursor Rules Issue Reporter"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Get repository context
CURRENT_REPO=$(git config --get remote.origin.url | sed 's/.*github.com[:/]\(.*\)\.git/\1/' 2>/dev/null || echo "unknown")
CURRENT_BRANCH=$(git branch --show-current 2>/dev/null || echo "unknown")

echo "📍 Reporting from: $CURRENT_REPO (branch: $CURRENT_BRANCH)"
echo ""

# Issue type selection
echo "Select issue type:"
echo "1) False positive - Rule triggered incorrectly"
echo "2) Blocking issue - Can't proceed with legitimate work"
echo "3) Rule clarity - Need clarification"
echo "4) Feature request - Suggest improvement"
echo "5) Other"
echo ""
read -p "Enter choice (1-5): " ISSUE_TYPE

case $ISSUE_TYPE in
    1) ISSUE_LABEL="false-positive" 
       ISSUE_TITLE="False positive in rule detection"
       ;;
    2) ISSUE_LABEL="blocking" 
       ISSUE_TITLE="Rule blocking legitimate work"
       ;;
    3) ISSUE_LABEL="documentation" 
       ISSUE_TITLE="Rule clarification needed"
       ;;
    4) ISSUE_LABEL="enhancement" 
       ISSUE_TITLE="Feature request"
       ;;
    *) ISSUE_LABEL="bug" 
       ISSUE_TITLE="Issue with cursor_rules"
       ;;
esac

# Get affected rule
echo ""
echo "Which rule/component is affected?"
echo "1) Secret detection"
echo "2) Workflow compliance"
echo "3) Test coverage"
echo "4) PR/Issue management"
echo "5) Git hooks"
echo "6) Other/Multiple"
echo ""
read -p "Enter choice (1-6): " RULE_AFFECTED

case $RULE_AFFECTED in
    1) RULE_NAME="Secret detection" ;;
    2) RULE_NAME="Workflow compliance" ;;
    3) RULE_NAME="Test coverage" ;;
    4) RULE_NAME="PR/Issue management" ;;
    5) RULE_NAME="Git hooks" ;;
    *) RULE_NAME="General" ;;
esac

# Get issue description
echo ""
echo "Describe the issue (press Enter twice when done):"
DESCRIPTION=""
while IFS= read -r line; do
    [ -z "$line" ] && break
    DESCRIPTION="${DESCRIPTION}${line}\n"
done

# Get reproduction steps
echo ""
echo "Steps to reproduce (optional, press Enter twice to skip):"
REPRO_STEPS=""
while IFS= read -r line; do
    [ -z "$line" ] && break
    REPRO_STEPS="${REPRO_STEPS}${line}\n"
done

# Build issue body
ISSUE_BODY="## Issue Type
${ISSUE_LABEL}

## Affected Component
${RULE_NAME}

## Description
${DESCRIPTION}

## Context
- Repository: ${CURRENT_REPO}
- Branch: ${CURRENT_BRANCH}
- Date: $(date)

## Steps to Reproduce
${REPRO_STEPS:-N/A}

## Expected Behavior
[What should happen]

## Actual Behavior
[What actually happens]

## Workaround
[Any temporary solution you're using]

---
*Reported via cursor_rules issue reporter*"

# Create the issue
echo ""
echo "📝 Creating issue in tyabonil/cursor_rules..."
echo ""

CREATED_ISSUE=$(gh issue create \
    --repo tyabonil/cursor_rules \
    --title "${ISSUE_TITLE}: ${RULE_NAME}" \
    --body "$ISSUE_BODY" \
    --label "$ISSUE_LABEL" 2>&1)

if [ $? -eq 0 ]; then
    echo "✅ Issue created successfully!"
    echo "$CREATED_ISSUE"
    echo ""
    echo "Thank you for helping improve cursor_rules!"
else
    echo "❌ Failed to create issue"
    echo "$CREATED_ISSUE"
    echo ""
    echo "You can create it manually at:"
    echo "https://github.com/tyabonil/cursor_rules/issues/new"
fi