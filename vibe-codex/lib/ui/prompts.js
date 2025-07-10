/**
 * UI prompts and components for interactive CLI
 */

const chalk = require('chalk');
const inquirer = require('inquirer');
const ora = require('ora');

/**
 * Project type prompt with visual icons
 */
const projectTypePrompt = {
  type: 'list',
  name: 'projectType',
  message: 'What type of project is this?',
  choices: [
    {
      name: chalk.cyan('🌐  Web Application') + chalk.gray(' (React, Vue, Angular, etc.)'),
      value: 'web',
      short: 'Web App'
    },
    {
      name: chalk.green('🔌  API/Backend Service') + chalk.gray(' (Express, NestJS, etc.)'),
      value: 'api',
      short: 'API'
    },
    {
      name: chalk.magenta('🚀  Full-Stack Application') + chalk.gray(' (Frontend + Backend)'),
      value: 'fullstack',
      short: 'Full-Stack'
    },
    {
      name: chalk.yellow('📦  npm Library/Package') + chalk.gray(' (Published to npm)'),
      value: 'library',
      short: 'Library'
    },
    {
      name: chalk.white('⚙️   Custom Configuration') + chalk.gray(' (Configure manually)'),
      value: 'custom',
      short: 'Custom'
    }
  ]
};

/**
 * Module selection with descriptions
 */
const moduleSelectionPrompt = (existingModules = {}) => ({
  type: 'checkbox',
  name: 'modules',
  message: 'Select the features you want to enable:',
  pageSize: 10,
  choices: [
    new inquirer.Separator(chalk.bold('─── Core Features ───')),
    {
      name: chalk.green('✓') + ' Core Rules ' + chalk.gray('(Basic git workflow, security)'),
      value: 'core',
      checked: true,
      disabled: chalk.gray('Always enabled')
    },
    
    new inquirer.Separator(chalk.bold('─── Testing & Quality ───')),
    {
      name: '🧪 Testing Framework Integration',
      value: 'testing',
      checked: existingModules.testing?.enabled ?? true
    },
    {
      name: '📐 Development Patterns ' + chalk.gray('(Naming, structure, best practices)'),
      value: 'patterns',
      checked: existingModules.patterns?.enabled ?? false
    },
    
    new inquirer.Separator(chalk.bold('─── GitHub Integration ───')),
    {
      name: '🐙 GitHub Workflow ' + chalk.gray('(PRs, issues, branch management)'),
      value: 'github',
      checked: existingModules.github?.enabled ?? true
    },
    {
      name: '🔄 GitHub Actions ' + chalk.gray('(CI/CD workflows)'),
      value: 'github-workflow',
      checked: existingModules['github-workflow']?.enabled ?? false
    },
    
    new inquirer.Separator(chalk.bold('─── Deployment & Docs ───')),
    {
      name: '🚀 Deployment Validation ' + chalk.gray('(Vercel, Netlify, AWS)'),
      value: 'deployment',
      checked: existingModules.deployment?.enabled ?? false
    },
    {
      name: '📚 Documentation Standards',
      value: 'documentation',
      checked: existingModules.documentation?.enabled ?? true
    }
  ]
});

/**
 * Testing configuration prompts
 */
const testingConfigPrompts = (detected) => [
  {
    type: 'list',
    name: 'framework',
    message: 'Which testing framework do you use?',
    choices: [
      { name: 'Jest', value: 'jest' },
      { name: 'Vitest', value: 'vitest' },
      { name: 'Mocha', value: 'mocha' },
      { name: 'Other', value: 'other' }
    ],
    default: detected || 'jest'
  },
  {
    type: 'number',
    name: 'coverageThreshold',
    message: 'Test coverage threshold (%):',
    default: 80,
    validate: (value) => {
      if (value < 0 || value > 100) {
        return 'Please enter a value between 0 and 100';
      }
      return true;
    }
  },
  {
    type: 'list',
    name: 'enforcement',
    message: 'How should test failures be handled?',
    choices: [
      { name: chalk.red('Error') + ' - Block commits/merges', value: 'error' },
      { name: chalk.yellow('Warning') + ' - Show warnings but allow', value: 'warning' },
      { name: chalk.blue('Info') + ' - Informational only', value: 'info' }
    ],
    default: 'error'
  }
];

/**
 * GitHub configuration prompts
 */
