#!/bin/bash
# Phone-a-Friend Demo Script
# This demonstrates how to configure and use the AI code review feature

set -e

echo "📱 Phone-a-Friend AI Code Review Demo"
echo "===================================="
echo ""

# Check if we're in a git repository
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo "❌ Not in a git repository. Please run from a git project."
    exit 1
fi

# Check if vibe-codex is initialized
if [ ! -f ".vibe-codex.json" ]; then
    echo "❌ vibe-codex not initialized. Run 'npx vibe-codex init' first."
    exit 1
fi

# List available models
echo "📋 Available AI Models:"
npx vibe-codex phone-a-friend --list

echo ""
echo "🔧 Configuring Phone-a-Friend with Claude 3.5 Sonnet..."
echo ""

# Configure phone-a-friend
npx vibe-codex phone-a-friend --model claude-3-5-sonnet

echo ""
echo "✅ Configuration complete!"
echo ""
echo "📝 To use the AI review:"
echo "   1. Set your API key: export ANTHROPIC_API_KEY='your-key'"
echo "   2. Make some code changes"
echo "   3. Commit your changes"
echo "   4. Push to trigger the review: git push"
echo ""
echo "💡 To skip review for a push: SKIP_AI_REVIEW=true git push"
echo ""
echo "🧪 To test the configuration: npx vibe-codex phone-a-friend --test"