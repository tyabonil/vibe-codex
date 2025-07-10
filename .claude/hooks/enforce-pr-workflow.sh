#!/bin/bash
# Enforce PR workflow rules before push
# Ensures all workflow requirements are met

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔍 Enforcing PR workflow rules...${NC}"

# Function to check if we're in a git repository
check_git_repo() {
    if ! git rev-parse --git-dir > /dev/null 2>&1; then
        echo -e "${RED}❌ Not in a git repository${NC}"
        exit 1
    fi
}

# Function to check branch naming
check_branch_naming() {
    local current_branch=$(git branch --show-current)
    
    # Allow main and preview branches
    if [[ "$current_branch" == "main" ]] || [[ "$current_branch" == "preview" ]]; then
        return 0
    fi
    
    # Check feature branch pattern
    if [[ ! "$current_branch" =~ ^(feature|bugfix|hotfix)/issue-[0-9]+-.*$ ]]; then
        echo -e "${RED}❌ Branch naming violation${NC}"
        echo -e "   Current: $current_branch"
        echo -e "   Expected: feature/issue-{number}-{description}"
        return 1
    fi
    
    echo -e "${GREEN}✓ Branch naming correct: $current_branch${NC}"
    return 0
}

# Function to check for uncommitted changes
check_uncommitted_changes() {
    if ! git diff-index --quiet HEAD --; then
        echo -e "${YELLOW}⚠️  Uncommitted changes detected${NC}"
        echo -e "   Commit or stash changes before pushing"
        return 1
    fi
    return 0
}

# Function to check PR exists
check_pr_exists() {
    if ! command -v gh &> /dev/null; then
        echo -e "${YELLOW}⚠️  GitHub CLI not available, skipping PR checks${NC}"
        return 0
    fi
    
    local current_branch=$(git branch --show-current)
    local pr_number=$(gh pr list --head "$current_branch" --json number --jq '.[0].number' 2>/dev/null || echo "")
    
    if [ -z "$pr_number" ]; then
        echo -e "${YELLOW}⚠️  No PR found for branch: $current_branch${NC}"
        echo -e "   Create a PR first: gh pr create"
        return 1
    fi
    
    echo -e "${GREEN}✓ PR #$pr_number exists for branch${NC}"
    
    # Check PR status
    check_pr_status "$pr_number"
    return $?
}

# Function to check PR status
check_pr_status() {
    local pr_number=$1
    local violations=0
    
    # Get PR data
    local pr_data=$(gh pr view "$pr_number" --json isDraft,mergeable,reviews,comments 2>/dev/null || echo "{}")
    
    if [ "$pr_data" == "{}" ]; then
        echo -e "${RED}❌ Failed to fetch PR data${NC}"
        return 1
    fi
    
    # Check if PR is draft
    local is_draft=$(echo "$pr_data" | jq -r '.isDraft')
    if [ "$is_draft" == "true" ]; then
        echo -e "${YELLOW}⚠️  PR is still in draft mode${NC}"
        violations=$((violations + 1))
    fi
    
    # Check for unresolved comments
    local comment_count=$(echo "$pr_data" | jq '.comments | length')
    if [ "$comment_count" -gt 0 ]; then
        echo -e "${YELLOW}⚠️  PR has $comment_count comments - ensure all are addressed${NC}"
    fi
    
    # Check mergeable status
    local mergeable=$(echo "$pr_data" | jq -r '.mergeable')
    if [ "$mergeable" == "CONFLICTING" ]; then
        echo -e "${RED}❌ PR has merge conflicts${NC}"
        violations=$((violations + 1))
    fi
    
    return $violations
}

# Function to check issue reference
check_issue_reference() {
    local current_branch=$(git branch --show-current)
    
    # Extract issue number from branch name
    if [[ "$current_branch" =~ issue-([0-9]+) ]]; then
        local issue_number="${BASH_REMATCH[1]}"
        echo -e "${GREEN}✓ Issue reference found: #$issue_number${NC}"
        
        # Check if issue exists and is open
        if command -v gh &> /dev/null; then
            local issue_state=$(gh issue view "$issue_number" --json state --jq '.state' 2>/dev/null || echo "")
            
            if [ -z "$issue_state" ]; then
                echo -e "${YELLOW}⚠️  Could not verify issue #$issue_number${NC}"
            elif [ "$issue_state" != "OPEN" ]; then
                echo -e "${YELLOW}⚠️  Issue #$issue_number is $issue_state${NC}"
            else
                echo -e "${GREEN}✓ Issue #$issue_number is OPEN${NC}"
            fi
        fi
        
        return 0
    else
        echo -e "${RED}❌ No issue reference in branch name${NC}"
        return 1
    fi
}

# Main enforcement logic
main() {
    local total_violations=0
    
    echo -e "${BLUE}==== PR Workflow Enforcement ====${NC}"
    
    # Run all checks
    check_git_repo || exit 1
    
    check_branch_naming || total_violations=$((total_violations + 1))
    check_uncommitted_changes || total_violations=$((total_violations + 1))
    check_issue_reference || total_violations=$((total_violations + 1))
    check_pr_exists || total_violations=$((total_violations + 1))
    
    echo -e "${BLUE}=================================${NC}"
    
    # Summary
    if [ $total_violations -eq 0 ]; then
        echo -e "${GREEN}✅ All workflow rules passed!${NC}"
        exit 0
    else
        echo -e "${RED}❌ Found $total_violations workflow violations${NC}"
        echo -e "${YELLOW}Fix the issues above before pushing${NC}"
        echo -e "${YELLOW}Or use 'git push --no-verify' to skip checks${NC}"
        exit 1
    fi
}

# Run main function
main