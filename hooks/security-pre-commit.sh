#!/bin/bash
# Pre-commit hook to enforce security rules

echo "🔍 Running security pre-commit checks..."

# Define secret patterns
SECRET_PATTERNS=(
  # Passwords
  "password[[:space:]]*=[[:space:]]*['\"]?.*['\"]?"
  "passwd[[:space:]]*=[[:space:]]*['\"]?.*['\"]?"
  "pwd[[:space:]]*=[[:space:]]*['\"]?.*['\"]?"
  
  # API Keys and Tokens
  "api[_-]?key[[:space:]]*=[[:space:]]*['\"][A-Za-z0-9]{16,}['\"]"
  "apikey[[:space:]]*=[[:space:]]*['\"][A-Za-z0-9]{16,}['\"]"
  "access[_-]?token[[:space:]]*=[[:space:]]*['\"][A-Za-z0-9]{16,}['\"]"
  "auth[_-]?token[[:space:]]*=[[:space:]]*['\"][A-Za-z0-9]{16,}['\"]"
  "bearer[[:space:]]+[a-zA-Z0-9_-]+\\.[a-zA-Z0-9_-]+\\.[a-zA-Z0-9_-]+"
  
  # Private Keys
  "-----BEGIN (RSA | DSA|EC|OPENSSH) PRIVATE KEY-----"
  "-----BEGIN PGP PRIVATE KEY BLOCK-----"
  "-----BEGIN PRIVATE KEY-----"
  
  # Cloud Provider Patterns
  "aws[_-]?access[_-]?key[_-]?id[[:space:]]*=[[:space:]]*['\"]?[A-Z0-9]{20}['\"]?"
  "aws[_-]?secret[_-]?access[_-]?key[[:space:]]*=[[:space:]]*['\"]?[A-Za-z0-9/+=]{40}['\"]?"
  "azure[_-]?storage[_-]?account[_-]?key"
  "gcp[_-]?api[_-]?key"
  
  # Database URLs
  "(postgres|postgresql|mysql|mongodb|redis)://[^[:space:]]+:[^[:space:]]+@"
  "DATABASE_URL[[:space:]]*=[[:space:]]*['\"]?(postgres|mysql|mongodb)"
  
  # SMTP Credentials
  "smtp[_-]?pass(word)?[[:space:]]*=[[:space:]]*['\"]?.*['\"]?"
  "mail[_-]?pass(word)?[[:space:]]*=[[:space:]]*['\"]?.*['\"]?"
)

# Test-safe patterns (won't trigger in test files)
TEST_EXCLUSIONS=(
  "mock-"
  "test-"
  "fake-"
  "example-"
  "dummy-"
  "sample-"
  "your-api-key"
  "api-key-here"
  "<api[_-]?key>"
  "@example\\.(com|org|net)"
  "@test\\.(com|org|net)"
  "@localhost"
  "@mock\\."
)

FOUND_SECRETS=0
FILES_TO_CHECK=$(git diff --cached --name-only --diff-filter=ACM)

for file in $FILES_TO_CHECK; do
  is_test_file=false
  is_doc_file=false
  is_prisma_file=false

  # Check if it's a test file
  if [[ "$file" =~ (test|tests|__tests__|__mocks__|spec|specs)/ || "$file" =~ \.(test|spec)\\.js$ ]]; then
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
  for pattern in "${SECRET_PATTERNS[@]}"; do
    matches=$(grep -inE "$pattern" "$file" 2>/dev/null || true)
    
    if [ -n "$matches" ]; then
      # Check if it's a test pattern
      is_excluded=false
      for exclusion in "${TEST_EXCLUSIONS[@]}"; do
        if echo "$matches" | grep -qE "$exclusion"; then
          is_excluded=true
          break
        fi
      done
      
      if [ "$is_excluded" = false ] && [ "$is_test_file" = false ] && [ "$is_doc_file" = false ] && [ "$is_prisma_file" = false ]; then
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