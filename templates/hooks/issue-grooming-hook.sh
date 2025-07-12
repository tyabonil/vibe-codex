#!/bin/bash
# vibe-codex issue grooming hook
# Reviews linked/dependent issues and updates holistic plans before work

set -euo pipefail

# Get current branch and extract issue number
BRANCH=$(git branch --show-current)
ISSUE_NUM=$(echo "$BRANCH" | grep -oE '[0-9]+' | head -1)

# Skip if not on an issue branch
if [ -z "$ISSUE_NUM" ]; then
  exit 0
fi

echo "🔍 Grooming issue #${ISSUE_NUM} and checking dependencies..."

# Function to check if gh CLI is available
check_gh_cli() {
  if ! command -v gh &> /dev/null; then
    echo "⚠️  GitHub CLI (gh) not found. Skipping issue grooming."
    exit 0
  fi
}

# Function to extract issue numbers from text
extract_issue_refs() {
  echo "$1" | grep -oE '#[0-9]+' | sed 's/#//' | sort -u
}

# Function to check issue status
check_issue_status() {
  local issue_num=$1
  gh issue view "$issue_num" --json state,title -q '.state + "|" + .title' 2>/dev/null || echo "UNKNOWN|Issue not found"
}

# Function to check project alignment
check_project_alignment() {
  local issue_body="$1"
  local warnings=""
  
  # Check for implementation suggestions that may not align
  if echo "$issue_body" | grep -qi "create.*component\|add.*to.*src/\|implement.*in.*components/"; then
    # Check if they mention our actual structure
    if ! echo "$issue_body" | grep -qi "rules/\|templates/\|hooks/\|registry\.json\|lib/"; then
      warnings+="⚠️  Issue suggests implementation but doesn't reference vibe-codex structure\n"
      warnings+="   (Missing: rules/, templates/, hooks/, registry.json)\n"
    fi
  fi
  
  # Check if external contributor
  ISSUE_AUTHOR=$(gh issue view "$ISSUE_NUM" --json author -q '.author.login' 2>/dev/null || echo "")
  REPO_CONTRIBUTORS=$(gh api repos/:owner/:repo/contributors --jq '.[].login' 2>/dev/null | grep -c "$ISSUE_AUTHOR" || echo "0")
  
  if [ "$REPO_CONTRIBUTORS" -eq "0" ] && [ -n "$ISSUE_AUTHOR" ]; then
    warnings+="👤 External contributor - review for project context\n"
  fi
  
  # Check for missing context about rule system
  if echo "$issue_body" | grep -qi "feature\|enhancement\|add.*functionality"; then
    if ! echo "$issue_body" | grep -qi "rule\|hook\|registry\|config"; then
      warnings+="📚 Feature request may need rule system integration\n"
    fi
  fi
  
  echo -e "$warnings"
}

# Main grooming logic
groom_issues() {
  check_gh_cli
  
  # Get current issue details
  echo "📋 Checking current issue #${ISSUE_NUM}..."
  ISSUE_BODY=$(gh issue view "$ISSUE_NUM" --json body,title -q '.body + " " + .title' 2>/dev/null || echo "")
  
  if [ -z "$ISSUE_BODY" ]; then
    echo "⚠️  Could not retrieve issue #${ISSUE_NUM}"
    exit 0
  fi
  
  # Check project alignment
  ALIGNMENT_WARNINGS=$(check_project_alignment "$ISSUE_BODY")
  if [ -n "$ALIGNMENT_WARNINGS" ]; then
    echo ""
    echo "🎯 PROJECT ALIGNMENT CHECK:"
    echo -e "$ALIGNMENT_WARNINGS"
    NEEDS_CONTEXT_UPDATE=true
  fi
  
  # Extract referenced issues
  REFERENCED_ISSUES=$(extract_issue_refs "$ISSUE_BODY")
  
  if [ -n "$REFERENCED_ISSUES" ]; then
    echo "🔗 Found linked issues:"
    for ref_issue in $REFERENCED_ISSUES; do
      if [ "$ref_issue" != "$ISSUE_NUM" ]; then
        status_info=$(check_issue_status "$ref_issue")
        IFS='|' read -r status title <<< "$status_info"
        echo "   - #${ref_issue}: ${status} - ${title}"
        
        # Check if closed issue has unfinished work
        if [ "$status" = "CLOSED" ]; then
          echo "     ✓ Already completed"
        elif [ "$status" = "OPEN" ]; then
          echo "     ⚠️  Still open - check for dependencies"
          NEEDS_REVIEW=true
        fi
      fi
    done
  fi
  
  # Check for parent/meta issues
  if echo "$ISSUE_BODY" | grep -qi "parent.*#\|meta.*#\|combines.*#\|supersedes.*#"; then
    echo "📊 This appears to be a meta-issue or has parent dependencies"
    NEEDS_REVIEW=true
  fi
  
  # Prompt for review if needed
  if [ "${NEEDS_REVIEW:-false}" = "true" ] || [ "${NEEDS_CONTEXT_UPDATE:-false}" = "true" ]; then
    echo ""
    echo "⚠️  ISSUE GROOMING RECOMMENDED"
    
    if [ "${NEEDS_CONTEXT_UPDATE:-false}" = "true" ]; then
      echo ""
      echo "📝 PROJECT CONTEXT UPDATE NEEDED:"
      echo "   This issue may need alignment with vibe-codex architecture:"
      echo "   - Rules go in /rules/ with registry.json entries"
      echo "   - Hooks go in /templates/hooks/ or /hooks/"
      echo "   - Configuration uses .vibe-codex.json format"
      echo "   - All features should integrate with the rule system"
      echo ""
      echo "   Consider adding a comment to clarify implementation approach"
    fi
    
    if [ "${NEEDS_REVIEW:-false}" = "true" ]; then
      echo ""
      echo "🔗 DEPENDENCY REVIEW NEEDED:"
      echo "   1. Review linked issues for completion status"
      echo "   2. Update the holistic plan if dependencies changed"
      echo "   3. Close completed linked issues"
      echo "   4. Update this issue's description with current state"
    fi
    
    echo ""
    echo "   📌 Actions:"
    echo "   - Run: gh issue view ${ISSUE_NUM} --web"
    echo "   - Review PROJECT-CONTEXT.md for architecture guidelines"
    echo "   - Check rules/registry.json for integration points"
    echo ""
    
    # Show example comment for external issues
    if [ "${NEEDS_CONTEXT_UPDATE:-false}" = "true" ]; then
      echo "   💡 Example clarification comment:"
      echo "   \"\"\""
      echo "   Thanks for the suggestion! To align with vibe-codex architecture:"
      echo "   - This would be implemented as a rule in /rules/[category]/"
      echo "   - Hook script would go in /templates/hooks/"
      echo "   - Users would enable via the checkbox menu (npx vibe-codex config)"
      echo "   - See PROJECT-CONTEXT.md for our architecture approach"
      echo "   \"\"\""
      echo ""
    fi
    
    # Add a delay to ensure developer sees the message
    sleep 5
  else
    echo "✅ No grooming needed - issue aligns with project structure"
  fi
}

# Run grooming
groom_issues

exit 0