#!/bin/bash
# vibe-codex test quality check
# Checks for common test anti-patterns

set -e

# Colors for output
RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🧪 Checking test quality...${NC}"

# Track if any issues found
ISSUES_FOUND=false
BLOCKING_ISSUES=false

# Find test files - common patterns
TEST_FILES=$(find . -type f \( \
    -name "*.test.js" -o -name "*.spec.js" -o \
    -name "*.test.ts" -o -name "*.spec.ts" -o \
    -name "*.test.jsx" -o -name "*.spec.jsx" -o \
    -name "*.test.tsx" -o -name "*.spec.tsx" -o \
    -name "*_test.py" -o -name "test_*.py" -o \
    -name "*.test.rb" -o -name "*_spec.rb" \
    \) -not -path "*/node_modules/*" -not -path "*/.git/*" -not -path "*/vendor/*" -not -path "*/venv/*" 2>/dev/null || true)

if [ -z "$TEST_FILES" ]; then
    echo -e "${YELLOW}⚠️  No test files found${NC}"
    exit 0
fi

echo -e "${BLUE}Found $(echo "$TEST_FILES" | wc -l) test files to check${NC}"

# Check each test file
for file in $TEST_FILES; do
    # Skip if file doesn't exist (could be deleted)
    [ -f "$file" ] || continue
    
    # Check for .only() or .skip()
    if grep -E '\.(only|skip)\s*\(' "$file" >/dev/null 2>&1; then
        echo -e "${RED}❌ $file: Contains .only() or .skip()${NC}"
        grep -n -E '\.(only|skip)\s*\(' "$file" | head -3
        ISSUES_FOUND=true
        BLOCKING_ISSUES=true
    fi
    
    # Check for focused tests in Python (pytest)
    if [[ "$file" == *.py ]] && grep -E '@pytest\.mark\.(only|skip)' "$file" >/dev/null 2>&1; then
        echo -e "${RED}❌ $file: Contains focused/skipped pytest markers${NC}"
        grep -n -E '@pytest\.mark\.(only|skip)' "$file" | head -3
        ISSUES_FOUND=true
        BLOCKING_ISSUES=true
    fi
    
    # Check for console.log in test files (unless in specific contexts)
    if grep -E 'console\.(log|error|warn)' "$file" 2>/dev/null | grep -v -E '(// |/\*|\*|expect.*console|process\.env|NODE_ENV)' >/dev/null; then
        echo -e "${YELLOW}⚠️  $file: Contains console statements${NC}"
        grep -n -E 'console\.(log|error|warn)' "$file" | grep -v -E '(// |/\*|\*)' | head -3
        ISSUES_FOUND=true
    fi
    
    # Check for empty test descriptions (both single and double quotes)
    if grep -E "(it|test|describe)\s*\(\s*['\"]['\"]" "$file" >/dev/null 2>&1; then
        echo -e "${RED}❌ $file: Contains empty test descriptions${NC}"
        grep -n -E "(it|test|describe)\s*\(\s*['\"]['\"]" "$file" | head -3
        ISSUES_FOUND=true
        BLOCKING_ISSUES=true
    fi
    
    # Check for commented out tests (basic check)
    if grep -E '^\s*//\s*(it|test|describe)\s*\(' "$file" >/dev/null 2>&1; then
        echo -e "${YELLOW}⚠️  $file: Contains commented out tests${NC}"
        grep -n -E '^\s*//\s*(it|test|describe)\s*\(' "$file" | head -3
        ISSUES_FOUND=true
    fi
done

# Check for test files in wrong locations (excluding common temp/build dirs)
MISPLACED_TESTS=$(find . -type f \( -name "*.test.*" -o -name "*.spec.*" \) \
    -not -path "*/test/*" -not -path "*/tests/*" -not -path "*/__tests__/*" \
    -not -path "*/spec/*" -not -path "*/node_modules/*" -not -path "*/.git/*" \
    -not -path "*/dist/*" -not -path "*/build/*" -not -path "*/temp*/*" \
    -not -path "*/.vibe-codex/*" -not -path "./test.*" -not -path "./spec.*" 2>/dev/null | head -10 || true)

# Only warn if there are many misplaced tests (more than 2)
MISPLACED_COUNT=$(echo "$MISPLACED_TESTS" | grep -c "^" || echo "0")
if [ "$MISPLACED_COUNT" -gt 2 ]; then
    echo -e "${YELLOW}⚠️  Many test files found outside test directories:${NC}"
    echo "$MISPLACED_TESTS" | head -5
    ISSUES_FOUND=true
fi

# Summary
if [ "$BLOCKING_ISSUES" = true ]; then
    echo -e ""
    echo -e "${RED}🚨 Test quality issues detected!${NC}"
    echo -e "${RED}Please fix .only(), .skip(), and empty test descriptions before committing.${NC}"
    
    if [ "${VIBE_CODEX_HOOK_TYPE}" = "pre-commit" ]; then
        exit 1
    fi
elif [ "$ISSUES_FOUND" = true ]; then
    echo -e ""
    echo -e "${YELLOW}⚠️  Minor test quality issues found${NC}"
    echo -e "${YELLOW}Consider fixing console statements and commented tests.${NC}"
else
    echo -e ""
    echo -e "${GREEN}✅ All test quality checks passed!${NC}"
fi

exit 0