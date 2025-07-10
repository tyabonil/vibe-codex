#!/bin/bash

# Issue Reminder Pre-push Hook
# Reminds developers about PR creation and issue linking requirements

set -e

# Colors for output
RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
REMINDER_ENABLED=${ISSUE_REMINDER_ENABLED:-true}

echo "🚀 Checking pre-push issue and PR requirements..."

# Function to extract issue number from branch name
get_issue_number() {
    local branch_name=$(git symbolic-ref --short HEAD 2>/dev/null || echo "")
    
    if [[ $branch_name =~ ^feature/issue-([0-9]+)- ]]; then
        echo "${BASH_REMATCH[1]}"
    elif [[ $branch_name =~ ^bugfix/issue-([0-9]+)- ]]; then
        echo "${BASH_REMATCH[1]}"
    elif [[ $branch_name =~ ^hotfix/issue-([0-9]+)- ]]; then
        echo "${BASH_REMATCH[1]}"
    else
        echo ""
    fi
}

# Function to check if PR exists for current branch
check_pr_exists() {
    local branch_name=$(git symbolic-ref --short HEAD 2>/dev/null || echo "")
    
    if [ -z "$branch_name" ]; then
        return 1
    fi
    
    # Check if gh CLI is available and authenticated
    if ! command -v gh >/dev/null 2>&1; then
        return 0  # Assume PR exists if we can't check
    fi
    
    if ! gh auth status >/dev/null 2>&1; then
        return 0  # Assume PR exists if we can't check
    fi
    
    # Check for existing PR with this head branch
    local pr_info=$(gh pr list --head "$branch_name" --json number,title,url 2>/dev/null || echo "[]")
    
    if [ "$pr_info" = "[]" ] || [ -z "$pr_info" ]; then
        return 1  # No PR found
    else
        echo "$pr_info"
        return 0  # PR exists
    fi
}

# Function to check if issue has PR link
issue_has_pr_link() {
    local issue_number=$1
    
    if [ -z "$issue_number" ]; then
        return 1
    fi
    
    # Check if gh CLI is available and authenticated
    if ! command -v gh >/dev/null 2>&1; then
        return 0  # Assume link exists if we can't check
    fi
    
    if ! gh auth status >/dev/null 2>&1; then
        return 0  # Assume link exists if we can't check
    fi
    
    # Check for PR links in issue comments
    local pr_links=$(gh issue view "$issue_number" --json comments --jq '.comments[] | select(.body | test("pull/[0-9]+|PR #[0-9]+"; "i")) | .body' 2>/dev/null || echo "")
    
    if [ -n "$pr_links" ]; then
        return 0  # PR link found
    else
        return 1  # No PR link found
    fi
}

# Function to get commits that will be pushed
get_commits_to_push() {
    local branch_name=$(git symbolic-ref --short HEAD 2>/dev/null || echo "")
    local remote_branch="origin/$branch_name"
    
    # Check if remote branch exists
    if git ls-remote --heads origin "$branch_name" | grep -q "$branch_name"; then
        # Remote branch exists, show commits ahead
        git rev-list --count "origin/$branch_name..HEAD" 2>/dev/null || echo "0"
    else
        # New branch, count all commits ahead of base branch
        local base_branch="main"
        
        # Check if preview workflow is enabled
        if [ -f "config/project-patterns.json" ] && command -v jq >/dev/null 2>&1; then
            local preview_enabled=$(jq -r '.rulesets.preview_workflow.enabled // false' config/project-patterns.json 2>/dev/null)
            if [ "$preview_enabled" = "true" ]; then
                base_branch="preview"
            fi
        fi
        
        git rev-list --count "${base_branch}..HEAD" 2>/dev/null || echo "0"
    fi
}

