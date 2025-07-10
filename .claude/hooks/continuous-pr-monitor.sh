#!/bin/bash
# Continuous PR monitoring and auto-merge enablement
# This hook should be run periodically to ensure PRs are progressing

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m'

echo -e "${PURPLE}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${PURPLE}           PR Workflow Monitoring & Enforcement                 ${NC}"
echo -e "${PURPLE}═══════════════════════════════════════════════════════════════${NC}"

# Function to check and fix PR issues
check_and_fix_pr() {
    local pr_number=$1
    local pr_data=$(gh pr view "$pr_number" --json title,state,mergeable,mergeStateStatus,statusCheckRollup,author,headRefName 2>/dev/null)
    
    if [ -z "$pr_data" ]; then
        return 1
    fi
    
    local title=$(echo "$pr_data" | jq -r '.title')
    local state=$(echo "$pr_data" | jq -r '.state')
    local mergeable=$(echo "$pr_data" | jq -r '.mergeable')
    local merge_state=$(echo "$pr_data" | jq -r '.mergeStateStatus')
    local branch=$(echo "$pr_data" | jq -r '.headRefName')
    
    echo -e "\n${BLUE}📋 PR #$pr_number: $title${NC}"
    echo -e "   Branch: $branch"
    echo -e "   State: $state | Mergeable: $mergeable | Merge State: $merge_state"
    
    # Check for specific issues and provide solutions
    if [ "$mergeable" = "CONFLICTING" ]; then
        echo -e "   ${RED}❌ MERGE CONFLICTS DETECTED${NC}"
        echo -e "   ${YELLOW}Action Required:${NC}"
        echo -e "   1. Checkout the branch: git checkout $branch"
        echo -e "   2. Update from base: git pull origin preview"
        echo -e "   3. Resolve conflicts and commit"
        echo -e "   4. Push changes"
        return 1
    fi
    
    # Check for failing checks
    local failing_checks=$(echo "$pr_data" | jq -r '.statusCheckRollup[]? | select(.conclusion == "FAILURE" or .state == "FAILURE") | {name: .name, conclusion: .conclusion}')
    if [ -n "$failing_checks" ]; then
        echo -e "   ${RED}❌ FAILING CHECKS:${NC}"
        echo "$failing_checks" | jq -r '"     - \(.name): \(.conclusion)"'
        
        # Check if it's just Review Bots (non-blocking)
        local critical_failures=$(echo "$failing_checks" | jq -r 'select(.name != "Review Bots Analysis") | .name' | wc -l)
        if [ "$critical_failures" -eq 0 ]; then
            echo -e "   ${YELLOW}ℹ️  Only Review Bots failing (non-blocking)${NC}"
        else
            echo -e "   ${YELLOW}Action Required: Fix failing checks${NC}"
            return 1
        fi
    fi
    
    # Check if auto-merge can be enabled
    if [ "$state" = "OPEN" ] && [ "$mergeable" = "MERGEABLE" ]; then
        echo -e "   ${GREEN}✅ PR is mergeable${NC}"
        
        # Check if auto-merge is already enabled
        local auto_merge_check=$(gh pr view "$pr_number" --json autoMergeRequest --jq '.autoMergeRequest' 2>/dev/null || echo "null")
        
        if [ "$auto_merge_check" = "null" ]; then
            echo -e "   ${YELLOW}🔄 Enabling auto-merge...${NC}"
            if gh pr merge "$pr_number" --auto --squash 2>/dev/null; then
                echo -e "   ${GREEN}✅ Auto-merge enabled successfully${NC}"
            else
                echo -e "   ${YELLOW}⚠️  Could not enable auto-merge (may need approvals)${NC}"
            fi
        else
            echo -e "   ${GREEN}✅ Auto-merge already enabled${NC}"
        fi
    fi
    
    return 0
}

# Function to create action items
create_action_items() {
    local has_issues=$1
    
    if [ "$has_issues" = true ]; then
        echo -e "\n${YELLOW}📝 ACTION ITEMS:${NC}"
        echo -e "${YELLOW}────────────────────────────────────────────────${NC}"
        
        # Check each PR for specific actions needed
        local open_prs=$(gh pr list --state open --json number --jq '.[].number')
        for pr in $open_prs; do
            local pr_data=$(gh pr view "$pr" --json title,mergeable,statusCheckRollup 2>/dev/null)
            local title=$(echo "$pr_data" | jq -r '.title')
            local mergeable=$(echo "$pr_data" | jq -r '.mergeable')
            
            if [ "$mergeable" = "CONFLICTING" ]; then
                echo -e "• PR #$pr: ${RED}Resolve merge conflicts${NC}"
            fi
            
            local failing_critical=$(echo "$pr_data" | jq -r '.statusCheckRollup[]? | select(.conclusion == "FAILURE" and .name != "Review Bots Analysis") | .name' | wc -l)
            if [ "$failing_critical" -gt 0 ]; then
                echo -e "• PR #$pr: ${RED}Fix failing checks${NC}"
            fi
        done
    fi
}

# Main monitoring logic
main() {
    local has_issues=false
    local total_prs=0
    local ready_prs=0
    
    # Get all open PRs
    local open_prs=$(gh pr list --state open --json number --jq '.[].number')
    
    if [ -z "$open_prs" ]; then
        echo -e "${GREEN}✅ No open PRs to monitor${NC}"
        return 0
    fi
    
    # Check each PR
    for pr in $open_prs; do
        ((total_prs++))
        if check_and_fix_pr "$pr"; then
            ((ready_prs++))
        else
            has_issues=true
        fi
    done
    
    # Summary
    echo -e "\n${PURPLE}═══════════════════════════════════════════════════════════════${NC}"
    echo -e "${BLUE}📊 SUMMARY:${NC}"
    echo -e "   Total Open PRs: $total_prs"
    echo -e "   Ready for Merge: $ready_prs"
    echo -e "   Need Attention: $((total_prs - ready_prs))"
    
    # Create action items if needed
    create_action_items $has_issues
    
    # Set up periodic check reminder
    echo -e "\n${BLUE}⏰ Next Steps:${NC}"
    echo -e "   • Fix any issues identified above"
    echo -e "   • This check will run automatically on git operations"
    echo -e "   • Run manually: ${YELLOW}./.claude/hooks/continuous-pr-monitor.sh${NC}"
    
    echo -e "${PURPLE}═══════════════════════════════════════════════════════════════${NC}"
    
    return 0
}

# Run main function
main

# Always exit 0 to not block operations, just inform
exit 0