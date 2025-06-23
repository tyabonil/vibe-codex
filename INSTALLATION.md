# 🚀 MANDATORY Rules Checker - Centralized Installation Guide

## 📋 Overview

Install the MANDATORY Rules compliance checker in any repository with centralized rule management from the `tyabonil/cursor_rules` repository.

## ⚡ Quick Installation (Recommended)

### 1. **Copy Installation Script**

Run this in your target repository:

```bash
# Download and run the installation script
curl -sSL https://raw.githubusercontent.com/tyabonil/cursor_rules/main/install-rule-checker.sh | bash
```

### 2. **Configure Repository Permissions**

1. Go to your repository **Settings → Actions → General**
2. Set **Workflow permissions** to "Read and write permissions"
3. Enable **Allow GitHub Actions to create and approve pull requests**

### 3. **Test Installation**

Create a test PR to verify the rule checker is working:

```bash
git checkout -b test/rule-checker-verification
echo "# Test file" > test-file.md
git add test-file.md
git commit -m "Test rule checker installation"
git push -u origin test/rule-checker-verification
```

Then create a PR and verify the rule checker runs automatically.

---

## 🔧 Manual Installation

If you prefer manual setup:

### 1. **Create Workflow File**

Create `.github/workflows/mandatory-rules-checker.yml`:

```yaml
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
        run: |
          # Create directories
          mkdir -p scripts config
          
          # Download latest rules from cursor_rules repository
          echo "📥 Downloading latest MANDATORY-RULES.md..."
          curl -H "Accept: application/vnd.github.raw" \
               -o MANDATORY-RULES.md \
               "https://api.github.com/repos/tyabonil/cursor_rules/contents/MANDATORY-RULES.md"
          
          # Download rule checker scripts
          echo "📥 Downloading rule checker scripts..."
          curl -H "Accept: application/vnd.github.raw" \
               -o scripts/rule-engine.js \
               "https://api.github.com/repos/tyabonil/cursor_rules/contents/scripts/rule-engine.js"
               
          curl -H "Accept: application/vnd.github.raw" \
               -o scripts/github-client.js \
               "https://api.github.com/repos/tyabonil/cursor_rules/contents/scripts/github-client.js"
               
          curl -H "Accept: application/vnd.github.raw" \
               -o scripts/reporter.js \
               "https://api.github.com/repos/tyabonil/cursor_rules/contents/scripts/reporter.js"
               
          # Download configuration
          curl -H "Accept: application/vnd.github.raw" \
               -o config/rules.json \
               "https://api.github.com/repos/tyabonil/cursor_rules/contents/config/rules.json"
               
          echo "✅ All files downloaded successfully"
          
      - name: Install dependencies
        run: |
          npm init -y
          npm install @actions/core @actions/github
          
      - name: Run MANDATORY Rules Compliance Check
        id: rule-check
        uses: actions/github-script@v7
        env:
          RULES_SOURCE_REPO: 'tyabonil/cursor_rules'
          RULES_SOURCE_BRANCH: 'main'
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
          script: |
            const fs = require('fs');
            const path = require('path');
            
            console.log('🚀 Starting MANDATORY Rules Compliance Check...');
            console.log(`📋 Rules source: ${process.env.RULES_SOURCE_REPO}`);
            
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
              
              console.log(`📋 Analyzing PR #${prData.number}: ${prData.title}`);
              console.log(`📁 Files changed: ${files.length}`);
              console.log(`📝 Commits: ${commits.length}`);
              
              // Run all rule checks
              const violations = [];
              
              // Level 1: Security (BLOCKER)
              console.log('🔐 Checking Level 1: Security & Safety...');
              const level1Violations = await ruleEngine.checkLevel1Security(files, prData);
              violations.push(...level1Violations);
              
              // Level 2: Workflow (MANDATORY)
              console.log('🔄 Checking Level 2: Workflow Integrity...');
              const level2Violations = await ruleEngine.checkLevel2Workflow(prData, files, commits, githubClient);
              violations.push(...level2Violations);
              
              // Level 3: Quality (MANDATORY)
              console.log('🎯 Checking Level 3: Quality Gates...');
              const level3Violations = await ruleEngine.checkLevel3Quality(prData, files, githubClient);
              violations.push(...level3Violations);
              
              // Level 4: Patterns (RECOMMENDED)
              console.log('📐 Checking Level 4: Development Patterns...');
              const level4Violations = await ruleEngine.checkLevel4Patterns(files, prData);
              violations.push(...level4Violations);
              
              // Calculate compliance score and blocking status
              const criticalViolations = violations.filter(v => v.level <= 3 && v.severity === 'BLOCKER');
              const isBlocking = criticalViolations.length > 0;
              const score = Math.max(0, 10 - violations.length);
              
              console.log(`📊 Compliance Results:`);
              console.log(`   Total violations: ${violations.length}`);
              console.log(`   Critical (blocking): ${criticalViolations.length}`);
              console.log(`   Score: ${score}/10`);
              console.log(`   Status: ${isBlocking ? 'BLOCKED' : 'PASSED'}`);
              
              // Generate and post compliance report
              const report = reporter.generateReport(violations, score, isBlocking, prData);
              
              if (violations.length > 0) {
                await githubClient.postComplianceComment(report);
                console.log('💬 Posted compliance report comment to PR');
              } else {
                await githubClient.postComplianceComment('## ✅ MANDATORY Rules Compliance - PASSED\n\nAll rules are compliant! Great work! 🎉\n\n*Rules validated against [tyabonil/cursor_rules](https://github.com/tyabonil/cursor_rules)*');
                console.log('✅ Posted success comment to PR');
              }
              
              // Set status check
              await githubClient.setStatusCheck(
                isBlocking ? 'failure' : 'success',
                `${score}/10 compliance score - ${isBlocking ? 'BLOCKED' : 'PASSED'}`,
                violations.length
              );
              
              console.log('🏁 MANDATORY Rules Compliance Check completed');
              
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
                body: `## ❌ MANDATORY Rules Checker Error\n\n\`\`\`\n${error.message}\n\`\`\`\n\nPlease check the [workflow logs](${context.payload.repository.html_url}/actions) for details.\n\n*Rules from [tyabonil/cursor_rules](https://github.com/tyabonil/cursor_rules)*`
              });
              
              throw error;
            }
