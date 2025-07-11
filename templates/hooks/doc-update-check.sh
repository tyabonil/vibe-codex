#!/bin/bash
# vibe-codex documentation update enforcement hook
# Reminds developers to update docs when code changes

# Get list of staged files
STAGED_FILES=$(git diff --cached --name-only)

# Check if any code files are being changed
CODE_CHANGED=false
DOC_CHANGED=false
SUGGESTIONS=""

# Define patterns that should trigger doc checks
declare -A DOC_TRIGGERS=(
  ["api/"]="docs/API.md, README.md"
  ["routes/"]="docs/API.md, README.md"
  ["controllers/"]="docs/API.md"
  ["config/"]="CONFIGURATION.md, .env.example"
  ["lib/"]="docs/API.md, README.md"
  ["src/"]="README.md"
  ["package.json"]="README.md (dependencies), docs/INSTALLATION.md"
  [".env"]="env.example, CONFIGURATION.md"
  ["schema"]="docs/DATABASE.md, docs/API.md"
  ["migrations/"]="docs/DATABASE.md, CHANGELOG.md"
)

# Check staged files
for file in $STAGED_FILES; do
  # Check if documentation file
  if [[ "$file" =~ \.(md|txt)$ ]] || [[ "$file" == ".env.example" ]]; then
    DOC_CHANGED=true
  fi
  
  # Check if code file that might need doc updates
  if [[ "$file" =~ \.(js|ts|jsx|tsx|py|go|java|rb|php)$ ]]; then
    CODE_CHANGED=true
    
    # Check against trigger patterns
    for pattern in "${!DOC_TRIGGERS[@]}"; do
      if [[ "$file" =~ $pattern ]]; then
        SUGGESTIONS="${SUGGESTIONS}\n- ${file} → Consider updating: ${DOC_TRIGGERS[$pattern]}"
      fi
    done
  fi
  
  # Special file checks
  case "$file" in
    "package.json")
      CODE_CHANGED=true
      SUGGESTIONS="${SUGGESTIONS}\n- package.json → Consider updating: README.md (dependencies), INSTALLATION.md"
      ;;
    ".env" | ".env.*")
      CODE_CHANGED=true
      SUGGESTIONS="${SUGGESTIONS}\n- ${file} → Consider updating: .env.example, CONFIGURATION.md"
      ;;
    "Dockerfile" | "docker-compose.yml")
      CODE_CHANGED=true
      SUGGESTIONS="${SUGGESTIONS}\n- ${file} → Consider updating: README.md (setup), docs/DEPLOYMENT.md"
      ;;
  esac
done

# If code changed but no docs, show reminder
if [ "$CODE_CHANGED" = true ] && [ "$DOC_CHANGED" = false ]; then
  echo "📚 Documentation Reminder"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "You've made code changes without updating documentation."
  echo ""
  
  if [ -n "$SUGGESTIONS" ]; then
    echo "Based on your changes, consider updating:"
    echo -e "$SUGGESTIONS"
    echo ""
  fi
  
  echo "Common documentation to update:"
  echo "- README.md (features, setup, usage)"
  echo "- CHANGELOG.md (notable changes)"
  echo "- API documentation (if applicable)"
  echo "- Configuration docs (new options)"
  echo ""
  echo "To proceed without updating docs:"
  echo "  git commit --no-verify"
  echo ""
  echo "To add documentation:"
  echo "  git add <doc-file> && git commit"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  
  # Ask if they want to continue
  read -p "Continue without updating docs? (y/N) " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    exit 1
  fi
elif [ "$DOC_CHANGED" = true ]; then
  echo "✅ Documentation updated alongside code changes"
fi

exit 0