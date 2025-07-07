#!/bin/bash

# Enhanced Pre-commit Validation Framework
# Modular system for comprehensive pre-commit validation

set -e

# Colors for output
RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration defaults
VALIDATION_TIMEOUT=${VALIDATION_TIMEOUT:-300}
VALIDATION_PARALLEL=${VALIDATION_PARALLEL:-true}
VALIDATION_FAIL_FAST=${VALIDATION_FAIL_FAST:-true}

# Results tracking
VALIDATION_RESULTS=()
VALIDATION_WARNINGS=()
VALIDATION_ERRORS=()

# Function to log messages with timestamps
log() {
    local level=$1
    shift
    local message="$*"
    local timestamp=$(date '+%H:%M:%S')
    
    case $level in
        "ERROR")
            echo -e "${timestamp} ${RED}[ERROR]${NC} $message" >&2
            ;;
        "WARN")
            echo -e "${timestamp} ${YELLOW}[WARN]${NC} $message" >&2
            ;;
        "INFO")
            echo -e "${timestamp} ${BLUE}[INFO]${NC} $message"
            ;;
        "SUCCESS")
            echo -e "${timestamp} ${GREEN}[SUCCESS]${NC} $message"
            ;;
        "DEBUG")
            if [ "${DEBUG_VALIDATION:-false}" = "true" ]; then
                echo -e "${timestamp} ${CYAN}[DEBUG]${NC} $message"
            fi
            ;;
    esac
}

# Function to run validation with timeout
run_with_timeout() {
    local timeout=$1
    local description=$2
    shift 2
    local command="$*"
    
    log "DEBUG" "Running: $command"
    
    if command -v timeout >/dev/null 2>&1; then
        timeout "$timeout" bash -c "$command"
    else
        # Fallback for systems without timeout command
        eval "$command"
    fi
}

# Function to check if validation is enabled
is_validation_enabled() {
    local validation_type=$1
    local config_file="config/rules.json"
    
    if [ ! -f "$config_file" ]; then
        return 0  # Default to enabled if no config
    fi
    
    if command -v jq >/dev/null 2>&1; then
        local enabled=$(jq -r ".enhanced_validation.${validation_type}.enabled // true" "$config_file" 2>/dev/null)
        [ "$enabled" = "true" ]
    else
        return 0  # Default to enabled if jq not available
    fi
}

# Function to get validation configuration
get_validation_config() {
    local validation_type=$1
    local config_key=$2
    local default_value=$3
    local config_file="config/rules.json"
    
    if [ ! -f "$config_file" ] || ! command -v jq >/dev/null 2>&1; then
        echo "$default_value"
        return
    fi
    
    local value=$(jq -r ".enhanced_validation.${validation_type}.${config_key} // \"$default_value\"" "$config_file" 2>/dev/null)
    echo "$value"
}

# Function to get list of changed files
get_changed_files() {
    local filter=$1
    
    # Get staged files
    local staged_files=$(git diff --cached --name-only --diff-filter=ACMR 2>/dev/null || echo "")
    
    if [ -z "$staged_files" ]; then
        echo ""
        return
    fi
    
    if [ -n "$filter" ]; then
        echo "$staged_files" | grep -E "$filter" || echo ""
    else
        echo "$staged_files"
    fi
}

# Function to run security validation
validate_security() {
    log "INFO" "🔒 Running security validation..."
    
    if ! is_validation_enabled "security"; then
        log "INFO" "Security validation disabled"
        return 0
    fi
    
    local timeout=$(get_validation_config "security" "timeout" "60")
    local result=0
    
    # Run existing security checks
    if [ -f "hooks/security-pre-commit.sh" ]; then
        if run_with_timeout "$timeout" "Security scan" "hooks/security-pre-commit.sh"; then
            log "SUCCESS" "Security validation passed"
        else
            log "ERROR" "Security validation failed"
            VALIDATION_ERRORS+=("Security validation failed")
            result=1
        fi
    else
        log "WARN" "Security pre-commit hook not found"
        VALIDATION_WARNINGS+=("Security pre-commit hook not found")
    fi
    
    return $result
}

