#!/bin/bash
# Update development hooks to use dev-hooks/ directory

echo "🔧 Updating development hooks to use dev-hooks/ directory..."

# Update pre-commit hook
if [ -f ".git/hooks/pre-commit" ]; then
  sed -i 's|hooks/|dev-hooks/|g' .git/hooks/pre-commit
  echo "✅ Updated pre-commit hook"
fi

# Update post-commit hook
if [ -f ".git/hooks/post-commit" ]; then
  sed -i 's|hooks/|dev-hooks/|g' .git/hooks/post-commit
  echo "✅ Updated post-commit hook"
fi

# Update pre-push hook
if [ -f ".git/hooks/pre-push" ]; then
  sed -i 's|hooks/|dev-hooks/|g' .git/hooks/pre-push
  echo "✅ Updated pre-push hook"
fi

# Update commit-msg hook
if [ -f ".git/hooks/commit-msg" ]; then
  sed -i 's|hooks/|dev-hooks/|g' .git/hooks/commit-msg
  echo "✅ Updated commit-msg hook"
fi

echo "🎉 Development hooks updated successfully!"