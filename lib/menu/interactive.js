/**
 * Enhanced interactive menu for vibe-codex rule configuration
 * Provides checkbox-based rule selection with category navigation
 */

const chalk = require('chalk');
const inquirer = require('inquirer');
const logger = require('../utils/logger');

/**
 * Main interactive rule configuration menu
 */
async function interactiveRuleConfig(config, registry) {
  try {
    console.clear();
    console.log(chalk.blue.bold('=== Vibe Codex Rule Configuration ===\n'));
    
    // Show current configuration summary
    const enabledCount = Object.values(config.rules || {}).filter(r => r.enabled).length;
    const totalCount = registry.rules.length;
    
    console.log(chalk.gray(`Current config: .vibe-codex.json`));
    console.log(chalk.gray(`Enabled rules: ${enabledCount}/${totalCount}\n`));
  
  // Build category menu
  const categories = {};
  registry.rules.forEach(rule => {
    if (!categories[rule.category]) {
      categories[rule.category] = [];
    }
    categories[rule.category].push(rule);
  });
  
  const categoryChoices = Object.entries(categories).map(([name, rules]) => {
    const categoryInfo = registry.categories[name];
    const enabledInCategory = rules.filter(r => config.rules[r.id]?.enabled).length;
    
    return {
      name: `${categoryInfo.icon} ${categoryInfo.name} (${enabledInCategory}/${rules.length} enabled)`,
      value: name,
      short: categoryInfo.name
    };
  });
  
  categoryChoices.push(
    new inquirer.Separator(),
    { name: '🎯 Apply Preset', value: 'preset' },
    { name: '💾 Save & Exit', value: 'save' },
    { name: '❌ Cancel', value: 'cancel' }
  );
  
  const { action } = await inquirer.prompt([{
    type: 'list',
    name: 'action',
    message: 'Select a category to configure:',
    choices: categoryChoices,
    pageSize: 10
  }]);
  
  switch (action) {
    case 'preset':
      await selectPreset(config, registry);
      return interactiveRuleConfig(config, registry);
      
    case 'save':
      return { action: 'save', config };
      
    case 'cancel':
      return { action: 'cancel' };
      
    default:
      // Configure rules in selected category
      await configureCategory(config, registry, action);
      return interactiveRuleConfig(config, registry);
  }
  } catch (error) {
    console.error(chalk.red('Error in interactive menu:'), error.message);
    throw error;
  }
}

/**
 * Configure rules within a specific category
 */
async function configureCategory(config, registry, categoryName) {
  try {
    console.clear();
    const categoryInfo = registry.categories[categoryName];
    const rules = registry.rules.filter(r => r.category === categoryName);
  
  console.log(chalk.blue.bold(`${categoryInfo.icon} ${categoryInfo.name} Rules\n`));
  console.log(chalk.gray(categoryInfo.description + '\n'));
  
  // Build checkbox choices with detailed information
  const choices = rules.map(rule => {
    const isEnabled = config.rules[rule.id]?.enabled || false;
    const complexity = chalk.gray(`[${rule.complexity}]`);
    const performance = rule.performance_impact === 'high' 
      ? chalk.red('⚡') 
      : rule.performance_impact === 'medium' 
      ? chalk.yellow('⚡') 
      : chalk.green('⚡');
    
    return {
      name: `${rule.name} ${complexity} ${performance}\n    ${chalk.gray(rule.description)}`,
      value: rule.id,
      checked: isEnabled,
      short: rule.name
    };
  });
  
  console.log(chalk.gray('Performance: ') + chalk.green('⚡ Low') + ' ' + chalk.yellow('⚡ Medium') + ' ' + chalk.red('⚡ High\n'));
  
  const { selectedRules } = await inquirer.prompt([{
    type: 'checkbox',
    name: 'selectedRules',
    message: 'Toggle rules with spacebar, press Enter when done:',
    choices,
    pageSize: 15
  }]);
  
  // Update configuration
  rules.forEach(rule => {
    const wasEnabled = config.rules[rule.id]?.enabled || false;
    const isEnabled = selectedRules.includes(rule.id);
    
    if (wasEnabled !== isEnabled) {
      if (!config.rules[rule.id]) {
        config.rules[rule.id] = {};
      }
      config.rules[rule.id].enabled = isEnabled;
      
      // Show change notification
      if (isEnabled) {
        console.log(chalk.green(`  ✓ Enabled: ${rule.name}`));
      } else {
        console.log(chalk.red(`  ✗ Disabled: ${rule.name}`));
      }
    }
  });
  
  // Pause to show changes
  await new Promise(resolve => setTimeout(resolve, 1500));
  } catch (error) {
    console.error(chalk.red('Error configuring category:'), error.message);
    throw error;
  }
}

