/**
 * MANDATORY Rules Validation Engine
 * Implements comprehensive validation for all rule levels from MANDATORY-RULES.md
 */

class RuleEngine {
  constructor() {
    this.rules = require('../config/rules.json');
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
    
    // Check for private repo references in PR title and body (SEC-12)
    const prContent = `${prData.title || ''} ${prData.body || ''}`;
    if (prContent && this.containsPrivateRepoReferences(prContent)) {
      violations.push({
        level: 1,
        type: 'SECURITY',
        severity: 'WARNING',
        rule: 'SEC-12: NO PRIVATE REPO REFERENCES',
        message: '⚠️ WARNING: Potential private repository references detected',
        details: 'PR title or description may contain references to private repositories that are not accessible to public users.',
        action: 'Review and sanitize repository references',
        fix: 'Replace private repo references with generic examples or remove them entirely',
        evidence: this.extractPrivateRepoReferences(prContent)
      });
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
    if (branchName !== 'preview' && !this.isValidBranchName(branchName)) {
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
    if (prData.base.ref === 'main' && prData.head.ref !== 'preview') {
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

  // Helper methods for rule validation

  containsSecrets(content) {
    const secretPatterns = this.rules.rules.level1_security.checks.secrets_detection.patterns;
    return secretPatterns.some(pattern => new RegExp(pattern).test(content));
  }
  
  isEnvironmentFile(filename) {
    const envFilePatterns = this.rules.rules.level1_security.checks.env_files_protection.patterns;
    return envFilePatterns.some(pattern => new RegExp(pattern).test(filename));
  }
  
  hasIssueReference(title, body) {
    const issueReferencePatterns = this.rules.rules.level2_workflow.checks.issue_reference.patterns;
    const text = `${title} ${body || ''}`;
    return issueReferencePatterns.some(pattern => new RegExp(pattern).test(text));
  }
  
  containsPrivateRepoReferences(content) {
    const config = this.rules.rules.level1_security.checks.private_repo_references;
    if (!config.enabled) return false;
    
    // Check if content contains any patterns that might be private repo references
    const hasRepoRef = config.patterns.some(pattern => new RegExp(pattern, 'gi').test(content));
    if (!hasRepoRef) return false;
    
    // Check if all found references are in the exclude list
    const excludePatterns = config.exclude_patterns;
    let tempContent = content;
    
    // Remove all excluded patterns from content
    excludePatterns.forEach(excludePattern => {
      tempContent = tempContent.replace(new RegExp(excludePattern, 'gi'), '');
    });
    
    // Check if any repo references remain after exclusions
    return config.patterns.some(pattern => new RegExp(pattern, 'gi').test(tempContent));
  }
  
  extractPrivateRepoReferences(content) {
    const config = this.rules.rules.level1_security.checks.private_repo_references;
    const references = [];
    
    config.patterns.forEach(pattern => {
      const regex = new RegExp(pattern, 'gi');
      const matches = content.match(regex) || [];
      references.push(...matches);
    });
    
    // Filter out excluded patterns
    const excludePatterns = config.exclude_patterns;
    return references.filter(ref => {
      return !excludePatterns.some(excludePattern => 
        new RegExp(excludePattern, 'gi').test(ref)
      );
    });
  }
  
  isValidBranchName(branchName) {
    const branchNamingPatterns = this.rules.rules.level2_workflow.checks.branch_naming.required_patterns;
    return branchNamingPatterns.some(pattern => new RegExp(pattern).test(branchName));
  }
  
  checkTokenEfficiency(files) {
    const violations = [];
    
    // Check for excessive file count
    if (files.length > this.rules.rules.level2_workflow.checks.token_efficiency.max_files_per_pr) {
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

  /**
   * Level 3: Quality Gates (MANDATORY)
   */
  async checkLevel3Quality(prData, files, githubClient) {
    const violations = [];
    
    console.log('🎯 Checking quality gates...');
    
    // Check for test coverage requirements
    const hasTests = files.some(file => 
      file.filename.includes('test') || 
      file.filename.includes('spec') || 
      file.filename.includes('.test.') || 
      file.filename.includes('.spec.')
    );
    
    const hasCodeChanges = files.some(file => 
      !file.filename.includes('test') && 
      !file.filename.includes('spec') && 
      !file.filename.includes('.md') && 
      !file.filename.includes('.json') && 
      !file.filename.includes('.yml') && 
      !file.filename.includes('.yaml')
    );
    
    if (hasCodeChanges && !hasTests) {
      violations.push({
        level: 3,
        type: 'QUALITY',
        severity: 'MANDATORY',
        rule: '100% TEST COVERAGE FOR NEW CODE',
        message: '🧪 Missing tests for code changes',
        details: 'All new code requires appropriate test coverage.',
        action: 'Add tests for the new functionality',
        fix: 'Create test files using appropriate framework (Jest, RTL, Cypress)'
      });
    }
    
    // Check for self-review requirement
    const prAuthor = prData.user.login;
    if (prData.comments === 0) {
      violations.push({
        level: 3,
        type: 'QUALITY',
        severity: 'MANDATORY',
        rule: 'SELF-REVIEW REQUIREMENT',
        message: '👀 PR requires self-review',
        details: 'After creating a PR, you MUST perform a self-review.',
        action: 'Add a self-review comment to the PR',
        fix: 'Comment on your own PR documenting your review process'
      });
    }
    
    console.log(`🎯 Level 3 Quality: ${violations.length} violations found`);
    return violations;
  }

  /**
   * Level 4: Development Patterns (RECOMMENDED)
   */
  async checkLevel4Patterns(files, prData) {
    const violations = [];
    
    console.log('📐 Checking development patterns...');
    
    // Check for large file violations
    const largeFiles = files.filter(file => {
      if (file.additions && file.deletions) {
        return (file.additions + file.deletions) > 300;
      }
      return false;
    });
    
    for (const file of largeFiles) {
      violations.push({
        level: 4,
        type: 'PATTERN',
        severity: 'RECOMMENDED',
        rule: 'FILES ≤200-300 LINES',
        message: `📄 Large file detected: ${file.filename}`,
        details: 'Consider refactoring large files into smaller, focused modules.',
        action: 'Consider breaking down the file into smaller modules',
        fix: 'Refactor into multiple smaller files with single responsibilities'
      });
    }
    
    // Check for commit message quality
    if (prData.title && !this.isDescriptiveCommitMessage(prData.title)) {
      violations.push({
        level: 4,
        type: 'PATTERN',
        severity: 'RECOMMENDED',
        rule: 'CLEAR, DESCRIPTIVE COMMIT MESSAGES',
        message: '💬 PR title could be more descriptive',
        details: 'Commit messages should clearly describe what and why.',
        action: 'Update PR title to be more descriptive',
        fix: 'Use format: "type: description of what and why"'
      });
    }
    
    console.log(`📐 Level 4 Patterns: ${violations.length} violations found`);
    return violations;
  }

  isDescriptiveCommitMessage(message) {
    // Check if message has at least 10 characters and contains descriptive words
    if (message.length < 10) return false;
    
    // Should start with a type prefix (feat:, fix:, docs:, etc.)
    const typePattern = /^(feat|fix|docs|style|refactor|test|chore|perf|ci|build):/;
    return typePattern.test(message);
  }
}

module.exports = RuleEngine;
