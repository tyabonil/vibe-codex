#!/bin/bash

# Enhanced Pre-commit Hook
# Comprehensive validation system for ensuring deployable commits

set -e

# Get the directory where this script is located
HOOK_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$HOOK_DIR/.." && pwd)"

# Change to repository root
cd "$REPO_ROOT"

# Colors for output
RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
ENHANCED_VALIDATION_ENABLED=${ENHANCED_VALIDATION_ENABLED:-true}
ALLOW_OVERRIDE=${ALLOW_OVERRIDE:-false}

echo -e "${CYAN}🚀 Enhanced Pre-commit Validation System${NC}"
echo -e "${BLUE}===========================================${NC}"

# Function to check if enhanced validation should run
should_run_enhanced_validation() {
    # Check environment variable override
    if [ "$ENHANCED_VALIDATION_ENABLED" != "true" ]; then
        echo -e "${YELLOW}Enhanced validation disabled via environment variable${NC}"
        return 1
    fi
    
    # Check configuration file
    if [ -f "config/rules.json" ] && command -v jq >/dev/null 2>&1; then
        local enabled=$(jq -r '.enhanced_validation.enabled // true' config/rules.json 2>/dev/null)
        if [ "$enabled" = "false" ]; then
            echo -e "${YELLOW}Enhanced validation disabled in config/rules.json${NC}"
            return 1
        fi
    fi
    
    # Check for override flag
    if [ "$ALLOW_OVERRIDE" = "true" ] && git rev-parse --verify HEAD >/dev/null 2>&1; then
        local commit_message=$(git log -1 --pretty=format:'%B' 2>/dev/null | head -1)
        if [[ $commit_message =~ --no-validate|--skip-validation ]]; then
            echo -e "${YELLOW}Validation skipped via commit message flag${NC}"
            return 1
        fi
    fi
    
    return 0
}

# Function to run legacy hooks for compatibility
run_legacy_hooks() {
    echo -e "${BLUE}📋 Running legacy validation hooks...${NC}"
    
    local legacy_result=0
    
    # Run existing pre-commit hook if it exists
    if [ -f "hooks/pre-commit.sh" ]; then
        echo -e "${BLUE}Running legacy pre-commit hook...${NC}"
        if bash hooks/pre-commit.sh; then
            echo -e "${GREEN}✅ Legacy pre-commit passed${NC}"
        else
            echo -e "${RED}❌ Legacy pre-commit failed${NC}"
            legacy_result=1
        fi
    fi
    
    # Run security pre-commit if it exists
    if [ -f "hooks/security-pre-commit.sh" ]; then
        echo -e "${BLUE}Running security pre-commit hook...${NC}"
        if bash hooks/security-pre-commit.sh; then
            echo -e "${GREEN}✅ Security validation passed${NC}"
        else
            echo -e "${RED}❌ Security validation failed${NC}"
            legacy_result=1
        fi
    fi
    
    # Run PR health check if it exists
    if [ -f "hooks/pr-health-check.sh" ]; then
        echo -e "${BLUE}Running PR health check...${NC}"
        if bash hooks/pr-health-check.sh; then
            echo -e "${GREEN}✅ PR health check passed${NC}"
        else
            echo -e "${RED}❌ PR health check failed${NC}"
            legacy_result=1
        fi
    fi
    
    # Run issue reminder if it exists
    if [ -f "hooks/issue-reminder-pre-commit.sh" ]; then
        echo -e "${BLUE}Running issue reminder check...${NC}"
        if bash hooks/issue-reminder-pre-commit.sh; then
            echo -e "${GREEN}✅ Issue reminder check passed${NC}"
        else
            echo -e "${YELLOW}⚠️ Issue reminder check had warnings${NC}"
            # Don't fail on issue reminder warnings
        fi
    fi
    
    return $legacy_result
}

# Main execution
main() {
    local overall_result=0
    
    # Always run legacy hooks first for compatibility
    echo -e "${CYAN}Phase 1: Legacy Compatibility Checks${NC}"
    if ! run_legacy_hooks; then
        echo -e "${RED}❌ Legacy validation failed${NC}"
        overall_result=1
        
        # If legacy fails and enhanced is disabled, exit early
        if ! should_run_enhanced_validation; then
            echo -e "${RED}🛑 Cannot proceed with commit${NC}"
            exit 1
        fi
    else
        echo -e "${GREEN}✅ Legacy validation passed${NC}"
    fi
    
    echo ""
    
    # Check if enhanced validation should run
    if should_run_enhanced_validation; then
        echo -e "${CYAN}Phase 2: Enhanced Validation${NC}"
        
        # Source the validation framework
        if [ -f "hooks/validations/validation-framework.sh" ]; then
            source hooks/validations/validation-framework.sh
            
            # Run enhanced validation
            if run_enhanced_validation; then
                echo -e "${GREEN}✅ Enhanced validation passed${NC}"
            else
                echo -e "${RED}❌ Enhanced validation failed${NC}"
                overall_result=1
            fi
        else
            echo -e "${YELLOW}⚠️ Enhanced validation framework not found${NC}"
            echo -e "${YELLOW}Falling back to legacy validation only${NC}"
        fi
    else
        echo -e "${BLUE}ℹ️ Enhanced validation skipped${NC}"
    fi
    
    echo ""
    echo -e "${CYAN}===========================================${NC}"
    
    # Final result
    if [ $overall_result -eq 0 ]; then
        echo -e "${GREEN}🎉 All pre-commit validations passed!${NC}"
        echo -e "${GREEN}✨ Commit is ready for deployment${NC}"
        
        # Success tips
        echo ""
        echo -e "${BLUE}💡 Next steps:${NC}"
        echo -e "${BLUE}  • git push (triggers additional CI checks)${NC}"
        echo -e "${BLUE}  • Create PR if this is your first commit${NC}"
        echo -e "${BLUE}  • Update issue with progress${NC}"
        
    else
        echo -e "${RED}🛑 Pre-commit validation failed${NC}"
        echo -e "${RED}Please fix the issues above before committing${NC}"
        
        # Failure help
        echo ""
        echo -e "${BLUE}💡 Quick fixes:${NC}"
        echo -e "${BLUE}  • Run 'npm run lint --fix' for linting issues${NC}"
        echo -e "${BLUE}  • Run 'npm test' to identify test failures${NC}"
        echo -e "${BLUE}  • Check for secrets in staged files${NC}"
        
        if [ "$ALLOW_OVERRIDE" = "true" ]; then
            echo ""
            echo -e "${YELLOW}🚨 Emergency override available:${NC}"
            echo -e "${YELLOW}  git commit -m \"your message --no-validate\"${NC}"
            echo -e "${YELLOW}  (Use only in emergencies)${NC}"
        fi
    fi
    
    echo -e "${CYAN}===========================================${NC}"
    
    return $overall_result
}

# Run main function and exit with its result
main "$@"
exit $?