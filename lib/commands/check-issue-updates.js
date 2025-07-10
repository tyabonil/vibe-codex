/**
 * Check issue updates command - Used by git hooks
 */

const IssueUpdateReminder = require('../hooks/issue-update-reminder');
const fs = require('fs-extra');
const logger = require('../utils/logger');

module.exports = async function checkIssueUpdates(options = {}) {
  try {
    // Load configuration
    const configPath = '.vibe-codex.json';
    let config = {};
    
    if (await fs.pathExists(configPath)) {
      const vibeConfig = await fs.readJSON(configPath);
      config = vibeConfig.issueTracking || {};
    }
    
    // Skip if disabled
    if (config.enableReminders === false) {
      return;
    }
    
    // Create reminder instance
    const reminder = new IssueUpdateReminder(config);
    
    // Run appropriate check based on context
    if (options.hook === 'post-commit') {
      await reminder.checkPostCommit();
    } else if (options.hook === 'pre-push') {
      await checkPrePush(reminder);
    } else {
      // Manual check
      await reminder.checkPostCommit();
    }
    
  } catch (error) {
    // Don't fail the hook on errors
    logger.debug('Issue update check error:', error.message);
  }
};

/**
 * Check for updates before push
 */
async function checkPrePush(reminder) {
  const issues = await reminder.findRelatedIssues();
  if (issues.length === 0) {
    return;
  }
  
  const needsUpdate = [];
  for (const issue of issues) {
    if (await reminder.needsReminder(issue)) {
      needsUpdate.push(issue);
    }
  }
  
  if (needsUpdate.length > 0) {
    logger.output('\n🔍 Checking for pending issue updates...');
    logger.output(`⚠️  Issues that may need updates: ${needsUpdate.map(i => `#${i}`).join(', ')}`);
    logger.output('\nConsider running: npx vibe-codex update-issues\n');
  }
}