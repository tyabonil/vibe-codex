#!/bin/bash
# Validate commit message format

# Get the commit message file path
COMMIT_MSG_FILE=$1
COMMIT_MSG=$(cat "$COMMIT_MSG_FILE")

echo "📝 Validating commit message..."

# Define valid types
VALID_TYPES=(
  "feat"      # New feature
  "fix"       # Bug fix
  "docs"      # Documentation only
  "style"     # Code style (formatting, semicolons, etc)
  "refactor"  # Code change that neither fixes bug nor adds feature
  "perf"      # Performance improvement
  "test"      # Adding missing tests
  "build"     # Changes to build process
  "ci"        # CI configuration changes
  "chore"     # Other changes that don't modify src or test
  "revert"    # Revert a previous commit
)

# Convert array to regex pattern
TYPES_PATTERN=$(IFS='|'; echo "${VALID_TYPES[*]}")

# Check format: type(scope): subject
if ! echo "$COMMIT_MSG" | grep -qE "^($TYPES_PATTERN)(\([^)]+\))?: .+"; then
  echo ""
  echo "❌ Invalid commit message format!"
  echo ""
  echo "Expected format: <type>(<scope>): <subject>"
  echo "                 <type>: <subject>"
  echo ""
  echo "Valid types:"
  for type in "${VALID_TYPES[@]}"; do
    case $type in
      feat) echo "  feat      - New feature" ;;
      fix) echo "  fix       - Bug fix" ;;
      docs) echo "  docs      - Documentation only" ;;
      style) echo "  style     - Code style changes" ;;
      refactor) echo "  refactor  - Code refactoring" ;;
      perf) echo "  perf      - Performance improvement" ;;
      test) echo "  test      - Adding tests" ;;
      build) echo "  build     - Build system changes" ;;
      ci) echo "  ci        - CI configuration" ;;
      chore) echo "  chore     - Other changes" ;;
      revert) echo "  revert    - Revert previous commit" ;;
    esac
  done
  echo ""
  echo "Examples:"
  echo "  feat(auth): Add login functionality"
  echo "  fix: Resolve memory leak in contact form"
  echo "  docs(api): Update endpoint documentation"
  echo "  refactor(utils): Simplify date formatting"
  echo ""
  exit 1
fi

# Check first line length (should be ≤72 chars)
FIRST_LINE=$(echo "$COMMIT_MSG" | head -1)
if [ ${#FIRST_LINE} -gt 72 ]; then
  echo ""
  echo "⚠️  Warning: First line is ${#FIRST_LINE} characters (recommended: ≤72)"
fi

# Check for issue reference (optional but recommended)
if ! echo "$COMMIT_MSG" | grep -qE "(#[0-9]+|[Ff]ixes|[Cc]loses|[Rr]esolves)"; then
  echo "💡 Tip: Consider referencing an issue (e.g., 'Fixes #123')"
fi

# Extract type for specific validations
COMMIT_TYPE=$(echo "$COMMIT_MSG" | grep -oE "^[a-z]+")

# Type-specific validations
case $COMMIT_TYPE in
  feat)
    if ! echo "$COMMIT_MSG" | grep -qiE "(add|implement|introduce|create)"; then
      echo "💡 Tip: feat commits typically use verbs like 'Add', 'Implement', 'Create'"
    fi
    ;;
  fix)
    if ! echo "$COMMIT_MSG" | grep -qiE "(fix|resolve|correct|repair)"; then
      echo "💡 Tip: fix commits typically use verbs like 'Fix', 'Resolve', 'Correct'"
    fi
    ;;
esac

echo "✅ Commit message validation passed"
echo "Type: $COMMIT_TYPE"