# Function to run build validation
validate_build() {
    log "INFO" "🔨 Running build validation..."
    
    if ! is_validation_enabled "build"; then
        log "INFO" "Build validation disabled"
        return 0
    fi
    
    local timeout=$(get_validation_config "build" "timeout" "120")
    local build_command=$(get_validation_config "build" "command" "")
    local result=0
    
    # Auto-detect build command if not configured
    if [ -z "$build_command" ]; then
        if [ -f "package.json" ]; then
            if jq -e '.scripts.build' package.json >/dev/null 2>&1; then
                build_command="npm run build"
            elif jq -e '.scripts.compile' package.json >/dev/null 2>&1; then
                build_command="npm run compile"
            fi
        elif [ -f "Cargo.toml" ]; then
            build_command="cargo build"
        elif [ -f "go.mod" ]; then
            build_command="go build ./..."
        elif [ -f "Makefile" ] || [ -f "makefile" ]; then
            build_command="make"
        fi
    fi
    
    if [ -n "$build_command" ]; then
        log "INFO" "Running build command: $build_command"
        
        if run_with_timeout "$timeout" "Build validation" "$build_command --quiet 2>/dev/null || $build_command"; then
            log "SUCCESS" "Build validation passed"
        else
            log "ERROR" "Build validation failed"
            VALIDATION_ERRORS+=("Build failed: $build_command")
            result=1
        fi
    else
        log "INFO" "No build command detected - skipping build validation"
    fi
    
    return $result
}

# Function to run test validation
validate_tests() {
    log "INFO" "🧪 Running test validation..."
    
    if ! is_validation_enabled "tests"; then
        log "INFO" "Test validation disabled"
        return 0
    fi
    
    local timeout=$(get_validation_config "tests" "timeout" "180")
    local test_strategy=$(get_validation_config "tests" "strategy" "affected")
    local test_command=$(get_validation_config "tests" "command" "")
    local result=0
    
    # Auto-detect test command if not configured
    if [ -z "$test_command" ]; then
        if [ -f "package.json" ]; then
            if jq -e '.scripts.test' package.json >/dev/null 2>&1; then
                test_command="npm test"
            fi
        elif [ -f "Cargo.toml" ]; then
            test_command="cargo test"
        elif [ -f "go.mod" ]; then
            test_command="go test ./..."
        elif [ -f "pytest.ini" ] || [ -f "setup.py" ]; then
            test_command="python -m pytest"
        fi
    fi
    
    if [ -n "$test_command" ]; then
        log "INFO" "Running tests with strategy: $test_strategy"
        
        case $test_strategy in
            "affected")
                # Try to run only tests for affected files
                local changed_files=$(get_changed_files '\.(js|ts|py|go|rs)$')
                if [ -n "$changed_files" ]; then
                    log "DEBUG" "Changed files: $changed_files"
                    # For now, run all tests (affected file detection is complex)
                    log "INFO" "Running full test suite (affected test detection not yet implemented)"
                fi
                ;;
            "all")
                log "INFO" "Running full test suite"
                ;;
            "none")
                log "INFO" "Test execution disabled"
                return 0
                ;;
        esac
        
        if run_with_timeout "$timeout" "Test validation" "$test_command --silent 2>/dev/null || $test_command"; then
            log "SUCCESS" "Test validation passed"
        else
            log "ERROR" "Test validation failed"
            VALIDATION_ERRORS+=("Tests failed: $test_command")
            result=1
        fi
    else
        log "INFO" "No test command detected - skipping test validation"
    fi
    
    return $result
}

# Function to run code quality validation
validate_quality() {
    log "INFO" "✨ Running code quality validation..."
    
    if ! is_validation_enabled "quality"; then
        log "INFO" "Quality validation disabled"
        return 0
    fi
    
    local timeout=$(get_validation_config "quality" "timeout" "60")
    local result=0
    local quality_checks=0
    local quality_passed=0
    
    # Linting
    local lint_command=""
    if [ -f "package.json" ] && jq -e '.scripts.lint' package.json >/dev/null 2>&1; then
        lint_command="npm run lint"
    elif [ -f ".eslintrc.js" ] || [ -f ".eslintrc.json" ]; then
        lint_command="npx eslint ."
    elif [ -f "Cargo.toml" ]; then
        lint_command="cargo clippy"
    elif [ -f ".pylintrc" ] || [ -f "setup.cfg" ]; then
        lint_command="python -m pylint ."
    fi
    
    if [ -n "$lint_command" ]; then
        quality_checks=$((quality_checks + 1))
        log "INFO" "Running linter: $lint_command"
        
        if run_with_timeout "$timeout" "Linting" "$lint_command --quiet 2>/dev/null || $lint_command"; then
            log "SUCCESS" "Linting passed"
            quality_passed=$((quality_passed + 1))
        else
            log "ERROR" "Linting failed"
            VALIDATION_ERRORS+=("Linting failed: $lint_command")
            result=1
        fi
    fi
    
    # Formatting check
    local format_command=""
    if [ -f "package.json" ] && jq -e '.scripts.format' package.json >/dev/null 2>&1; then
        format_command="npm run format -- --check"
    elif [ -f ".prettierrc" ] || [ -f "prettier.config.js" ]; then
        format_command="npx prettier --check ."
    elif [ -f "Cargo.toml" ]; then
        format_command="cargo fmt -- --check"
    fi
    
    if [ -n "$format_command" ]; then
        quality_checks=$((quality_checks + 1))
        log "INFO" "Checking code formatting"
        
        if run_with_timeout "$timeout" "Format check" "$format_command"; then
            log "SUCCESS" "Code formatting is correct"
            quality_passed=$((quality_passed + 1))
        else
            log "WARN" "Code formatting issues detected"
            VALIDATION_WARNINGS+=("Code formatting issues detected")
        fi
    fi
    
    if [ $quality_checks -eq 0 ]; then
        log "INFO" "No quality tools detected - skipping quality validation"
    else
        log "INFO" "Quality validation: $quality_passed/$quality_checks checks passed"
    fi
    
    return $result
}

