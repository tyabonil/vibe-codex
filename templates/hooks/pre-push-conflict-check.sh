#!/bin/bash
# Pre-push hook to check for merge conflicts with target branch
# Prevents creating PRs that will have massive conflicts

# Colors for output
RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
NC='\033[0m' # No Color

# Get current branch
current_branch=$(git rev-parse --abbrev-ref HEAD)

# Skip check for main/master/preview branches
if [[ "$current_branch" =~ ^(main|master|preview)$ ]]; then
    exit 0
fi

# Determine target branch (usually preview for this project)
# Can be customized via git config
target_branch=$(git config --get vibe-codex.targetBranch || echo "preview")

echo "🔍 Checking for conflicts with $target_branch branch..."

# Fetch latest target branch
git fetch origin "$target_branch" --quiet 2>/dev/null || {
    echo -e "${YELLOW}⚠️  Warning: Could not fetch $target_branch branch${NC}"
    echo "   Proceeding without conflict check..."
    exit 0
}

# Create a temporary merge to test for conflicts
# Using a detached HEAD to avoid modifying working tree
merge_base=$(git merge-base HEAD "origin/$target_branch")
conflicts=$(git merge-tree "$merge_base" HEAD "origin/$target_branch" 2>&1 | grep -c "<<<<<<< ")

if [ "$conflicts" -gt 0 ]; then
    echo -e "${RED}❌ Merge conflicts detected with $target_branch!${NC}"
    echo ""
    echo "   Your branch will have conflicts when creating a PR."
    echo "   This will make the PR unmergeable without resolution."
    echo ""
    echo "   To resolve:"
    echo "   1. Merge latest $target_branch:"
    echo "      git fetch origin $target_branch"
    echo "      git merge origin/$target_branch"
    echo ""
    echo "   2. Or rebase on $target_branch:"
    echo "      git fetch origin $target_branch"
    echo "      git rebase origin/$target_branch"
    echo ""
    echo "   3. To push anyway (not recommended):"
    echo "      git push --no-verify"
    echo ""
    
    # Check if we should block or just warn
    block_on_conflicts=$(git config --get vibe-codex.blockOnConflicts || echo "false")
    if [ "$block_on_conflicts" = "true" ]; then
        echo -e "${RED}Push blocked due to conflicts.${NC}"
        exit 1
    else
        echo -e "${YELLOW}⚠️  Proceeding with push despite conflicts...${NC}"
        echo "   Consider resolving before creating PR."
    fi
else
    echo -e "${GREEN}✅ No conflicts detected with $target_branch${NC}"
fi

exit 0