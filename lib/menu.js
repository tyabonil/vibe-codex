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
      const configV3 = require('./commands/config-v3');
      await configV3();
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
    const { loadConfig, loadRegistry, getConfigSummary } = require('./config/loader');
    const config = await loadConfig();
    
    if (!config) {
      console.log(chalk.yellow('\n⚠️  No configuration found. Run "init" first.'));
      return;
    }
    
    const registry = await loadRegistry();
    const summary = await getConfigSummary(config);
    const { displaySummary } = require('./menu/interactive');
    
    displaySummary(config, registry);
    
    // Show additional info
    console.log(chalk.gray('\nConfiguration Details:'));
    console.log(chalk.gray(`  Version: ${config.version}`));
    console.log(chalk.gray(`  Preset: ${config.preset}`));
    console.log(chalk.gray(`  Git Hooks: ${summary.hooks.join(', ') || 'none'}`));
    
    if (config.projectContext?.enabled) {
      console.log(chalk.gray(`  Project Context: ${config.projectContext.file}`));
    }
    
  } catch (error) {
    console.error(chalk.red('\n❌ Error reading configuration:'), error.message);
  }
}

module.exports = {
  mainMenu
};
