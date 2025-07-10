/**
 * Interactive menu system for vibe-codex
 * Simple text-based interface similar to Claude Code
 */

const inquirer = require('inquirer');
const chalk = require('chalk');
const fs = require('fs').promises;
const path = require('path');

async function mainMenu() {
  const choices = [
    {
      name: '🚀 Initialize vibe-codex in this project',
      value: 'init',
      short: 'Initialize'
    },
    {
      name: '⚙️  Configure rules and hooks',
      value: 'config',
      short: 'Configure'
    },
    {
      name: '📋 View current configuration',
      value: 'view',
      short: 'View config'
    },
    {
      name: '🗑️  Uninstall vibe-codex',
      value: 'uninstall',
      short: 'Uninstall'
    },
    new inquirer.Separator(),
    {
      name: '❌ Exit',
      value: 'exit',
      short: 'Exit'
    }
  ];

  const { action } = await inquirer.prompt([
    {
      type: 'list',
      name: 'action',
      message: 'What would you like to do?',
      choices,
      pageSize: 10
    }
  ]);

  switch (action) {
    case 'init':
      const { init } = require('./commands');
      await init();
      break;
    
    case 'config':
      const { config } = require('./commands');
      await config();
      break;
    
    case 'view':
      await viewConfig();
      break;
    
    case 'uninstall':
      const { uninstall } = require('./commands');
      await uninstall();
      break;
    
    case 'exit':
      console.log(chalk.green('\n👋 Goodbye!'));
      process.exit(0);
  }

  // Return to main menu unless exiting
  if (action !== 'exit') {
    console.log(); // Add spacing
    await mainMenu();
  }
}

async function viewConfig() {
  try {
    const configPath = path.join(process.cwd(), '.vibe-codex.json');
    const configExists = await fs.access(configPath).then(() => true).catch(() => false);
    
    if (!configExists) {
      console.log(chalk.yellow('\n⚠️  No configuration found. Run "init" first.'));
      return;
    }
    
    const config = JSON.parse(await fs.readFile(configPath, 'utf8'));
    
    console.log(chalk.blue('\n📋 Current Configuration:\n'));
    console.log(chalk.gray('Rules enabled:'));
    
    if (config.rules && config.rules.length > 0) {
      config.rules.forEach(rule => {
        console.log(`  ✓ ${rule}`);
      });
    } else {
      console.log(chalk.gray('  (no rules configured)'));
    }
    
    console.log(chalk.gray('\nGit hooks:'));
    if (config.gitHooks) {
      console.log(`  ${config.gitHooks ? '✓' : '✗'} Enabled`);
    }
    
    console.log(chalk.gray('\nGitHub Actions:'));
    if (config.githubActions) {
      console.log(`  ${config.githubActions ? '✓' : '✗'} Enabled`);
    }
    
  } catch (error) {
    console.error(chalk.red('\n❌ Error reading configuration:'), error.message);
  }
}

module.exports = {
  mainMenu
};