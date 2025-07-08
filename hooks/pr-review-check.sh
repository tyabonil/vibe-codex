#!/bin/bash

# PR Review Check Hook
# Automatically fetches and analyzes PR comments for compliance violations
# Usage: ./hooks/pr-review-check.sh [PR_NUMBER] [options]

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
    echo "Usage: $0 [PR_NUMBER] [options]"
    echo ""
    echo "Options:"
    echo "  --auto                 Auto-detect current PR from branch"
    echo "  --summary             Show summary only (no interactive prompts)"
    echo "  --violations-only     Show only compliance violations"
    echo "  --json                Output results in JSON format"
    echo ""
    echo "Description:"
    echo "  Automatically fetches PR comments, parses compliance bot feedback,"
    echo "  and displays violations summary with options to address them."
    echo ""
    echo "Examples:"
    echo "  $0 99                 # Review PR #99"
    echo "  $0 --auto             # Auto-detect PR from current branch"
    echo "  $0 99 --summary       # Show violations summary for PR #99"
    echo "  $0 --auto --violations-only  # Show only violations"
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

# Function to get current PR number from branch
get_current_pr() {
    local current_branch=$(git branch --show-current)
    
    echo -e "${BLUE}🔍 Looking for PR associated with branch: ${current_branch}${NC}"
    
    # Try to find PR by branch name
    local pr_number=$(gh pr list --head "$current_branch" --json number -q '.[0].number' 2>/dev/null || echo "")
    
    if [ -z "$pr_number" ]; then
        echo -e "${YELLOW}⚠️  No PR found for current branch: ${current_branch}${NC}"
        echo -e "${YELLOW}   Create a PR first or specify PR number manually${NC}"
        return 1
    fi
    
    echo "$pr_number"
    return 0
}

# Function to validate PR exists
validate_pr() {
    local pr_number=$1
    
    echo -e "${BLUE}🔍 Validating PR #${pr_number}...${NC}"
    
    if ! gh pr view "$pr_number" --json number,title,state &>/dev/null; then
        echo -e "${RED}❌ Error: PR #${pr_number} not found${NC}"
        return 1
    fi
    
    local pr_state=$(gh pr view "$pr_number" --json state -q '.state')
    if [ "$pr_state" = "CLOSED" ]; then
        echo -e "${YELLOW}⚠️  Warning: PR #${pr_number} is closed${NC}"
    elif [ "$pr_state" = "MERGED" ]; then
        echo -e "${GREEN}ℹ️  PR #${pr_number} is already merged${NC}"
    fi
    
    echo -e "${GREEN}✅ PR #${pr_number} validated${NC}"
    return 0
}

# Function to fetch PR details
get_pr_details() {
    local pr_number=$1
    
    gh pr view "$pr_number" --json number,title,state,author,url,body,createdAt
}

# Function to fetch PR comments
get_pr_comments() {
    local pr_number=$1
    
    gh pr view "$pr_number" --comments --json comments -q '.comments[] | {author: .author.login, body: .body, createdAt: .createdAt, url: .url}'
}

# Function to fetch PR checks and status
get_pr_checks() {
    local pr_number=$1
    
    # Get the PR head SHA
    local head_sha=$(gh pr view "$pr_number" --json headRefOid -q '.headRefOid')
    
    # Get status checks
    gh api "repos/:owner/:repo/commits/$head_sha/status" --template '{{range .statuses}}{{.context}}: {{.state}} - {{.description}}{{"\n"}}{{end}}' 2>/dev/null || echo ""
    
    # Get check runs
    gh api "repos/:owner/:repo/commits/$head_sha/check-runs" --template '{{range .check_runs}}{{.name}}: {{.status}}/{{.conclusion}} - {{.output.title}}{{"\n"}}{{end}}' 2>/dev/null || echo ""
}

