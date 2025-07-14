#!/bin/bash

# Branch Cleanup Script
# Safely removes merged feature branches from local and remote repositories

set -e

# Colors for output
RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
DRY_RUN=${DRY_RUN:-false}
INTERACTIVE=${INTERACTIVE:-true}
FORCE=${FORCE:-false}
CLEANUP_REMOTE=${CLEANUP_REMOTE:-true}

# Protected branches that should never be deleted
PROTECTED_BRANCHES="main master preview develop staging production"

# Function to show usage
show_usage() {
    echo "Usage: $0 [options]"
    echo ""
    echo "Options:"
    echo "  --dry-run          Show what would be deleted without actually deleting"
    echo "  --force            Skip confirmation prompts"
    echo "  --no-interactive   Don't ask for confirmation on each branch"
    echo "  --local-only       Only clean up local branches"
    echo "  --remote-only      Only clean up remote branches"
    echo "  --help             Show this help message"
    echo ""
    echo "Environment Variables:"
    echo "  DRY_RUN=true              Same as --dry-run"
    echo "  INTERACTIVE=false         Same as --no-interactive"
    echo "  FORCE=true                Same as --force"
    echo "  CLEANUP_REMOTE=false      Same as --local-only"
    echo ""
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --dry-run)
            DRY_RUN=true
            shift
            ;;
        --force)
            FORCE=true
            INTERACTIVE=false
            shift
            ;;
        --no-interactive)
            INTERACTIVE=false
            shift
            ;;
        --local-only)
            CLEANUP_REMOTE=false
            shift
            ;;
        --remote-only)
            CLEANUP_LOCAL=false
            CLEANUP_REMOTE=true
            shift
            ;;
        --help)
            show_usage
            exit 0
            ;;
        *)
            echo "Unknown option: $1"
            show_usage
            exit 1
            ;;
    esac
done

echo -e "${BLUE}🧹 Branch Cleanup Tool${NC}"
echo -e "${BLUE}=====================${NC}"

if [ "$DRY_RUN" = true ]; then
    echo -e "${YELLOW}🔍 DRY RUN MODE - No branches will be deleted${NC}"
fi

# Function to check if branch is protected
is_protected_branch() {
    local branch=$1
    for protected in $PROTECTED_BRANCHES; do
        if [[ "$branch" == "$protected" ]]; then
            return 0
        fi
    done
    return 1
}

# Function to check if branch is merged
is_branch_merged() {
    local branch=$1
    local base_branch=${2:-main}
    
    # Check if branch exists in git log of base branch
    if git merge-base --is-ancestor "$branch" "$base_branch" 2>/dev/null; then
        return 0
    else
        return 1
    fi
}

# Function to check if PR is merged
is_pr_merged() {
    local branch=$1
    
    if ! command -v gh >/dev/null 2>&1; then
        return 1  # Can't check without gh CLI
    fi
    
    # Extract issue number from branch name
    local issue_num
    if [[ $branch =~ issue-([0-9]+) ]]; then
        issue_num=${BASH_REMATCH[1]}
    else
        return 1
    fi
    
    # Check if there's a merged PR for this branch
    local pr_info
    pr_info=$(gh pr list --state merged --head "$branch" --json number,mergedAt 2>/dev/null || echo "[]")
    
    if [ "$pr_info" != "[]" ] && [ -n "$pr_info" ]; then
        return 0  # PR is merged
    else
        return 1  # No merged PR found
    fi
}

# Function to get merged branches
get_merged_branches() {
    local branch_type=$1  # "local" or "remote"
    local base_branch=${2:-main}
    
    if [ "$branch_type" = "local" ]; then
        git for-each-ref --format='%(refname:short)' refs/heads/ | while read -r branch; do
            if ! is_protected_branch "$branch" && [ "$branch" != "$(git branch --show-current)" ]; then
                if is_branch_merged "$branch" "$base_branch" || is_pr_merged "$branch"; then
                    echo "$branch"
                fi
            fi
        done
    else
        git for-each-ref --format='%(refname:short)' refs/remotes/origin/ | grep -v "origin/HEAD" | sed 's|origin/||' | while read -r branch; do
            if ! is_protected_branch "$branch"; then
                if is_branch_merged "origin/$branch" "$base_branch" || is_pr_merged "$branch"; then
                    echo "$branch"
                fi
            fi
        done
    fi
}

