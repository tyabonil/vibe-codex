#!/bin/bash
# Continuous PR monitoring script
# Monitors PR status and enables auto-merge when ready

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔍 Monitoring PR status...${NC}"

# Check if gh CLI is available
if ! command -v gh &> /dev/null; then
    echo -e "${YELLOW}⚠️  GitHub CLI (gh) not found. Skipping PR monitoring.${NC}"
    exit 0
fi

# Get current branch
current_branch=$(git branch --show-current)

# Skip if on main or preview
if [[ "$current_branch" == "main" ]] || [[ "$current_branch" == "preview" ]]; then
    exit 0
fi

# Check if PR exists for current branch
pr_number=$(gh pr list --head "$current_branch" --json number --jq '.[0].number' 2>/dev/null || echo "")

if [ -z "$pr_number" ]; then
    echo -e "${YELLOW}ℹ️  No PR found for branch: $current_branch${NC}"
    exit 0
fi

echo -e "${GREEN}✓ Found PR #$pr_number for branch: $current_branch${NC}"

# Check PR status
pr_data=$(gh pr view "$pr_number" --json state,mergeable,mergeStateStatus,reviews,statusCheckRollup 2>/dev/null || echo "{}")

if [ "$pr_data" == "{}" ]; then
    echo -e "${RED}❌ Failed to fetch PR data${NC}"
    exit 1
fi

state=$(echo "$pr_data" | jq -r '.state')
mergeable=$(echo "$pr_data" | jq -r '.mergeable')
merge_state=$(echo "$pr_data" | jq -r '.mergeStateStatus')

echo -e "${BLUE}📊 PR Status:${NC}"
echo -e "   State: $state"
echo -e "   Mergeable: $mergeable"
echo -e "   Merge State: $merge_state"

# Check for required actions
if [ "$state" == "OPEN" ]; then
    # Check for review approval
    approved=$(echo "$pr_data" | jq -r '.reviews[] | select(.state == "APPROVED") | .state' | head -1)
    
    if [ -z "$approved" ]; then
        echo -e "${YELLOW}⚠️  PR needs review approval${NC}"
        echo -e "   Run: gh pr review $pr_number --approve"
    fi
    
    # Check status checks
    checks_status=$(echo "$pr_data" | jq -r '.statusCheckRollup[] | select(.conclusion != "SUCCESS") | .name' 2>/dev/null)
    
    if [ -n "$checks_status" ]; then
        echo -e "${YELLOW}⚠️  Some checks are not passing:${NC}"
        echo "$checks_status" | while read -r check; do
            echo -e "   ❌ $check"
        done
    fi
    
    # Enable auto-merge if ready
    if [ "$mergeable" == "MERGEABLE" ] && [ "$merge_state" == "CLEAN" ]; then
        echo -e "${GREEN}✅ PR is ready to merge!${NC}"
        
        # Check if auto-merge is already enabled
        auto_merge=$(gh pr view "$pr_number" --json autoMergeRequest --jq '.autoMergeRequest' 2>/dev/null || echo "null")
        
        if [ "$auto_merge" == "null" ]; then
            echo -e "${BLUE}🔄 Enabling auto-merge...${NC}"
            gh pr merge "$pr_number" --auto --squash 2>/dev/null || echo -e "${YELLOW}⚠️  Could not enable auto-merge (may need branch protection)${NC}"
        else
            echo -e "${GREEN}✓ Auto-merge already enabled${NC}"
        fi
    fi
fi

# Log PR monitoring to remind file
echo "[$(date '+%Y-%m-%d %H:%M:%S')] Monitored PR #$pr_number on branch $current_branch" >> .claude/pr-reminders.log