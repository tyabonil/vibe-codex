/**
 * Config command v3 - Manage vibe-codex configuration with rule-based system
 */

const chalk = require('chalk');
const inquirer = require('inquirer');
const logger = require('../utils/logger');
const { 
  loadConfig, 
  saveConfig, 
  loadRegistry,
  getRulesByCategory,
  getConfigSummary,
  updateRule,
  applyPreset
} = require('../config/loader');

module.exports = async function config(options) {
  // Handle case where options is a string (backward compatibility)
  if (typeof options === 'string') {
    const action = options;
    const opts = arguments[1] || {};
    return handleAction(action, opts);
  }
  
  // Handle options from CLI
  if (!options || Object.keys(options).length === 0) {
    return interactiveConfig();
  }
  
  // Route to appropriate action
  if (options.list) {
    return listConfiguration();
  } else if (options.set) {
    return setConfiguration(options.set);
  } else if (options.reset) {
    return resetConfiguration();
  } else if (options.export) {
    return exportConfiguration(options.export);
  } else if (options.import) {
    return importConfiguration(options.import);
  } else if (options.preview) {
    return previewConfiguration();
  } else {
    return interactiveConfig();
  }
};

/**
 * Interactive configuration menu
 */
async function interactiveConfig() {
  try {
    console.log(chalk.blue('🔧 vibe-codex Configuration\n'));
    
    const config = await loadConfig();
    if (!config) {
      console.log(chalk.yellow('No configuration file found.'));
      console.log('Run "npx vibe-codex init" to create one.');
      return;
    }
    
    const summary = await getConfigSummary(config);
  
  // Show current status
  console.log(chalk.gray(`Version: ${config.version}`));
  console.log(chalk.gray(`Preset: ${config.preset}`));
  console.log(chalk.gray(`Enabled Rules: ${summary.enabledRules}/${summary.totalRules}`));
  console.log();
  
  const { action } = await inquirer.prompt([{
    type: 'list',
    name: 'action',
    message: 'What would you like to configure?',
    choices: [
      { name: 'Configure rules by category', value: 'rules' },
      { name: 'Apply a preset', value: 'preset' },
      { name: 'Configure project context', value: 'context' },
      { name: 'View current configuration', value: 'view' },
      { name: 'Export configuration', value: 'export' },
      { name: 'Import configuration', value: 'import' },
      { name: 'Reset to defaults', value: 'reset' },
      { name: 'Exit', value: 'exit' }
    ]
  }]);
  
  switch (action) {
    case 'rules':
      await configureRules(config);
      break;
    case 'preset':
      await configurePreset(config);
      break;
    case 'context':
      await configureProjectContext(config);
      break;
    case 'view':
      await viewConfiguration(config);
      return;
    case 'export':
      console.log('\n' + JSON.stringify(config, null, 2));
      return;
    case 'import':
      const { path } = await inquirer.prompt([{
        type: 'input',
        name: 'path',
        message: 'Path to configuration file:',
        default: 'vibe-codex.json'
      }]);
      return importConfiguration(path);
    case 'reset':
      return resetConfiguration();
    case 'exit':
      return;
  }
  
  // Save changes
  await saveConfig(config);
  logger.success('Configuration saved!');
  } catch (error) {
    logger.error('Configuration error:', error.message);
    throw error;
  }
}

/**
 * Configure rules by category
 */