/**
 * Select and apply a preset
 */
async function selectPreset(config, registry) {
  try {
    console.clear();
    console.log(chalk.blue.bold('🎯 Select a Preset\n'));
  
  const presetChoices = Object.entries(registry.presets).map(([key, preset]) => {
    const ruleCount = preset.rules.length;
    return {
      name: `${preset.name} - ${preset.description}\n    ${chalk.gray(`Enables ${ruleCount} rules`)}`,
      value: key,
      short: preset.name
    };
  });
  
  presetChoices.push(
    new inquirer.Separator(),
    { name: '← Back', value: 'back' }
  );
  
  const { preset } = await inquirer.prompt([{
    type: 'list',
    name: 'preset',
    message: 'Choose a preset configuration:',
    choices: presetChoices
  }]);
  
  if (preset === 'back') {
    return;
  }
  
  // Show what will change
  const presetConfig = registry.presets[preset];
  console.log(chalk.yellow(`\nThis will enable ${presetConfig.rules.length} rules:`));
  
  const rulesByCategory = {};
  presetConfig.rules.forEach(ruleId => {
    const rule = registry.rules.find(r => r.id === ruleId);
    if (rule) {
      if (!rulesByCategory[rule.category]) {
        rulesByCategory[rule.category] = [];
      }
      rulesByCategory[rule.category].push(rule.name);
    }
  });
  
  Object.entries(rulesByCategory).forEach(([category, ruleNames]) => {
    console.log(`\n${chalk.bold(category)}:`);
    ruleNames.forEach(name => console.log(`  • ${name}`));
  });
  
  const { confirm } = await inquirer.prompt([{
    type: 'confirm',
    name: 'confirm',
    message: '\nApply this preset?',
    default: true
  }]);
  
  if (confirm) {
    // Clear all rules first
    Object.keys(config.rules).forEach(ruleId => {
      config.rules[ruleId].enabled = false;
    });
    
    // Enable preset rules
    presetConfig.rules.forEach(ruleId => {
      if (!config.rules[ruleId]) {
        config.rules[ruleId] = {};
      }
      config.rules[ruleId].enabled = true;
    });
    
    config.preset = preset;
    console.log(chalk.green(`\n✓ Applied ${registry.presets[preset].name} preset`));
    await new Promise(resolve => setTimeout(resolve, 1500));
  }
  } catch (error) {
    console.error(chalk.red('Error selecting preset:'), error.message);
    throw error;
  }
}

/**
 * Display configuration summary
 */
function displaySummary(config, registry) {
  const enabledRules = Object.entries(config.rules || {})
    .filter(([_, ruleConfig]) => ruleConfig.enabled)
    .map(([ruleId]) => registry.rules.find(r => r.id === ruleId))
    .filter(Boolean);
  
  const byCategory = {};
  enabledRules.forEach(rule => {
    if (!byCategory[rule.category]) {
      byCategory[rule.category] = [];
    }
    byCategory[rule.category].push(rule);
  });
  
  console.log(chalk.blue.bold('\n📋 Configuration Summary\n'));
  
  Object.entries(byCategory).forEach(([category, rules]) => {
    const categoryInfo = registry.categories[category];
    console.log(chalk.bold(`${categoryInfo.icon} ${categoryInfo.name}:`));
    rules.forEach(rule => {
      console.log(`  ✓ ${rule.name}`);
    });
    console.log();
  });
  
  console.log(chalk.gray(`Total: ${enabledRules.length} rules enabled`));
}

module.exports = {
  interactiveRuleConfig,
  displaySummary
};
