#!/bin/bash

# Test Coverage Validator Hook
# Ensures 100% test coverage for new code before allowing push

set -e

# Colors for output
RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
COVERAGE_THRESHOLD=${TEST_COVERAGE_THRESHOLD:-100}
COVERAGE_ENABLED=${TEST_COVERAGE_ENABLED:-true}

if [ "$COVERAGE_ENABLED" = "false" ]; then
    echo -e "${YELLOW}⚠️  Test coverage validation disabled${NC}"
    exit 0
fi

echo -e "${BLUE}🧪 Checking test coverage for changed files...${NC}"

# Function to detect test framework
detect_test_framework() {
    if [ -f "package.json" ]; then
        # Check for common JS test frameworks
        if grep -q "\"jest\"" package.json; then
            echo "jest"
        elif grep -q "\"mocha\"" package.json; then
            echo "mocha"
        elif grep -q "\"vitest\"" package.json; then
            echo "vitest"
        elif grep -q "\"@angular/core\"" package.json; then
            echo "ng"
        else
            echo "npm"
        fi
    elif [ -f "pyproject.toml" ] || [ -f "setup.py" ]; then
        echo "pytest"
    elif [ -f "go.mod" ]; then
        echo "go"
    elif [ -f "Cargo.toml" ]; then
        echo "cargo"
    else
        echo "unknown"
    fi
}

# Function to get changed files
get_changed_files() {
    local base_branch="main"
    
    # Check if preview workflow is enabled
    if [ -f "config/project-patterns.json" ] && command -v jq >/dev/null 2>&1; then
        local preview_enabled=$(jq -r '.rulesets.preview_workflow.enabled // false' config/project-patterns.json 2>/dev/null)
        if [ "$preview_enabled" = "true" ]; then
            base_branch="preview"
        fi
    fi
    
    # Get list of changed files (excluding tests)
    git diff --name-only "$base_branch"...HEAD | grep -E '\.(js|jsx|ts|tsx|py|go|rs)$' | grep -v -E '(test|spec|\.test\.|\.spec\.)'
}

# Function to check if test file exists
find_test_file() {
    local source_file=$1
    local dir=$(dirname "$source_file")
    local basename=$(basename "$source_file")
    local name="${basename%.*}"
    local ext="${basename##*.}"
    
    # Common test file patterns
    local test_patterns=(
        "${dir}/__tests__/${name}.test.${ext}"
        "${dir}/__tests__/${name}.spec.${ext}"
        "${dir}/${name}.test.${ext}"
        "${dir}/${name}.spec.${ext}"
        "${dir}/test_${name}.py"
        "${dir}/${name}_test.go"
        "${dir}/tests/${name}_test.rs"
    )
    
    for pattern in "${test_patterns[@]}"; do
        if [ -f "$pattern" ]; then
            echo "$pattern"
            return 0
        fi
    done
    
    return 1
}

# Function to run coverage for a specific file
check_file_coverage() {
    local file=$1
    local framework=$2
    
    case $framework in
        jest)
            npm test -- --coverage --collectCoverageFrom="$file" --coverageThreshold="{\"global\":{\"branches\":$COVERAGE_THRESHOLD,\"functions\":$COVERAGE_THRESHOLD,\"lines\":$COVERAGE_THRESHOLD,\"statements\":$COVERAGE_THRESHOLD}}" "$file" 2>&1
            ;;
        mocha)
            npx nyc --check-coverage --lines $COVERAGE_THRESHOLD --functions $COVERAGE_THRESHOLD --branches $COVERAGE_THRESHOLD mocha "$file" 2>&1
            ;;
        vitest)
            npx vitest run --coverage --coverage.lines=$COVERAGE_THRESHOLD --coverage.functions=$COVERAGE_THRESHOLD --coverage.branches=$COVERAGE_THRESHOLD "$file" 2>&1
            ;;
        pytest)
            pytest --cov="$file" --cov-fail-under=$COVERAGE_THRESHOLD "$file" 2>&1
            ;;
        go)
            go test -cover -coverprofile=coverage.out "./$(dirname "$file")" && go tool cover -func=coverage.out | grep "$file" 2>&1
            ;;
        *)
            echo "Framework not supported for coverage checks"
            return 1
            ;;
    esac
}

