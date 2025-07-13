#!/bin/bash
# vibe-codex cursor rules check
# Checks for .cursorrules file and basic compliance

set -e

# Colors for output
RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}📋 Checking cursor rules...${NC}"

# Check if .cursorrules exists
if [ ! -f ".cursorrules" ]; then
    echo -e "${YELLOW}⚠️  No .cursorrules file found${NC}"
    echo -e "${YELLOW}   Consider adding cursor rules for consistent AI assistance${NC}"
    echo -e "${YELLOW}   See: https://cursor.com/docs/cursorrules${NC}"
    exit 0
fi

# Check file size (empty or very small files are likely placeholders)
FILE_SIZE=$(wc -c < .cursorrules)
if [ "$FILE_SIZE" -lt 50 ]; then
    echo -e "${YELLOW}⚠️  .cursorrules file seems empty or too small${NC}"
    echo -e "${YELLOW}   Add meaningful rules for better AI assistance${NC}"
    exit 0
fi

# Check for common required sections
MISSING_SECTIONS=""

# Check for basic content indicators
if ! grep -q -i "style\|format\|convention\|rule\|guideline" .cursorrules 2>/dev/null; then
    MISSING_SECTIONS="${MISSING_SECTIONS}   - No coding style or convention rules found\n"
fi

if ! grep -q -i "language\|typescript\|javascript\|python\|ruby\|java" .cursorrules 2>/dev/null; then
    MISSING_SECTIONS="${MISSING_SECTIONS}   - No language-specific rules found\n"
fi

if ! grep -q -i "test\|spec\|jest\|pytest\|rspec" .cursorrules 2>/dev/null; then
    MISSING_SECTIONS="${MISSING_SECTIONS}   - No testing guidelines found\n"
fi

# Report findings
if [ ! -z "$MISSING_SECTIONS" ]; then
    echo -e "${YELLOW}⚠️  .cursorrules might be incomplete:${NC}"
    echo -e "$MISSING_SECTIONS"
    echo -e "${YELLOW}Consider adding more comprehensive rules${NC}"
else
    echo -e "${GREEN}✅ .cursorrules file looks good!${NC}"
fi

# Check age of file (warn if very old)
if command -v stat >/dev/null 2>&1; then
    # Get file modification time in seconds since epoch
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        FILE_MOD_TIME=$(stat -f %m .cursorrules)
    else
        # Linux
        FILE_MOD_TIME=$(stat -c %Y .cursorrules)
    fi
    
    CURRENT_TIME=$(date +%s)
    FILE_AGE_DAYS=$(( ($CURRENT_TIME - $FILE_MOD_TIME) / 86400 ))
    
    if [ "$FILE_AGE_DAYS" -gt 180 ]; then
        echo -e "${YELLOW}⚠️  .cursorrules hasn't been updated in ${FILE_AGE_DAYS} days${NC}"
        echo -e "${YELLOW}   Consider reviewing and updating your cursor rules${NC}"
    fi
fi

exit 0