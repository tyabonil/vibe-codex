#!/bin/bash

# Post-merge Branch Cleanup Hook
# Automatically cleans up feature branches after merging

set -e

# Colors for output
RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
CLEANUP_ENABLED=${BRANCH_CLEANUP_ENABLED:-true}
CURRENT_BRANCH=$(git symbolic-ref --short HEAD 2>/dev/null || echo "")

# Only run on main or preview branches
if [[ "$CURRENT_BRANCH" != "main" && "$CURRENT_BRANCH" != "preview" ]]; then
    exit 0
fi

# Skip if cleanup is disabled
if [ "$CLEANUP_ENABLED" = "false" ]; then
    exit 0
fi

echo -e "${BLUE}🧹 Post-merge cleanup...${NC}"

# Function to check if branch is merged
is_branch_merged() {
    local branch=$1
    local base_branch=${2:-main}
    
    if git merge-base --is-ancestor "$branch" "$base_branch" 2>/dev/null; then
        return 0
    else
        return 1
    fi
}

# Function to check if PR is merged
check_pr_merged() {
    local branch=$1
    
    if ! command -v gh >/dev/null 2>&1; then
        return 1
    fi
    
    local pr_info
    pr_info=$(gh pr list --state merged --head "$branch" --json number,mergedAt --limit 1 2>/dev/null || echo "[]")
    
    if [ "$pr_info" != "[]" ] && [ -n "$pr_info" ]; then
        return 0
    else
        return 1
    fi
}

# Clean up merged local branches
cleanup_merged_branches() {
    local cleaned=0
    
    git for-each-ref --format='%(refname:short)' refs/heads/ | while read -r branch; do
        # Skip protected branches and current branch
        if [[ "$branch" == "main" || "$branch" == "master" || "$branch" == "preview" || "$branch" == "$CURRENT_BRANCH" ]]; then
            continue
        fi
        
        # Check if branch is merged or has merged PR
        if is_branch_merged "$branch" "$CURRENT_BRANCH" || check_pr_merged "$branch"; then
            echo -e "  ${GREEN}✓${NC} Cleaning up merged branch: $branch"
            if git branch -d "$branch" 2>/dev/null; then
                cleaned=$((cleaned + 1))
            elif git branch -D "$branch" 2>/dev/null; then
                echo -e "  ${YELLOW}⚠${NC} Force deleted: $branch"
                cleaned=$((cleaned + 1))
            fi
        fi
    done
    
    if [ $cleaned -gt 0 ]; then
        echo -e "${GREEN}✨ Cleaned up $cleaned merged branches${NC}"
    fi
}

# Check if this was a merge commit
if git log -1 --pretty=%B | grep -q "Merge\|merge"; then
    cleanup_merged_branches
fi

# Prune remote tracking branches
echo -e "${BLUE}🌐 Pruning remote references...${NC}"
git fetch --prune origin 2>/dev/null || true

echo -e "${GREEN}✅ Post-merge cleanup complete${NC}"