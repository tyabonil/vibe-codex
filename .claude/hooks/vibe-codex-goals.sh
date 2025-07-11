#!/bin/bash
# Claude hook to remember vibe-codex project goals and prevent scope creep

# Function to check if current work aligns with goals
check_current_work() {
  local current_issue="$1"
  local warnings=0
  
  # Check for complexity indicators
  if echo "$current_issue" | grep -iE "(manifest|lock file|backup|rollback|dry-run)" > /dev/null; then
    echo "⚠️  WARNING: This issue may add unnecessary complexity!"
    echo "   Consider: Simple operations without manifests or complex state tracking"
    ((warnings++))
  fi
  
  if echo "$current_issue" | grep -iE "(detect|smart|adaptive|framework-specific)" > /dev/null; then
    echo "⚠️  WARNING: This issue suggests making the tool 'smart'!"
    echo "   Consider: Keep it dumb and simple - one size fits all"
    ((warnings++))
  fi
  
  if echo "$current_issue" | grep -iE "(workflow|CI/CD|integration|platform)" > /dev/null; then
    echo "⚠️  WARNING: This issue may expand beyond basic hooks!"
    echo "   Consider: Focus only on git hooks, nothing more"
    ((warnings++))
  fi
  
  return $warnings
}

# If an issue number is provided, check it
if [ -n "$1" ]; then
  echo "🔍 Checking issue #$1 against project goals..."
  issue_content=$(gh issue view "$1" 2>/dev/null || echo "")
  check_current_work "$issue_content"
  warnings=$?
  
  if [ $warnings -gt 0 ]; then
    echo ""
    echo "🚨 This issue has $warnings warning(s) about scope creep!"
    echo "   Consider closing as 'wontfix' or simplifying the approach."
    echo ""
  fi
fi

cat << 'EOF'
🎯 VIBE-CODEX PROJECT GOALS REMINDER
====================================

CORE PURPOSE: Simple NPX tool to install basic git hooks and rules

✅ WHAT IT SHOULD DO:
- Install basic git hooks (pre-commit, commit-msg)
- Simple menu interface (like Claude Code)
- Quick setup via: npx vibe-codex
- Minimal dependencies (2 only: chalk, inquirer)
- < 100KB package size
- < 5 second execution

❌ WHAT IT SHOULD NOT DO:
- Complex module systems
- Project type detection
- Framework-specific configs
- Issue tracking features
- PR workflow enforcement
- Platform-specific integrations
- Heavy dependencies

🚨 RED FLAGS TO WATCH FOR:
- Adding new dependencies
- Creating complex abstractions
- Adding features beyond basic hooks
- Scope creep into CI/CD territory
- Making it "smart" or "adaptive"

📋 CURRENT PRIORITIES:
1. Keep it simple
2. Make it work reliably
3. Fast execution
4. Clear documentation
5. Easy uninstall

Remember: If a feature request doesn't align with "simple hook installer", 
it probably doesn't belong in vibe-codex!
EOF