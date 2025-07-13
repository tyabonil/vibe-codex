/**
 * Simplified commands for vibe-codex
 */

const inquirer = require('inquirer');
const chalk = require('chalk');
const fs = require('fs').promises;
const path = require('path');
const { installHooks, uninstallHooks } = require('./installer');

const CONFIG_FILE = '.vibe-codex.json';

/**
 * Initialize vibe-codex in a project
 */
async function init() {
  console.log(chalk.blue('\n🚀 Initializing vibe-codex...\n'));
  
  // Check if already initialized
  const configPath = path.join(process.cwd(), CONFIG_FILE);
  const exists = await fs.access(configPath).then(() => true).catch(() => false);
  
  if (exists) {
    const { overwrite } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'overwrite',
        message: 'vibe-codex is already initialized. Overwrite configuration?',
        default: false
      }
    ]);
    
    if (!overwrite) {
      console.log(chalk.yellow('Initialization cancelled.'));
      return;
    }
  }
  
  // Ask what to install
  const { features } = await inquirer.prompt([
    {
      type: 'checkbox',
      name: 'features',
      message: 'What would you like to install?',
      choices: [
        {
          name: 'Git hooks (pre-commit, commit-msg)',
          value: 'gitHooks',
          checked: true
        },
        {
          name: 'GitHub Actions workflow',
          value: 'githubActions',
          checked: false
        }
      ]
    }
  ]);
  
  // Select rules if git hooks are enabled
  let selectedRules = [];
  if (features.includes('gitHooks')) {
    const { rules } = await inquirer.prompt([
      {
        type: 'checkbox',
        name: 'rules',
        message: 'Select rules to enforce:',
        choices: [
          {
            name: '🔒 Security checks (no secrets, API keys)',
            value: 'security',
            checked: true
          },
          {
            name: '📝 Commit message format',
            value: 'commit-format',
            checked: true
          },
          {
            name: '🧪 Test requirements',
            value: 'testing',
            checked: false
          },
          {
            name: '📚 Documentation requirements',
            value: 'documentation',
            checked: false
          },
          {
            name: '🎨 Code style checks',
            value: 'code-style',
            checked: false
          },
          {
            name: '🌿 Branch name validation',
            value: 'branch-validation',
            checked: false
          },
          {
            name: '🛡️ Dependency safety check',
            value: 'dependency-safety',
            checked: false
          },
          {
            name: '✨ Test quality checker',
            value: 'test-quality',
            checked: false
          },
          {
            name: '📏 Context size monitoring',
            value: 'context-size',
            checked: false
          }
        ],
        validate: (answers) => {
          if (answers.length === 0) {
            return 'Please select at least one rule';
          }
          return true;
        }
      }
    ]);
    selectedRules = rules;
  }
  
  // Create configuration
  const config = {
    version: '3.0.0',
    gitHooks: features.includes('gitHooks'),
    githubActions: features.includes('githubActions'),
    rules: selectedRules,
    created: new Date().toISOString()
  };
  
  // Save configuration
  await fs.writeFile(configPath, JSON.stringify(config, null, 2));
  console.log(chalk.green('✓ Configuration saved'));
  
  // Install selected features
  if (config.gitHooks) {
    await installHooks(config);
  }
  
  if (config.githubActions) {
    await installGitHubActions(config);
  }
  
  console.log(chalk.green('\n✅ vibe-codex initialized successfully!'));
  console.log(chalk.gray('\nNext steps:'));
  console.log(chalk.gray('  - Run "vibe-codex config" to modify settings'));
  console.log(chalk.gray('  - Commit your changes to save the configuration'));
}

/**
 * Configure vibe-codex settings
 */
async function config() {
  console.log(chalk.blue('\n⚙️  Configure vibe-codex\n'));
  
  // Load existing config
  const configPath = path.join(process.cwd(), CONFIG_FILE);
  const exists = await fs.access(configPath).then(() => true).catch(() => false);
  
  if (!exists) {
    console.log(chalk.yellow('No configuration found. Run "init" first.'));
    return;
  }
  
  const currentConfig = JSON.parse(await fs.readFile(configPath, 'utf8'));
  
  // Show configuration menu
  const { action } = await inquirer.prompt([
    {
      type: 'list',
      name: 'action',
      message: 'What would you like to configure?',
      choices: [
        {
          name: '📝 Modify rules',
          value: 'rules'
        },
        {
          name: '🔧 Toggle git hooks',
          value: 'hooks'
        },
        {
          name: '🚀 Toggle GitHub Actions',
          value: 'actions'
        },
        {
          name: '🔄 Reset to defaults',
          value: 'reset'
        },
        {
          name: '← Back',
          value: 'back'
        }
      ]
    }
  ]);
  
  switch (action) {
    case 'rules':
      await configureRules(currentConfig);
      break;
    
    case 'hooks':
      await toggleGitHooks(currentConfig);
      break;
    
    case 'actions':
      await toggleGitHubActions(currentConfig);
      break;
    
    case 'reset':
      await resetConfig();
      break;
    
    case 'back':
      return;
  }
  
  // Save updated config if not resetting
  if (action !== 'reset' && action !== 'back') {
    await fs.writeFile(configPath, JSON.stringify(currentConfig, null, 2));
    console.log(chalk.green('\n✓ Configuration updated'));
  }
}

