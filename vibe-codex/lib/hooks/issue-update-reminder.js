/**
 * Issue update reminder functionality for vibe-codex
 * Reminds developers to update issues during development
 */

const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');
const inquirer = require('inquirer');
const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);
const logger = require('../utils/logger');

class IssueUpdateReminder {
  constructor(config = {}) {
    this.config = {
      enableReminders: true,
      reminderFrequency: 2 * 60 * 60 * 1000, // 2 hours in milliseconds
      autoPrompt: true,
      updateOnPush: true,
      relatedIssueDetection: true,
      ...config
    };
    
    this.updateDir = '.git/issue-updates';
  }
  
  /**
   * Check if reminders are enabled
   */
  isEnabled() {
    return this.config.enableReminders;
  }
  
  /**
   * Get current branch name
   */
  async getCurrentBranch() {
    try {
      const { stdout } = await execAsync('git branch --show-current');
      return stdout.trim();
    } catch (error) {
      logger.debug('Failed to get current branch:', error.message);
      return null;
    }
  }
  
  /**
   * Extract issue number from branch name
   */
  extractIssueFromBranch(branch) {
    const match = branch.match(/issue-(\d+)/);
    return match ? match[1] : null;
  }
  
  /**
   * Extract issue references from commit message
   */
  extractIssuesFromCommit(commitMsg) {
    const patterns = [
      /#(\d+)/g,
      /issue\s+#?(\d+)/gi,
      /fixes\s+#?(\d+)/gi,
      /closes\s+#?(\d+)/gi,
      /resolves\s+#?(\d+)/gi,
      /part\s+of\s+#?(\d+)/gi,
      /related\s+to\s+#?(\d+)/gi,
      /refs?\s+#?(\d+)/gi
    ];
    
    const issues = new Set();
    
    patterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(commitMsg)) !== null) {
        issues.add(match[1]);
      }
    });
    
    return Array.from(issues);
  }
  
  /**
   * Get last commit message
   */
  async getLastCommitMessage() {
    try {
      const { stdout } = await execAsync('git log -1 --pretty=%B');
      return stdout.trim();
    } catch (error) {
      logger.debug('Failed to get last commit message:', error.message);
      return '';
    }
  }
  
  /**
   * Find all related issues
   */
  async findRelatedIssues() {
    const issues = new Set();
    
    // Get issue from branch name
    const branch = await this.getCurrentBranch();
    if (branch) {
      const branchIssue = this.extractIssueFromBranch(branch);
      if (branchIssue) {
        issues.add(branchIssue);
      }
    }
    
    // Get issues from last commit
    if (this.config.relatedIssueDetection) {
      const commitMsg = await this.getLastCommitMessage();
      const commitIssues = this.extractIssuesFromCommit(commitMsg);
      commitIssues.forEach(issue => issues.add(issue));
    }
    
    return Array.from(issues).sort((a, b) => parseInt(a) - parseInt(b));
  }
  
  /**
   * Get last update time for an issue
   */
  async getLastUpdateTime(issueNumber) {
    const updateFile = path.join(this.updateDir, issueNumber.toString());
    
    try {
      if (await fs.pathExists(updateFile)) {
        const content = await fs.readFile(updateFile, 'utf-8');
        return parseInt(content.trim());
      }
    } catch (error) {
      logger.debug(`Failed to read update time for issue ${issueNumber}:`, error.message);
    }
    
    return null;
  }
  
  /**
   * Record update time for an issue
   */
  async recordUpdate(issueNumber) {
    await fs.ensureDir(this.updateDir);
    const updateFile = path.join(this.updateDir, issueNumber.toString());
    await fs.writeFile(updateFile, Date.now().toString());
  }
  
  /**
   * Check if an issue needs an update reminder
   */
  async needsReminder(issueNumber) {
    const lastUpdate = await this.getLastUpdateTime(issueNumber);
    if (!lastUpdate) {
      return true; // Never updated
    }
    
    const timeSinceUpdate = Date.now() - lastUpdate;
    return timeSinceUpdate > this.config.reminderFrequency;
  }
  
  /**
   * Get suggested update message based on git diff
   */
  async getSuggestedMessage() {
    try {
      const { stdout: diffStat } = await execAsync('git diff --stat HEAD~1 2>/dev/null || git diff --stat --cached');
      const lines = diffStat.trim().split('\n');
      const summary = lines[lines.length - 1];
      
      const filesMatch = summary.match(/(\d+) files? changed/);
      const additionsMatch = summary.match(/(\d+) insertions?\(\+\)/);
      const deletionsMatch = summary.match(/(\d+) deletions?\(-\)/);
      
      const files = filesMatch ? filesMatch[1] : '0';
      const additions = additionsMatch ? additionsMatch[1] : '0';
      const deletions = deletionsMatch ? deletionsMatch[1] : '0';
      
      return {
        files: parseInt(files),
        additions: parseInt(additions),
        deletions: parseInt(deletions),
        suggestion: `Made changes to ${files} file${files !== '1' ? 's' : ''} (+${additions}/-${deletions} lines)`
      };
    } catch (error) {
      logger.debug('Failed to get diff stats:', error.message);
      return {
        files: 0,
        additions: 0,
        deletions: 0,
        suggestion: 'Made progress on implementation'
      };
    }
  }
  
  /**
   * Prompt user to update an issue
   */
  async promptForUpdate(issueNumber) {
    const stats = await this.getSuggestedMessage();
    
    console.log(chalk.blue(`\n📝 Issue #${issueNumber} Update`));
    console.log(chalk.gray(`Changes: ${stats.files} files, +${stats.additions}/-${stats.deletions} lines`));
    
    const { shouldUpdate } = await inquirer.prompt([{
      type: 'confirm',
      name: 'shouldUpdate',
      message: `Would you like to update issue #${issueNumber}?`,
      default: true
    }]);
    
    if (!shouldUpdate) {
      return null;
    }
    
    const { message } = await inquirer.prompt([{
      type: 'input',
      name: 'message',
      message: 'Update message:',
      default: stats.suggestion,
      validate: (input) => input.trim().length > 0 || 'Message cannot be empty'
    }]);
    
    return message;
  }
  
  /**
   * Run post-commit reminder check
   */
  async checkPostCommit() {
    if (!this.isEnabled()) {
      return;
    }
    
    const issues = await this.findRelatedIssues();
    if (issues.length === 0) {
      return;
    }
    
    const needsUpdate = [];
    for (const issue of issues) {
      if (await this.needsReminder(issue)) {
        needsUpdate.push(issue);
      }
    }
    
    if (needsUpdate.length === 0) {
      return;
    }
    
    console.log(chalk.yellow('\n🔔 Issue Update Reminder'));
    console.log(chalk.gray(`Found ${needsUpdate.length} issue${needsUpdate.length > 1 ? 's' : ''} that may need updates:\n`));
    
    for (const issue of needsUpdate) {
      const lastUpdate = await this.getLastUpdateTime(issue);
      const timeAgo = lastUpdate ? formatTimeAgo(Date.now() - lastUpdate) : 'never';
      console.log(chalk.yellow(`  • Issue #${issue} (last updated: ${timeAgo})`));
    }
    
    console.log(chalk.gray('\nConsider updating these issues with your progress.'));
    console.log(chalk.gray('Run: npx vibe-codex update-issues\n'));
  }
  
  /**
   * Run interactive update prompt
   */
  async runInteractiveUpdate() {
    const issues = await this.findRelatedIssues();
    
    if (issues.length === 0) {
      console.log(chalk.yellow('No related issues found.'));
      return;
    }
    
    console.log(chalk.blue(`\n📋 Found ${issues.length} related issue${issues.length > 1 ? 's' : ''}: ${issues.map(i => `#${i}`).join(', ')}\n`));
    
    const updates = [];
    let skipAll = false;
    
    for (const issue of issues) {
      if (skipAll) break;
      
      const lastUpdate = await this.getLastUpdateTime(issue);
      const needsUpdate = await this.needsReminder(issue);
      
      if (needsUpdate) {
        console.log(chalk.yellow(`⚠️  Issue #${issue} hasn't been updated in a while`));
      }
      
      const { action } = await inquirer.prompt([{
        type: 'list',
        name: 'action',
        message: `What would you like to do with issue #${issue}?`,
        choices: [
          { name: 'Update with a message', value: 'update' },
          { name: 'Skip this issue', value: 'skip' },
          { name: 'Skip all remaining issues', value: 'skipAll' }
        ]
      }]);
      
      if (action === 'skipAll') {
        skipAll = true;
        break;
      }
      
      if (action === 'update') {
        const message = await this.promptForUpdate(issue);
        if (message) {
          updates.push({ issue, message });
          await this.recordUpdate(issue);
        }
      }
    }
    
    return updates;
  }
  
  /**
   * Generate update hook script
   */
  async generateHookScript() {
    const script = `#!/bin/bash
# vibe-codex issue update reminder hook
# Generated by vibe-codex

# Check if vibe-codex is available
if ! command -v npx &> /dev/null; then
  exit 0
fi

# Run the reminder check
npx vibe-codex check-issue-updates --hook

exit 0
`;
    
    return script;
  }
}

/**
 * Format time ago in human-readable format
 */
function formatTimeAgo(ms) {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) {
    return `${days} day${days > 1 ? 's' : ''} ago`;
  }
  if (hours > 0) {
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  }
  if (minutes > 0) {
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  }
  return 'just now';
}

module.exports = IssueUpdateReminder;
module.exports.formatTimeAgo = formatTimeAgo;