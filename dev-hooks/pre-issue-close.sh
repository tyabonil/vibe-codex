#!/bin/bash

# Pre-Issue-Close Validation Hook
# Validates all requirements are met before closing an issue
# Usage: ./hooks/pre-issue-close.sh <issue_number> [options]

set -e

# Colors for output
RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

# Function to show usage
show_usage() {
    echo "Usage: $0 <issue_number> [options]"
    echo ""
    echo "Options:"
    echo "  --force              Skip warnings and proceed with validation"
    echo "  --json               Output results in JSON format"
    echo "  --checklist          Show validation checklist only"
    echo "  --auto-close         Automatically close if all validations pass"
    echo ""
    echo "Description:"
    echo "  Validates that all requirements are met before closing an issue:"
    echo "  - Linked PRs are merged"
    echo "  - Tests exist and pass"
    echo "  - Documentation is updated"
    echo "  - Completion comments exist"
    echo "  - Appropriate labels are applied"
    echo ""
    echo "Examples:"
    echo "  $0 169                        # Validate issue #169"
    echo "  $0 169 --force                # Force validation (skip warnings)"
    echo "  $0 169 171 173                # Check multiple issues"
    echo "  $0 169 --auto-close           # Close if validation passes"
    echo ""
}

# Function to check if gh CLI is available
check_gh_cli() {
    if ! command -v gh &> /dev/null; then
        echo -e "${RED}❌ Error: GitHub CLI (gh) not available${NC}"
        echo -e "${YELLOW}Install GitHub CLI: https://cli.github.com/${NC}"
        return 1
    fi
    return 0
}

# Function to get issue details
get_issue_details() {
    local issue_number=$1
    
    gh issue view "$issue_number" --json number,title,state,body,comments,labels,assignees,projectItems,milestone,closedAt,author
}

# Function to get linked PRs from issue
get_linked_prs() {
    local issue_number=$1
    
    echo -e "${BLUE}🔍 Searching for linked PRs...${NC}"
    
    # Get issue comments and body
    local issue_data=$(gh issue view "$issue_number" --json body,comments)
    local issue_body=$(echo "$issue_data" | jq -r '.body // ""')
    local comments=$(echo "$issue_data" | jq -r '.comments[].body' 2>/dev/null || echo "")
    
    # Combine body and comments
    local all_text="${issue_body}
${comments}"
    
    # Extract PR numbers (various formats)
    local pr_numbers=$(echo "$all_text" | grep -oE "(PR #[0-9]+|pull/[0-9]+|#[0-9]+)" | grep -oE "[0-9]+" | sort -u)
    
    # Validate each PR exists
    local valid_prs=""
    for pr in $pr_numbers; do
        if gh pr view "$pr" --json number &>/dev/null; then
            valid_prs="${valid_prs}${pr} "
        fi
    done
    
    echo "$valid_prs" | xargs
}

# Function to check if PRs are merged
check_prs_merged() {
    local pr_numbers=$1
    local all_merged=true
    local unmerged_prs=""
    
    if [ -z "$pr_numbers" ]; then
        echo -e "${YELLOW}⚠️  No linked PRs found${NC}"
        return 1
    fi
    
    echo -e "${BLUE}🔍 Checking PR merge status...${NC}"
    
    for pr in $pr_numbers; do
        local pr_state=$(gh pr view "$pr" --json state -q '.state' 2>/dev/null || echo "UNKNOWN")
        
        if [ "$pr_state" = "MERGED" ]; then
            echo -e "  ${GREEN}✅ PR #${pr}: MERGED${NC}"
        else
            echo -e "  ${RED}❌ PR #${pr}: ${pr_state}${NC}"
            all_merged=false
            unmerged_prs="${unmerged_prs}#${pr} "
        fi
    done
    
    if [ "$all_merged" = true ]; then
        echo -e "${GREEN}✅ All linked PRs are merged${NC}"
        return 0
    else
        echo -e "${RED}❌ Unmerged PRs: ${unmerged_prs}${NC}"
        return 1
    fi
}

# Function to check for test coverage
check_test_coverage() {
    local issue_number=$1
    local pr_numbers=$2
    
    echo -e "${BLUE}🧪 Checking test coverage...${NC}"
    
    # Check if any PR added test files
    local has_tests=false
    
    for pr in $pr_numbers; do
        local files=$(gh pr view "$pr" --json files -q '.files[].path' 2>/dev/null || echo "")
        
        if echo "$files" | grep -qE "(test|spec)\.(js|ts|jsx|tsx|sh)$"; then
            has_tests=true
            echo -e "  ${GREEN}✅ PR #${pr} includes test files${NC}"
        fi
    done
    
    if [ "$has_tests" = false ]; then
        # Check if issue is documentation or refactoring only
        local issue_labels=$(gh issue view "$issue_number" --json labels -q '.labels[].name' 2>/dev/null || echo "")
        
        if echo "$issue_labels" | grep -qE "documentation|docs|refactor"; then
            echo -e "  ${CYAN}ℹ️  Documentation/refactoring issue - tests may not be required${NC}"
            return 0
        else
            echo -e "  ${YELLOW}⚠️  No test files found in linked PRs${NC}"
            return 1
        fi
    fi
    
    return 0
}

