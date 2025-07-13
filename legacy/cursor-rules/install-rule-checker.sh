#!/bin/bash

# MANDATORY Rules Checker - Automated Installation Script
# Installs centralized rule checking with remote rule management

set -e

echo "🚀 Installing MANDATORY Rules Compliance Checker..."
echo "📋 Source: tyabonil/vibe-codex (centralized rules)"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if we're in a git repository
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo -e "${RED}❌ Error: Not in a git repository${NC}"
    echo "Please run this script from the root of your git repository."
    exit 1
fi

# Check if GitHub Actions directory exists, create if not
if [ ! -d ".github" ]; then
    echo "📁 Creating .github directory..."
    mkdir -p .github/workflows
else
    if [ ! -d ".github/workflows" ]; then
        echo "📁 Creating .github/workflows directory..."
        mkdir -p .github/workflows
    fi
fi

# Download the centralized workflow file
echo "📥 Downloading centralized rule checker workflow..."
curl -sSL -H "Accept: application/vnd.github.raw" \
     -o .github/workflows/mandatory-rules-checker.yml \
     "https://api.github.com/repos/tyabonil/vibe-codex/contents/.github/workflows/rule-checker.yml"

# Modify the workflow to use centralized approach
echo "🔧 Configuring for centralized rule management..."
cat > .github/workflows/mandatory-rules-checker.yml << 'EOF'
name: MANDATORY Rules Compliance Checker

on:
  pull_request:
    types: [opened, synchronize, ready_for_review]
  pull_request_review:
    types: [submitted]

