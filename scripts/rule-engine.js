/**
 * MANDATORY Rules Validation Engine
 * Implements comprehensive validation for all rule levels from MANDATORY-RULES.md
 */

class RuleEngine {
  constructor() {
    this.secretPatterns = [
      /api[_-]?key\s*[=:]\s*['"]\w+['"]/gi,
      /password\s*[=:]\s*['"]\w+['"]/gi,
      /token\s*[=:]\s*['"]\w+['"]/gi,
      /secret\s*[=:]\s*['"]\w+['"]/gi,
      /auth[_-]?token\s*[=:]\s*['"]\w+['"]/gi,
      /access[_-]?key\s*[=:]\s*['"]\w+['"]/gi,
      /private[_-]?key\s*[=:]\s*['"]\w+['"]/gi,
      /[A-Za-z0-9+/]{20,}={0,2}/g // Base64 patterns
    ];
    
    this.envFilePatterns = [
      /\.env$/,
      /\.env\./,
      /environment/i
    ];
  }

  /**
   * Level 1: Security & Safety (NON-NEGOTIABLE)
   */
  async checkLevel1Security(files, prData) {
    const violations = [];
    
    console.log('🔍 Scanning for security violations...');
    
    for (const file of files) {
      // Check for secrets in file content
      if (file.patch && this.containsSecrets(file.patch)) {
        violations.push({
          level: 1,
          type: 'SECURITY',
          severity: 'BLOCKER',
          rule: 'NEVER COMMIT SECRETS',
          message: `🚨 CRITICAL: Potential secrets detected in ${file.filename}`,
          details: 'Found patterns matching API keys, passwords, or tokens. Remove all hardcoded credentials.',
          file: file.filename,
          action: 'IMMEDIATE STOP - Remove secrets before proceeding',
          fix: 'Use environment variables instead of hardcoded credentials'
        });
      }
      
      // Check for .env file modifications
      if (this.isEnvironmentFile(file.filename)) {
        if (file.status === 'modified' || file.status === 'removed') {
          violations.push({
            level: 1,
            type: 'SECURITY',
            severity: 'BLOCKER', 
            rule: 'NEVER OVERWRITE ENVIRONMENT FILES',
            message: `🚨 CRITICAL: Environment file ${file.status}: ${file.filename}`,
            details: 'Environment files should not be modified without explicit permission.',
            file: file.filename,
            action: 'ASK USER FIRST - Get explicit permission before modifying environment files',
            fix: 'Revert environment file changes or get explicit approval'
          });
        }
      }
    }
    
    console.log(`🔐 Level 1 Security: ${violations.length} violations found`);
    return violations;
  }

  /**
   * Level 2: Workflow Integrity (MANDATORY)
   */
  async checkLevel2Workflow(prData, files, commits, githubClient) {
    const violations = [];
    
    console.log('🔄 Checking workflow integrity...');
    
    const sequentialWorkflowViolations = await this.checkSequentialWorkflow(prData, files, commits, githubClient);
    violations.push(...sequentialWorkflowViolations);

    // Check for proper token efficiency (file count and duplication)
    const tokenEfficiencyViolations = this.checkTokenEfficiency(files);
    violations.push(...tokenEfficiencyViolations);
    
    console.log(`🔄 Level 2 Workflow: ${violations.length} violations found`);
    return violations;
  }

  /**
   * New function to check the sequential workflow
   */
  async checkSequentialWorkflow(prData, files, commits, githubClient) {
    const violations = [];

    // SEQ-1: Check for issue reference
    if (!this.hasIssueReference(prData.title, prData.body)) {
      violations.push({
        level: 2,
        type: 'WORKFLOW',
        severity: 'BLOCKER',
        rule: 'SEQ-1: CREATE OR IDENTIFY AN ISSUE',
        message: '📝 MANDATORY: No issue reference found in PR',
        details: 'Every code change must start with a GitHub issue.',
        action: 'Add issue number to PR title or description (e.g., "Fixes #123")',
        fix: 'Reference the issue number in PR title or description'
      });
    }

    // SEQ-2: Check branch naming convention
    const branchName = prData.head.ref;
    if (!this.isValidBranchName(branchName)) {
      violations.push({
        level: 2,
        type: 'WORKFLOW',
        severity: 'MANDATORY',
        rule: 'SEQ-2: CREATE A BRANCH',
        message: `🌿 Branch naming violation: ${branchName}`,
        details: 'Branch should follow pattern: feature/issue-{number}-{description}',
        action: 'Rename branch to follow naming convention',
        fix: 'Use: feature/issue-{number}-{short-description} or bugfix/issue-{number}-{description}'
      });
    }
    
    // SEQ-4: Check PR target branch
    if (prData.base.ref === 'main' || prData.base.ref === 'master') {
        violations.push({
          level: 2,
          type: 'WORKFLOW',
          severity: 'BLOCKER',
          rule: 'SEQ-4: CREATE A PULL REQUEST',
          message: 'PR targets main/master branch directly',
          details: 'PRs should target the preview branch, not main.',
          action: 'Change the base branch of the PR to `preview`',
          fix: 'Update the PR to target the `preview` branch.'
        });
    }

    return violations;
  }


  /**
   * Level 3: Quality Gates (MANDATORY)
   */
  async checkLevel3Quality(prData, files, githubClient) {
    const violations = [];
    
    console.log('🎯 Checking quality gates...');
    
    // Check for test coverage
    const testCoverageViolation = await this.checkTestCoverage(files, prData);
    if (testCoverageViolation) {
      violations.push(testCoverageViolation);
    }
    
    // Check for Copilot review request
    const copilotReviewViolation = await this.checkCopilotReview(prData, githubClient);
    if (copilotReviewViolation) {
      violations.push(copilotReviewViolation);
    }
    
    // Check for comprehensive PR feedback response
    const feedbackViolation = await this.checkPRFeedbackResponse(prData, githubClient);
    if (feedbackViolation) {
      violations.push(feedbackViolation);
    }
    
    // Check for thought process documentation on issues
    const documentationViolation = await this.checkThoughtProcessDocumentation(prData, githubClient);
    if (documentationViolation) {
      violations.push(documentationViolation);
    }
    
    console.log(`🎯 Level 3 Quality: ${violations.length} violations found`);
    return violations;
  }

  /**
   * Level 4: Development Patterns (STRONGLY RECOMMENDED)
   */
  async checkLevel4Patterns(files, prData) {
    const violations = [];
    
    console.log('📐 Checking development patterns...');
    
    // Check file sizes
    for (const file of files) {
      if (file.additions && file.additions > 300) {
        violations.push({
          level: 4,
          type: 'PATTERN',
          severity: 'RECOMMENDED',
          rule: 'FILES ≤200-300 LINES',
          message: `📏 Large file detected: ${file.filename} (+${file.additions} lines)`,
          details: 'Files should be kept under 200-300 lines for maintainability.',
          action: 'Consider refactoring into smaller, focused modules',
          fix: 'Break large files into smaller, single-responsibility modules'
        });
      }
    }
    
    // Check for code duplication patterns
    const duplicationViolations = this.checkCodeDuplication(files);
    violations.push(...duplicationViolations);
    
    console.log(`📐 Level 4 Patterns: ${violations.length} violations found`);
    return violations;
  }

  // Helper methods for rule validation

  containsSecrets(content) {
    return this.secretPatterns.some(pattern => pattern.test(content));
  }
  
  isEnvironmentFile(filename) {
    return this.envFilePatterns.some(pattern => pattern.test(filename));
  }
  
  hasIssueReference(title, body) {
    const text = `${title} ${body || ''}`;
    return /#\d+/.test(text) || /issue\s+\d+/i.test(text) || /fixes?\s+#?\d+/i.test(text);
  }
  
  isValidBranchName(branchName) {
    const patterns = [
      /^feature\/issue-\d+-[\w-]+$/,
      /^bugfix\/issue-\d+-[\w-]+$/,
      /^hotfix\/issue-\d+-[\w-]+$/
    ];
    return patterns.some(pattern => pattern.test(branchName));
  }
  
  hasSignificantChanges(files) {
    const significantPatterns = [
      /\.github\/workflows\//,
      /package\.json$/,
      /\.cursorrules$/,
      /scripts\//,
      /src\//,
      /lib\//
    ];
    
    return files.some(file => 
      significantPatterns.some(pattern => pattern.test(file.filename)) ||
      (file.additions && file.additions > 50)
    );
  }
  
  detectTerminalGitUsage(commits) {
    const terminalPatterns = [
      /git push/i,
      /git pull/i,
      /git checkout -b/i,
      /git merge/i,
      /git commit.*-m/i
    ];
    
    const evidence = [];
    commits.forEach(commit => {
      terminalPatterns.forEach(pattern => {
        if (pattern.test(commit.commit.message)) {
          evidence.push(`Commit ${commit.sha.substring(0, 7)}: ${commit.commit.message}`);
        }
      });
    });
    
    return evidence;
  }
  
  checkTokenEfficiency(files) {
    const violations = [];
    
    // Check for excessive file count
    if (files.length > 20) {
      violations.push({
        level: 2,
        type: 'WORKFLOW',
        severity: 'MANDATORY',
        rule: 'LLM TOKEN EFFICIENCY',
        message: `📊 Excessive file changes: ${files.length} files`,
        details: 'Large changesets should be broken into smaller, focused PRs.',
        action: 'Consider breaking into smaller PRs',
        fix: 'Split changes into multiple focused PRs'
      });
    }
    
    return violations;
  }
  
  async checkTestCoverage(files, prData) {
    // Check if new code files have corresponding tests
    const codeFiles = files.filter(f => 
      (f.filename.endsWith('.js') || f.filename.endsWith('.ts') || f.filename.endsWith('.py')) &&
      !f.filename.includes('test') && !f.filename.includes('spec')
    );
    
    const testFiles = files.filter(f => 
      f.filename.includes('test') || f.filename.includes('spec') || f.filename.includes('.test.') || f.filename.includes('.spec.')
    );
    
    if (codeFiles.length > 0 && testFiles.length === 0) {
      return {
        level: 3,
        type: 'QUALITY',
        severity: 'BLOCKER',
        rule: '100% TEST COVERAGE REQUIRED',
        message: '🧪 No test files found for new code',
        details: '100% test coverage required for all new feasibly testable code.',
        action: 'Add comprehensive test coverage',
        fix: 'Create test files with 100% coverage for new code'
      };
    }
    
    return null;
  }
  
  async checkCopilotReview(prData, githubClient) {
    // Note: This would need actual GitHub API integration to check reviews
    // For now, we'll check if the PR is in draft state or has specific labels
    if (prData.draft) {
      return {
        level: 3,
        type: 'QUALITY',
        severity: 'BLOCKER',
        rule: 'ALWAYS REQUEST COPILOT REVIEW',
        message: '👨‍💻 PR is in draft - Copilot review not yet requested',
        details: 'Request Copilot review immediately after PR creation.',
        action: 'Mark PR as ready for review and request Copilot review',
        fix: 'Use mcp_github_request_copilot_review tool'
      };
    }
    
    return null;
  }
  
  async checkPRFeedbackResponse(prData, githubClient) {
    // This would require checking PR conversation for unaddressed feedback
    // Implementation would analyze comments, reviews, and their responses
    return null; // Placeholder for now
  }
  
  async checkThoughtProcessDocumentation(prData, githubClient) {
    // This would check linked issues for thought process documentation
    // Implementation would verify issue comments contain reasoning and approach
    return null; // Placeholder for now
  }
  
  checkCodeDuplication(files) {
    const violations = [];
    
    // Simple duplication detection based on similar filenames or patterns
    const fileGroups = {};
    files.forEach(file => {
      const baseName = file.filename.replace(/\d+/g, 'X'); // Replace numbers with X
      if (!fileGroups[baseName]) {
        fileGroups[baseName] = [];
      }
      fileGroups[baseName].push(file.filename);
    });
    
    Object.entries(fileGroups).forEach(([pattern, filenames]) => {
      if (filenames.length > 2) {
        violations.push({
          level: 4,
          type: 'PATTERN',
          severity: 'RECOMMENDED',
          rule: 'AVOID CODE DUPLICATION',
          message: `🔄 Potential duplication pattern: ${pattern}`,
          details: `Similar files detected: ${filenames.join(', ')}`,
          action: 'Review for consolidation opportunities',
          fix: 'Consider consolidating similar functionality'
        });
      }
    });
    
    return violations;
  }
}

module.exports = RuleEngine;