# Function to check documentation updates
check_documentation() {
    local issue_number=$1
    local pr_numbers=$2
    
    echo -e "${BLUE}📚 Checking documentation updates...${NC}"
    
    # Check if any PR updated documentation
    local has_docs=false
    
    for pr in $pr_numbers; do
        local files=$(gh pr view "$pr" --json files -q '.files[].path' 2>/dev/null || echo "")
        
        if echo "$files" | grep -qE "\.(md|mdx|rst|txt)$|README|CHANGELOG|docs/"; then
            has_docs=true
            echo -e "  ${GREEN}✅ PR #${pr} includes documentation updates${NC}"
        fi
    done
    
    if [ "$has_docs" = false ]; then
        # Check if issue requires documentation
        local issue_labels=$(gh issue view "$issue_number" --json labels -q '.labels[].name' 2>/dev/null || echo "")
        
        if echo "$issue_labels" | grep -qE "bug|fix|internal"; then
            echo -e "  ${CYAN}ℹ️  Bug fix/internal issue - documentation may not be required${NC}"
            return 0
        else
            echo -e "  ${YELLOW}⚠️  No documentation updates found in linked PRs${NC}"
            return 1
        fi
    fi
    
    return 0
}

# Function to check for completion comments
check_completion_comments() {
    local issue_number=$1
    
    echo -e "${BLUE}💬 Checking for completion comments...${NC}"
    
    # Get issue comments
    local comments=$(gh issue view "$issue_number" --json comments -q '.comments[].body' 2>/dev/null || echo "")
    
    # Look for completion indicators
    if echo "$comments" | grep -qiE "complet|done|finish|implement|merged|deploy|resolv"; then
        echo -e "  ${GREEN}✅ Found completion-related comments${NC}"
        return 0
    else
        echo -e "  ${YELLOW}⚠️  No completion comments found${NC}"
        return 1
    fi
}

# Function to check labels
check_labels() {
    local issue_number=$1
    
    echo -e "${BLUE}🏷️  Checking issue labels...${NC}"
    
    # Get issue labels
    local labels=$(gh issue view "$issue_number" --json labels -q '.labels[].name' 2>/dev/null || echo "")
    
    if [ -z "$labels" ]; then
        echo -e "  ${YELLOW}⚠️  No labels applied to issue${NC}"
        return 1
    fi
    
    # Check for status labels
    if echo "$labels" | grep -qE "done|completed|resolved|fixed"; then
        echo -e "  ${GREEN}✅ Has completion label${NC}"
    else
        echo -e "  ${CYAN}ℹ️  Consider adding a completion label${NC}"
    fi
    
    # List all labels
    echo -e "  ${BLUE}Current labels: ${labels}${NC}"
    
    return 0
}

# Function to validate single issue
validate_issue() {
    local issue_number=$1
    local force_mode=$2
    local json_mode=$3
    
    echo -e "${PURPLE}════════════════════════════════════════════════════════════════${NC}"
    echo -e "${PURPLE}🔍 VALIDATING ISSUE #${issue_number}${NC}"
    echo -e "${PURPLE}════════════════════════════════════════════════════════════════${NC}"
    echo ""
    
    # Get issue details
    local issue_details=$(get_issue_details "$issue_number")
    local issue_state=$(echo "$issue_details" | jq -r '.state')
    local issue_title=$(echo "$issue_details" | jq -r '.title')
    
    echo -e "${BLUE}📋 Issue: ${issue_title}${NC}"
    echo -e "${BLUE}📊 State: ${issue_state}${NC}"
    echo ""
    
    # Initialize validation results
    local validation_passed=true
    local validation_results=()
    
    # Get linked PRs
    local linked_prs=$(get_linked_prs "$issue_number")
    echo ""
    
    # Check 1: PRs are merged
    if check_prs_merged "$linked_prs"; then
        validation_results+=("pr_merged:pass")
    else
        validation_results+=("pr_merged:fail")
        validation_passed=false
    fi
    echo ""
    
    # Check 2: Test coverage
    if check_test_coverage "$issue_number" "$linked_prs"; then
        validation_results+=("test_coverage:pass")
    else
        validation_results+=("test_coverage:warn")
        if [ "$force_mode" != "true" ]; then
            validation_passed=false
        fi
    fi
    echo ""
    
    # Check 3: Documentation
    if check_documentation "$issue_number" "$linked_prs"; then
        validation_results+=("documentation:pass")
    else
        validation_results+=("documentation:warn")
        if [ "$force_mode" != "true" ]; then
            validation_passed=false
        fi
    fi
    echo ""
    
    # Check 4: Completion comments
    if check_completion_comments "$issue_number"; then
        validation_results+=("completion_comments:pass")
    else
        validation_results+=("completion_comments:warn")
    fi
    echo ""
    
    # Check 5: Labels
    if check_labels "$issue_number"; then
        validation_results+=("labels:pass")
    else
        validation_results+=("labels:info")
    fi
    echo ""
    
    # Summary
    echo -e "${PURPLE}════════════════════════════════════════════════════════════════${NC}"
    if [ "$validation_passed" = true ]; then
        echo -e "${GREEN}✅ VALIDATION PASSED - Issue #${issue_number} can be closed${NC}"
    else
        echo -e "${RED}❌ VALIDATION FAILED - Issue #${issue_number} is not ready to close${NC}"
        if [ "$force_mode" = "true" ]; then
            echo -e "${YELLOW}⚠️  Force mode enabled - warnings ignored${NC}"
        fi
    fi
    echo -e "${PURPLE}════════════════════════════════════════════════════════════════${NC}"
    
    # Output JSON if requested
    if [ "$json_mode" = "true" ]; then
        local json_output=$(printf '%s\n' "${validation_results[@]}" | jq -R 'split(":") | {(.[0]): .[1]}' | jq -s 'add')
        echo ""
        echo "JSON Output:"
        echo "$json_output"
    fi
    
    return $([ "$validation_passed" = true ] && echo 0 || echo 1)
}

