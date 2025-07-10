#!/bin/bash

# Claude Hook: PR Follow-up Reminder
# Ensures checking back on PRs after creation and moving to next issue

set -euo pipefail

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to check recent PRs
check_recent_prs() {
    echo -e "${BLUE}🔍 Checking recent PRs...${NC}"
    
    # Get PRs created in last hour
    local recent_prs=$(gh pr list --author "@me" --json number,title,state,createdAt,url -q '.[] | select(.createdAt > (now - 3600 | strftime("%Y-%m-%dT%H:%M:%SZ"))) | "\(.number) - \(.title) [\(.state)]"' 2>/dev/null || echo "")
    
    if [ -n "$recent_prs" ]; then
        echo -e "${YELLOW}📋 Recently created PRs (last hour):${NC}"
        echo "$recent_prs" | while read -r pr; do
            echo "  • PR #$pr"
        done
        echo -e "${RED}⚠️ Remember to check these PRs for:${NC}"
        echo "  - Review comments"
        echo "  - CI/CD status"
        echo "  - Merge conflicts"
        echo "  - Approval status"
    fi
}

# Function to check open PRs status
check_pr_status() {
    echo -e "${BLUE}📊 Checking all open PRs...${NC}"
    
    local open_prs=$(gh pr list --author "@me" --state open --json number,title,isDraft,reviewDecision,statusCheckRollup -q '.[] | "\(.number) - \(.title) [Draft: \(.isDraft), Review: \(.reviewDecision // "PENDING"), Checks: \(.statusCheckRollup[0].state // "UNKNOWN")]"' 2>/dev/null || echo "")
    
    if [ -n "$open_prs" ]; then
        echo -e "${YELLOW}📂 Open PRs status:${NC}"
        echo "$open_prs" | while read -r pr; do
            echo "  • PR #$pr"
        done
    fi
}

# Function to suggest next actions
suggest_next_actions() {
    echo -e "\n${BLUE}💡 Suggested actions:${NC}"
    
    # Check if any PRs need attention
    local prs_needing_attention=$(gh pr list --author "@me" --state open --json number,reviewDecision -q '.[] | select(.reviewDecision == "CHANGES_REQUESTED") | .number' 2>/dev/null || echo "")
    
    if [ -n "$prs_needing_attention" ]; then
        echo -e "${RED}1. Address review comments on PRs: $prs_needing_attention${NC}"
    fi
    
    # Check for PRs ready to merge
    local approved_prs=$(gh pr list --author "@me" --state open --json number,reviewDecision,mergeable -q '.[] | select(.reviewDecision == "APPROVED" and .mergeable == "MERGEABLE") | .number' 2>/dev/null || echo "")
    
    if [ -n "$approved_prs" ]; then
        echo -e "${GREEN}2. Ready to merge PRs: $approved_prs${NC}"
    fi
    
    # Suggest moving to next issue
    echo -e "${BLUE}3. Continue with next issue in the roadmap${NC}"
}

# Function to check roadmap progress
check_roadmap_progress() {
    # Check if we're working on issue #220 (roadmap)
    if [ -f ".claude/current-roadmap.txt" ]; then
        echo -e "\n${BLUE}📍 Current roadmap progress:${NC}"
        cat .claude/current-roadmap.txt 2>/dev/null || echo "No roadmap file found"
    fi
}

# Main execution
case "${1:-check}" in
    "after-pr")
        echo -e "${GREEN}🎯 PR Created - Running follow-up checks${NC}"
        echo ""
        check_recent_prs
        echo ""
        check_pr_status
        echo ""
        suggest_next_actions
        echo ""
        check_roadmap_progress
        echo ""
        echo -e "${YELLOW}📌 IMPORTANT: Before moving to next issue:${NC}"
        echo "  1. Ensure PR has no immediate CI failures"
        echo "  2. Self-review your PR"
        echo "  3. Update the associated issue"
        echo "  4. Check if any other PRs need attention"
        echo ""
        
        # Create a reminder file
        echo "$(date): PR created, remember to check back" >> .claude/pr-reminders.log
        ;;
        
    "check")
        check_pr_status
        echo ""
        suggest_next_actions
        ;;
        
    "roadmap")
        check_roadmap_progress
        ;;
        
    *)
        echo "Usage: $0 [after-pr|check|roadmap]"
        exit 1
        ;;
esac

# Add reminder to git post-commit hook if not already there
if [ "${1:-}" = "after-pr" ] && [ -d ".git/hooks" ]; then
    HOOK_FILE=".git/hooks/post-commit"
    HOOK_LINE="# Check PR status after commits"
    
    if ! grep -q "$HOOK_LINE" "$HOOK_FILE" 2>/dev/null; then
        echo -e "\n$HOOK_LINE\n.claude/hooks/pr-follow-up.sh check" >> "$HOOK_FILE"
        chmod +x "$HOOK_FILE"
        echo -e "${GREEN}✅ Added PR check to post-commit hook${NC}"
    fi
fi