# Function to analyze comments for compliance violations
analyze_compliance_violations() {
    local pr_number=$1
    local comments_json=$2
    
    echo -e "${CYAN}🔍 Analyzing compliance violations...${NC}"
    
    # Look for compliance bot comments (case insensitive patterns)
    local violation_comments=$(echo "$comments_json" | jq -r '. | select(.author == "github-actions[bot]" or .body | contains("violation") or contains("VIOLATION") or contains("compliance") or contains("MANDATORY") or contains("Level") or contains("BLOCKER")) | .body' 2>/dev/null || echo "")
    
    if [ -z "$violation_comments" ]; then
        echo -e "${GREEN}✅ No compliance violations detected in PR comments${NC}"
        return 0
    fi
    
    # Parse violations from comments
    local violations_found=0
    
    while IFS= read -r comment; do
        if [ -n "$comment" ]; then
            # Check for different violation patterns
            if echo "$comment" | grep -qi "violation\|blocker\|mandatory\|level.*:"; then
                violations_found=$((violations_found + 1))
                
                echo -e "${RED}📋 Compliance Violation #${violations_found}:${NC}"
                echo -e "${YELLOW}${comment}${NC}"
                echo ""
            fi
        fi
    done <<< "$violation_comments"
    
    if [ $violations_found -gt 0 ]; then
        echo -e "${RED}❌ Found ${violations_found} compliance violation(s)${NC}"
        return 1
    else
        echo -e "${GREEN}✅ No compliance violations detected${NC}"
        return 0
    fi
}

# Function to extract specific violation types
extract_violation_details() {
    local comments_json=$1
    
    # Initialize counters
    local level1_violations=0
    local level2_violations=0
    local level3_violations=0
    local level4_violations=0
    local blocker_violations=0
    local warning_violations=0
    
    # Look for specific violation levels and types
    while IFS= read -r comment; do
        if [ -n "$comment" ]; then
            # Count violation levels
            level1_violations=$((level1_violations + $(echo "$comment" | grep -ci "level 1\|level.*1")))
            level2_violations=$((level2_violations + $(echo "$comment" | grep -ci "level 2\|level.*2")))
            level3_violations=$((level3_violations + $(echo "$comment" | grep -ci "level 3\|level.*3")))
            level4_violations=$((level4_violations + $(echo "$comment" | grep -ci "level 4\|level.*4")))
            
            # Count severity types
            blocker_violations=$((blocker_violations + $(echo "$comment" | grep -ci "blocker\|critical")))
            warning_violations=$((warning_violations + $(echo "$comment" | grep -ci "warning")))
        fi
    done <<< "$comments_json"
    
    # Output summary
    echo "{"
    echo "  \"level1\": $level1_violations,"
    echo "  \"level2\": $level2_violations,"
    echo "  \"level3\": $level3_violations,"
    echo "  \"level4\": $level4_violations,"
    echo "  \"blockers\": $blocker_violations,"
    echo "  \"warnings\": $warning_violations,"
    echo "  \"total\": $((level1_violations + level2_violations + level3_violations + level4_violations))"
    echo "}"
}