```

### 2. **Add Local Configuration (Optional)**

Create `.cursorrules` file for repository-specific rule overrides:

```markdown
# Repository-specific rule overrides
# These settings override the central rules from tyabonil/cursor_rules

# Example: Disable file size warnings for this repo
level4_patterns:
  file_size_limits:
    enabled: false

# Example: Custom branch naming for this project  
level2_workflow:
  branch_naming:
    required_patterns:
      - "^feat\\/.*"
      - "^fix\\/.*"
      - "^docs\\/.*"
```

---

## 🔐 Private Repository Setup

For private repositories, you may need authentication to access the central rules:

### 1. **Create Personal Access Token**

1. Go to GitHub **Settings → Developer settings → Personal access tokens**
2. Create token with `Contents: Read` permission for `tyabonil/cursor_rules`
3. Copy the token

### 2. **Add Repository Secret**

1. Go to your repository **Settings → Secrets and variables → Actions**
2. Add new secret: `RULES_ACCESS_TOKEN` = your token
3. Update the workflow to use authenticated requests:

```yaml
- name: Download MANDATORY Rules and Scripts
  env:
    GITHUB_TOKEN: ${{ secrets.RULES_ACCESS_TOKEN || secrets.GITHUB_TOKEN }}
  run: |
    # Download with authentication
    curl -H "Authorization: token $GITHUB_TOKEN" \
         -H "Accept: application/vnd.github.raw" \
         -o MANDATORY-RULES.md \
         "https://api.github.com/repos/tyabonil/cursor_rules/contents/MANDATORY-RULES.md"
    # ... rest of downloads
```

---

## 🧪 Testing Your Installation

### 1. **Verify Basic Functionality**

Create a test PR with violations to see the checker in action:

```bash
# Create test branch
git checkout -b test/rule-violations

# Create file with secrets (should be detected)
echo 'const API_KEY = "sk-test123";' > test-secrets.js
git add test-secrets.js
git commit -m "Add test secrets file"

# Create PR without issue reference (should be detected)
git push -u origin test/rule-violations
# Create PR with title: "Test violations" (no issue reference)
```

### 2. **Expected Results**

The rule checker should:
- ✅ Detect the secret in `test-secrets.js`
- ✅ Flag missing issue reference in PR title
- ✅ Block the PR from merging
- ✅ Provide actionable feedback

### 3. **Fix and Retry**

```bash
# Remove secrets
git rm test-secrets.js
git commit -m "Remove test secrets - fixes issue #123"
git push
```

The rule checker should now pass! ✅

---

## 📊 Centralized Benefits

### ✅ **Consistent Rule Enforcement**
- All repositories use the same rule version
- Updates automatically propagate to all repos
- No rule drift between repositories

### ✅ **Easy Maintenance**  
- Update rules once in `tyabonil/cursor_rules`
- All repositories get updates automatically
- Centralized configuration management

### ✅ **Version Control**
- Full history of rule changes
- Easy rollback if needed
- Transparent rule evolution

---

## 🔧 Troubleshooting

### **Rule Checker Not Running**
- Check repository Actions permissions
- Verify workflow file syntax
- Ensure proper trigger configuration

### **Authentication Errors**
- Verify `RULES_ACCESS_TOKEN` if using private repos
- Check token permissions include `Contents: Read`
- Confirm token hasn't expired

### **Download Failures**
- Check internet connectivity from GitHub Actions
- Verify `tyabonil/cursor_rules` repository accessibility
- Review workflow logs for specific error messages

### **Custom Rules Not Working**
- Verify `.cursorrules` file syntax
- Check that overrides match configuration structure
- Review logs for configuration parsing errors

---

## 🆕 Staying Updated

The rule checker automatically downloads the latest rules on each run, so you're always using the most current version from `tyabonil/cursor_rules`.

To manually check for rule updates:
1. View the [MANDATORY-RULES.md](https://github.com/tyabonil/cursor_rules/blob/main/MANDATORY-RULES.md) file
2. Check the [commit history](https://github.com/tyabonil/cursor_rules/commits/main/MANDATORY-RULES.md) for recent changes
3. Review any [release notes](https://github.com/tyabonil/cursor_rules/releases) for major updates

---

**Installation complete! Your repository now enforces MANDATORY rules with centralized management from `tyabonil/cursor_rules`. 🎉**