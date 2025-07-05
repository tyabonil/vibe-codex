#!/bin/bash

# Issue Reminder Pre-commit Hook
# Reminds developers to update issues with progress and plans

set -e

# Colors for output
RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration (can be overridden by config/rules.json)
REMINDER_ENABLED=${ISSUE_REMINDER_ENABLED:-true}
ACTIVITY_THRESHOLD_HOURS=${ISSUE_REMINDER_THRESHOLD:-24}
CHECK_RECENT_ACTIVITY=${ISSUE_REMINDER_CHECK_ACTIVITY:-true}

echo "🔔 Checking issue tracking compliance..."

# Function to check if issue reminders are enabled
check_config() {
    if [ -f "config/rules.json" ]; then
        # Check if issue reminders are configured
        if command -v jq >/dev/null 2>&1; then
            local config_enabled=$(jq -r '.issueReminders.enabled // true' config/rules.json 2>/dev/null)
            if [ "$config_enabled" = "false" ]; then
                echo "ℹ️ Issue reminders disabled in config"
                exit 0
            fi
        fi
    fi
}

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

# Function to check if user has recent activity on issue
check_recent_issue_activity() {
    local issue_number=$1
    
    if [ -z "$issue_number" ]; then
        return 1
    fi
    
    # Get current git user
    local git_user=$(git config user.name 2>/dev/null || echo "unknown")
    
    # Check if gh CLI is available and authenticated
    if ! command -v gh >/dev/null 2>&1; then
        echo -e "${YELLOW}⚠️ gh CLI not available - cannot check issue activity${NC}"
        return 0  # Don't block if we can't check
    fi
    
    # Check if authenticated
    if ! gh auth status >/dev/null 2>&1; then
        echo -e "${YELLOW}⚠️ gh CLI not authenticated - cannot check issue activity${NC}"
        return 0  # Don't block if we can't check
    fi
    
    # Get recent comments from the user
    local recent_comments=$(gh issue view "$issue_number" --json comments --jq '.comments[] | select(.author.login) | select(.createdAt > (now - 86400)) | .author.login' 2>/dev/null || echo "")
    
    if [ -n "$recent_comments" ]; then
        return 0  # Recent activity found
    else
        return 1  # No recent activity
    fi
}

# Function to get issue details
get_issue_details() {
    local issue_number=$1
    
    if [ -z "$issue_number" ]; then
        return 1
    fi
    
    if ! command -v gh >/dev/null 2>&1 || ! gh auth status >/dev/null 2>&1; then
        return 1
    fi
    
    gh issue view "$issue_number" --json title,state,url 2>/dev/null || return 1
}

# Function to check if this is first commit on feature branch
is_first_commit_on_branch() {
    local branch_name=$(git symbolic-ref --short HEAD 2>/dev/null || echo "")
    local base_branch="main"
    
    # Check if preview workflow is enabled
    if [ -f "config/project-patterns.json" ] && command -v jq >/dev/null 2>&1; then
        local preview_enabled=$(jq -r '.rulesets.preview_workflow.enabled // false' config/project-patterns.json 2>/dev/null)
        if [ "$preview_enabled" = "true" ]; then
            base_branch="preview"
        fi
    fi
    
    # Count commits ahead of base branch
    local commits_ahead=$(git rev-list --count "${base_branch}..HEAD" 2>/dev/null || echo "0")
    
    if [ "$commits_ahead" = "0" ]; then
        return 0  # This will be the first commit
    else
        return 1  # Not the first commit
    fi
}

# Main logic
main() {
    # Check configuration
    if [ "$REMINDER_ENABLED" != "true" ]; then
        echo "ℹ️ Issue reminders disabled"
        exit 0
    fi
    
    check_config
    
    # Get current branch and extract issue number
    local branch_name=$(git symbolic-ref --short HEAD 2>/dev/null || echo "")
    local issue_number=$(get_issue_number)
    
    if [ -z "$issue_number" ]; then
        echo -e "${YELLOW}⚠️ Branch name doesn't follow issue convention (feature/issue-123-description)${NC}"
        echo -e "${BLUE}💡 Consider creating a GitHub issue and using proper branch naming${NC}"
        exit 0  # Non-blocking reminder
    fi
    
    echo -e "${GREEN}✅ Issue-based branch detected: #${issue_number}${NC}"
    
    # Get issue details
    local issue_details=$(get_issue_details "$issue_number")
    if [ $? -eq 0 ]; then
        local issue_title=$(echo "$issue_details" | jq -r '.title' 2>/dev/null || echo "Unknown")
        local issue_state=$(echo "$issue_details" | jq -r '.state' 2>/dev/null || echo "Unknown")
        local issue_url=$(echo "$issue_details" | jq -r '.url' 2>/dev/null || echo "")
        
        echo -e "${BLUE}📋 Issue #${issue_number}: ${issue_title} (${issue_state})${NC}"
        
        if [ "$issue_state" = "CLOSED" ]; then
            echo -e "${YELLOW}⚠️ Warning: Working on a closed issue${NC}"
        fi
    else
        echo -e "${YELLOW}⚠️ Could not retrieve issue details for #${issue_number}${NC}"
    fi
    
    # Check for recent activity if enabled
    if [ "$CHECK_RECENT_ACTIVITY" = "true" ]; then
        if ! check_recent_issue_activity "$issue_number"; then
            echo ""
            echo -e "${YELLOW}📝 REMINDER: Issue Update Needed${NC}"
            echo -e "${BLUE}According to MANDATORY-RULES.md, you should:${NC}"
            
            if is_first_commit_on_branch; then
                echo -e "${BLUE}  • Comment on issue #${issue_number} with detailed implementation plan${NC}"
                echo -e "${BLUE}  • Update progress as you work on the implementation${NC}"
            else
                echo -e "${BLUE}  • Update issue #${issue_number} with current progress${NC}"
                echo -e "${BLUE}  • Document any challenges or changes to approach${NC}"
            fi
            
            echo ""
            echo -e "${BLUE}💡 Quick update: gh issue comment ${issue_number} --body \"Progress update message\"${NC}"
            echo ""
        else
            echo -e "${GREEN}✅ Recent issue activity detected${NC}"
        fi
    fi
    
    echo -e "${GREEN}✅ Issue reminder check complete${NC}"
}

# Run main function
main "$@"