# Function to show PR summary
show_pr_summary() {
    local pr_number=$1
    local pr_details=$2
    local checks_output=$3
    local violations_summary=$4
    
    local pr_title=$(echo "$pr_details" | jq -r '.title')
    local pr_author=$(echo "$pr_details" | jq -r '.author.login')
    local pr_state=$(echo "$pr_details" | jq -r '.state')
    local pr_url=$(echo "$pr_details" | jq -r '.url')
    local pr_created=$(echo "$pr_details" | jq -r '.createdAt')
    
    echo -e "${PURPLE}════════════════════════════════════════════════════════════════${NC}"
    echo -e "${PURPLE}📋 PR REVIEW SUMMARY${NC}"
    echo -e "${PURPLE}════════════════════════════════════════════════════════════════${NC}"
    echo ""
    echo -e "${BLUE}🔗 PR #${pr_number}: ${pr_title}${NC}"
    echo -e "   📍 Author: ${pr_author}"
    echo -e "   📊 State: ${pr_state}"
    echo -e "   🌐 URL: ${pr_url}"
    echo -e "   📅 Created: ${pr_created}"
    echo ""
    
    # Show checks status
    if [ -n "$checks_output" ]; then
        echo -e "${CYAN}🔍 Checks Status:${NC}"
        echo "$checks_output" | while IFS= read -r line; do
            if echo "$line" | grep -qi "fail\|error"; then
                echo -e "   ${RED}❌ $line${NC}"
            elif echo "$line" | grep -qi "success\|pass"; then
                echo -e "   ${GREEN}✅ $line${NC}"
            elif echo "$line" | grep -qi "pending\|running"; then
                echo -e "   ${YELLOW}⏳ $line${NC}"
            else
                echo -e "   ${BLUE}ℹ️  $line${NC}"
            fi
        done
        echo ""
    fi
    
    # Show violations summary
    if [ -n "$violations_summary" ]; then
        local total_violations=$(echo "$violations_summary" | jq -r '.total')
        local blockers=$(echo "$violations_summary" | jq -r '.blockers')
        local warnings=$(echo "$violations_summary" | jq -r '.warnings')
        
        if [ "$total_violations" -gt 0 ]; then
            echo -e "${RED}⚠️  COMPLIANCE VIOLATIONS DETECTED${NC}"
            echo -e "   📊 Total Violations: ${total_violations}"
            echo -e "   🚫 Blockers: ${blockers}"
            echo -e "   ⚠️  Warnings: ${warnings}"
            echo ""
            echo -e "   📋 By Level:"
            echo -e "   • Level 1 (Security): $(echo "$violations_summary" | jq -r '.level1')"
            echo -e "   • Level 2 (Workflow): $(echo "$violations_summary" | jq -r '.level2')"
            echo -e "   • Level 3 (Quality): $(echo "$violations_summary" | jq -r '.level3')"
            echo -e "   • Level 4 (Patterns): $(echo "$violations_summary" | jq -r '.level4')"
        else
            echo -e "${GREEN}✅ NO COMPLIANCE VIOLATIONS${NC}"
        fi
        echo ""
    fi
    
    echo -e "${PURPLE}════════════════════════════════════════════════════════════════${NC}"
}

# Function to provide violation resolution suggestions
suggest_resolutions() {
    local violations_summary=$1
    
    local level1_count=$(echo "$violations_summary" | jq -r '.level1')
    local level2_count=$(echo "$violations_summary" | jq -r '.level2')
    local level3_count=$(echo "$violations_summary" | jq -r '.level3')
    local level4_count=$(echo "$violations_summary" | jq -r '.level4')
    
    echo -e "${CYAN}💡 RESOLUTION SUGGESTIONS${NC}"
    echo ""
    
    if [ "$level1_count" -gt 0 ]; then
        echo -e "${RED}🚨 Level 1 - Security & Safety (CRITICAL):${NC}"
        echo "   • Remove any hardcoded secrets, API keys, or passwords"
        echo "   • Use environment variables instead of hardcoded credentials"
        echo "   • Get explicit permission before modifying environment files"
        echo ""
    fi
    
    if [ "$level2_count" -gt 0 ]; then
        echo -e "${YELLOW}🔄 Level 2 - Workflow Integrity (MANDATORY):${NC}"
        echo "   • Add issue number to PR title or description (e.g., 'Fixes #123')"
        echo "   • Follow branch naming convention: feature/issue-{number}-{description}"
        echo "   • Target 'preview' branch instead of 'main'"
        echo "   • Check if Vercel deployment is successful"
        echo ""
    fi
    
    if [ "$level3_count" -gt 0 ]; then
        echo -e "${BLUE}🎯 Level 3 - Quality Gates (MANDATORY):${NC}"
        echo "   • Add tests for new code (aim for 100% coverage)"
        echo "   • Perform self-review and add a comment to the PR"
        echo "   • Run linting and type checking"
        echo ""
    fi
    
    if [ "$level4_count" -gt 0 ]; then
        echo -e "${PURPLE}📐 Level 4 - Development Patterns (RECOMMENDED):${NC}"
        echo "   • Break large files into smaller modules"
        echo "   • Use descriptive commit messages (type: description)"
        echo "   • Consider refactoring for better maintainability"
        echo ""
    fi
    
    echo -e "${GREEN}🛠️  Quick Actions:${NC}"
    echo "   • Run: npm run lint && npm run test"
    echo "   • Check: npm run build (for deployment issues)"
    echo "   • Review: Re-read PR changes carefully"
    echo "   • Update: Push additional commits to address violations"
}