# Function to show validation checklist
show_checklist() {
    echo -e "${PURPLE}════════════════════════════════════════════════════════════════${NC}"
    echo -e "${PURPLE}📋 PRE-ISSUE-CLOSE VALIDATION CHECKLIST${NC}"
    echo -e "${PURPLE}════════════════════════════════════════════════════════════════${NC}"
    echo ""
    echo -e "${GREEN}Required Checks:${NC}"
    echo "  ☐ All linked PRs are merged"
    echo "  ☐ Test files exist for new features/fixes"
    echo "  ☐ Documentation is updated (if applicable)"
    echo "  ☐ Completion comments document the resolution"
    echo "  ☐ Appropriate labels are applied"
    echo ""
    echo -e "${CYAN}Optional Checks:${NC}"
    echo "  ☐ Deployment verified (if applicable)"
    echo "  ☐ Related issues are cross-referenced"
    echo "  ☐ Changelog updated (for user-facing changes)"
    echo "  ☐ Migration guide provided (for breaking changes)"
    echo ""
    echo -e "${YELLOW}Best Practices:${NC}"
    echo "  • Link all related PRs in issue comments"
    echo "  • Document the solution approach"
    echo "  • Verify no regression issues"
    echo "  • Update project board status"
    echo ""
    echo -e "${PURPLE}════════════════════════════════════════════════════════════════${NC}"
}

# Main execution
main() {
    local force_mode=false
    local json_mode=false
    local checklist_mode=false
    local auto_close=false
    local issue_numbers=()
    
    # Parse arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            --force)
                force_mode=true
                shift
                ;;
            --json)
                json_mode=true
                shift
                ;;
            --checklist)
                checklist_mode=true
                shift
                ;;
            --auto-close)
                auto_close=true
                shift
                ;;
            --help|-h)
                show_usage
                exit 0
                ;;
            *)
                if [[ $1 =~ ^[0-9]+$ ]]; then
                    issue_numbers+=("$1")
                else
                    echo -e "${RED}❌ Error: Invalid argument: $1${NC}"
                    show_usage
                    exit 1
                fi
                shift
                ;;
        esac
    done
    
    # Check GitHub CLI availability
    if ! check_gh_cli; then
        exit 1
    fi
    
    # Show checklist if requested
    if [ "$checklist_mode" = true ]; then
        show_checklist
        exit 0
    fi
    
    # Require at least one issue number
    if [ ${#issue_numbers[@]} -eq 0 ]; then
        echo -e "${RED}❌ Error: At least one issue number required${NC}"
        show_usage
        exit 1
    fi
    
    # Validate each issue
    local all_passed=true
    for issue_num in "${issue_numbers[@]}"; do
        if ! validate_issue "$issue_num" "$force_mode" "$json_mode"; then
            all_passed=false
        fi
        echo ""
    done
    
    # Auto-close if requested and validation passed
    if [ "$auto_close" = true ] && [ "$all_passed" = true ]; then
        echo -e "${CYAN}🔄 Auto-closing validated issues...${NC}"
        for issue_num in "${issue_numbers[@]}"; do
            echo -e "  Closing issue #${issue_num}..."
            gh issue close "$issue_num" --comment "✅ Pre-close validation passed. Closing issue."
        done
    fi
    
    # Exit with appropriate code
    if [ "$all_passed" = true ]; then
        exit 0
    else
        exit 1
    fi
}

# Run main function with all arguments
main "$@"