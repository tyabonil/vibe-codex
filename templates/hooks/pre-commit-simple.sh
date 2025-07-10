#!/bin/sh
# vibe-codex simple pre-commit hook
# This is a minimal template for basic checks

echo "🚀 Running pre-commit checks..."

# Basic security check - look for common secret patterns
if git diff --cached --name-only | xargs grep -E "(api_key|apikey|secret|password|token)\s*=\s*['\"][^'\"]+['\"]" 2>/dev/null; then
  echo "❌ Error: Potential secrets detected!"
  echo "Please remove sensitive information before committing."
  exit 1
fi

echo "✅ Pre-commit checks passed!"
exit 0