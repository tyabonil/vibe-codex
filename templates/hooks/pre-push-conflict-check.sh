#!/bin/bash
# vibe-codex pre-push conflict detection hook
# Checks for merge conflicts before pushing to prevent unmergeable PRs

echo "🔍 Checking for conflicts with target branch..."

# Get the remote and branch being pushed to
remote="$1"
url="$2"

# Read the branches being pushed
while read local_ref local_sha remote_ref remote_sha; do
  # Skip if deleting a branch
  if [ "$local_sha" = "0000000000000000000000000000000000000000" ]; then
    continue
  fi
  
  # Extract branch names
  local_branch="${local_ref#refs/heads/}"
  remote_branch="${remote_ref#refs/heads/}"
  
  # Determine target branch (usually main or preview)
  target_branch="preview"  # Default to preview
  
  # Check if main branch exists on remote
  if git ls-remote --heads "$remote" main | grep -q "refs/heads/main"; then
    # If we're not pushing to main, check against main
    if [ "$remote_branch" != "main" ]; then
      target_branch="main"
    fi
  fi
  
  # Fetch latest target branch
  echo "Fetching latest $target_branch from $remote..."
  git fetch "$remote" "$target_branch" --quiet
  
  # Check for conflicts
  echo "Checking for conflicts with $target_branch..."
  
  # Find merge base
  merge_base=$(git merge-base HEAD "$remote/$target_branch")
  
  # Attempt a test merge (dry run)
  if ! git merge-tree "$merge_base" HEAD "$remote/$target_branch" 2>&1 | grep -q '<<<<<<<'; then
    echo "✅ No conflicts detected with $target_branch"
  else
    echo ""
    echo "❌ ERROR: Merge conflicts detected with $target_branch!"
    echo ""
    echo "Your branch has conflicts that must be resolved before pushing."
    echo "This prevents creating PRs that cannot be merged."
    echo ""
    echo "To fix:"
    echo "  1. git fetch $remote $target_branch"
    echo "  2. git merge $remote/$target_branch"
    echo "  3. Resolve conflicts"
    echo "  4. git add <resolved files>"
    echo "  5. git commit"
    echo "  6. git push"
    echo ""
    echo "Or rebase:"
    echo "  1. git fetch $remote $target_branch"
    echo "  2. git rebase $remote/$target_branch"
    echo "  3. Resolve conflicts if any"
    echo "  4. git push --force-with-lease"
    echo ""
    exit 1
  fi
done

exit 0