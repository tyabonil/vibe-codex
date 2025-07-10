/**
 * Update issues command - Interactive issue update interface
 */

const chalk = require('chalk');
const ora = require('ora');
const IssueUpdateReminder = require('../hooks/issue-update-reminder');
const logger = require('../utils/logger');
const fs = require('fs-extra');
const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);

module.exports = async function updateIssues(options = {}) {
  const spinner = ora('Checking for related issues...').start();
  
  try {
    // Load configuration
    const configPath = '.vibe-codex.json';
    let config = {};
    
    if (await fs.pathExists(configPath)) {
      const vibeConfig = await fs.readJSON(configPath);
      config = vibeConfig.issueTracking || {};
    }
    
    // Create reminder instance
    const reminder = new IssueUpdateReminder(config);
    
    spinner.stop();
    
    // Run interactive update
    const updates = await reminder.runInteractiveUpdate();
    
    if (!updates || updates.length === 0) {
      console.log(chalk.gray('\nNo issues were updated.'));
      return;
    }
    
    // Process updates
    spinner.start('Processing updates...');
    
    for (const { issue, message } of updates) {
      try {
        // Check if gh CLI is available
        const ghAvailable = await checkGhCli();
        
        if (ghAvailable && !options.dryRun) {
          // Post comment using gh CLI
          spinner.text = `Updating issue #${issue}...`;
          
          const commentBody = `## 📝 Progress Update\n\n${message}\n\n---\n*Updated via vibe-codex*`;
          
          await execAsync(`gh issue comment ${issue} --body "${commentBody.replace(/"/g, '\\"')}"`);
          
          console.log(chalk.green(`\n✅ Updated issue #${issue}`));
        } else if (options.dryRun) {
          console.log(chalk.blue(`\n[DRY RUN] Would update issue #${issue} with:`));
          console.log(chalk.gray(message));
        } else {
          console.log(chalk.yellow(`\n⚠️  GitHub CLI not available. Manual update needed for issue #${issue}:`));
          console.log(chalk.gray(`Message: ${message}`));
          console.log(chalk.gray(`URL: https://github.com/${await getRepoInfo()}/issues/${issue}`));
        }
      } catch (error) {
        spinner.fail(`Failed to update issue #${issue}`);
        logger.error(`Update error: ${error.message}`);
      }
    }
    
    spinner.succeed(`Updated ${updates.length} issue${updates.length > 1 ? 's' : ''}`);
    
    // Show summary
    console.log(chalk.blue('\n📊 Update Summary:'));
    updates.forEach(({ issue, message }) => {
      console.log(chalk.gray(`  • #${issue}: ${message.substring(0, 50)}${message.length > 50 ? '...' : ''}`));
    });
    
  } catch (error) {
    spinner.fail('Failed to update issues');
    logger.error(error.message);
    throw error;
  }
};

/**
 * Check if GitHub CLI is available
 */
async function checkGhCli() {
  try {
    await execAsync('gh --version');
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Get repository info from git remote
 */
async function getRepoInfo() {
  try {
    const { stdout } = await execAsync('git remote get-url origin');
    const url = stdout.trim();
    
    // Extract owner/repo from various URL formats
    const patterns = [
      /github\.com[:/]([^/]+)\/([^/.]+)/,
      /git@github\.com:([^/]+)\/([^/.]+)/,
      /https?:\/\/github\.com\/([^/]+)\/([^/.]+)/
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) {
        return `${match[1]}/${match[2]}`;
      }
    }
  } catch (error) {
    logger.debug('Failed to get repo info:', error.message);
  }
  
  return 'owner/repo';
}