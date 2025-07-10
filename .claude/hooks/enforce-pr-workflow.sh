#!/bin/bash
# Strict PR workflow enforcement hook
# This hook BLOCKS operations until PR workflow is properly followed

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Get current branch
CURRENT_BRANCH=$(git branch --show-current)

echo -e "${BLUE}🔍 Enforcing PR workflow rules...${NC}"

# Function to check PR status
check_pr_status() {
    local pr_number=$1
    
    # Get PR details
    local pr_data=$(gh pr view "$pr_number" --json state,mergeable,mergeStateStatus,reviews,statusCheckRollup,autoMergeRequest 2>/dev/null || echo "{}")
    
    if [ "$pr_data" = "{}" ]; then
        return 1
    fi
    
    local state=$(echo "$pr_data" | jq -r '.state')
    local mergeable=$(echo "$pr_data" | jq -r '.mergeable')
    local merge_state=$(echo "$pr_data" | jq -r '.mergeStateStatus')
    local auto_merge=$(echo "$pr_data" | jq -r '.autoMergeRequest')
    
    echo -e "${BLUE}PR #$pr_number Status:${NC}"
    echo "  State: $state"
    echo "  Mergeable: $mergeable"
    echo "  Merge State: $merge_state"
    echo "  Auto-merge: $([ "$auto_merge" != "null" ] && echo "ENABLED" || echo "DISABLED")"
    
    # Check for failing checks
    local failing_checks=$(echo "$pr_data" | jq -r '.statusCheckRollup[]? | select(.conclusion == "FAILURE" or .status == "FAILURE") | .name' | wc -l)
    if [ "$failing_checks" -gt 0 ]; then
        echo -e "${RED}  ❌ Failing checks detected${NC}"
        return 1
    fi
    
    # Check for requested changes
    local changes_requested=$(echo "$pr_data" | jq -r '.reviews[]? | select(.state == "CHANGES_REQUESTED") | .author.login' | wc -l)
    if [ "$changes_requested" -gt 0 ]; then
        echo -e "${RED}  ❌ Changes requested by reviewers${NC}"
        return 1
    fi
    
    # Enable auto-merge if not already enabled and checks are passing
    if [ "$auto_merge" = "null" ] && [ "$mergeable" = "MERGEABLE" ] && [ "$merge_state" != "BLOCKED" ]; then
        echo -e "${YELLOW}  🔄 Enabling auto-merge...${NC}"
        gh pr merge "$pr_number" --auto --squash 2>/dev/null || true
        echo -e "${GREEN}  ✅ Auto-merge enabled${NC}"
    fi
    
    return 0
}

# Function to find PR for current branch
find_current_pr() {
    gh pr list --head "$CURRENT_BRANCH" --json number --jq '.[0].number' 2>/dev/null || echo ""
}

# Main enforcement logic
main() {
    # Skip if on main or preview branch
    if [[ "$CURRENT_BRANCH" == "main" ]] || [[ "$CURRENT_BRANCH" == "preview" ]]; then
        echo -e "${GREEN}✅ On $CURRENT_BRANCH branch - no PR workflow needed${NC}"
        return 0
    fi
    
    # Check if we're on a feature branch
    if [[ ! "$CURRENT_BRANCH" =~ ^feature/issue-[0-9]+- ]]; then
        echo -e "${YELLOW}⚠️  Not on a feature branch - PR workflow not applicable${NC}"
        return 0
    fi
    
    # Find PR for current branch
    local pr_number=$(find_current_pr)
    
    if [ -z "$pr_number" ]; then
        echo -e "${RED}❌ ERROR: No PR found for branch $CURRENT_BRANCH${NC}"
        echo -e "${YELLOW}Create a PR first before continuing work${NC}"
        return 1
    fi
    
    echo -e "${GREEN}✅ Found PR #$pr_number for current branch${NC}"
    
    # Check PR status and enable auto-merge if appropriate
    if ! check_pr_status "$pr_number"; then
        echo -e "${RED}❌ PR #$pr_number has issues that need to be resolved${NC}"
        echo -e "${YELLOW}Fix the issues above before continuing${NC}"
        return 1
    fi
    
    # Check all open PRs and enable auto-merge where appropriate
    echo -e "\n${BLUE}🔍 Checking all open PRs...${NC}"
    local open_prs=$(gh pr list --state open --json number --jq '.[].number')
    
    for pr in $open_prs; do
        echo -e "\n${BLUE}Checking PR #$pr...${NC}"
        check_pr_status "$pr" || true
    done
    
    echo -e "\n${GREEN}✅ PR workflow check complete${NC}"
    return 0
}

# Run main function
main

# Exit with appropriate code
exit $?