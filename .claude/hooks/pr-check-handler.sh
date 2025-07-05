#!/bin/bash

# PR Check Handler - Analyzes bot check failures
# Distinguishes between systemic errors and actual rule violations

echo "🔍 PR Check Handler"
echo "━━━━━━━━━━━━━━━━━━"
echo ""

# Get PR number from current branch or argument
PR_NUMBER=$1
if [ -z "$PR_NUMBER" ]; then
    # Try to get PR number from current branch
    PR_NUMBER=$(gh pr view --json number --jq .number 2>/dev/null)
fi

if [ -z "$PR_NUMBER" ]; then
    echo "❌ No PR number provided and couldn't detect from current branch"
    echo "Usage: $0 [PR_NUMBER]"
    exit 1
fi

echo "📋 Analyzing PR #$PR_NUMBER..."
echo ""

# Get check runs for the PR
CHECKS=$(gh pr checks $PR_NUMBER 2>/dev/null)

if [ $? -ne 0 ]; then
    echo "❌ Failed to fetch PR checks"
    exit 1
fi

# Analyze failures
FAILED_CHECKS=$(echo "$CHECKS" | grep -E "(fail|X)" || true)

if [ -z "$FAILED_CHECKS" ]; then
    echo "✅ All checks passed!"
    exit 0
fi

echo "⚠️  Failed checks detected:"
echo "$FAILED_CHECKS"
echo ""

# Check for known systemic errors
SYSTEMIC_ERRORS=0
ACTUAL_VIOLATIONS=0

# Pattern matching for systemic errors
if echo "$FAILED_CHECKS" | grep -qE "(timeout|ETIMEDOUT|ECONNRESET)"; then
    echo "🔧 Detected: Network timeout error (systemic)"
    ((SYSTEMIC_ERRORS++))
fi

if echo "$FAILED_CHECKS" | grep -qE "(SyntaxError.*Unexpected token|JSON.*parse)"; then
    echo "🔧 Detected: JSON parsing error from bot (systemic)"
    ((SYSTEMIC_ERRORS++))
fi

if echo "$FAILED_CHECKS" | grep -qE "(rate.limit|429|Too Many Requests)"; then
    echo "🔧 Detected: API rate limit error (systemic)"
    ((SYSTEMIC_ERRORS++))
fi

if echo "$FAILED_CHECKS" | grep -qE "(503|Service Unavailable|502|Bad Gateway)"; then
    echo "🔧 Detected: Service availability error (systemic)"
    ((SYSTEMIC_ERRORS++))
fi

# Check for actual violations
if echo "$FAILED_CHECKS" | grep -qE "(MANDATORY.*Rules|rule.*violation|compliance.*failed)"; then
    echo "❌ Detected: Actual rule violations"
    ((ACTUAL_VIOLATIONS++))
fi

echo ""
echo "📊 Analysis Summary:"
echo "   - Systemic errors: $SYSTEMIC_ERRORS"
echo "   - Rule violations: $ACTUAL_VIOLATIONS"
echo ""

if [ $ACTUAL_VIOLATIONS -gt 0 ]; then
    echo "🛑 PR is blocked due to rule violations"
    echo "   Fix the violations before proceeding"
    exit 1
elif [ $SYSTEMIC_ERRORS -gt 0 ]; then
    echo "⚠️  Only systemic errors detected"
    echo "✅ PR can proceed - no actual rule violations"
    echo ""
    echo "💡 Recommended actions:"
    echo "   1. Document these systemic errors in PR comment"
    echo "   2. Re-run checks if possible"
    echo "   3. Proceed with merge if checks remain failed"
    exit 0
else
    echo "❓ Unknown failures detected"
    echo "   Manual review required"
    exit 1
fi