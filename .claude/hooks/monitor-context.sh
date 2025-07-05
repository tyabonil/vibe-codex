#!/bin/bash

# Context usage monitoring for Claude Code
# Alerts when context is running low and suggests updating RESTART_CONTEXT.md

echo "🔍 Claude Context Monitor"
echo "━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check if we're in a git repository
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo "❌ Not in a git repository"
    exit 1
fi

# Simulated context usage (in real implementation, would query Claude's API)
# For demonstration, we'll use a random value or environment variable
CONTEXT_USAGE=${CLAUDE_CONTEXT_USAGE:-45}

echo "📊 Current context usage: ${CONTEXT_USAGE}%"
echo ""

if [ "$CONTEXT_USAGE" -ge 75 ]; then
    echo "🚨 CRITICAL: Context usage is at ${CONTEXT_USAGE}%!"
    echo "   You should run: ./.claude/hooks/update-restart-context.sh"
    echo ""
    echo "⚠️  Claude may lose context soon. Update RESTART_CONTEXT.md now!"
elif [ "$CONTEXT_USAGE" -ge 40 ]; then
    echo "⚠️  WARNING: Context usage is at ${CONTEXT_USAGE}%"
    echo "   Consider updating RESTART_CONTEXT.md soon"
else
    echo "✅ Context usage is healthy"
fi

echo ""
echo "💡 Tips:"
echo "   - Update RESTART_CONTEXT.md when context > 75%"
echo "   - Include current branch, open PRs, and work in progress"
echo "   - This helps maintain continuity across Claude sessions"