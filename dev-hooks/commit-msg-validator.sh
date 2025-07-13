#!/bin/bash
set -euo pipefail
# Validate commit message format

# Get the commit message file path
COMMIT_MSG_FILE=$1
COMMIT_MSG=$(cat "$COMMIT_MSG_FILE")

# Load the configuration
CONFIG_FILE="config/commit-msg.json"
if [ ! -f "$CONFIG_FILE" ]; then
  echo "❌ Configuration file not found: $CONFIG_FILE"
  exit 1
fi

# Read the configuration
VALID_TYPES=$(jq -r '.types[]' "$CONFIG_FILE" | tr '\n' '|')
MAX_LINE_LENGTH=$(jq -r '.max_line_length' "$CONFIG_FILE")
REQUIRE_ISSUE_REFERENCE=$(jq -r '.require_issue_reference' "$CONFIG_FILE")

# Check format: type(scope): subject
if ! echo "$COMMIT_MSG" | grep -qE "^(${VALID_TYPES%?})(\([^)]+\))?: .+"; then
  echo ""
  echo "❌ Invalid commit message format!"
  echo ""
  echo "Expected format: <type>(<scope>): <subject>"
  echo "                 <type>: <subject>"
  echo ""
  echo "Valid types: $(jq -r '.types[]' "$CONFIG_FILE" | tr '\n' ' ')"
  echo ""
  exit 1
fi

# Check first line length
FIRST_LINE=$(echo "$COMMIT_MSG" | head -1)
if [ ${#FIRST_LINE} -gt "$MAX_LINE_LENGTH" ]; then
  echo ""
  echo "⚠️  Warning: First line is ${#FIRST_LINE} characters (recommended: ≤$MAX_LINE_LENGTH)"
fi

# Check for issue reference
if [ "$REQUIRE_ISSUE_REFERENCE" = "true" ] && ! echo "$COMMIT_MSG" | grep -qE "(#[0-9]+|[Ff]ixes|[Cc]loses|[Rr]esolves)"; then
  echo "💡 Tip: Consider referencing an issue (e.g., 'Fixes #123')"
fi

# Check for a body
if [ $(echo "$COMMIT_MSG" | wc -l) -lt 2 ]; then
  echo "💡 Tip: Consider adding a body to your commit message to explain the 'what' and 'why' of your changes."
fi

echo "✅ Commit message validation passed"
