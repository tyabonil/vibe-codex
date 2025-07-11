#!/usr/bin/env node

/**
 * Rule compliance checker for vibe-codex
 */

class RuleEngine {
  constructor() {
    this.rules = this.loadRules();
  }

  loadRules() {
    try {
      const fs = require('fs');
      const path = require('path');
      const rulesPath = path.join(process.cwd(), 'config', 'rules.json');
      const rulesContent = fs.readFileSync(rulesPath, 'utf8');
      return JSON.parse(rulesContent);
    } catch (error) {
      console.error('Failed to load rules:', error.message);
      return { rules: {} };
    }
  }

  async checkLevel1Security(files, prData) {
    const violations = [];
    
    // Check for .env files
    const envFiles = files.filter(f => f.filename.match(/^\.env$/));
    if (envFiles.length > 0) {
      violations.push({
        level: 1,
        rule: 'no-env-files',
        message: '🔒 .env files should not be committed',
        severity: 'error',
        files: envFiles.map(f => f.filename)
      });
    }
    
    return violations;
  }

  async checkLevel2Workflow(prData, files, commits, githubClient) {
    const violations = [];
    
    // Check if PR references an issue
    if (this.rules.rules['issue-linked']?.enabled) {
      const issuePattern = /#\d+/;
      const hasIssueRef = issuePattern.test(prData.title) || issuePattern.test(prData.body || '');
      
      if (!hasIssueRef) {
        violations.push({
          level: 2,
          rule: 'issue-linked',
          message: '📋 PR should reference an issue number',
          severity: 'warning'
        });
      }
    }
    
    return violations;
  }

  async checkLevel3Quality(prData, files, githubClient) {
    const violations = [];
    
    // Check if PR includes tests
    if (this.rules.rules['pr-has-tests']?.enabled) {
      const hasTestFiles = files.some(f => f.filename.includes('test'));
      const mentionsTests = (prData.body || '').toLowerCase().includes('test');
      
      if (!hasTestFiles && !mentionsTests) {
        violations.push({
          level: 3,
          rule: 'pr-has-tests',
          message: '🧪 PR should include tests for new features',
          severity: 'warning'
        });
      }
    }
    
    return violations;
  }

  async checkLevel4Patterns(files, prData) {
    // Level 4 is optional/recommended patterns
    return [];
  }
}

// Support both module export and direct execution
if (require.main === module) {
  // Direct execution - simple compliance check
  const engine = new RuleEngine();
  console.log('🔍 Checking PR compliance...');
  
  // Mock data for direct execution
  const mockPR = {
    title: process.env.PR_TITLE || '',
    body: process.env.PR_BODY || ''
  };
  
  engine.checkLevel2Workflow(mockPR, [], [], null).then(violations => {
    if (violations.length > 0) {
      violations.forEach(v => console.log(`${v.severity}: ${v.message}`));
      process.exit(1);
    } else {
      console.log('✅ All checks passed!');
    }
  });
} else {
  module.exports = RuleEngine;
}