# Function to confirm deletion
confirm_deletion() {
    local branch=$1
    local branch_type=$2
    
    if [ "$FORCE" = true ] || [ "$INTERACTIVE" = false ]; then
        return 0
    fi
    
    echo -e "\n${YELLOW}Delete $branch_type branch: $branch?${NC}"
    read -p "  (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        return 0
    else
        return 1
    fi
}

# Function to delete local branch
delete_local_branch() {
    local branch=$1
    
    if [ "$DRY_RUN" = true ]; then
        echo -e "  ${YELLOW}[DRY RUN]${NC} Would delete local branch: $branch"
        return
    fi
    
    if confirm_deletion "$branch" "local"; then
        if git branch -d "$branch" 2>/dev/null; then
            echo -e "  ${GREEN}✓${NC} Deleted local branch: $branch"
        elif git branch -D "$branch" 2>/dev/null; then
            echo -e "  ${GREEN}✓${NC} Force deleted local branch: $branch"
        else
            echo -e "  ${RED}✗${NC} Failed to delete local branch: $branch"
        fi
    else
        echo -e "  ${YELLOW}↷${NC} Skipped local branch: $branch"
    fi
}

# Function to delete remote branch
delete_remote_branch() {
    local branch=$1
    
    if [ "$DRY_RUN" = true ]; then
        echo -e "  ${YELLOW}[DRY RUN]${NC} Would delete remote branch: origin/$branch"
        return
    fi
    
    if confirm_deletion "$branch" "remote"; then
        if git push origin --delete "$branch" 2>/dev/null; then
            echo -e "  ${GREEN}✓${NC} Deleted remote branch: origin/$branch"
        else
            echo -e "  ${RED}✗${NC} Failed to delete remote branch: origin/$branch"
        fi
    else
        echo -e "  ${YELLOW}↷${NC} Skipped remote branch: origin/$branch"
    fi
}

# Main cleanup function
cleanup_branches() {
    echo -e "\n${CYAN}🔍 Analyzing branches...${NC}"
    
    # Update remote references
    git fetch --prune origin 2>/dev/null || true
    
    # Clean up local branches
    if [ "$CLEANUP_LOCAL" != false ]; then
        echo -e "\n${BLUE}📂 Local Merged Branches:${NC}"
        local_merged=$(get_merged_branches "local")
        
        if [ -z "$local_merged" ]; then
            echo -e "  ${GREEN}✓${NC} No merged local branches to clean up"
        else
            echo "$local_merged" | while read -r branch; do
                if [ -n "$branch" ]; then
                    delete_local_branch "$branch"
                fi
            done
        fi
    fi
    
    # Clean up remote branches
    if [ "$CLEANUP_REMOTE" = true ]; then
        echo -e "\n${BLUE}🌐 Remote Merged Branches:${NC}"
        remote_merged=$(get_merged_branches "remote")
        
        if [ -z "$remote_merged" ]; then
            echo -e "  ${GREEN}✓${NC} No merged remote branches to clean up"
        else
            echo "$remote_merged" | while read -r branch; do
                if [ -n "$branch" ]; then
                    delete_remote_branch "$branch"
                fi
            done
        fi
    fi
}

# Function to show summary
show_summary() {
    echo -e "\n${CYAN}📊 Current Branch Status:${NC}"
    
    echo -e "\n${BLUE}Local Branches:${NC}"
    git branch --list | sed 's/^/  /'
    
    if [ "$CLEANUP_REMOTE" = true ]; then
        echo -e "\n${BLUE}Remote Branches:${NC}"
        git branch -r | grep -v "origin/HEAD" | sed 's/^/  /'
    fi
    
    echo -e "\n${GREEN}✨ Cleanup complete!${NC}"
}

# Main execution
main() {
    # Check if we're in a git repository
    if ! git rev-parse --git-dir > /dev/null 2>&1; then
        echo -e "${RED}❌ Error: Not in a git repository${NC}"
        exit 1
    fi
    
    # Check if gh CLI is available for PR checking
    if ! command -v gh >/dev/null 2>&1; then
        echo -e "${YELLOW}⚠️  Warning: gh CLI not found. PR merge status checking disabled.${NC}"
    fi
    
    # Confirm operation if not in dry-run mode
    if [ "$DRY_RUN" = false ] && [ "$FORCE" = false ]; then
        echo -e "\n${YELLOW}This will delete merged branches. Continue?${NC}"
        read -p "(y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            echo -e "${YELLOW}Operation cancelled.${NC}"
            exit 0
        fi
    fi
    
    cleanup_branches
    show_summary
}

# Run main function
main "$@"