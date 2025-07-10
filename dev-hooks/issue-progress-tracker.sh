#!/bin/bash

# Issue Progress Tracker Hook
# Automates issue status updates throughout the development lifecycle
# Usage: ./hooks/issue-progress-tracker.sh <action> <issue_number> [message] [pr_number]

set -e

# Colors for output
RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

# Function to show usage
show_usage() {
    echo "Usage: $0 <action> <issue_number> [message] [pr_number]"
    echo ""
    echo "Actions:"
    echo "  start <issue_number> [message]           - Mark issue as started"
    echo "  update <issue_number> <message>          - Add progress update"
    echo "  link-pr <issue_number> <pr_number>       - Link PR to issue"
    echo "  complete <issue_number> <pr_number> [message] - Mark issue complete"
    echo "  validate <issue_number>                  - Validate issue exists and format"
    echo ""
    echo "Examples:"
    echo "  $0 start 95 'Beginning work on privacy checkbox fix'"
    echo "  $0 update 95 'Identified root cause: checkbox styling issue'"
    echo "  $0 link-pr 95 99"
    echo "  $0 complete 95 99 'Fix deployed successfully'"
    echo ""
}

# Function to validate issue exists
validate_issue() {
    local issue_number=$1
    
    if ! command -v gh &> /dev/null; then
        echo -e "${RED}❌ Error: GitHub CLI (gh) not available${NC}"
        return 1
    fi
    
    echo -e "${BLUE}🔍 Validating issue #${issue_number}...${NC}"
    
    if ! gh issue view "$issue_number" --json number,title,state &>/dev/null; then
        echo -e "${RED}❌ Error: Issue #${issue_number} not found${NC}"
        return 1
    fi
    
    local issue_state=$(gh issue view "$issue_number" --json state -q '.state')
    if [ "$issue_state" = "CLOSED" ]; then
        echo -e "${YELLOW}⚠️  Warning: Issue #${issue_number} is already closed${NC}"
    fi
    
    echo -e "${GREEN}✅ Issue #${issue_number} validated${NC}"
    return 0
}

# Function to get current branch and check issue reference
check_branch_issue_reference() {
    local issue_number=$1
    local current_branch=$(git branch --show-current)
    
    echo -e "${BLUE}🌿 Current branch: ${current_branch}${NC}"
    
    if [[ "$current_branch" =~ issue-${issue_number} ]]; then
        echo -e "${GREEN}✅ Branch correctly references issue #${issue_number}${NC}"
        return 0
    else
        echo -e "${YELLOW}⚠️  Branch name doesn't reference issue #${issue_number}${NC}"
        echo -e "${YELLOW}   Expected pattern: *issue-${issue_number}*${NC}"
        return 1
    fi
}

