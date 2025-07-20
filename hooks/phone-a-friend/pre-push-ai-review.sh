#!/bin/bash
# Phone-a-Friend AI Code Review Hook
# This hook performs AI-powered code review before push

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if hook is disabled
if [ "$SKIP_VIBE_CODEX" = "true" ] || [ "$SKIP_AI_REVIEW" = "true" ]; then
    exit 0
fi

# Get configuration
CONFIG_FILE=".vibe-codex.json"
MODEL_CONFIG_DIR="config/models"

# Check if vibe-codex is configured
if [ ! -f "$CONFIG_FILE" ]; then
    echo -e "${YELLOW}⚠️  vibe-codex not configured. Skipping AI review.${NC}"
    exit 0
fi

# Check if AI review is enabled
AI_REVIEW_ENABLED=$(jq -r '.hooks.phoneAFriend.enabled // false' "$CONFIG_FILE" 2>/dev/null)
if [ "$AI_REVIEW_ENABLED" != "true" ]; then
    exit 0
fi

# Get model configuration
MODEL_NAME=$(jq -r '.hooks.phoneAFriend.model // "claude-3-5-sonnet"' "$CONFIG_FILE" 2>/dev/null)
MODEL_CONFIG_FILE="$MODEL_CONFIG_DIR/$MODEL_NAME.json"

if [ ! -f "$MODEL_CONFIG_FILE" ]; then
    echo -e "${RED}❌ Model configuration not found: $MODEL_CONFIG_FILE${NC}"
    echo -e "${YELLOW}Available models:${NC}"
    ls -1 "$MODEL_CONFIG_DIR" 2>/dev/null | sed 's/\.json$//' || echo "No models found"
    exit 1
fi

# Read model configuration
MODEL_PROVIDER=$(jq -r '.provider' "$MODEL_CONFIG_FILE")
MODEL_ID=$(jq -r '.model' "$MODEL_CONFIG_FILE")
ENDPOINT=$(jq -r '.endpoint' "$MODEL_CONFIG_FILE")
API_KEY_ENV=$(jq -r '.apiKeyEnv' "$MODEL_CONFIG_FILE")
MAX_TOKENS=$(jq -r '.maxTokens // 4096' "$MODEL_CONFIG_FILE")
TEMPERATURE=$(jq -r '.temperature // 0.3' "$MODEL_CONFIG_FILE")
SYSTEM_PROMPT=$(jq -r '.systemPrompt' "$MODEL_CONFIG_FILE")

# Get API key from environment
API_KEY="${!API_KEY_ENV}"
if [ -z "$API_KEY" ]; then
    echo -e "${RED}❌ API key not found. Please set $API_KEY_ENV environment variable.${NC}"
    exit 1
fi

# Get commit range
if [ -z "$1" ]; then
    # No remote specified, compare with origin/main
    REMOTE_REF="origin/main"
else
    # Use the remote ref being pushed to
    REMOTE_REF="$1/$2"
fi

LOCAL_REF=$(git rev-parse HEAD)

# Get changed files
CHANGED_FILES=$(git diff --name-only "$REMOTE_REF..$LOCAL_REF" 2>/dev/null || git diff --name-only HEAD~1..HEAD)

if [ -z "$CHANGED_FILES" ]; then
    echo -e "${GREEN}✅ No changes to review${NC}"
    exit 0
fi

echo -e "${BLUE}🤖 Phone-a-Friend: Starting AI code review with $MODEL_NAME...${NC}"

# Prepare the diff for review
DIFF_CONTENT=$(git diff "$REMOTE_REF..$LOCAL_REF" 2>/dev/null || git diff HEAD~1..HEAD)

