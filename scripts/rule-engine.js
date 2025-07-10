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

    // Check for repository restructuring with open PRs
    const restructuringViolations = await this.checkRepositoryRestructuring(files, githubClient);
    violations.push(...restructuringViolations);

    // Check for proper token efficiency (file count and duplication)
    const tokenEfficiencyViolations = this.checkTokenEfficiency(files);
    violations.push(...tokenEfficiencyViolations);

    // Check Vercel deployment status
    const vercelViolations = await this.checkVercelDeploymentStatus(prData, githubClient);
    violations.push(...vercelViolations);
    
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
      const branchExample = this.generateCorrectBranchName(branchName);
      violations.push({
        level: 2,
        type: 'WORKFLOW',
        severity: 'MANDATORY',
        rule: 'SEQ-2: CREATE A BRANCH',
        message: `🌿 Branch naming violation: '${branchName}'`,
        details: `Branch must include the feature/ prefix and follow the pattern: {type}/issue-{number}-{description}`,
        action: 'Rename branch to follow naming convention',
        fix: `Rename to: ${branchExample}`,
        evidence: [
          `❌ Current: ${branchName}`,
          `✅ Required format: feature/issue-{number}-{description}`,
          `✅ Example: ${branchExample}`
        ]
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

  /**
   * Check for repository restructuring with open PRs
   */
  async checkRepositoryRestructuring(files, githubClient) {
    const violations = [];
    
    // Detect if this PR is performing major restructuring
    const movedFiles = files.filter(f => f.status === 'renamed' || f.previous_filename);
    const deletedFiles = files.filter(f => f.status === 'removed');
    const totalMovements = movedFiles.length + deletedFiles.length;
    
    // Check for directory-level movements
    const isDirectoryMove = movedFiles.some(f => {
      if (!f.previous_filename) return false;
      const oldParts = f.previous_filename.split('/');
      const newParts = f.filename.split('/');
      return oldParts[0] !== newParts[0]; // Root directory changed
    });
    
    // Detect major restructuring - only count moved files, not deletions alone
    const isMajorRestructuring = movedFiles.length > 20 || isDirectoryMove;
    
    if (isMajorRestructuring) {
      console.log('🏗️ Detected major repository restructuring...');
      
      try {
        // Check for other open PRs
        const openPRs = await githubClient.github.rest.pulls.list({
          owner: githubClient.context.repo.owner,
          repo: githubClient.context.repo.repo,
          state: 'open'
        });
        
        const otherOpenPRs = openPRs.data.filter(pr => pr.number !== githubClient.context.issue.number);
        
        if (otherOpenPRs.length > 0) {
          violations.push({
            level: 2,
            type: 'WORKFLOW',
            severity: 'BLOCKER',
            rule: 'REPOSITORY RESTRUCTURING WITH OPEN PRS',
            message: `🚨 Major restructuring detected with ${otherOpenPRs.length} open PR(s)`,
            details: 'Repository restructuring must not be performed while other PRs are open. This causes massive merge conflicts.',
            action: 'Close or merge all open PRs before restructuring',
            fix: 'Postpone restructuring until all PRs are resolved',
            evidence: [
              `📊 Files moved/deleted: ${totalMovements}`,
              `📁 Directory restructuring: ${isDirectoryMove ? 'Yes' : 'No'}`,
              '',
              '🔓 Open PRs that will be affected:',
              ...otherOpenPRs.map(pr => `• PR #${pr.number}: ${pr.title}`)
            ]
          });
        }
      } catch (error) {
        console.error('Failed to check for open PRs:', error.message);
      }
      
      // Check for proper documentation of file mappings (even if API fails)
      const hasMappingDoc = files.some(f => 
        f.filename.toLowerCase().includes('migration') ||
        f.filename.toLowerCase().includes('restructur') || // Match both restructure and restructuring
        f.filename.toLowerCase().includes('file-mapping') ||
        f.filename.toLowerCase().includes('refactor-map')
      );
      
      if (!hasMappingDoc && movedFiles.length > 5) {
        violations.push({
          level: 2,
          type: 'WORKFLOW',
          severity: 'MANDATORY',
          rule: 'DOCUMENT RESTRUCTURING MAPPINGS',
          message: '📝 Missing file mapping documentation',
          details: 'Major restructuring requires documentation of old → new file paths.',
          action: 'Add a file documenting all path changes',
          fix: 'Create RESTRUCTURING.md or similar with file mappings',
          evidence: [
            `📁 ${movedFiles.length} files moved without documentation`,
            '',
            'Example mappings needed:',
            ...movedFiles.slice(0, 5).map(f => `• ${f.previous_filename || 'unknown'} → ${f.filename}`)
          ]
        });
      }
    }
    
    return violations;
  }

  /**
   * Check Vercel deployment status for the PR
   */
  async checkVercelDeploymentStatus(prData, githubClient) {
    const violations = [];
    
    console.log('🚀 Checking Vercel deployment status...');
    
    try {
      const vercelStatus = await githubClient.checkVercelDeploymentStatus();
      
      if (!vercelStatus.hasVercelChecks) {
        // No Vercel checks found - this is optional, not a violation
        console.log('ℹ️ No Vercel deployment checks detected (optional)');
        return violations;
      }
      
      // Check for failed Vercel deployments
      if (vercelStatus.failedChecks > 0) {
        const failureDetails = vercelStatus.failures.map(failure => ({
          name: failure.name,
          state: failure.state,
          description: failure.description || 'No description available',
          url: failure.target_url
        }));
        
        violations.push({
          level: 2,
          type: 'DEPLOYMENT',
          severity: 'WARNING',
          rule: 'DEP-1: VERCEL DEPLOYMENT VALIDATION',
          message: `🚀 Vercel deployment failed (${vercelStatus.failedChecks} failure${vercelStatus.failedChecks > 1 ? 's' : ''})`,
          details: 'Vercel deployment must succeed before merging to ensure the application builds correctly.',
          action: 'Fix deployment issues before proceeding with merge',
          fix: 'Run local build and address deployment errors',
          evidence: failureDetails.map(f => `❌ ${f.name}: ${f.state} - ${f.description}`),
          deploymentInfo: {
            totalChecks: vercelStatus.totalChecks,
            failedChecks: vercelStatus.failedChecks,
            failures: failureDetails,
            deploymentUrls: vercelStatus.deploymentUrls
          },
          troubleshooting: [
            '🔧 **Common Vercel deployment issues:**',
            '• Build errors (TypeScript, missing dependencies)',
            '• Environment variable issues', 
            '• Prisma schema problems',
            '• Memory or timeout issues',
            '',
            '🛠️ **Debug steps:**',
            '1. Run `npm run build` locally to identify build errors',
            '2. Check Vercel deployment logs for detailed error messages',
            '3. Verify environment variables match Vercel settings',
            '4. Ensure all dependencies are properly installed',
            '',
            '🔗 **Deployment URLs:**',
            ...vercelStatus.deploymentUrls.map(url => `• [View deployment](${url})`)
          ]
        });
      }
      
      // Check for pending deployments (informational)
      if (vercelStatus.pendingChecks > 0) {
        violations.push({
          level: 2,
          type: 'DEPLOYMENT',
          severity: 'INFO',
          rule: 'DEP-2: VERCEL DEPLOYMENT PENDING',
          message: `⏳ Vercel deployment in progress (${vercelStatus.pendingChecks} pending)`,
          details: 'Vercel deployment is currently running. Wait for completion before merging.',
          action: 'Wait for deployment to complete',
          fix: 'Monitor deployment progress in Vercel dashboard',
          evidence: vercelStatus.pending.map(p => `⏳ ${p.name}: ${p.state}`),
          deploymentInfo: {
            pendingChecks: vercelStatus.pendingChecks,
            pending: vercelStatus.pending,
            deploymentUrls: vercelStatus.deploymentUrls
          }
        });
      }
      
      console.log(`🚀 Vercel deployment check: ${vercelStatus.totalChecks} total, ${vercelStatus.failedChecks} failed, ${vercelStatus.pendingChecks} pending`);
      
    } catch (error) {
      console.error('❌ Failed to check Vercel deployment status:', error.message);
      // Don't add violations for API errors - deployment checks are optional
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
  
  generateCorrectBranchName(incorrectBranch) {
    // Try to extract issue number from the branch name
    const issueMatch = incorrectBranch.match(/(\d+)/);
    const issueNumber = issueMatch ? issueMatch[1] : '{number}';
    
    // Try to extract description
    let description = incorrectBranch
      .replace(/issue[-_]?\d+[-_]?/i, '')
      .replace(/^[-_]+|[-_]+$/g, '')
      .replace(/[^a-z0-9-]/gi, '-')
      .toLowerCase();
    
    if (!description || description.length < 3) {
      description = '{description}';
    }
    
    // Check if it looks like a bug fix
    const isBugfix = /bug|fix|hotfix/i.test(incorrectBranch);
    const type = isBugfix ? 'bugfix' : 'feature';
    
    return `${type}/issue-${issueNumber}-${description}`;
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