# Function to start work on issue
start_issue() {
    local issue_number=$1
    local message=${2:-"Work started on this issue"}
    
    echo -e "${CYAN}🚀 Starting work on issue #${issue_number}...${NC}"
    
    # Validate issue exists
    if ! validate_issue "$issue_number"; then
        return 1
    fi
    
    # Check branch reference
    check_branch_issue_reference "$issue_number"
    
    # Get current branch for context
    local current_branch=$(git branch --show-current)
    local timestamp=$(date -u '+%Y-%m-%d %H:%M:%S UTC')
    
    # Post start comment
    local comment_body="## 🚀 **Work Started**

**Development Status:** 🔄 **IN PROGRESS**

**Details:**
- **Branch:** \`${current_branch}\`
- **Started:** ${timestamp}
- **Message:** ${message}

**Next Steps:**
- Implementation in progress
- Will update with progress milestones
- PR will be created when ready for review

*Automated by issue-progress-tracker.sh*"
    
    if gh issue comment "$issue_number" --body "$comment_body"; then
        echo -e "${GREEN}✅ Added start comment to issue #${issue_number}${NC}"
    else
        echo -e "${RED}❌ Failed to add comment to issue #${issue_number}${NC}"
        return 1
    fi
    
    return 0
}

# Function to update issue progress
update_issue() {
    local issue_number=$1
    local message=$2
    
    if [ -z "$message" ]; then
        echo -e "${RED}❌ Error: Update message is required${NC}"
        return 1
    fi
    
    echo -e "${CYAN}📝 Updating progress on issue #${issue_number}...${NC}"
    
    # Validate issue exists
    if ! validate_issue "$issue_number"; then
        return 1
    fi
    
    local timestamp=$(date -u '+%Y-%m-%d %H:%M:%S UTC')
    local current_branch=$(git branch --show-current)
    
    # Post update comment
    local comment_body="## 📝 **Progress Update**

**Status:** 🔄 **IN PROGRESS** - Development continuing

**Update:** ${message}

**Context:**
- **Branch:** \`${current_branch}\`
- **Updated:** ${timestamp}

*Automated by issue-progress-tracker.sh*"
    
    if gh issue comment "$issue_number" --body "$comment_body"; then
        echo -e "${GREEN}✅ Added progress update to issue #${issue_number}${NC}"
    else
        echo -e "${RED}❌ Failed to add update to issue #${issue_number}${NC}"
        return 1
    fi
    
    return 0
}

# Function to link PR to issue
link_pr() {
    local issue_number=$1
    local pr_number=$2
    
    if [ -z "$pr_number" ]; then
        echo -e "${RED}❌ Error: PR number is required${NC}"
        return 1
    fi
    
    echo -e "${CYAN}🔗 Linking PR #${pr_number} to issue #${issue_number}...${NC}"
    
    # Validate issue exists
    if ! validate_issue "$issue_number"; then
        return 1
    fi
    
    # Validate PR exists
    if ! gh pr view "$pr_number" --json number,title,state &>/dev/null; then
        echo -e "${RED}❌ Error: PR #${pr_number} not found${NC}"
        return 1
    fi
    
    # Get PR details
    local pr_title=$(gh pr view "$pr_number" --json title -q '.title')
    local pr_url=$(gh pr view "$pr_number" --json url -q '.url')
    local pr_state=$(gh pr view "$pr_number" --json state -q '.state')
    local timestamp=$(date -u '+%Y-%m-%d %H:%M:%S UTC')
    
    # Post link comment
    local comment_body="## 🔗 **Pull Request Created**

**Status:** 📋 **READY FOR REVIEW**

**PR Details:**
- **Title:** ${pr_title}
- **Number:** #${pr_number}
- **Status:** ${pr_state}
- **Link:** ${pr_url}
- **Created:** ${timestamp}

**Next Steps:**
1. Monitor PR progress and reviews
2. Address any feedback or violations
3. Update this issue with resolution details
4. Issue will be closed when PR is merged

*Automated by issue-progress-tracker.sh*"
    
    if gh issue comment "$issue_number" --body "$comment_body"; then
        echo -e "${GREEN}✅ Linked PR #${pr_number} to issue #${issue_number}${NC}"
    else
        echo -e "${RED}❌ Failed to link PR to issue #${issue_number}${NC}"
        return 1
    fi
    
    return 0
}

# Function to complete issue
complete_issue() {
    local issue_number=$1
    local pr_number=$2
    local message=${3:-"Implementation completed successfully"}
    
    if [ -z "$pr_number" ]; then
        echo -e "${RED}❌ Error: PR number is required for completion${NC}"
        return 1
    fi
    
    echo -e "${CYAN}🎯 Completing issue #${issue_number}...${NC}"
    
    # Validate issue exists
    if ! validate_issue "$issue_number"; then
        return 1
    fi
    
    # Check if PR is merged
    local pr_state=$(gh pr view "$pr_number" --json state -q '.state' 2>/dev/null || echo "UNKNOWN")
    if [ "$pr_state" != "MERGED" ]; then
        echo -e "${YELLOW}⚠️  Warning: PR #${pr_number} is not merged (state: ${pr_state})${NC}"
        echo -e "${YELLOW}   Consider waiting until PR is merged before completing issue${NC}"
    fi
    
    local timestamp=$(date -u '+%Y-%m-%d %H:%M:%S UTC')
    local pr_url=$(gh pr view "$pr_number" --json url -q '.url' 2>/dev/null || echo "")
    
    # Post completion comment
    local comment_body="## ✅ **Implementation Complete**

**Status:** 🎉 **RESOLVED**

**Resolution:** ${message}

**Summary:**
- **Resolved by:** PR #${pr_number}
- **PR Link:** ${pr_url}
- **Completed:** ${timestamp}

**Implementation Details:**
- All requirements addressed
- Code changes merged to main branch
- Issue resolved successfully

**Issue Status: CLOSED** 🎉

*Automated by issue-progress-tracker.sh*"
    
    if gh issue comment "$issue_number" --body "$comment_body"; then
        echo -e "${GREEN}✅ Added completion comment to issue #${issue_number}${NC}"
    else
        echo -e "${RED}❌ Failed to add completion comment${NC}"
        return 1
    fi
    
    # Close the issue
    if gh issue close "$issue_number"; then
        echo -e "${GREEN}✅ Closed issue #${issue_number}${NC}"
    else
        echo -e "${RED}❌ Failed to close issue #${issue_number}${NC}"
        return 1
    fi
    
    return 0
}

# Function to extract issue number from branch name
extract_issue_from_branch() {
    local current_branch=$(git branch --show-current)
    
    if [[ "$current_branch" =~ issue-([0-9]+) ]]; then
        echo "${BASH_REMATCH[1]}"
        return 0
    else
        echo ""
        return 1
    fi
}

# Function for auto-mode (called by git hooks)
auto_mode() {
    local action=$1
    local auto_issue
    
    # Try to extract issue number from branch
    if auto_issue=$(extract_issue_from_branch); then
        echo -e "${BLUE}🤖 Auto-detected issue #${auto_issue} from branch${NC}"
        
        case "$action" in
            "commit")
                # Auto-update on significant commits
                local last_commit_msg=$(git log -1 --pretty=format:"%s")
                update_issue "$auto_issue" "Commit: ${last_commit_msg}"
                ;;
            "push")
                # Auto-update on push
                update_issue "$auto_issue" "Changes pushed to remote branch"
                ;;
            *)
                echo -e "${YELLOW}⚠️  Unknown auto action: ${action}${NC}"
                return 1
                ;;
        esac
    else
        echo -e "${YELLOW}⚠️  No issue number detected in branch name${NC}"
        return 1
    fi
}

# Main execution
main() {
    if [ $# -eq 0 ]; then
        show_usage
        exit 1
    fi
    
    local action=$1
    
    case "$action" in
        "start")
            if [ $# -lt 2 ]; then
                echo -e "${RED}❌ Error: Issue number required for start action${NC}"
                show_usage
                exit 1
            fi
            start_issue "$2" "$3"
            ;;
        "update")
            if [ $# -lt 3 ]; then
                echo -e "${RED}❌ Error: Issue number and message required for update action${NC}"
                show_usage
                exit 1
            fi
            update_issue "$2" "$3"
            ;;
        "link-pr")
            if [ $# -lt 3 ]; then
                echo -e "${RED}❌ Error: Issue number and PR number required for link-pr action${NC}"
                show_usage
                exit 1
            fi
            link_pr "$2" "$3"
            ;;
        "complete")
            if [ $# -lt 3 ]; then
                echo -e "${RED}❌ Error: Issue number and PR number required for complete action${NC}"
                show_usage
                exit 1
            fi
            complete_issue "$2" "$3" "$4"
            ;;
        "validate")
            if [ $# -lt 2 ]; then
                echo -e "${RED}❌ Error: Issue number required for validate action${NC}"
                show_usage
                exit 1
            fi
            validate_issue "$2"
            ;;
        "auto")
            if [ $# -lt 2 ]; then
                echo -e "${RED}❌ Error: Auto action required${NC}"
                exit 1
            fi
            auto_mode "$2"
            ;;
        "--help"|"-h")
            show_usage
            exit 0
            ;;
        *)
            echo -e "${RED}❌ Error: Unknown action: $action${NC}"
            show_usage
            exit 1
            ;;
    esac
}

# Run main function with all arguments
main "$@"