#!/bin/bash
# Script to update issue labels based on the review recommendations

REPO="tyabonil/vibe-codex"

echo "Updating issue labels for vibe-codex repository..."

# P0 - Critical Issues
echo "Adding P0-CRITICAL labels..."
gh issue edit 224 --repo $REPO --add-label "P0-CRITICAL,workflow-improvement"
gh issue edit 214 --repo $REPO --add-label "P0-CRITICAL,enhancement"

# P1 - Transformation Roadmap Issues
echo "Adding priority/p1-high and enhancement labels to transformation issues..."
for issue in 212 213 215 216 217 218 219 220; do
    gh issue edit $issue --repo $REPO --add-label "priority/p1-high,enhancement"
done

# P2 - Medium Priority Issues
echo "Adding labels to medium priority issues..."
gh issue edit 200 --repo $REPO --add-label "enhancement,ai-optimization"
gh issue edit 194 --repo $REPO --add-label "enhancement,workflow"
gh issue edit 185 --repo $REPO --add-label "enhancement,workflow"
gh issue edit 184 --repo $REPO --add-label "bug"

# P3 - Low Priority Issues (adding question label for further evaluation)
echo "Adding labels to low priority issues..."
for issue in 197 198 199; do
    gh issue edit $issue --repo $REPO --add-label "enhancement,question"
done

echo "Label updates complete!"

# Link related issues
echo "Linking related issues..."
gh issue comment 184 --repo $REPO --body "Related to #185 which provides a solution for this GitHub API issue."
gh issue comment 185 --repo $REPO --body "Addresses the problem described in #184."

# Update meta issue with current status
echo "Updating meta issue #220..."
gh issue comment 220 --repo $REPO --body "## Status Update - $(date +%Y-%m-%d)

### Repository State
- Dual project structure issue (#214) identified as P0-CRITICAL blocker
- Recent repository restructuring caused PR conflicts (see #224)
- All transformation issues remain relevant and properly scoped

### Priority Classification Complete
- P0 (Critical): #224, #214 - Must be resolved before transformation
- P1 (High): #212-#220 - Core transformation work
- P2 (Medium): #200, #194, #185, #184 - Post-transformation enhancements
- P3 (Low): #197-#199 - Under evaluation for relevance to simplified architecture

### Next Steps
1. Resolve dual project structure (#214)
2. Implement repository restructuring rules (#224)
3. Begin core simplification (#212, #216)
"

echo "All updates complete!"