# Function to run interactive mode
run_interactive_mode() {
    local pr_number=$1
    local violations_summary=$2
    
    local total_violations=$(echo "$violations_summary" | jq -r '.total')
    
    if [ "$total_violations" -eq 0 ]; then
        echo -e "${GREEN}🎉 No violations found! PR looks good to merge.${NC}"
        return 0
    fi
    
    echo -e "${YELLOW}🤔 What would you like to do?${NC}"
    echo ""
    echo "1. Show resolution suggestions"
    echo "2. View detailed violation comments"
    echo "3. Run npm lint and test"
    echo "4. Open PR in browser"
    echo "5. Exit"
    echo ""
    
    read -p "Enter your choice (1-5): " choice
    
    case $choice in
        1)
            suggest_resolutions "$violations_summary"
            ;;
        2)
            echo -e "${CYAN}📋 Fetching detailed violation comments...${NC}"
            local comments=$(get_pr_comments "$pr_number")
            analyze_compliance_violations "$pr_number" "$comments"
            ;;
        3)
            echo -e "${CYAN}🧪 Running lint and tests...${NC}"
            npm run lint && npm run test
            ;;
        4)
            echo -e "${CYAN}🌐 Opening PR in browser...${NC}"
            gh pr view "$pr_number" --web
            ;;
        5)
            echo -e "${BLUE}👋 Goodbye!${NC}"
            ;;
        *)
            echo -e "${RED}Invalid choice. Please enter 1-5.${NC}"
            ;;
    esac
}

# Main execution
main() {
    local pr_number=""
    local auto_detect=false
    local summary_only=false
    local violations_only=false
    local json_output=false
    
    # Parse arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            --auto)
                auto_detect=true
                shift
                ;;
            --summary)
                summary_only=true
                shift
                ;;
            --violations-only)
                violations_only=true
                shift
                ;;
            --json)
                json_output=true
                shift
                ;;
            --help|-h)
                show_usage
                exit 0
                ;;
            *)
                if [[ $1 =~ ^[0-9]+$ ]]; then
                    pr_number=$1
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
    
    # Determine PR number
    if [ "$auto_detect" = true ]; then
        if ! pr_number=$(get_current_pr); then
            exit 1
        fi
    elif [ -z "$pr_number" ]; then
        echo -e "${RED}❌ Error: PR number required${NC}"
        echo -e "${YELLOW}Use --auto to detect from current branch or specify PR number${NC}"
        show_usage
        exit 1
    fi
    
    # Validate PR
    if ! validate_pr "$pr_number"; then
        exit 1
    fi
    
    echo -e "${CYAN}🔄 Fetching PR data...${NC}"
    
    # Fetch PR details
    local pr_details=$(get_pr_details "$pr_number")
    local pr_comments=$(get_pr_comments "$pr_number")
    local pr_checks=$(get_pr_checks "$pr_number")
    
    # Analyze violations
    local violations_summary
    if analyze_compliance_violations "$pr_number" "$pr_comments"; then
        violations_summary='{"level1": 0, "level2": 0, "level3": 0, "level4": 0, "blockers": 0, "warnings": 0, "total": 0}'
    else
        violations_summary=$(extract_violation_details "$pr_comments")
    fi
    
    # Output based on mode
    if [ "$json_output" = true ]; then
        echo "{"
        echo "  \"pr_number\": $pr_number,"
        echo "  \"pr_details\": $pr_details,"
        echo "  \"violations\": $violations_summary"
        echo "}"
    elif [ "$violations_only" = true ]; then
        analyze_compliance_violations "$pr_number" "$pr_comments"
    elif [ "$summary_only" = true ]; then
        show_pr_summary "$pr_number" "$pr_details" "$pr_checks" "$violations_summary"
    else
        # Full interactive mode
        show_pr_summary "$pr_number" "$pr_details" "$pr_checks" "$violations_summary"
        run_interactive_mode "$pr_number" "$violations_summary"
    fi
}

# Run main function with all arguments
main "$@"