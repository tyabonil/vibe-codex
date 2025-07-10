#!/bin/bash

# GitHub Issue Progress Update Hook
# Automatically updates GitHub issues with progress during long-running tasks
# Usage: ./update-issue-progress.sh <issue_number> <update_type> [message]
# Update types: plan, progress, blocker, completion

set -euo pipefail

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if gh CLI is available
if ! command -v gh &> /dev/null; then
    echo -e "${RED}Error: GitHub CLI (gh) is not installed${NC}"
    exit 1
fi

# Check arguments
if [ $# -lt 2 ]; then
    echo "Usage: $0 <issue_number> <update_type> [message]"
    echo "Update types: plan, progress, blocker, completion"
    exit 1
fi

ISSUE_NUMBER=$1
UPDATE_TYPE=$2
MESSAGE="${3:-}"

# Validate issue number
if ! [[ "$ISSUE_NUMBER" =~ ^[0-9]+$ ]]; then
    echo -e "${RED}Error: Invalid issue number: $ISSUE_NUMBER${NC}"
    exit 1
fi

# Get current timestamp
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S %Z')

# Function to extract current todo list
get_todo_status() {
    if [ -f ".claude/todos.json" ]; then
        # Extract completed and pending counts
        COMPLETED=$(jq '[.[] | select(.status == "completed")] | length' .claude/todos.json 2>/dev/null || echo "0")
        IN_PROGRESS=$(jq '[.[] | select(.status == "in_progress")] | length' .claude/todos.json 2>/dev/null || echo "0")
        PENDING=$(jq '[.[] | select(.status == "pending")] | length' .claude/todos.json 2>/dev/null || echo "0")
        
        # Get current task in progress
        CURRENT_TASK=$(jq -r '[.[] | select(.status == "in_progress") | .content] | first // "No task in progress"' .claude/todos.json 2>/dev/null)
        
        echo "Tasks: ✅ $COMPLETED completed, 🔄 $IN_PROGRESS in progress, 📋 $PENDING pending"
        echo "Current: $CURRENT_TASK"
    else
        echo "No todo list found"
    fi
}

# Function to check test results
get_test_status() {
    if command -v npm &> /dev/null && [ -f "package.json" ]; then
        # Check if test script exists
        if npm run | grep -q "test"; then
            echo -e "${BLUE}Running tests...${NC}"
            if npm test &> /tmp/test_results.log; then
                echo "✅ All tests passing"
            else
                FAILED_COUNT=$(grep -c "FAIL\|failed\|Error" /tmp/test_results.log || echo "unknown")
                echo "❌ Tests failing (${FAILED_COUNT} failures)"
            fi
        fi
    fi
}

# Function to get git status
get_git_status() {
    if [ -d ".git" ]; then
        MODIFIED_FILES=$(git status --porcelain | wc -l)
        CURRENT_BRANCH=$(git branch --show-current)
        echo "Branch: $CURRENT_BRANCH | Modified files: $MODIFIED_FILES"
    fi
}

# Generate update message based on type
case "$UPDATE_TYPE" in
    "plan")
        UPDATE_HEADER="## 📋 Implementation Plan - $TIMESTAMP"
        
        # Get todo list for plan
        TODO_STATUS=$(get_todo_status)
        
        UPDATE_BODY="### Planned Approach
$MESSAGE

### Task Breakdown
$TODO_STATUS

### Expected Outcomes
- Implementation following vibe-codex rules
- Comprehensive test coverage
- Documentation updates
- PR ready for review"
        ;;
        
    "progress")
        UPDATE_HEADER="## 🚧 Progress Update - $TIMESTAMP"
        
        # Get current status
        TODO_STATUS=$(get_todo_status)
        TEST_STATUS=$(get_test_status)
        GIT_STATUS=$(get_git_status)
        
        UPDATE_BODY="### Current Status
$TODO_STATUS

### Development Status
$GIT_STATUS
$TEST_STATUS

### Recent Changes
$MESSAGE

### Next Steps
- Continue with pending tasks
- Address any test failures
- Prepare for PR submission"
        ;;
        
    "blocker")
        UPDATE_HEADER="## 🚨 Blocker Encountered - $TIMESTAMP"
        
        UPDATE_BODY="### Issue Description
$MESSAGE

### Impact
- Current approach may need revision
- Timeline may be affected
- Additional investigation required

### Proposed Solutions
1. Analyze root cause
2. Consider alternative approaches
3. Update implementation plan

### Assistance Needed
Please review and provide guidance on the best path forward."
        ;;
        
    "completion")
        UPDATE_HEADER="## ✅ Task Completed - $TIMESTAMP"
        
        # Get final status
        TODO_STATUS=$(get_todo_status)
        TEST_STATUS=$(get_test_status)
        GIT_STATUS=$(get_git_status)
        
        UPDATE_BODY="### Summary
$MESSAGE

### Final Status
$TODO_STATUS
$TEST_STATUS

### Deliverables
$GIT_STATUS

### What's Next
- PR has been created/updated
- Ready for review
- All vibe-codex rules compliance verified"
        ;;
        
    *)
        echo -e "${RED}Error: Invalid update type: $UPDATE_TYPE${NC}"
        echo "Valid types: plan, progress, blocker, completion"
        exit 1
        ;;
esac

# Construct the full update message
FULL_UPDATE="$UPDATE_HEADER

$UPDATE_BODY

---
*Automated update from vibe-codex progress tracker*"

# Post update to GitHub issue
echo -e "${BLUE}Posting update to issue #$ISSUE_NUMBER...${NC}"

if gh issue comment "$ISSUE_NUMBER" --body "$FULL_UPDATE"; then
    echo -e "${GREEN}✅ Successfully updated issue #$ISSUE_NUMBER${NC}"
    
    # Log the update
    LOG_FILE=".claude/issue_updates.log"
    mkdir -p .claude
    echo "[$TIMESTAMP] Updated issue #$ISSUE_NUMBER with $UPDATE_TYPE update" >> "$LOG_FILE"
else
    echo -e "${RED}❌ Failed to update issue #$ISSUE_NUMBER${NC}"
    exit 1
fi

# Optional: Check if we should create a context checkpoint
if [ "$UPDATE_TYPE" = "progress" ] || [ "$UPDATE_TYPE" = "blocker" ]; then
    echo -e "${YELLOW}💡 Consider creating a context checkpoint for this progress${NC}"
    echo "Run: .claude/hooks/update-restart-context.sh"
fi