#!/bin/bash
# vibe-codex branch name validation hook
# Enforces consistent branch naming conventions

set -e

# Colors for output
RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🌿 Validating branch name...${NC}"

# Get current branch name
# In tests, BRANCH_NAME is provided via environment variable
if [ -z "$BRANCH_NAME" ]; then
    BRANCH_NAME=$(git symbolic-ref --short HEAD 2>/dev/null || echo "")
fi

if [ -z "$BRANCH_NAME" ]; then
    echo -e "${RED}❌ Error: Unable to determine current branch${NC}"
    exit 1
fi

# Skip validation for main branches
MAIN_BRANCHES="main master develop staging production preview"
for main_branch in $MAIN_BRANCHES; do
    if [ "$BRANCH_NAME" = "$main_branch" ]; then
        echo -e "${GREEN}✅ Main branch - skipping validation${NC}"
        exit 0
    fi
done

# Check if branch validation is configured
CONFIG_FILE=".vibe-codex.json"
if [ -f "$CONFIG_FILE" ]; then
    # Check if jq is available
    if command -v jq >/dev/null 2>&1; then
        # Check if branch validation is disabled
        VALIDATION_ENABLED=$(jq -r 'if has("advanced") and .advanced.branchValidation != null then .advanced.branchValidation else true end' "$CONFIG_FILE" 2>/dev/null || echo "true")
        if [ "$VALIDATION_ENABLED" = "false" ]; then
            echo -e "${GREEN}✅ Branch validation disabled in config${NC}"
            exit 0
        fi
        
        # Get custom patterns if defined
        CUSTOM_PATTERNS=$(jq -r '.branchPatterns[]? // empty' "$CONFIG_FILE" 2>/dev/null || echo "")
    else
        # Fallback: simple grep check if jq is not available
        if grep -q '"branchValidation"[[:space:]]*:[[:space:]]*false' "$CONFIG_FILE" 2>/dev/null; then
            echo -e "${GREEN}✅ Branch validation disabled in config${NC}"
            exit 0
        fi
    fi
fi

# Define valid branch patterns (default if no custom patterns)
if [ -z "$CUSTOM_PATTERNS" ]; then
    VALID_PATTERNS=(
        "^feature/[a-z0-9-]+$"
        "^fix/[a-z0-9-]+$"
        "^bugfix/[a-z0-9-]+$"
        "^hotfix/[a-z0-9-]+$"
        "^docs/[a-z0-9-]+$"
        "^refactor/[a-z0-9-]+$"
        "^test/[a-z0-9-]+$"
        "^chore/[a-z0-9-]+$"
        "^feature/issue-[0-9]+-[a-z0-9-]+$"
        "^fix/issue-[0-9]+-[a-z0-9-]+$"
        "^bugfix/issue-[0-9]+-[a-z0-9-]+$"
    )
else
    # Use custom patterns from config
    IFS=$'\n' read -d '' -r -a VALID_PATTERNS <<< "$CUSTOM_PATTERNS" || true
fi

# Check branch length
BRANCH_LENGTH=${#BRANCH_NAME}
MAX_LENGTH=50
if [ $BRANCH_LENGTH -gt $MAX_LENGTH ]; then
    echo -e "${RED}❌ Branch name is too long (${BRANCH_LENGTH} > ${MAX_LENGTH} chars)${NC}"
    if [ "${VIBE_CODEX_HOOK_TYPE}" = "pre-push" ]; then
        exit 1
    fi
fi

# Check for invalid characters
if [[ ! "$BRANCH_NAME" =~ ^[a-z0-9/_-]+$ ]]; then
    echo -e "${RED}❌ Branch name contains invalid characters${NC}"
    echo -e "${YELLOW}Only lowercase letters, numbers, hyphens, underscores, and forward slashes allowed${NC}"
    exit 1
fi

# Check if branch matches any valid pattern
VALID=false
for pattern in "${VALID_PATTERNS[@]}"; do
    if [[ $BRANCH_NAME =~ $pattern ]]; then
        VALID=true
        break
    fi
done

if [ "$VALID" = true ]; then
    echo -e "${GREEN}✅ Branch name is valid: $BRANCH_NAME${NC}"
else
    echo -e "${RED}❌ Branch name violation: '$BRANCH_NAME'${NC}"
    echo -e "${YELLOW}Branch doesn't match any configured patterns${NC}"
    echo -e ""
    echo -e "${BLUE}Valid patterns:${NC}"
    for pattern in "${VALID_PATTERNS[@]}"; do
        echo -e "  • $pattern"
    done
    echo -e ""
    echo -e "${BLUE}Examples of valid branch names:${NC}"
    echo -e "  ${GREEN}✅${NC} feature/add-login"
    echo -e "  ${GREEN}✅${NC} fix/header-styling"
    echo -e "  ${GREEN}✅${NC} docs/update-readme"
    echo -e "  ${GREEN}✅${NC} feature/issue-123-user-auth"
    echo -e ""
    
    # Try to suggest a correct branch name
    if [[ $BRANCH_NAME =~ ^([^/]+)/(.+)$ ]]; then
        TYPE="${BASH_REMATCH[1]}"
        DESC="${BASH_REMATCH[2]}"
        # Normalize description
        NORM_DESC=$(echo "$DESC" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9-]/-/g' | sed 's/--*/-/g' | sed 's/^-*//' | sed 's/-*$//')
        echo -e "${GREEN}💡 Suggested rename:${NC}"
        echo -e "  git branch -m $TYPE/$NORM_DESC"
    else
        # Extract any numbers that might be issue references
        if [[ $BRANCH_NAME =~ ([0-9]+) ]]; then
            ISSUE_NUM="${BASH_REMATCH[1]}"
            echo -e "${GREEN}💡 Suggested rename:${NC}"
            echo -e "  git branch -m feature/issue-$ISSUE_NUM-description"
        else
            echo -e "${GREEN}💡 To rename your branch:${NC}"
            echo -e "  git branch -m feature/your-feature-name"
        fi
    fi
    
    echo -e ""
    
    # In pre-push context, block the push
    if [ "${VIBE_CODEX_HOOK_TYPE}" = "pre-push" ]; then
        echo -e "${YELLOW}⚠️  Push blocked due to branch naming violation${NC}"
        echo -e "${YELLOW}Please rename your branch before pushing.${NC}"
        exit 1
    else
        # In other contexts, just warn
        echo -e "${YELLOW}⚠️  Warning: Branch name doesn't follow conventions${NC}"
        echo -e "${YELLOW}Consider renaming before pushing.${NC}"
    fi
fi