jobs:
  rule-compliance:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      pull-requests: write
      checks: write
      issues: read
      
    steps:
      - name: Checkout PR code
        uses: actions/checkout@v4
        with:
          fetch-depth: 0
          
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          
      - name: Download MANDATORY Rules and Scripts
        env:
          GITHUB_TOKEN: ${{ secrets.RULES_ACCESS_TOKEN || secrets.GITHUB_TOKEN }}
        run: |
          # Create directories
          mkdir -p scripts config
          
          echo "📥 Downloading latest MANDATORY-RULES.md from tyabonil/vibe-codex..."
          curl -H "Authorization: token ${GITHUB_TOKEN}" \
               -H "Accept: application/vnd.github.raw" \
               -o MANDATORY-RULES.md \
               "https://api.github.com/repos/tyabonil/vibe-codex/contents/MANDATORY-RULES.md" || \
          curl -H "Accept: application/vnd.github.raw" \
               -o MANDATORY-RULES.md \
               "https://api.github.com/repos/tyabonil/vibe-codex/contents/MANDATORY-RULES.md"
          
          echo "📥 Downloading rule checker scripts from tyabonil/vibe-codex..."
          
          # Download rule engine
          curl -H "Authorization: token ${GITHUB_TOKEN}" \
               -H "Accept: application/vnd.github.raw" \
               -o scripts/rule-engine.js \
               "https://api.github.com/repos/tyabonil/vibe-codex/contents/scripts/rule-engine.js" || \
          curl -H "Accept: application/vnd.github.raw" \
               -o scripts/rule-engine.js \
               "https://api.github.com/repos/tyabonil/vibe-codex/contents/scripts/rule-engine.js"
               
          # Download GitHub client
          curl -H "Authorization: token ${GITHUB_TOKEN}" \
               -H "Accept: application/vnd.github.raw" \
               -o scripts/github-client.js \
               "https://api.github.com/repos/tyabonil/vibe-codex/contents/scripts/github-client.js" || \
          curl -H "Accept: application/vnd.github.raw" \
               -o scripts/github-client.js \
               "https://api.github.com/repos/tyabonil/vibe-codex/contents/scripts/github-client.js"
               
          # Download reporter
          curl -H "Authorization: token ${GITHUB_TOKEN}" \
               -H "Accept: application/vnd.github.raw" \
               -o scripts/reporter.js \
               "https://api.github.com/repos/tyabonil/vibe-codex/contents/scripts/reporter.js" || \
          curl -H "Accept: application/vnd.github.raw" \
               -o scripts/reporter.js \
               "https://api.github.com/repos/tyabonil/vibe-codex/contents/scripts/reporter.js"
               
          # Download configuration
          curl -H "Authorization: token ${GITHUB_TOKEN}" \
               -H "Accept: application/vnd.github.raw" \
               -o config/rules.json \
               "https://api.github.com/repos/tyabonil/vibe-codex/contents/config/rules.json" || \
          curl -H "Accept: application/vnd.github.raw" \
               -o config/rules.json \
               "https://api.github.com/repos/tyabonil/vibe-codex/contents/config/rules.json"
               
          echo "✅ All files downloaded successfully from tyabonil/vibe-codex"
          echo "📊 Rules version: $(date)"
          
      - name: Install dependencies
        run: |
          npm init -y
          npm install @actions/core @actions/github
          
      - name: Run MANDATORY Rules Compliance Check
        id: rule-check
        uses: actions/github-script@v7
        env:
          RULES_SOURCE_REPO: 'tyabonil/vibe-codex'
          RULES_SOURCE_BRANCH: 'main'
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
          script: |
            const fs = require('fs');
            const path = require('path');
            
            // console.log('🚀 Starting MANDATORY Rules Compliance Check...');
            // console.log(`📋 Rules source: ${process.env.RULES_SOURCE_REPO}`);
            // console.log(`🌟 Repository: ${context.repo.owner}/${context.repo.repo}`);
            
            try {
              // Import rule checking modules
              const RuleEngine = require('./scripts/rule-engine.js');
              const GitHubClient = require('./scripts/github-client.js');
              const Reporter = require('./scripts/reporter.js');
              
              // Initialize components
              const ruleEngine = new RuleEngine();
              const githubClient = new GitHubClient(github, context);
              const reporter = new Reporter();
              
              // Get PR and files data
              const prData = await githubClient.getPRData();
              const files = await githubClient.getPRFiles();
              const commits = await githubClient.getPRCommits();
              
              // console.log(`📋 Analyzing PR #${prData.number}: ${prData.title}`);
              // console.log(`📁 Files changed: ${files.length}`);
              // console.log(`📝 Commits: ${commits.length}`);
              
              // Run all rule checks
              const violations = [];
              
              // Level 1: Security (BLOCKER)
              // console.log('🔐 Checking Level 1: Security & Safety...');
              const level1Violations = await ruleEngine.checkLevel1Security(files, prData);
              violations.push(...level1Violations);
              
              // Level 2: Workflow (MANDATORY)
              // console.log('🔄 Checking Level 2: Workflow Integrity...');
              const level2Violations = await ruleEngine.checkLevel2Workflow(prData, files, commits, githubClient);
              violations.push(...level2Violations);
              
              // Level 3: Quality (MANDATORY)
              // console.log('🎯 Checking Level 3: Quality Gates...');
              const level3Violations = await ruleEngine.checkLevel3Quality(prData, files, githubClient);
              violations.push(...level3Violations);
              
              // Level 4: Patterns (RECOMMENDED)
              // console.log('📐 Checking Level 4: Development Patterns...');
              const level4Violations = await ruleEngine.checkLevel4Patterns(files, prData);
              violations.push(...level4Violations);
              
              // Calculate compliance score and blocking status
              const criticalViolations = violations.filter(v => v.level <= 3 && v.severity === 'BLOCKER');
              const isBlocking = criticalViolations.length > 0;
              const score = Math.max(0, 10 - violations.length);
              
              // console.log(`📊 Compliance Results:`);
              // console.log(`   Total violations: ${violations.length}`);
              // console.log(`   Critical (blocking): ${criticalViolations.length}`);
              // console.log(`   Score: ${score}/10`);
              // console.log(`   Status: ${isBlocking ? 'BLOCKED' : 'PASSED'}`);
              
              // Generate and post compliance report
              const report = reporter.generateReport(violations, score, isBlocking, prData);
              
              // Add centralized rules footer
              const centralizedFooter = `\n\n---\n\n*Rules validated against [tyabonil/vibe-codex](https://github.com/tyabonil/vibe-codex) • Updated: ${new Date().toISOString().split('T')[0]}*`;
              
              if (violations.length > 0) {
                await githubClient.postComplianceComment(report + centralizedFooter);
                // console.log('💬 Posted compliance report comment to PR');
              } else {
                await githubClient.postComplianceComment(`## ✅ MANDATORY Rules Compliance - PASSED\n\nAll rules are compliant! Great work! 🎉${centralizedFooter}`);
                // console.log('✅ Posted success comment to PR');
              }
              
              // Set status check
              await githubClient.setStatusCheck(
                isBlocking ? 'failure' : 'success',
                `${score}/10 compliance score - ${isBlocking ? 'BLOCKED' : 'PASSED'}`,
                violations.length
              );
              
              // console.log('🏁 MANDATORY Rules Compliance Check completed');
              // console.log(`📋 Rules enforced from: ${process.env.RULES_SOURCE_REPO}`);
              
              return {
                violations: violations.length,
                score: score,
                blocking: isBlocking,
                success: !isBlocking
              };
              
            } catch (error) {
              console.error('❌ Rule check failed:', error);
              
              // Post error comment
              await github.rest.issues.createComment({
                owner: context.repo.owner,
                repo: context.repo.repo,
                issue_number: context.issue.number,
                body: `## ❌ MANDATORY Rules Checker Error\n\n\`\`\`\n${error.message}\n\`\`\`\n\nPlease check the [workflow logs](${context.payload.repository.html_url}/actions) for details.\n\n*Rules from [tyabonil/vibe-codex](https://github.com/tyabonil/vibe-codex)*`
              });
              
              throw error;
            }
