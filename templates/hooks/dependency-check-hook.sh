#!/bin/bash
# vibe-codex dependency check hook
# Prevents deletion of files/directories that have active dependencies

set -euo pipefail

# Colors for output
RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
NC='\033[0m' # No Color

# Function to check if a file/directory has dependencies
check_dependencies() {
    local target="$1"
    local target_basename=$(basename "$target")
    local dependencies_found=false
    local dep_report=""
    
    echo -e "${YELLOW}🔍 Checking dependencies for: $target${NC}"
    
    # Check in main branch
    echo "Checking main branch..."
    if git show main:. &>/dev/null; then
        if git grep -n "$target_basename" main -- '*.js' '*.ts' '*.json' '*.yml' '*.yaml' '*.sh' '*.md' 2>/dev/null | grep -v "^main:$target"; then
            dependencies_found=true
            dep_report+="\n${RED}Dependencies found in main branch:${NC}\n"
            dep_report+=$(git grep -n "$target_basename" main -- '*.js' '*.ts' '*.json' '*.yml' '*.yaml' '*.sh' '*.md' 2>/dev/null | grep -v "^main:$target")
        fi
    fi
    
    # Check in preview branch
    echo "Checking preview branch..."
    if git show preview:. &>/dev/null; then
        if git grep -n "$target_basename" preview -- '*.js' '*.ts' '*.json' '*.yml' '*.yaml' '*.sh' '*.md' 2>/dev/null | grep -v "^preview:$target"; then
            dependencies_found=true
            dep_report+="\n${RED}Dependencies found in preview branch:${NC}\n"
            dep_report+=$(git grep -n "$target_basename" preview -- '*.js' '*.ts' '*.json' '*.yml' '*.yaml' '*.sh' '*.md' 2>/dev/null | grep -v "^preview:$target")
        fi
    fi
    
    # Check in current working directory (including untracked files)
    echo "Checking working directory..."
    if grep -r "$target_basename" . --include="*.js" --include="*.ts" --include="*.json" --include="*.yml" --include="*.yaml" --include="*.sh" --include="*.md" 2>/dev/null | grep -v "^$target" | grep -v ".git/"; then
        dependencies_found=true
        dep_report+="\n${RED}Dependencies found in working directory:${NC}\n"
        dep_report+=$(grep -r "$target_basename" . --include="*.js" --include="*.ts" --include="*.json" --include="*.yml" --include="*.yaml" --include="*.sh" --include="*.md" 2>/dev/null | grep -v "^$target" | grep -v ".git/" | head -20)
    fi
    
    # Check for directory imports/references
    if [ -d "$target" ]; then
        local dir_patterns=("from ['\"].*$target_basename" "require.*$target_basename" "$target_basename/")
        for pattern in "${dir_patterns[@]}"; do
            if grep -r "$pattern" . --include="*.js" --include="*.ts" --include="*.json" 2>/dev/null | grep -v ".git/"; then
                dependencies_found=true
                dep_report+="\n${RED}Directory import patterns found:${NC}\n"
                dep_report+=$(grep -r "$pattern" . --include="*.js" --include="*.ts" --include="*.json" 2>/dev/null | grep -v ".git/" | head -10)
            fi
        done
    fi
    
    # Check git hooks
    if [ -d ".git/hooks" ]; then
        if grep -l "$target_basename" .git/hooks/* 2>/dev/null; then
            dependencies_found=true
            dep_report+="\n${RED}References found in git hooks:${NC}\n"
            dep_report+=$(grep -l "$target_basename" .git/hooks/* 2>/dev/null)
        fi
    fi
    
    if [ "$dependencies_found" = true ]; then
        echo -e "${RED}❌ DEPENDENCIES FOUND for $target${NC}"
        echo -e "$dep_report"
        return 1
    else
        echo -e "${GREEN}✅ No dependencies found for $target${NC}"
        return 0
    fi
}

# Main execution
if [ $# -eq 0 ]; then
    echo "Usage: $0 <file_or_directory_to_check>..."
    exit 1
fi

all_clear=true
for target in "$@"; do
    if ! check_dependencies "$target"; then
        all_clear=false
        echo -e "\n${YELLOW}⚠️  Before deleting $target:${NC}"
        echo "1. Analyze what functionality it provides"
        echo "2. Ensure replacement code covers all use cases"
        echo "3. Update all references to point to new location"
        echo "4. Create migration plan if needed"
        echo ""
    fi
done

if [ "$all_clear" = false ]; then
    echo -e "${RED}🛑 Deletion blocked due to active dependencies${NC}"
    echo -e "${YELLOW}Create an issue to properly migrate these dependencies first${NC}"
    exit 1
fi

echo -e "${GREEN}✅ All targets are safe to delete${NC}"
exit 0