const githubConfigPrompts = [
  {
    type: 'checkbox',
    name: 'features',
    message: 'Select GitHub features:',
    choices: [
      { name: '✅ PR status checks', value: 'prChecks', checked: true },
      { name: '🔍 Issue tracking', value: 'issueTracking', checked: true },
      { name: '🤖 Auto-merge when checks pass', value: 'autoMerge', checked: false },
      { name: '🧹 Branch cleanup after merge', value: 'branchCleanup', checked: true },
      { name: '📋 PR templates', value: 'prTemplates', checked: true },
      { name: '🐛 Issue templates', value: 'issueTemplates', checked: true }
    ]
  },
  {
    type: 'confirm',
    name: 'requireIssueReference',
    message: 'Require issue reference in PRs?',
    default: true
  }
];

/**
 * Show configuration preview in a formatted box
 */
function showConfigPreview(config) {
  const box = require('./box');
  
  console.log('\n' + box({
    title: '📋 Configuration Preview',
    content: [
      `Project Type: ${chalk.bold(config.projectType)}`,
      `Enforcement: ${chalk.bold(config.enforcementLevel)}`,
      '',
      chalk.underline('Enabled Modules:'),
      ...Object.entries(config.modules)
        .filter(([_, mod]) => mod.enabled)
        .map(([name, _]) => `  ✓ ${name}`)
    ].join('\n'),
    padding: 1,
    borderColor: 'blue'
  }));
}

/**
 * Progress indicator for long operations
 */
class ProgressIndicator {
  constructor(total, message = 'Processing') {
    this.total = total;
    this.current = 0;
    this.message = message;
    this.spinner = ora({
      text: this.getText(),
      spinner: 'dots'
    });
  }
  
  start() {
    this.spinner.start();
    return this;
  }
  
  increment(message) {
    this.current++;
    if (message) {
      this.message = message;
    }
    this.spinner.text = this.getText();
  }
  
  getText() {
    const percentage = Math.round((this.current / this.total) * 100);
    const filled = Math.floor(percentage / 5);
    const empty = 20 - filled;
    const bar = '█'.repeat(filled) + '░'.repeat(empty);
    
    return `${this.message}\n[${bar}] ${percentage}%`;
  }
  
  succeed(message) {
    this.spinner.succeed(message || 'Complete!');
  }
  
  fail(message) {
    this.spinner.fail(message || 'Failed');
  }
}

/**
 * Conflict resolution prompt
 */
async function promptConflictResolution(conflictType, details) {
  console.log(chalk.yellow(`\n⚠️  ${conflictType} detected:\n`));
  console.log(chalk.gray(details));
  
  const { resolution } = await inquirer.prompt([
    {
      type: 'list',
      name: 'resolution',
      message: 'How would you like to proceed?',
      choices: [
        {
          name: chalk.green('Merge') + ' with vibe-codex rules ' + chalk.gray('(recommended)'),
          value: 'merge'
        },
        {
          name: chalk.yellow('Replace') + ' with vibe-codex rules',
          value: 'replace'
        },
        {
          name: chalk.red('Keep') + ' existing ' + chalk.gray('(vibe-codex rules won\'t apply)'),
          value: 'keep'
        },
        {
          name: chalk.blue('View') + ' differences',
          value: 'diff'
        }
      ]
    }
  ]);
  
  return resolution;
}

/**
 * Confirmation prompt with custom message
 */
async function confirm(message, defaultValue = true) {
  const { confirmed } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'confirmed',
      message,
      default: defaultValue
    }
  ]);
  
  return confirmed;
}

/**
 * Success message with emoji
 */
function showSuccess(message) {
  console.log('\n' + chalk.green('✅ ') + chalk.bold(message));
}

/**
 * Error message with details
 */
function showError(message, details) {
  console.log('\n' + chalk.red('❌ ') + chalk.bold(message));
  if (details) {
    console.log(chalk.gray(details));
  }
}

/**
 * Warning message
 */
function showWarning(message) {
  console.log('\n' + chalk.yellow('⚠️  ') + message);
}

/**
 * Info message
 */
function showInfo(message) {
  console.log('\n' + chalk.blue('ℹ️  ') + message);
}

module.exports = {
  projectTypePrompt,
  moduleSelectionPrompt,
  testingConfigPrompts,
  githubConfigPrompts,
  showConfigPreview,
  ProgressIndicator,
  promptConflictResolution,
  confirm,
  showSuccess,
  showError,
  showWarning,
  showInfo
};