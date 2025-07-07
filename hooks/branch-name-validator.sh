#!/bin/bash

# Branch Name Validator Hook
# Validates branch naming convention before allowing push

set -e

# Colors for output
RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🌿 Validating branch name...${NC}"

# Get current branch name
BRANCH_NAME=$(git symbolic-ref --short HEAD 2>/dev/null || echo "")

if [ -z "$BRANCH_NAME" ]; then
    echo -e "${RED}❌ Error: Unable to determine current branch${NC}"
    exit 1
fi

# Skip validation for main branches
if [[ "$BRANCH_NAME" == "main" || "$BRANCH_NAME" == "master" || "$BRANCH_NAME" == "preview" ]]; then
    echo -e "${GREEN}✅ Main branch - skipping validation${NC}"
    exit 0
fi

# Define valid branch patterns
VALID_PATTERNS=(
    "^feature/issue-[0-9]+-[a-z0-9-]+$"
    "^bugfix/issue-[0-9]+-[a-z0-9-]+$"
    "^hotfix/issue-[0-9]+-[a-z0-9-]+$"
)

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
    echo -e "${YELLOW}Required format: {type}/issue-{number}-{description}${NC}"
    echo -e "${YELLOW}Types: feature, bugfix, hotfix${NC}"
    echo -e ""
    echo -e "${BLUE}Examples of valid branch names:${NC}"
    echo -e "  ${GREEN}✅${NC} feature/issue-61-healthcare-ai-blog"
    echo -e "  ${GREEN}✅${NC} bugfix/issue-145-fix-compliance-check"
    echo -e "  ${GREEN}✅${NC} hotfix/issue-99-security-patch"
    echo -e ""
    echo -e "${BLUE}Common mistakes:${NC}"
    echo -e "  ${RED}❌${NC} issue-61-healthcare-ai-blog ${YELLOW}(missing 'feature/' prefix)${NC}"
    echo -e "  ${RED}❌${NC} feature-issue-61-blog ${YELLOW}(use '/' not '-' after type)${NC}"
    echo -e "  ${RED}❌${NC} feature/61-blog ${YELLOW}(missing 'issue-' before number)${NC}"
    echo -e ""
    
    # Try to suggest a correct branch name
    if [[ $BRANCH_NAME =~ ([0-9]+) ]]; then
        ISSUE_NUM="${BASH_REMATCH[1]}"
        # Extract description part
        DESC=$(echo "$BRANCH_NAME" | sed -E "s/.*$ISSUE_NUM[-_]?//" | sed 's/[^a-z0-9-]/-/g' | sed 's/^-*//' | sed 's/-*$//' | tr '[:upper:]' '[:lower:]')
        if [ -z "$DESC" ]; then
            DESC="description"
        fi
        
        # Determine type
        if [[ $BRANCH_NAME =~ (bug|fix|hotfix) ]]; then
            TYPE="bugfix"
        else
            TYPE="feature"
        fi
        
        echo -e "${GREEN}💡 Suggested rename:${NC}"
        echo -e "  git branch -m $TYPE/issue-$ISSUE_NUM-$DESC"
    else
        echo -e "${GREEN}💡 To rename your branch:${NC}"
        echo -e "  git branch -m feature/issue-{number}-{description}"
    fi
    
    echo -e ""
    echo -e "${YELLOW}⚠️  Push blocked due to branch naming violation${NC}"
    echo -e "${YELLOW}Please rename your branch before pushing.${NC}"
    
    # Non-zero exit prevents push
    exit 1
fi