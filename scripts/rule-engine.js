#!/usr/bin/env node

/**
 * Simple rule compliance checker for vibe-codex
 */

const fs = require('fs');
const path = require('path');

// Load rules configuration
function loadRules() {
  try {
    const rulesPath = path.join(process.cwd(), 'config', 'rules.json');
    const rulesContent = fs.readFileSync(rulesPath, 'utf8');
    return JSON.parse(rulesContent);
  } catch (error) {
    console.error('❌ Failed to load rules.json:', error.message);
    process.exit(1);
  }
}

// Check PR compliance
function checkCompliance() {
  const rules = loadRules();
  const errors = [];
  const warnings = [];
  
  // Get environment variables
  const prBranch = process.env.GITHUB_BASE_REF || '';
  const prTitle = process.env.PR_TITLE || '';
  const prBody = process.env.PR_BODY || '';
  
  console.log('🔍 Checking PR compliance...');
  console.log(`PR Target Branch: ${prBranch}`);
  
  // Rule: PR targets preview
  if (rules.rules['pr-targets-preview']?.enabled) {
    if (prBranch && prBranch !== 'preview') {
      errors.push(`❌ PR must target 'preview' branch, but targets '${prBranch}'`);
    }
  }
  
  // Rule: PR has tests
  if (rules.rules['pr-has-tests']?.enabled) {
    // Simple check - in real implementation would check file changes
    if (!prBody.toLowerCase().includes('test')) {
      warnings.push('⚠️  PR should include tests for new features');
    }
  }
  
  // Rule: Issue linked
  if (rules.rules['issue-linked']?.enabled) {
    const issuePattern = /#\d+/;
    if (!issuePattern.test(prTitle) && !issuePattern.test(prBody)) {
      warnings.push('⚠️  PR should reference an issue number');
    }
  }
  
  // Output results
  console.log('\n📋 Compliance Check Results:');
  
  if (errors.length > 0) {
    console.log('\n❌ ERRORS:');
    errors.forEach(err => console.log(`  ${err}`));
  }
  
  if (warnings.length > 0) {
    console.log('\n⚠️  WARNINGS:');
    warnings.forEach(warn => console.log(`  ${warn}`));
  }
  
  if (errors.length === 0 && warnings.length === 0) {
    console.log('✅ All checks passed!');
  }
  
  // Exit with error if there are errors
  if (errors.length > 0) {
    process.exit(1);
  }
}

// Run compliance check
checkCompliance();