async function configureRules(config) {
  const { rules } = await inquirer.prompt([
    {
      type: 'checkbox',
      name: 'rules',
      message: 'Select rules to enforce:',
      choices: [
        {
          name: '🔒 Security checks',
          value: 'security',
          checked: config.rules.includes('security')
        },
        {
          name: '📝 Commit message format',
          value: 'commit-format',
          checked: config.rules.includes('commit-format')
        },
        {
          name: '🧪 Test requirements',
          value: 'testing',
          checked: config.rules.includes('testing')
        },
        {
          name: '📚 Documentation requirements',
          value: 'documentation',
          checked: config.rules.includes('documentation')
        },
        {
          name: '🎨 Code style checks',
          value: 'code-style',
          checked: config.rules.includes('code-style')
        },
        {
          name: '🌿 Branch name validation',
          value: 'branch-validation',
          checked: config.rules.includes('branch-validation')
        },
        {
          name: '🛡️ Dependency safety check',
          value: 'dependency-safety',
          checked: config.rules.includes('dependency-safety')
        },
        {
          name: '✨ Test quality checker',
          value: 'test-quality',
          checked: config.rules.includes('test-quality')
        },
        {
          name: '📏 Context size monitoring',
          value: 'context-size',
          checked: config.rules.includes('context-size')
        }
      ]
    }
  ]);
  
  config.rules = rules;
  config.updated = new Date().toISOString();
}

async function toggleGitHooks(config) {
  const newState = !config.gitHooks;
  config.gitHooks = newState;
  config.updated = new Date().toISOString();
  
  if (newState) {
    await installHooks(config);
    console.log(chalk.green('✓ Git hooks enabled'));
  } else {
    await uninstallHooks();
    console.log(chalk.yellow('✓ Git hooks disabled'));
  }
}

async function toggleGitHubActions(config) {
  const newState = !config.githubActions;
  config.githubActions = newState;
  config.updated = new Date().toISOString();
  
  if (newState) {
    await installGitHubActions(config);
    console.log(chalk.green('✓ GitHub Actions enabled'));
  } else {
    await uninstallGitHubActions();
    console.log(chalk.yellow('✓ GitHub Actions disabled'));
  }
}

async function resetConfig() {
  const { confirm } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'confirm',
      message: 'Are you sure you want to reset to default configuration?',
      default: false
    }
  ]);
  
  if (confirm) {
    await init();
  }
}

/**
 * Uninstall vibe-codex from a project
 */
async function uninstall() {
  console.log(chalk.yellow('\n🗑️  Uninstall vibe-codex\n'));
  
  const { confirm } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'confirm',
      message: 'This will remove all vibe-codex configurations and hooks. Continue?',
      default: false
    }
  ]);
  
  if (!confirm) {
    console.log(chalk.gray('Uninstall cancelled.'));
    return;
  }
  
  // Remove git hooks
  await uninstallHooks();
  
  // Remove GitHub Actions
  await uninstallGitHubActions();
  
  // Remove config file
  const configPath = path.join(process.cwd(), CONFIG_FILE);
  try {
    await fs.unlink(configPath);
    console.log(chalk.green('✓ Configuration removed'));
  } catch (error) {
    // Config file might not exist
  }
  
  console.log(chalk.green('\n✅ vibe-codex uninstalled successfully!'));
}

/**
 * Install GitHub Actions workflow
 */
async function installGitHubActions(config) {
  const workflowDir = path.join(process.cwd(), '.github', 'workflows');
  const workflowPath = path.join(workflowDir, 'vibe-codex.yml');
  
  // Create workflow directory
  await fs.mkdir(workflowDir, { recursive: true });
  
  // Create workflow content based on selected rules
  const workflowContent = generateGitHubActionsWorkflow(config);
  
  await fs.writeFile(workflowPath, workflowContent);
  console.log(chalk.green('✓ GitHub Actions workflow installed'));
}

/**
 * Uninstall GitHub Actions workflow
 */
async function uninstallGitHubActions() {
  const workflowPath = path.join(process.cwd(), '.github', 'workflows', 'vibe-codex.yml');
  
  try {
    await fs.unlink(workflowPath);
    console.log(chalk.green('✓ GitHub Actions workflow removed'));
  } catch (error) {
    // Workflow might not exist
  }
}

/**
 * Generate GitHub Actions workflow based on configuration
 */
function generateGitHubActionsWorkflow(config) {
  const rules = config.rules || [];
  
  let steps = [];
  
  // Always checkout code
  steps.push(`      - uses: actions/checkout@v4`);
  
  // Add steps based on rules
  if (rules.includes('security')) {
    steps.push(`
      - name: Security Check
        run: |
          # Check for secrets and API keys
          ! grep -r -E "(api_key|apikey|secret|password|token)\\s*=\\s*['\\"'][^'\\""]+['\\"']" . --include="*.js" --include="*.ts" --include="*.py" || (echo "Found potential secrets in code" && exit 1)`);
  }
  
  if (rules.includes('testing')) {
    steps.push(`
      - name: Run Tests
        run: |
          # Run tests based on package.json script
          if [ -f "package.json" ] && grep -q '"test"' package.json; then
            npm test
          fi`);
  }
  
  if (rules.includes('documentation')) {
    steps.push(`
      - name: Check Documentation
        run: |
          # Ensure README exists
          [ -f "README.md" ] || (echo "README.md is required" && exit 1)`);
  }
  
  return `name: vibe-codex checks

on:
  push:
    branches: [ main, master, develop ]
  pull_request:
    branches: [ main, master, develop ]

jobs:
  check:
    runs-on: ubuntu-latest
    
    steps:
${steps.join('\n')}
`;
}

module.exports = {
  init,
  config,
  uninstall
};