# Limit diff size to avoid token limits
MAX_DIFF_SIZE=50000
if [ ${#DIFF_CONTENT} -gt $MAX_DIFF_SIZE ]; then
    echo -e "${YELLOW}⚠️  Diff too large, reviewing only changed file names${NC}"
    REVIEW_CONTENT="Files changed:\n$CHANGED_FILES\n\nPlease review these files for potential issues."
else
    REVIEW_CONTENT="Please review the following code changes:\n\n\`\`\`diff\n$DIFF_CONTENT\n\`\`\`"
fi

# Create temporary file for response
RESPONSE_FILE=$(mktemp)
trap "rm -f $RESPONSE_FILE" EXIT

# Build request based on provider
case "$MODEL_PROVIDER" in
    "anthropic")
        # Build Anthropic request
        REQUEST_BODY=$(jq -n \
            --arg model "$MODEL_ID" \
            --arg system "$SYSTEM_PROMPT" \
            --arg content "$REVIEW_CONTENT" \
            --argjson max_tokens "$MAX_TOKENS" \
            --argjson temperature "$TEMPERATURE" \
            '{
                model: $model,
                max_tokens: $max_tokens,
                temperature: $temperature,
                system: $system,
                messages: [{role: "user", content: $content}]
            }')
        
        # Make API call
        HTTP_CODE=$(curl -s -w "%{http_code}" -o "$RESPONSE_FILE" \
            -X POST "$ENDPOINT" \
            -H "x-api-key: $API_KEY" \
            -H "anthropic-version: 2023-06-01" \
            -H "content-type: application/json" \
            -d "$REQUEST_BODY")
        ;;
        
    "openai")
        # Build OpenAI request
        REQUEST_BODY=$(jq -n \
            --arg model "$MODEL_ID" \
            --arg system "$SYSTEM_PROMPT" \
            --arg content "$REVIEW_CONTENT" \
            --argjson max_tokens "$MAX_TOKENS" \
            --argjson temperature "$TEMPERATURE" \
            '{
                model: $model,
                max_tokens: $max_tokens,
                temperature: $temperature,
                messages: [
                    {role: "system", content: $system},
                    {role: "user", content: $content}
                ]
            }')
        
        # Make API call
        HTTP_CODE=$(curl -s -w "%{http_code}" -o "$RESPONSE_FILE" \
            -X POST "$ENDPOINT" \
            -H "Content-Type: application/json" \
            -H "Authorization: Bearer $API_KEY" \
            -d "$REQUEST_BODY")
        ;;
        
    *)
        echo -e "${RED}❌ Unsupported provider: $MODEL_PROVIDER${NC}"
        exit 1
        ;;
esac

# Check HTTP response code
if [ "$HTTP_CODE" -ne 200 ]; then
    echo -e "${RED}❌ API request failed with code $HTTP_CODE${NC}"
    cat "$RESPONSE_FILE"
    exit 1
fi

# Extract review content based on provider
case "$MODEL_PROVIDER" in
    "anthropic")
        REVIEW=$(jq -r '.content[0].text // "No review generated"' "$RESPONSE_FILE")
        ;;
    "openai")
        REVIEW=$(jq -r '.choices[0].message.content // "No review generated"' "$RESPONSE_FILE")
        ;;
esac

# Display review
echo -e "${BLUE}📋 AI Code Review Results:${NC}"
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo "$REVIEW"
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# Check if review contains critical issues
if echo "$REVIEW" | grep -iE "(critical|severe|security|vulnerability|bug)" > /dev/null; then
    echo -e "${RED}⚠️  Critical issues detected. Please review before pushing.${NC}"
    
    # Check if force push is allowed
    FORCE_PUSH=$(jq -r '.hooks.phoneAFriend.allowForcePush // false' "$CONFIG_FILE" 2>/dev/null)
    if [ "$FORCE_PUSH" != "true" ]; then
        echo -e "${YELLOW}To push anyway, use: SKIP_AI_REVIEW=true git push${NC}"
        exit 1
    fi
fi

echo -e "${GREEN}✅ AI review complete${NC}"
exit 0