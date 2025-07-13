#!/bin/bash
# vibe-codex context size check
# Warns about large changes that might exceed AI context windows

set -e

# Colors for output
RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}📏 Checking context size...${NC}"

# Default thresholds (can be overridden by config)
MAX_LINES_PER_FILE=1000
MAX_TOTAL_LINES=5000
MAX_FILES_CHANGED=20

# Read config if exists
CONFIG_FILE=".vibe-codex.json"
if [ -f "$CONFIG_FILE" ] && command -v jq >/dev/null 2>&1; then
    # Try to read custom thresholds
    CUSTOM_MAX_LINES=$(jq -r '.contextThresholds.maxLinesPerFile // empty' "$CONFIG_FILE" 2>/dev/null || echo "")
    CUSTOM_TOTAL_LINES=$(jq -r '.contextThresholds.maxTotalLines // empty' "$CONFIG_FILE" 2>/dev/null || echo "")
    CUSTOM_MAX_FILES=$(jq -r '.contextThresholds.maxFiles // empty' "$CONFIG_FILE" 2>/dev/null || echo "")
    
    [ ! -z "$CUSTOM_MAX_LINES" ] && MAX_LINES_PER_FILE=$CUSTOM_MAX_LINES
    [ ! -z "$CUSTOM_TOTAL_LINES" ] && MAX_TOTAL_LINES=$CUSTOM_TOTAL_LINES
    [ ! -z "$CUSTOM_MAX_FILES" ] && MAX_FILES_CHANGED=$CUSTOM_MAX_FILES
fi

# Track warnings
WARNINGS=""

# Get staged files
STAGED_FILES=$(git diff --cached --name-only)
if [ -z "$STAGED_FILES" ]; then
    echo -e "${GREEN}✅ No staged changes to check${NC}"
    exit 0
fi

# Count files
FILE_COUNT=$(echo "$STAGED_FILES" | wc -l)
if [ "$FILE_COUNT" -gt "$MAX_FILES_CHANGED" ]; then
    WARNINGS="${WARNINGS}${YELLOW}⚠️  Too many files changed: $FILE_COUNT (max: $MAX_FILES_CHANGED)${NC}\n"
fi

# Check individual file sizes and count total lines
TOTAL_LINES=0
LARGE_FILES=""

for file in $STAGED_FILES; do
    # Skip if file was deleted
    if [ ! -f "$file" ]; then
        continue
    fi
    
    # Count lines in file
    FILE_LINES=$(wc -l < "$file" 2>/dev/null || echo "0")
    
    # Check if file is too large
    if [ "$FILE_LINES" -gt "$MAX_LINES_PER_FILE" ]; then
        LARGE_FILES="${LARGE_FILES}   - $file ($FILE_LINES lines)\n"
    fi
    
    # Add to total for staged lines (approximation)
    STAGED_LINES=$(git diff --cached "$file" | grep -E "^[+-]" | grep -v "^[+-]{3}" | wc -l)
    TOTAL_LINES=$((TOTAL_LINES + STAGED_LINES))
done

# Check large files
if [ ! -z "$LARGE_FILES" ]; then
    WARNINGS="${WARNINGS}${YELLOW}⚠️  Large files that may exceed context limits:${NC}\n$LARGE_FILES"
fi

# Check total changes
if [ "$TOTAL_LINES" -gt "$MAX_TOTAL_LINES" ]; then
    WARNINGS="${WARNINGS}${YELLOW}⚠️  Total changes are large: ~$TOTAL_LINES lines (max: $MAX_TOTAL_LINES)${NC}\n"
fi

# Report findings
if [ ! -z "$WARNINGS" ]; then
    echo -e ""
    echo -e "${YELLOW}⚠️  Context size warnings:${NC}"
    echo -e "$WARNINGS"
    echo -e "${BLUE}💡 Tips for managing large changes:${NC}"
    echo -e "   • Break changes into smaller, focused commits"
    echo -e "   • Use git add -p to stage specific hunks"
    echo -e "   • Consider splitting large files into modules"
    echo -e "   • Review changes in smaller batches"
    echo -e ""
    echo -e "${YELLOW}This may impact AI tools' ability to process your changes effectively.${NC}"
else
    echo -e "${GREEN}✅ Context size is reasonable${NC}"
fi

# This is a warning-only check, always exit 0
exit 0