#!/bin/sh
# vibe-codex simple commit-msg hook
# Validates basic commit message format

commit_msg=$(cat "$1")

# Simple check - ensure message is not empty and has reasonable length
if [ -z "$commit_msg" ]; then
  echo "❌ Error: Commit message cannot be empty!"
  exit 1
fi

if [ ${#commit_msg} -lt 10 ]; then
  echo "❌ Error: Commit message too short (minimum 10 characters)"
  exit 1
fi

if [ ${#commit_msg} -gt 100 ]; then
  echo "⚠️  Warning: Commit message is quite long (${#commit_msg} characters)"
fi

echo "✅ Commit message accepted!"
exit 0