#!/bin/bash
# vibe-codex goal alignment check (AI-005)
# Ensures changes serve project goals, not just task completion

set -euo pipefail

# Colors for output
YELLOW='\033[1;33m'
RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m' # No Color

# Get commit message and changed files
COMMIT_MSG=$(git diff --cached --name-only | head -1 2>/dev/null || echo "")
CHANGED_FILES=$(git diff --cached --name-only)
DELETED_FILES=$(git diff --cached --name-only --diff-filter=D)
ADDED_FILES=$(git diff --cached --name-only --diff-filter=A)
MODIFIED_FILES=$(git diff --cached --name-only --diff-filter=M)

# Count changes
NUM_DELETED=$(echo "$DELETED_FILES" | grep -c . || echo 0)
NUM_ADDED=$(echo "$ADDED_FILES" | grep -c . || echo 0)
NUM_MODIFIED=$(echo "$MODIFIED_FILES" | grep -c . || echo 0)
TOTAL_CHANGES=$(git diff --cached --stat | tail -1 | awk '{print $1}' || echo 0)

# Red flags for potential reward hacking
check_reward_hacking() {
    local warnings=""
    
    # Check for deletion without replacement
    if [ "$NUM_DELETED" -gt 0 ] && [ "$NUM_ADDED" -eq 0 ]; then
        warnings+="${YELLOW}⚠️  Deleting files without replacement - ensure functionality is preserved${NC}\n"
    fi
    
    # Check for trivial changes
    if [ "$TOTAL_CHANGES" -lt 10 ] && [ "$NUM_MODIFIED" -gt 3 ]; then
        warnings+="${YELLOW}⚠️  Many files changed but minimal content - avoid busywork${NC}\n"
    fi
    
    # Check for comment-only changes
    local comment_only=true
    if [ -n "$MODIFIED_FILES" ]; then
        while IFS= read -r file; do
            if [ -n "$file" ] && git diff --cached "$file" | grep -v '^[+-]#' | grep -v '^[+-]//' | grep -v '^[+-]\s*\*' | grep -q '^[+-]'; then
                comment_only=false
                break
            fi
        done <<< "$MODIFIED_FILES"
    fi
    
    if [ "$comment_only" = true ] && [ "$NUM_MODIFIED" -gt 0 ]; then
        warnings+="${YELLOW}⚠️  Changes appear to be comments only - ensure substantive value${NC}\n"
    fi
    
    # Check for refactoring without clear benefit
    if git log -1 --pretty=%B | grep -iE "refactor|cleanup|reorganize" > /dev/null; then
        if [ "$TOTAL_CHANGES" -lt 50 ]; then
            warnings+="${YELLOW}⚠️  Small refactoring detected - document the benefit${NC}\n"
        fi
    fi
    
    if [ -n "$warnings" ]; then
        echo -e "\n${YELLOW}🎯 Goal Alignment Check (AI-005)${NC}"
        echo -e "$warnings"
        echo -e "${GREEN}💡 Tips:${NC}"
        echo "  - Every change should add real value"
        echo "  - Document why changes improve the project"
        echo "  - Consider if this advances issue goals"
        echo ""
    fi
}

# Check if we're on an issue branch
BRANCH=$(git branch --show-current)
ISSUE_NUM=$(echo "$BRANCH" | grep -oE '[0-9]+' | head -1)

if [ -n "$ISSUE_NUM" ]; then
    echo -e "${GREEN}✓ Working on issue #${ISSUE_NUM}${NC}"
    
    # Check if work log exists
    if [ -f ".vibe-codex/work-logs/issue-${ISSUE_NUM}-work.md" ]; then
        echo -e "${GREEN}✓ Work log found${NC}"
    else
        echo -e "${YELLOW}💡 Consider creating a work log to track progress${NC}"
    fi
fi

# Run reward hacking checks
check_reward_hacking

exit 0