# Main validation logic
FRAMEWORK=$(detect_test_framework)

if [ "$FRAMEWORK" = "unknown" ]; then
    echo -e "${YELLOW}⚠️  Unable to detect test framework${NC}"
    echo -e "${YELLOW}   Skipping coverage validation${NC}"
    exit 0
fi

echo -e "${CYAN}📦 Detected test framework: $FRAMEWORK${NC}"

# Get changed files
CHANGED_FILES=$(get_changed_files)

if [ -z "$CHANGED_FILES" ]; then
    echo -e "${GREEN}✅ No source files changed - skipping coverage check${NC}"
    exit 0
fi

# Check each changed file
MISSING_TESTS=()
COVERAGE_FAILURES=()

echo -e "${BLUE}📋 Checking ${#CHANGED_FILES[@]} changed files...${NC}"
echo ""

while IFS= read -r file; do
    if [ -z "$file" ]; then
        continue
    fi
    
    echo -e "${BLUE}Checking: $file${NC}"
    
    # Check if test file exists
    if test_file=$(find_test_file "$file"); then
        echo -e "  ${GREEN}✓${NC} Test file found: $test_file"
        
        # Run coverage check
        if output=$(check_file_coverage "$file" "$FRAMEWORK"); then
            echo -e "  ${GREEN}✓${NC} Coverage meets threshold"
        else
            echo -e "  ${RED}✗${NC} Coverage below threshold"
            COVERAGE_FAILURES+=("$file")
        fi
    else
        echo -e "  ${RED}✗${NC} No test file found"
        MISSING_TESTS+=("$file")
    fi
    echo ""
done <<< "$CHANGED_FILES"

# Report results
if [ ${#MISSING_TESTS[@]} -eq 0 ] && [ ${#COVERAGE_FAILURES[@]} -eq 0 ]; then
    echo -e "${GREEN}✅ All changed files have tests with adequate coverage!${NC}"
    exit 0
fi

echo -e "${RED}❌ Test coverage validation failed${NC}"
echo ""

if [ ${#MISSING_TESTS[@]} -gt 0 ]; then
    echo -e "${RED}Files missing tests:${NC}"
    for file in "${MISSING_TESTS[@]}"; do
        echo -e "  ${RED}•${NC} $file"
        
        # Suggest test file location
        dir=$(dirname "$file")
        basename=$(basename "$file")
        name="${basename%.*}"
        ext="${basename##*.}"
        
        echo -e "    ${YELLOW}→ Create test at:${NC} ${dir}/${name}.test.${ext}"
    done
    echo ""
fi

if [ ${#COVERAGE_FAILURES[@]} -gt 0 ]; then
    echo -e "${RED}Files with insufficient coverage:${NC}"
    for file in "${COVERAGE_FAILURES[@]}"; do
        echo -e "  ${RED}•${NC} $file"
        echo -e "    ${YELLOW}→ Add tests to reach ${COVERAGE_THRESHOLD}% coverage${NC}"
    done
    echo ""
fi

echo -e "${YELLOW}💡 Suggestions:${NC}"
echo -e "  1. Write tests for all new code"
echo -e "  2. Aim for ${COVERAGE_THRESHOLD}% coverage"
echo -e "  3. Test edge cases and error conditions"
echo -e "  4. Use test-driven development (TDD)"
echo ""

if [ "$FRAMEWORK" = "jest" ]; then
    echo -e "${CYAN}📝 Example test template:${NC}"
    echo -e "${CYAN}describe('YourModule', () => {${NC}"
    echo -e "${CYAN}  it('should do something', () => {${NC}"
    echo -e "${CYAN}    expect(yourFunction()).toBe(expectedValue);${NC}"
    echo -e "${CYAN}  });${NC}"
    echo -e "${CYAN}});${NC}"
fi

echo ""
echo -e "${YELLOW}⚠️  Push blocked due to insufficient test coverage${NC}"
echo -e "${YELLOW}To skip (not recommended): export TEST_COVERAGE_ENABLED=false${NC}"

exit 1