async function configureRules(config) {
  try {
    const categories = await getRulesByCategory();
    const categoryNames = Object.keys(categories);
  
  const { category } = await inquirer.prompt([{
    type: 'list',
    name: 'category',
    message: 'Select a category:',
    choices: [
      ...categoryNames.map(cat => ({
        name: `${cat} (${categories[cat].length} rules)`,
        value: cat
      })),
      { name: '← Back', value: 'back' }
    ]
  }]);
  
  if (category === 'back') {
    return;
  }
  
  // Show rules in category
  const rules = categories[category];
  const choices = rules.map(rule => ({
    name: `${rule.name} - ${rule.description}`,
    value: rule.id,
    checked: config.rules[rule.id]?.enabled || false
  }));
  
  const { selectedRules } = await inquirer.prompt([{
    type: 'checkbox',
    name: 'selectedRules',
    message: `Select ${category} rules to enable:`,
    choices,
    pageSize: 10
  }]);
  
  // Update configuration
  rules.forEach(rule => {
    const enabled = selectedRules.includes(rule.id);
    config = updateRule(config, rule.id, enabled);
  });
  
  // Ask if user wants to configure another category
  const { another } = await inquirer.prompt([{
    type: 'confirm',
    name: 'another',
    message: 'Configure another category?',
    default: true
  }]);
  
  if (another) {
    await configureRules(config);
  }
  } catch (error) {
    logger.error('Error configuring rules:', error.message);
    throw error;
  }
}

/**
 * Apply a preset configuration
 */
async function configurePreset(config) {
  try {
    const registry = await loadRegistry();
    const presets = Object.entries(registry.presets);
  
  const { preset } = await inquirer.prompt([{
    type: 'list',
    name: 'preset',
    message: 'Select a preset:',
    choices: [
      ...presets.map(([key, value]) => ({
        name: `${value.name} - ${value.description}`,
        value: key
      })),
      { name: '← Back', value: 'back' }
    ]
  }]);
  
  if (preset === 'back') {
    return;
  }
  
  // Show what will change
  const presetConfig = registry.presets[preset];
  console.log(chalk.yellow(`\nThis will enable ${presetConfig.rules.length} rules:`));
  console.log(presetConfig.rules.join(', '));
  
  const { confirm } = await inquirer.prompt([{
    type: 'confirm',
    name: 'confirm',
    message: 'Apply this preset?',
    default: true
  }]);
  
  if (confirm) {
    const newConfig = await applyPreset(preset);
    // Preserve project settings
    newConfig.project = config.project;
    Object.assign(config, newConfig);
  }
  } catch (error) {
    logger.error('Error applying preset:', error.message);
    throw error;
  }
}

/**
 * Configure project context
 */
async function configureProjectContext(config) {
  const current = config.projectContext || { enabled: false, file: 'PROJECT-CONTEXT.md' };
  
  const answers = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'enabled',
      message: 'Enable project context integration?',
      default: current.enabled
    },
    {
      type: 'input',
      name: 'file',
      message: 'Path to project context file:',
      default: current.file,
      when: (answers) => answers.enabled
    }
  ]);
  
  config.projectContext = answers;
}

/**
 * View current configuration with details
 */
async function viewConfiguration(config) {
  try {
    const summary = await getConfigSummary(config);
    const registry = await loadRegistry();
  
  console.log(chalk.blue('\n📋 Current Configuration\n'));
  
  // Basic info
  console.log(chalk.bold('Project:'));
  console.log(`  Type: ${config.project?.type || 'custom'}`);
  console.log(`  Preset: ${config.preset}`);
  console.log();
  
  // Enabled rules by category
  console.log(chalk.bold('Enabled Rules:'));
  Object.entries(summary.categories).forEach(([category, count]) => {
    console.log(`  ${category}: ${count} rules`);
  });
  console.log();
  
  // List all enabled rules
  console.log(chalk.bold('Rule Details:'));
  Object.entries(config.rules).forEach(([ruleId, ruleConfig]) => {
    if (ruleConfig.enabled) {
      const rule = registry.rules.find(r => r.id === ruleId);
      if (rule) {
        console.log(`  ✓ ${rule.name} (${ruleId})`);
        if (ruleConfig.options) {
          console.log(chalk.gray(`    Options: ${JSON.stringify(ruleConfig.options)}`));
        }
      }
    }
  });
  console.log();
  
  // Hooks
  console.log(chalk.bold('Git Hooks:'));
  summary.hooks.forEach(hook => {
    console.log(`  ✓ ${hook}`);
  });
  
  // Project context
  if (config.projectContext?.enabled) {
    console.log(chalk.bold('\nProject Context:'));
    console.log(`  ✓ Enabled (${config.projectContext.file})`);
  }
  } catch (error) {
    logger.error('Error viewing configuration:', error.message);
    throw error;
  }
}