EOF

echo "✅ Workflow file created: .github/workflows/mandatory-rules-checker.yml"

# Create .cursorrules template for local overrides (optional)
if [ ! -f ".cursorrules" ]; then
    echo "📝 Creating .cursorrules template for local rule overrides..."
    cat > .cursorrules << 'EOF'
# Repository-specific MANDATORY Rules overrides
# These settings override the central rules from tyabonil/vibe-codex
# Remove this file to use central rules without modification

# Example: Disable specific checks for this repository
# level4_patterns:
#   file_size_limits:
#     enabled: false

# Example: Custom branch naming patterns
# level2_workflow:
#   branch_naming:
#     required_patterns:
#       - "^feat\\/.*"
#       - "^fix\\/.*"
#       - "^docs\\/.*"

# Example: Custom test coverage threshold  
# level3_quality:
#   test_coverage:
#     require_100_percent: false
#     minimum_threshold: 80

# For complete configuration options, see:
# https://github.com/tyabonil/vibe-codex/blob/main/config/rules.json
EOF
    echo "✅ Created .cursorrules template"
else
    echo "ℹ️  .cursorrules already exists - keeping existing configuration"
fi

# Add .cursorrules to .gitignore if it doesn't exist there
if [ -f ".gitignore" ]; then
    if ! grep -q ".cursorrules" .gitignore; then
        echo "📝 Adding .cursorrules to .gitignore..."
        echo "" >> .gitignore
        echo "# Repository-specific rule overrides (optional)" >> .gitignore
        echo ".cursorrules" >> .gitignore
        echo "✅ Added .cursorrules to .gitignore"
    fi
else
    echo "📝 Creating .gitignore with .cursorrules..."
    echo "# Repository-specific rule overrides (optional)" > .gitignore
    echo ".cursorrules" >> .gitignore
    echo "✅ Created .gitignore"
fi

echo ""
echo -e "${GREEN}🎉 Installation Complete!${NC}"
echo ""
echo -e "${BLUE}📋 What was installed:${NC}"
echo "  ✅ Centralized workflow: .github/workflows/mandatory-rules-checker.yml"
echo "  ✅ Local override template: .cursorrules (optional)"
echo "  ✅ Updated .gitignore"
echo ""
echo -e "${BLUE}📊 Centralized Rule Management:${NC}"
echo "  • Rules source: tyabonil/vibe-codex"
echo "  • Auto-updates: Latest rules downloaded on each run"
echo "  • Local overrides: Customize via .cursorrules (optional)"
echo ""
echo -e "${BLUE}🔧 Next Steps:${NC}"
echo "  1. Configure repository permissions:"
echo "     Settings → Actions → General → Workflow permissions"
echo "     Set to 'Read and write permissions'"
echo ""
echo "  2. Test installation:"
echo "     Create a test PR and verify the rule checker runs"
echo ""
echo "  3. For private repositories:"
echo "     Add RULES_ACCESS_TOKEN secret if needed for rule access"
echo ""
echo -e "${BLUE}📚 Documentation:${NC}"
echo "  • Installation guide: https://github.com/tyabonil/vibe-codex/blob/main/INSTALLATION.md"
echo "  • Rule documentation: https://github.com/tyabonil/vibe-codex/blob/main/MANDATORY-RULES.md"
echo ""
echo -e "${GREEN}🚀 Your repository now enforces MANDATORY rules with centralized management!${NC}"