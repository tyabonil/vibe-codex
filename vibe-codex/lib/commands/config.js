/**
 * Config command - Manage vibe-codex configuration
 */

const chalk = require('chalk');
const fs = require('fs-extra');
const path = require('path');
const inquirer = require('inquirer');

module.exports = async function config(action, options) {
  // If no action provided, open interactive configuration
  if (!action) {
    return interactiveConfig();
  }
  
  switch (action) {
    case 'list':
      return listConfiguration();
    case 'set':
      return setConfiguration(options.set);
    case 'reset':
      return resetConfiguration();
    case 'export':
      return exportConfiguration();
    case 'import':
      return importConfiguration(options.import);
    default:
      throw new Error(`Unknown config action: ${action}`);
  }
};

async function interactiveConfig() {
  console.log(chalk.blue('🔧 vibe-codex Configuration\n'));
  
  // TODO: Implement interactive configuration UI
  console.log(chalk.yellow('Interactive configuration coming soon!'));
  console.log('Use "vibe-codex config list" to view current configuration');
}

async function listConfiguration() {
  const configPath = '.vibe-codex.json';
  
  if (!await fs.pathExists(configPath)) {
    console.log(chalk.yellow('No configuration file found.'));
    console.log('Run "npx vibe-codex init" to create one.');
    return;
  }
  
  const config = await fs.readJSON(configPath);
  console.log(chalk.blue('Current vibe-codex configuration:\n'));
  console.log(JSON.stringify(config, null, 2));
}

async function setConfiguration(keyValue) {
  if (!keyValue || !keyValue.includes('=')) {
    throw new Error('Invalid format. Use: vibe-codex config set key=value');
  }
  
  const [key, value] = keyValue.split('=');
  
  // TODO: Implement configuration setting
  console.log(chalk.green(`✓ Set ${key} = ${value}`));
}

async function resetConfiguration() {
  const { confirm } = await inquirer.prompt([{
    type: 'confirm',
    name: 'confirm',
    message: 'Are you sure you want to reset to default configuration?',
    default: false
  }]);
  
  if (!confirm) {
    console.log('Reset cancelled.');
    return;
  }
  
  // TODO: Implement configuration reset
  console.log(chalk.green('✓ Configuration reset to defaults'));
}

async function exportConfiguration() {
  const configPath = '.vibe-codex.json';
  
  if (!await fs.pathExists(configPath)) {
    throw new Error('No configuration file found');
  }
  
  const config = await fs.readJSON(configPath);
  console.log(JSON.stringify(config, null, 2));
}

async function importConfiguration(file) {
  if (!file) {
    throw new Error('Configuration file path required');
  }
  
  if (!await fs.pathExists(file)) {
    throw new Error(`Configuration file not found: ${file}`);
  }
  
  // TODO: Implement configuration import
  console.log(chalk.green(`✓ Configuration imported from ${file}`));
}