/**
 * List configuration (CLI command)
 */
async function listConfiguration() {
  try {
    const config = await loadConfig();
    
    if (!config) {
      logger.warn('No configuration file found.');
      logger.info('Run "npx vibe-codex init" to create one.');
      return;
    }
    
    await viewConfiguration(config);
  } catch (error) {
    logger.error('Error listing configuration:', error.message);
    throw error;
  }
}

/**
 * Set configuration value
 */
async function setConfiguration(keyValue) {
  try {
    if (!keyValue || !keyValue.includes('=')) {
      throw new Error('Invalid format. Use: vibe-codex config set rule.id=enabled');
    }
    
    const [key, value] = keyValue.split('=');
    const config = await loadConfig();
    
    if (!config) {
      throw new Error('No configuration file found');
    }
  
  // Handle rule enabling/disabling
  if (key.match(/^[a-z]+-\d{3}$/)) {
    const enabled = value === 'true' || value === 'enabled';
    updateRule(config, key, enabled);
    await saveConfig(config);
    logger.success(`Set ${key} = ${enabled ? 'enabled' : 'disabled'}`);
  } else {
    throw new Error(`Unknown configuration key: ${key}`);
  }
  } catch (error) {
    logger.error('Error setting configuration:', error.message);
    throw error;
  }
}

/**
 * Reset configuration
 */
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
  
  const newConfig = await applyPreset('minimal');
  await saveConfig(newConfig);
  console.log(chalk.green('✓ Configuration reset to minimal preset'));
}

/**
 * Export configuration
 */
async function exportConfiguration(file) {
  const config = await loadConfig();
  
  if (!config) {
    throw new Error('No configuration file found');
  }
  
  if (file && file !== true) {
    const fs = require('fs-extra');
    await fs.writeJSON(file, config, { spaces: 2 });
    console.log(chalk.green(`✓ Configuration exported to ${file}`));
  } else {
    console.log(JSON.stringify(config, null, 2));
  }
}

/**
 * Import configuration
 */
async function importConfiguration(file) {
  if (!file) {
    throw new Error('Configuration file path required');
  }
  
  const fs = require('fs-extra');
  if (!await fs.pathExists(file)) {
    throw new Error(`Configuration file not found: ${file}`);
  }
  
  const newConfig = await fs.readJSON(file);
  
  // Validate using our schema
  const { validateConfig } = require('../config/schema');
  const validation = validateConfig(newConfig);
  
  if (!validation.valid) {
    throw new Error(`Invalid configuration: ${validation.errors.map(e => e.message).join(', ')}`);
  }
  
  // Backup existing
  const existingConfig = await loadConfig();
  if (existingConfig) {
    const backupPath = `.vibe-codex.backup.${Date.now()}.json`;
    await fs.writeJSON(backupPath, existingConfig, { spaces: 2 });
    console.log(chalk.gray(`Backup saved to ${backupPath}`));
  }
  
  // Import
  await saveConfig(newConfig);
  console.log(chalk.green(`✓ Configuration imported from ${file}`));
}

/**
 * Preview configuration impact
 */
async function previewConfiguration() {
  const config = await loadConfig();
  
  if (!config) {
    console.log(chalk.yellow('No configuration file found.'));
    return;
  }
  
  await viewConfiguration(config);
}

// Handle backward compatibility
function handleAction(action, options) {
  switch (action) {
    case 'list':
      return listConfiguration();
    case 'set':
      return setConfiguration(options.set || options);
    case 'reset':
      return resetConfiguration();
    case 'export':
      return exportConfiguration(options.export || options);
    case 'import':
      return importConfiguration(options.import || options);
    default:
      throw new Error(`Unknown config action: ${action}`);
  }
}