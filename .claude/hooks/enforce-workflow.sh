#!/bin/bash

# Claude Hook: Enforce vibe-codex workflow rules
# Ensures strict adherence to git hygiene and issue-based development

set -euo pipefail

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to check current branch
check_branch() {
    local current_branch=$(git branch --show-current)
    
    # Check if we're on a feature branch
    if [[ ! "$current_branch" =~ ^feature/issue-[0-9]+-.*$ ]] && [[ "$current_branch" != "preview" ]] && [[ "$current_branch" != "main" ]]; then
        echo -e "${RED}❌ ERROR: Not on a properly named feature branch${NC}"
        echo -e "${YELLOW}Current branch: $current_branch${NC}"
        echo -e "${BLUE}Expected format: feature/issue-{number}-{description}${NC}"
        return 1
    fi
    
    # Extract issue number if on feature branch
    if [[ "$current_branch" =~ ^feature/issue-([0-9]+)-.*$ ]]; then
        echo -e "${GREEN}✅ Working on issue #${BASH_REMATCH[1]}${NC}"
        export CURRENT_ISSUE="${BASH_REMATCH[1]}"
    fi
}

# Function to check if issue is open
check_issue_status() {
    if [ -z "${CURRENT_ISSUE:-}" ]; then
        return 0
    fi
    
    local issue_state=$(gh issue view "$CURRENT_ISSUE" --json state -q .state 2>/dev/null || echo "")
    
    if [ "$issue_state" != "OPEN" ]; then
        echo -e "${RED}❌ WARNING: Issue #$CURRENT_ISSUE is not open (state: $issue_state)${NC}"
        echo -e "${YELLOW}Make sure to work on open issues only${NC}"
        return 1
    fi
}

# Function to check for uncommitted changes
check_uncommitted() {
    if [ -n "$(git status --porcelain)" ]; then
        echo -e "${YELLOW}⚠️ You have uncommitted changes${NC}"
        git status --short
        echo -e "${BLUE}Commit or stash changes before switching tasks${NC}"
    fi
}

# Function to check PR status
check_pr_status() {
    if [ -z "${CURRENT_ISSUE:-}" ]; then
        return 0
    fi
    
    local pr_count=$(gh pr list --head "$(git branch --show-current)" --json number -q '. | length' 2>/dev/null || echo "0")
    
    if [ "$pr_count" -eq "0" ]; then
        echo -e "${YELLOW}📝 No PR exists for this branch yet${NC}"
        echo -e "${BLUE}Create PR with: gh pr create --base preview${NC}"
    else
        local pr_number=$(gh pr list --head "$(git branch --show-current)" --json number -q '.[0].number' 2>/dev/null)
        echo -e "${GREEN}✅ PR #$pr_number exists for this branch${NC}"
        
        # Check for review comments
        local comment_count=$(gh pr view "$pr_number" --json comments -q '.comments | length' 2>/dev/null || echo "0")
        if [ "$comment_count" -gt "0" ]; then
            echo -e "${YELLOW}💬 PR has $comment_count comments - review them!${NC}"
        fi
    fi
}

# Function to remind about issue updates
remind_issue_update() {
    if [ -z "${CURRENT_ISSUE:-}" ]; then
        return 0
    fi
    
    echo -e "${BLUE}📋 Remember to update issue #$CURRENT_ISSUE:${NC}"
    echo "  - Post progress updates"
    echo "  - Document blockers"
    echo "  - Update when creating PR"
    echo "  - Close when merged to preview"
}

# Function to check workflow compliance
check_workflow() {
    echo -e "${BLUE}🔍 Checking vibe-codex workflow compliance...${NC}"
    echo ""
    
    # Check branch
    if ! check_branch; then
        echo -e "${RED}Create a proper feature branch first:${NC}"
        echo -e "  git checkout -b feature/issue-XXX-description"
        return 1
    fi
    
    # Check issue status
    check_issue_status
    
    # Check uncommitted changes
    check_uncommitted
    
    # Check PR status
    check_pr_status
    
    # Remind about updates
    remind_issue_update
    
    echo ""
    echo -e "${BLUE}📚 Workflow Rules:${NC}"
    echo "1. Create/identify issue first"
    echo "2. Create feature branch: feature/issue-XXX-description"
    echo "3. Make changes and commit with issue reference"
    echo "4. Create PR to preview branch"
    echo "5. Address all review comments"
    echo "6. Update and close issue when merged"
    echo ""
}

# Main execution
case "${1:-check}" in
    "check")
        check_workflow
        ;;
    "pre-commit")
        if ! check_branch; then
            exit 1
        fi
        ;;
    "pre-push")
        if ! check_branch; then
            exit 1
        fi
        check_pr_status
        ;;
    *)
        echo "Usage: $0 [check|pre-commit|pre-push]"
        exit 1
        ;;
esac