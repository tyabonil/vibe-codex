#!/bin/bash
# Update git hook paths to point to correct directories

echo "🔧 Updating git hook paths..."

# Update pre-commit hook
if [ -f .git/hooks/pre-commit ]; then
  echo "Updating pre-commit hook..."
  sed -i 's|dev-hooks/|hooks/|g' .git/hooks/pre-commit
  sed -i 's|\.claude/dev-hooks/|hooks/|g' .git/hooks/pre-commit
fi

# Update commit-msg hook
if [ -f .git/hooks/commit-msg ]; then
  echo "Updating commit-msg hook..."
  sed -i 's|dev-hooks/|hooks/|g' .git/hooks/commit-msg
fi

# Update post-commit hook
if [ -f .git/hooks/post-commit ]; then
  echo "Updating post-commit hook..."
  sed -i 's|\.claude/dev-hooks/|hooks/|g' .git/hooks/post-commit
  sed -i 's|\.claude/hooks/|hooks/|g' .git/hooks/post-commit
fi

# Update pre-push hook
if [ -f .git/hooks/pre-push ]; then
  echo "Updating pre-push hook..."
  sed -i 's|dev-hooks/|hooks/|g' .git/hooks/pre-push
fi

# Update post-merge hook
if [ -f .git/hooks/post-merge ]; then
  echo "Updating post-merge hook..."
  sed -i 's|dev-hooks/|hooks/|g' .git/hooks/post-merge
fi

echo "✅ Git hook paths updated!"
echo ""
echo "Hooks now point to:"
echo "  hooks/ (instead of dev-hooks/)"
echo "  hooks/ (instead of .claude/dev-hooks/)"