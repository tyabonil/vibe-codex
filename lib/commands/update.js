/**
 * Update command - Update vibe-codex rules and modules
 */

const chalk = require('chalk');
const ora = require('ora');
const semver = require('semver');
const fs = require('fs-extra');
const { installRules, downloadFile } = require('../installer/rules');
const { downloadHookScripts } = require('../installer/hooks-downloader');
const { installGitHooks } = require('../installer/git-hooks');

module.exports = async function update(options) {
  const spinner = ora('Checking for updates...').start();
  
  try {
    // Load current configuration
    const configPath = '.vibe-codex.json';
    if (!await fs.pathExists(configPath)) {
      spinner.fail('No vibe-codex configuration found');
      console.log(chalk.yellow('\nRun "npx vibe-codex init" to set up vibe-codex'));
      return;
    }
    
    const config = await fs.readJSON(configPath);
    const currentVersion = config.version || '0.0.0';
    
    // TODO: Check npm registry for latest version
    const latestVersion = require('../../package.json').version;
    
    if (semver.gte(currentVersion, latestVersion) && !options.force) {
      spinner.succeed('vibe-codex is up to date');
      console.log(chalk.gray(`Current version: ${currentVersion}`));
      return;
    }
    
    spinner.text = `Updating from ${currentVersion} to ${latestVersion}...`;
    
    console.log(chalk.blue('\n📋 Starting update process...\n'));
    
    // Backup existing configuration
    const backupPath = `.vibe-codex.backup.${Date.now()}.json`;
    await fs.copy(configPath, backupPath);
    console.log(chalk.gray(`  ✓ Configuration backed up to ${backupPath}`));
    
    // Update MANDATORY-RULES.md
    spinner.start('Updating MANDATORY rules...');
    try {
      await downloadFile(
        'https://raw.githubusercontent.com/tyabonil/cursor_rules/main/MANDATORY-RULES.md',
        'MANDATORY-RULES.md'
      );
      spinner.succeed('MANDATORY rules updated');
    } catch (error) {
      spinner.warn('Failed to update MANDATORY rules');
    }
    
    // Update hook scripts if hooks directory exists
    if (await fs.pathExists('hooks')) {
      spinner.start('Updating hook scripts...');
      try {
        await downloadHookScripts(config);
        spinner.succeed('Hook scripts updated');
      } catch (error) {
        spinner.warn('Failed to update some hook scripts');
      }
    }
    
    // Re-install git hooks
    if (config.modules?.core?.gitHooks !== false) {
      spinner.start('Updating git hooks...');
      try {
        await installGitHooks(config);
        spinner.succeed('Git hooks updated');
      } catch (error) {
        spinner.warn('Failed to update git hooks');
      }
    }
    
    // Update configuration files
    spinner.start('Updating configuration files...');
    try {
      // Update .cursorrules
      const { createCursorRulesFile } = require('../installer/rules');
      await createCursorRulesFile(config);
      
      // Update config files
      const { createConfigFiles } = require('../installer/rules');
      await createConfigFiles(config);
      
      spinner.succeed('Configuration files updated');
    } catch (error) {
      spinner.warn('Failed to update some configuration files');
    }
    
    // Migrate configuration if needed
    config.version = latestVersion;
    config.lastModified = new Date().toISOString();
    
    // Add any new default modules
    if (!config.modules.quality && semver.lt(currentVersion, '1.1.0')) {
      config.modules.quality = { enabled: false };
      console.log(chalk.yellow('  → Added new "quality" module (disabled by default)'));
    }
    
    await fs.writeJSON(configPath, config, { spaces: 2 });
    
    spinner.succeed(`Updated to version ${latestVersion}`);
    
    // Run validation to check status
    console.log(chalk.blue('\n🔍 Running post-update validation...\n'));
    const RuleValidator = require('../validator');
    const validator = new RuleValidator(config);
    const results = await validator.validate({ silent: true });
    
    console.log(chalk.blue('\n📊 Update Summary:'));
    console.log(`  • Updated from version ${currentVersion} to ${latestVersion}`);
    console.log(`  • MANDATORY rules: ${chalk.green('Updated')}`);
    console.log(`  • Configuration: ${chalk.green('Migrated')}`);
    console.log(`  • Validation: ${results.violations.length === 0 ? chalk.green('Passed') : chalk.yellow(`${results.violations.length} violations`)}`);
    
    if (results.violations.length > 0) {
      console.log(chalk.yellow('\n⚠  Some violations were found after update.'));
      console.log(chalk.gray('Run "npx vibe-codex validate" for details'));
    }
    
    console.log(chalk.green('\n✓ Update complete!'));
    
    // Clean up old backup files (keep last 3)
    await cleanupBackups();
    
  } catch (error) {
    spinner.fail(`Update failed: ${error.message}`);
    throw error;
  }
};

/**
 * Clean up old backup files, keeping only the most recent ones
 * @param {number} keepCount - Number of backups to keep
 */
async function cleanupBackups(keepCount = 3) {
  try {
    const files = await fs.readdir('.');
    const backupFiles = files
      .filter(f => f.startsWith('.vibe-codex.backup.') && f.endsWith('.json'))
      .sort()
      .reverse();
    
    if (backupFiles.length > keepCount) {
      const toDelete = backupFiles.slice(keepCount);
      for (const file of toDelete) {
        await fs.remove(file);
      }
      console.log(chalk.gray(`  ✓ Cleaned up ${toDelete.length} old backup(s)`));
    }
  } catch (error) {
    // Ignore cleanup errors
  }
}