# Main logic
main() {
    # Check if reminders are enabled
    if [ "$REMINDER_ENABLED" != "true" ]; then
        echo "ℹ️ Issue reminders disabled"
        exit 0
    fi
    
    local branch_name=$(git symbolic-ref --short HEAD 2>/dev/null || echo "")
    local issue_number=$(get_issue_number)
    local commits_to_push=$(get_commits_to_push)
    
    echo -e "${BLUE}📤 Pushing branch: ${branch_name}${NC}"
    
    if [ "$commits_to_push" -gt 0 ]; then
        echo -e "${BLUE}📈 Commits to push: ${commits_to_push}${NC}"
    fi
    
    # Check if on issue branch
    if [ -z "$issue_number" ]; then
        echo -e "${YELLOW}⚠️ Branch doesn't follow issue convention${NC}"
        echo -e "${BLUE}💡 Consider using: feature/issue-{number}-{description}${NC}"
        exit 0  # Non-blocking
    fi
    
    echo -e "${GREEN}✅ Issue-based branch: #${issue_number}${NC}"
    
    # Check if PR exists
    local pr_info=$(check_pr_exists)
    local pr_exists=$?
    
    if [ $pr_exists -eq 0 ]; then
        # PR exists
        local pr_number=$(echo "$pr_info" | jq -r '.[0].number' 2>/dev/null || echo "unknown")
        local pr_title=$(echo "$pr_info" | jq -r '.[0].title' 2>/dev/null || echo "Unknown")
        local pr_url=$(echo "$pr_info" | jq -r '.[0].url' 2>/dev/null || echo "")
        
        echo -e "${GREEN}✅ PR exists: #${pr_number} - ${pr_title}${NC}"
        
        # Check if issue has PR link
        if ! issue_has_pr_link "$issue_number"; then
            echo ""
            echo -e "${YELLOW}📝 REMINDER: Link PR to Issue${NC}"
            echo -e "${BLUE}According to MANDATORY-RULES.md, you should:${NC}"
            echo -e "${BLUE}  • Comment on issue #${issue_number} with PR link${NC}"
            echo ""
            echo -e "${BLUE}💡 Quick link: gh issue comment ${issue_number} --body \"Created PR #${pr_number}: ${pr_url}\"${NC}"
            echo ""
        else
            echo -e "${GREEN}✅ Issue has PR link${NC}"
        fi
        
    else
        # No PR exists
        echo ""
        echo -e "${YELLOW}📋 REMINDER: Create Pull Request${NC}"
        echo -e "${BLUE}According to MANDATORY-RULES.md, you should:${NC}"
        echo -e "${BLUE}  • Create a PR as soon as you have made your first commit${NC}"
        echo -e "${BLUE}  • Link the PR to issue #${issue_number}${NC}"
        echo ""
        
        # Determine target branch
        local target_branch="main"
        if [ -f "config/project-patterns.json" ] && command -v jq >/dev/null 2>&1; then
            local preview_enabled=$(jq -r '.rulesets.preview_workflow.enabled // false' config/project-patterns.json 2>/dev/null)
            if [ "$preview_enabled" = "true" ]; then
                target_branch="preview"
            fi
        fi
        
        echo -e "${BLUE}💡 Create PR: gh pr create --title \"Title referencing #${issue_number}\" --base ${target_branch}${NC}"
        echo -e "${BLUE}💡 Then update issue: gh issue comment ${issue_number} --body \"Created PR: [link]\"${NC}"
        echo ""
    fi
    
    # Additional workflow reminders
    if [ "$commits_to_push" -gt 0 ]; then
        echo -e "${BLUE}📝 Workflow Reminders:${NC}"
        echo -e "${BLUE}  • Update issue #${issue_number} with progress after push${NC}"
        echo -e "${BLUE}  • Address any PR feedback promptly${NC}"
        echo -e "${BLUE}  • Update issue when PR is blocked or needs changes${NC}"
        echo ""
    fi
    
    echo -e "${GREEN}✅ Pre-push issue reminder check complete${NC}"
}

# Run main function
main "$@"