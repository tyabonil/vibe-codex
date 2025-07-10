#!/bin/bash
# Pre-commit hook to enforce security rules

echo "🔍 Running security pre-commit checks..."

# Load the configuration
CONFIG_FILE="config/rules.json"
if [ ! -f "$CONFIG_FILE" ]; then
  echo "❌ Configuration file not found: $CONFIG_FILE"
  exit 1
fi

# Read the configuration
SECRET_PATTERNS=$(jq -r '.rules.level1_security.checks.secrets_detection.patterns[]' "$CONFIG_FILE")

FOUND_SECRETS=0
FILES_TO_CHECK=$(git diff --cached --name-only --diff-filter=ACM)

for file in $FILES_TO_CHECK; do
  is_test_file=false
  is_doc_file=false
  is_prisma_file=false

  # Check if it's a test file
  if [[ "$file" =~ (test|tests|__tests__|__mocks__|spec|specs)/ || "$file" =~ \.(test|spec)\.js$ ]]; then
    is_test_file=true
  fi

  # Check if it's a documentation file
  if [[ "$file" =~ \.md$ || "$file" =~ README || "$file" =~ (docs|doc)/ ]]; then
    is_doc_file=true
  fi

  # Check if it's a prisma schema file
  if [[ "$file" =~ \.prisma$ ]]; then
    is_prisma_file=true
  fi
  
  # Skip binary files
  if file "$file" | grep -q "binary"; then
    continue
  fi
  
  # Check each pattern
  for pattern in $SECRET_PATTERNS; do
    matches=$(grep -inE "$pattern" "$file" 2>/dev/null || true)
    
    if [ -n "$matches" ]; then
      if [ "$is_test_file" = false ] && [ "$is_doc_file" = false ] && [ "$is_prisma_file" = false ]; then
        echo ""
        echo "❌ CRITICAL: Potential secret found in $file"
        echo "Pattern: $pattern"
        echo "$matches" | head -3
        FOUND_SECRETS=1
      fi
    fi
  done
done

if [ $FOUND_SECRETS -eq 1 ]; then
  echo ""
  echo "🛑 Commit blocked: Remove all secrets before committing"
  echo ""
  echo "💡 Tips:"
  echo "- Use environment variables for sensitive data"
  echo "- Add secrets to .env.local (not .env)"  
  echo "- For tests, use obvious mock values (mock-*, test-*, etc)"
  exit 1
fi

echo "✅ No secrets detected"
