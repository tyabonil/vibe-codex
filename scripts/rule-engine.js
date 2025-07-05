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
}

module.exports = RuleEngine;
