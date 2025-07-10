#!/bin/bash

# Issue Reminder Post-commit Hook
# Reminds developers to update issues after commits, especially first commits

set -e

# Colors for output
RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
REMINDER_ENABLED=${ISSUE_REMINDER_ENABLED:-true}

echo "📝 Checking post-commit issue update requirements..."

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

# Function to check if this is first commit on feature branch
is_first_commit_on_branch() {
    local base_branch="main"
    
    # Check if preview workflow is enabled
    if [ -f "config/project-patterns.json" ] && command -v jq >/dev/null 2>&1; then
        local preview_enabled=$(jq -r '.rulesets.preview_workflow.enabled // false' config/project-patterns.json 2>/dev/null)
        if [ "$preview_enabled" = "true" ]; then
            base_branch="preview"
        fi
    fi
    
    # Count commits ahead of base branch
    local commits_ahead=$(git rev-list --count "${base_branch}..HEAD" 2>/dev/null || echo "1")
    
    if [ "$commits_ahead" = "1" ]; then
        return 0  # This is the first commit
    else
        return 1  # Not the first commit
    fi
}

# Function to check if issue has implementation plan
has_implementation_plan() {
    local issue_number=$1
    
    if [ -z "$issue_number" ]; then
        return 1
    fi
    
    # Check if gh CLI is available and authenticated
    if ! command -v gh >/dev/null 2>&1; then
        return 0  # Assume it exists if we can't check
    fi
    
    if ! gh auth status >/dev/null 2>&1; then
        return 0  # Assume it exists if we can't check
    fi
    
    # Get current git user
    local git_user=$(git config user.name 2>/dev/null || echo "unknown")
    
    # Check for comments containing plan-related keywords from current user
    local plan_comments=$(gh issue view "$issue_number" --json comments --jq '.comments[] | select(.author.login) | select(.body | test("plan|implementation|approach|strategy"; "i")) | .body' 2>/dev/null || echo "")
    
    if [ -n "$plan_comments" ]; then
        return 0  # Implementation plan found
    else
        return 1  # No implementation plan found
    fi
}

# Function to get latest commit info
get_commit_info() {
    local commit_hash=$(git rev-parse HEAD)
    local commit_message=$(git log -1 --pretty=format:'%s')
    local commit_author=$(git log -1 --pretty=format:'%an')
    
    echo "$commit_hash|$commit_message|$commit_author"
}

# Main logic
main() {
    # Check if reminders are enabled
    if [ "$REMINDER_ENABLED" != "true" ]; then
        echo "ℹ️ Issue reminders disabled"
        exit 0
    fi
    
    # Get issue number from branch
    local issue_number=$(get_issue_number)
    
    if [ -z "$issue_number" ]; then
        # Not on an issue branch, no reminder needed
        exit 0
    fi
    
    # Get commit information
    local commit_info=$(get_commit_info)
    local commit_message=$(echo "$commit_info" | cut -d'|' -f2)
    
    echo -e "${GREEN}✅ Commit successful on issue branch #${issue_number}${NC}"
    echo -e "${BLUE}📝 Commit: ${commit_message}${NC}"
    
    # Check if this is the first commit and if implementation plan exists
    if is_first_commit_on_branch; then
        echo ""
        echo -e "${YELLOW}🎯 First commit detected on feature branch!${NC}"
        
        if ! has_implementation_plan "$issue_number"; then
            echo ""
            echo -e "${YELLOW}📋 REMINDER: Implementation Plan Required${NC}"
            echo -e "${BLUE}According to MANDATORY-RULES.md, your first action should be:${NC}"
            echo -e "${BLUE}  • Comment on issue #${issue_number} with detailed implementation plan${NC}"
            echo ""
            echo -e "${BLUE}Your plan should include:${NC}"
            echo -e "${BLUE}  • Analysis of the problem and proposed approach${NC}"
            echo -e "${BLUE}  • Implementation steps and timeline${NC}"
            echo -e "${BLUE}  • Expected challenges and mitigation strategies${NC}"
            echo -e "${BLUE}  • Testing approach and acceptance criteria${NC}"
            echo ""
            echo -e "${BLUE}💡 Quick plan: gh issue comment ${issue_number} --body \"**Implementation Plan**\n\n[Your detailed plan here]\"${NC}"
            echo ""
        else
            echo -e "${GREEN}✅ Implementation plan already exists for issue #${issue_number}${NC}"
        fi
    else
        # For subsequent commits, remind about progress updates
        echo ""
        echo -e "${BLUE}💡 Consider updating issue #${issue_number} with progress:${NC}"
        echo -e "${BLUE}  • What was accomplished in this commit${NC}"
        echo -e "${BLUE}  • Any challenges encountered${NC}"
        echo -e "${BLUE}  • Next steps in the implementation${NC}"
        echo ""
        echo -e "${BLUE}💡 Quick update: gh issue comment ${issue_number} --body \"Progress: [your update]\"${NC}"
        echo ""
    fi
    
    # Check if commit message references the issue
    if [[ ! $commit_message =~ #${issue_number}|resolves.*#${issue_number}|fixes.*#${issue_number}|closes.*#${issue_number} ]]; then
        echo -e "${YELLOW}💡 Tip: Consider referencing issue #${issue_number} in commit messages${NC}"
        echo -e "${BLUE}  Example: 'feat: implement feature, addresses #${issue_number}'${NC}"
        echo ""
    fi
    
    echo -e "${GREEN}✅ Post-commit issue reminder check complete${NC}"
}

# Run main function
main "$@"