# Function to generate validation summary
generate_summary() {
    local total_errors=${#VALIDATION_ERRORS[@]}
    local total_warnings=${#VALIDATION_WARNINGS[@]}
    
    echo ""
    echo -e "${CYAN}========================================${NC}"
    echo -e "${CYAN}📋 ENHANCED VALIDATION SUMMARY${NC}"
    echo -e "${CYAN}========================================${NC}"
    
    if [ $total_errors -eq 0 ] && [ $total_warnings -eq 0 ]; then
        echo -e "${GREEN}✅ All validations passed successfully!${NC}"
        echo -e "${GREEN}🚀 Ready to commit${NC}"
    elif [ $total_errors -eq 0 ]; then
        echo -e "${YELLOW}⚠️  Validations passed with $total_warnings warning(s)${NC}"
        echo -e "${GREEN}✅ Ready to commit${NC}"
    else
        echo -e "${RED}❌ Validation failed with $total_errors error(s) and $total_warnings warning(s)${NC}"
        echo -e "${RED}🛑 Cannot commit${NC}"
    fi
    
    if [ $total_errors -gt 0 ]; then
        echo ""
        echo -e "${RED}Errors to fix:${NC}"
        for error in "${VALIDATION_ERRORS[@]}"; do
            echo -e "${RED}  • $error${NC}"
        done
    fi
    
    if [ $total_warnings -gt 0 ]; then
        echo ""
        echo -e "${YELLOW}Warnings (non-blocking):${NC}"
        for warning in "${VALIDATION_WARNINGS[@]}"; do
            echo -e "${YELLOW}  • $warning${NC}"
        done
    fi
    
    echo -e "${CYAN}========================================${NC}"
    
    return $total_errors
}

# Main validation function
run_enhanced_validation() {
    local start_time=$(date +%s)
    
    echo -e "${CYAN}🔍 Starting Enhanced Pre-commit Validation${NC}"
    echo -e "${BLUE}Timestamp: $(date)${NC}"
    echo ""
    
    # Check if enhanced validation is enabled
    if ! is_validation_enabled "enabled"; then
        log "INFO" "Enhanced validation is disabled"
        echo -e "${YELLOW}Enhanced validation disabled - running basic checks only${NC}"
        return 0
    fi
    
    # Run all validations
    local results=()
    
    if [ "$VALIDATION_PARALLEL" = "true" ]; then
        log "INFO" "Running validations in parallel"
        # Note: Parallel execution would require more complex implementation
        # For now, run sequentially
    fi
    
    # Security validation (always runs first)
    validate_security
    results+=($?)
    
    # Early exit on security failure if fail-fast is enabled
    if [ "$VALIDATION_FAIL_FAST" = "true" ] && [ ${results[-1]} -ne 0 ]; then
        log "ERROR" "Security validation failed - stopping due to fail-fast mode"
        generate_summary
        return 1
    fi
    
    # Build validation
    validate_build
    results+=($?)
    
    # Early exit on build failure if fail-fast is enabled
    if [ "$VALIDATION_FAIL_FAST" = "true" ] && [ ${results[-1]} -ne 0 ]; then
        log "ERROR" "Build validation failed - stopping due to fail-fast mode"
        generate_summary
        return 1
    fi
    
    # Test validation
    validate_tests
    results+=($?)
    
    # Quality validation (warnings only, doesn't stop commit)
    validate_quality
    # Don't add quality result to blocking results
    
    # Calculate final result
    local final_result=0
    for result in "${results[@]}"; do
        if [ $result -ne 0 ]; then
            final_result=1
            break
        fi
    done
    
    local end_time=$(date +%s)
    local duration=$((end_time - start_time))
    
    echo ""
    log "INFO" "Validation completed in ${duration}s"
    
    generate_summary
    return $final_result
}

# Export functions for use by other scripts
export -f log
export -f run_with_timeout
export -f is_validation_enabled
export -f get_validation_config
export -f get_changed_files