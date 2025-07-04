#!/bin/bash
# Context Monitoring Hook - Alerts when context is running low

echo "📊 Context Usage Monitor"
echo "======================="

# Context thresholds
CRITICAL_THRESHOLD=25
WARNING_THRESHOLD=40

# Get current context usage (would need Claude API integration)
check_context_usage() {
  local usage=${1:-50}
  echo "$usage"
}

CONTEXT_USAGE=${1:-$(check_context_usage)}
echo "Current context usage: ${CONTEXT_USAGE}%"

if [ "$CONTEXT_USAGE" -ge 75 ]; then
  echo "🔴 CRITICAL: Context usage at ${CONTEXT_USAGE}%!"
  echo "Action required: Update RESTART_CONTEXT.md immediately"
  
  # Auto-trigger update if available
  if [ -f "./update-restart-context.sh" ]; then
    ./update-restart-context.sh
  fi
elif [ "$CONTEXT_USAGE" -ge 60 ]; then
  echo "⚠️  WARNING: Context usage at ${CONTEXT_USAGE}%"
fi

# Log usage
echo "$(date): Context check - ${CONTEXT_USAGE}%" >> context-usage.log
