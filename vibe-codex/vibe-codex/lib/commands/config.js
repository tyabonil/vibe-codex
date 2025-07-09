/**
 * Interactive configuration command for vibe-codex
 */

const inquirer = require('inquirer');
const chalk = require('chalk');
const ora = require('ora');
const fs = require('fs-extra');
const path = require('path');
const { detectFramework, detectPackageManager, detectTestingFramework } = require('../utils/detector');
const { createConfig, mergeConfigs, validateConfig } = require('../utils/config-creator');
const logger = require('../utils/logger');

/**
 * Main config command handler
 */
async function config(options = {}) {
  // Handle subcommands
  if (options.list) {
    return listConfig();
  }
  
  if (options.set) {
    return setConfig(options.set, options.value);
  }
  
  if (options.reset) {
    return resetConfig();
  }
  
  if (options.export) {
    return exportConfig(options.export);
  }
  
  if (options.import) {
    return importConfig(options.import);
  }
  
  if (options.preview) {
    return previewConfig();
  }
  
  // Default: interactive configuration
  return interactiveConfig();
}

/**
 * Interactive configuration flow
 */
async function interactiveConfig() {
  console.log(chalk.blue('\n🎯 vibe-codex Configuration\n'));
  
  const spinner = ora('Detecting project settings...').start();
  
  try {
    // Auto-detect project settings
    const detectedFramework = await detectFramework();
    const detectedPM = await detectPackageManager();
    const detectedTesting = await detectTestingFramework();
    
    spinner.succeed('Project settings detected');
    
    // Load existing config if exists
    let existingConfig = {};
    const configPath = '.vibe-codex.json';
    if (await fs.pathExists(configPath)) {
      existingConfig = await fs.readJSON(configPath);
      console.log(chalk.yellow('\n📋 Existing configuration found\n'));
    }
    
    // Project type selection
    const { projectType } = await inquirer.prompt([
      {
        type: 'list',
        name: 'projectType',
        message: 'What type of project is this?',
        choices: [
          { name: '🌐 Web Application (Frontend)', value: 'web' },
          { name: '🔌 API/Backend Service', value: 'api' },
          { name: '🚀 Full-Stack Application', value: 'fullstack' },
          { name: '📦 npm Library/Package', value: 'library' },
          { name: '⚙️  Custom Configuration', value: 'custom' }
        ],
        default: existingConfig.projectType || (detectedFramework ? 'web' : 'custom')
      }
    ]);
    
    // Module selection
    const moduleChoices = [
      {
        name: '✅ Core Rules (required)',
        value: 'core',
        checked: true,
        disabled: 'Always enabled'
      },
      {
        name: '🧪 Testing & Quality',
        value: 'testing',
        checked: existingConfig.modules?.testing?.enabled ?? true
      },
      {
        name: '🐙 GitHub Workflow Integration',
        value: 'github',
        checked: existingConfig.modules?.github?.enabled ?? true
      },
      {
        name: '🚀 Deployment Validation',
        value: 'deployment',
        checked: existingConfig.modules?.deployment?.enabled ?? false
      },
      {
        name: '📚 Documentation Standards',
        value: 'documentation',
        checked: existingConfig.modules?.documentation?.enabled ?? true
      },
      {
        name: '📐 Development Patterns',
        value: 'patterns',
        checked: existingConfig.modules?.patterns?.enabled ?? false
      },
      {
        name: '🔄 GitHub Actions Workflows',
        value: 'github-workflow',
        checked: existingConfig.modules?.['github-workflow']?.enabled ?? false
      }
    ];
    
    const { selectedModules } = await inquirer.prompt([
      {
        type: 'checkbox',
        name: 'selectedModules',
        message: 'Select the features you want to enable:',
        choices: moduleChoices,
        validate: (answers) => {
          if (!answers.includes('core')) {
            return 'Core module is required';
          }
          return true;
        }
      }
    ]);
    
    // Configure each selected module
    const moduleConfigs = {};
    
    for (const moduleName of selectedModules) {
      if (moduleName === 'core') {
        moduleConfigs.core = { enabled: true };
        continue;
      }
      
      console.log(chalk.blue(`\n⚙️  Configuring ${moduleName} module...\n`));
      
      switch (moduleName) {
        case 'testing':
          moduleConfigs.testing = await configureTestingModule(detectedTesting);
          break;
        case 'github':
          moduleConfigs.github = await configureGitHubModule();
          break;
        case 'deployment':
          moduleConfigs.deployment = await configureDeploymentModule();
          break;
        case 'documentation':
          moduleConfigs.documentation = await configureDocumentationModule();
          break;
        case 'patterns':
          moduleConfigs.patterns = await configurePatternsModule();
          break;
        case 'github-workflow':
          moduleConfigs['github-workflow'] = await configureGitHubWorkflowModule();
          break;
      }
    }
    
    // Enforcement level
    const { enforcementLevel } = await inquirer.prompt([
      {
        type: 'list',
        name: 'enforcementLevel',
        message: 'How should violations be handled?',
        choices: [
          { name: '🛑 Block (prevent commits/merges)', value: 'error' },
          { name: '⚠️  Warn (show warnings but allow)', value: 'warning' },
          { name: 'ℹ️  Info (informational only)', value: 'info' }
        ],
        default: existingConfig.enforcementLevel || 'error'
      }
    ]);
    
    // Build final configuration
    const newConfig = {
      version: '2.0.0',
      projectType,
      modules: moduleConfigs,
      enforcementLevel,
      packageManager: detectedPM,
      createdAt: existingConfig.createdAt || new Date().toISOString(),
      lastModified: new Date().toISOString()
    };
    
    // Preview configuration
    console.log(chalk.blue('\n📋 Configuration Preview:\n'));
    console.log(JSON.stringify(newConfig, null, 2));
    
    // Confirm save
    const { confirmSave } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'confirmSave',
        message: 'Save this configuration?',
        default: true
      }
    ]);
    
    if (confirmSave) {
      await fs.writeJSON(configPath, newConfig, { spaces: 2 });
      console.log(chalk.green('\n✅ Configuration saved to .vibe-codex.json'));
      
      // Offer to install hooks
      const { installHooks } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'installHooks',
          message: 'Install git hooks now?',
          default: true
        }
      ]);
      
      if (installHooks) {
        const gitHooks = require('../installer/git-hooks');
        await gitHooks.installGitHooks(newConfig);
        console.log(chalk.green('✅ Git hooks installed'));
      }
    }
    
  } catch (error) {
    spinner.fail('Configuration failed');
    logger.error('Config error:', error);
    throw error;
  }
}

/**
 * Configure testing module
 */
async function configureTestingModule(detectedFramework) {
  const answers = await inquirer.prompt([
    {
      type: 'list',
      name: 'framework',
      message: 'Which testing framework do you use?',
      choices: ['jest', 'vitest', 'mocha', 'other'],
      default: detectedFramework || 'jest'
    },
    {
      type: 'number',
      name: 'coverageThreshold',
      message: 'What should be your test coverage threshold?',
      default: 80,
      validate: (value) => {
        if (value < 0 || value > 100) {
          return 'Please enter a value between 0 and 100';
        }
        return true;
      }
    },
    {
      type: 'checkbox',
      name: 'options',
      message: 'Select additional testing options:',
      choices: [
        { name: 'Require tests for new files', value: 'requireNewFileTests', checked: true },
        { name: 'Fail on console statements', value: 'failOnConsole', checked: true },
        { name: 'Allow inline snapshots', value: 'allowInlineSnapshots', checked: false },
        { name: 'Enforce test naming conventions', value: 'enforceTestNaming', checked: true }
      ]
    }
  ]);
  
  return {
    enabled: true,
    framework: answers.framework,
    coverage: {
      threshold: answers.coverageThreshold,
      perFile: true
    },
    options: answers.options.reduce((acc, opt) => ({ ...acc, [opt]: true }), {})
  };
}

/**
 * Configure GitHub module
 */
async function configureGitHubModule() {
  const answers = await inquirer.prompt([
    {
      type: 'checkbox',
      name: 'features',
      message: 'Select GitHub features to enable:',
      choices: [
        { name: 'PR status checks', value: 'prChecks', checked: true },
        { name: 'Issue tracking', value: 'issueTracking', checked: true },
        { name: 'Auto-merge (when checks pass)', value: 'autoMerge', checked: false },
        { name: 'Branch cleanup', value: 'branchCleanup', checked: true },
        { name: 'PR templates', value: 'prTemplates', checked: true },
        { name: 'Issue templates', value: 'issueTemplates', checked: true }
      ]
    },
    {
      type: 'confirm',
      name: 'requireIssueReference',
      message: 'Require issue reference in PRs?',
      default: true
    },
    {
      type: 'confirm',
      name: 'autoAssignReviewers',
      message: 'Auto-assign reviewers?',
      default: false
    }
  ]);
  
  return {
    enabled: true,
    features: answers.features.reduce((acc, feat) => ({ ...acc, [feat]: true }), {}),
    requireIssueReference: answers.requireIssueReference,
    autoAssignReviewers: answers.autoAssignReviewers
  };
}

/**
 * Configure deployment module
 */
async function configureDeploymentModule() {
  const answers = await inquirer.prompt([
    {
      type: 'list',
      name: 'platform',
      message: 'Which deployment platform do you use?',
      choices: [
        'vercel',
        'netlify',
        'aws',
        'gcp',
        'azure',
        'heroku',
        'other'
      ]
    },
    {
      type: 'checkbox',
      name: 'environments',
      message: 'Which environments do you deploy to?',
      choices: [
        { name: 'Development', value: 'development', checked: true },
        { name: 'Staging', value: 'staging', checked: true },
        { name: 'Production', value: 'production', checked: true }
      ]
    },
    {
      type: 'confirm',
      name: 'requireStagingBeforeProduction',
      message: 'Require staging deployment before production?',
      default: true
    }
  ]);
  
  return {
    enabled: true,
    platform: answers.platform,
    environments: answers.environments,
    requireStagingBeforeProduction: answers.requireStagingBeforeProduction
  };
}

/**
 * Configure documentation module
 */
async function configureDocumentationModule() {
  const answers = await inquirer.prompt([
    {
      type: 'checkbox',
      name: 'requirements',
      message: 'Select documentation requirements:',
      choices: [
        { name: 'README.md', value: 'readme', checked: true },
        { name: 'API documentation', value: 'api', checked: true },
        { name: 'Code comments', value: 'comments', checked: true },
        { name: 'Architecture docs', value: 'architecture', checked: false },
        { name: 'CHANGELOG.md', value: 'changelog', checked: true }
      ]
    },
    {
      type: 'confirm',
      name: 'autoGenerateDocs',
      message: 'Auto-generate documentation from code?',
      default: false
    }
  ]);
  
  return {
    enabled: true,
    requirements: answers.requirements,
    autoGenerate: answers.autoGenerateDocs
  };
}

/**
 * Configure patterns module
 */
async function configurePatternsModule() {
  const answers = await inquirer.prompt([
    {
      type: 'checkbox',
      name: 'patterns',
      message: 'Select development patterns to enforce:',
      choices: [
        { name: 'File naming conventions', value: 'fileNaming', checked: true },
        { name: 'Code organization', value: 'codeOrganization', checked: true },
        { name: 'Error handling patterns', value: 'errorHandling', checked: true },
        { name: 'Async/await patterns', value: 'asyncPatterns', checked: true },
        { name: 'Component structure', value: 'componentStructure', checked: false }
      ]
    },
    {
      type: 'list',
      name: 'namingConvention',
      message: 'Preferred file naming convention:',
      choices: [
        { name: 'kebab-case', value: 'kebab' },
        { name: 'camelCase', value: 'camel' },
        { name: 'PascalCase', value: 'pascal' },
        { name: 'snake_case', value: 'snake' }
      ],
      default: 'kebab'
    }
  ]);
  
  return {
    enabled: true,
    enforce: answers.patterns,
    namingConvention: answers.namingConvention
  };
}

/**
 * Configure GitHub workflow module
 */
async function configureGitHubWorkflowModule() {
  const answers = await inquirer.prompt([
    {
      type: 'checkbox',
      name: 'workflows',
      message: 'Select workflows to enable:',
      choices: [
        { name: 'CI/CD pipeline', value: 'ci', checked: true },
        { name: 'Security scanning', value: 'security', checked: true },
        { name: 'Dependency updates', value: 'dependabot', checked: true },
        { name: 'Release automation', value: 'release', checked: false },
        { name: 'Code quality checks', value: 'quality', checked: true }
      ]
    },
    {
      type: 'confirm',
      name: 'pinActions',
      message: 'Enforce pinned action versions?',
      default: true
    },
    {
      type: 'confirm',
      name: 'restrictPermissions',
      message: 'Enforce restricted workflow permissions?',
      default: true
    }
  ]);
  
  return {
    enabled: true,
    workflows: answers.workflows,
    security: {
      pinActions: answers.pinActions,
      restrictPermissions: answers.restrictPermissions
    }
  };
}

/**
 * List current configuration
 */
async function listConfig() {
  const configPath = '.vibe-codex.json';
  
  if (!await fs.pathExists(configPath)) {
    console.log(chalk.yellow('No configuration found. Run "vibe-codex config" to create one.'));
    return;
  }
  
  const config = await fs.readJSON(configPath);
  console.log(chalk.blue('\n📋 Current vibe-codex Configuration:\n'));
  console.log(JSON.stringify(config, null, 2));
}

/**
 * Set a configuration value
 */
async function setConfig(key, value) {
  const configPath = '.vibe-codex.json';
  
  if (!await fs.pathExists(configPath)) {
    console.log(chalk.yellow('No configuration found. Run "vibe-codex config" to create one.'));
    return;
  }
  
  const config = await fs.readJSON(configPath);
  
  // Parse nested keys (e.g., "modules.testing.coverage.threshold")
  const keys = key.split('.');
  let current = config;
  
  for (let i = 0; i < keys.length - 1; i++) {
    if (!current[keys[i]]) {
      current[keys[i]] = {};
    }
    current = current[keys[i]];
  }
  
  // Try to parse value as JSON first
  try {
    current[keys[keys.length - 1]] = JSON.parse(value);
  } catch {
    // If not JSON, treat as string
    current[keys[keys.length - 1]] = value;
  }
  
  config.lastModified = new Date().toISOString();
  
  await fs.writeJSON(configPath, config, { spaces: 2 });
  console.log(chalk.green(`✅ Set ${key} = ${value}`));
}

/**
 * Reset configuration to defaults
 */
async function resetConfig() {
  const { confirmReset } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'confirmReset',
      message: 'Are you sure you want to reset to default configuration?',
      default: false
    }
  ]);
  
  if (!confirmReset) {
    console.log(chalk.yellow('Reset cancelled'));
    return;
  }
  
  const defaultConfig = createConfig({ projectType: 'custom', modules: ['core'] });
  await fs.writeJSON('.vibe-codex.json', defaultConfig, { spaces: 2 });
  console.log(chalk.green('✅ Configuration reset to defaults'));
}

/**
 * Export configuration
 */
async function exportConfig(outputPath) {
  const configPath = '.vibe-codex.json';
  
  if (!await fs.pathExists(configPath)) {
    console.log(chalk.yellow('No configuration found to export.'));
    return;
  }
  
  const config = await fs.readJSON(configPath);
  await fs.writeJSON(outputPath, config, { spaces: 2 });
  console.log(chalk.green(`✅ Configuration exported to ${outputPath}`));
}

/**
 * Import configuration
 */
async function importConfig(inputPath) {
  if (!await fs.pathExists(inputPath)) {
    console.log(chalk.red(`Configuration file not found: ${inputPath}`));
    return;
  }
  
  const importedConfig = await fs.readJSON(inputPath);
  
  // Validate imported config
  const validation = validateConfig(importedConfig);
  if (!validation.valid) {
    console.log(chalk.red('Invalid configuration:'));
    validation.errors.forEach(error => console.log(chalk.red(`  - ${error}`)));
    return;
  }
  
  const { confirmImport } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'confirmImport',
      message: 'Import this configuration? (This will overwrite existing config)',
      default: false
    }
  ]);
  
  if (confirmImport) {
    importedConfig.lastModified = new Date().toISOString();
    await fs.writeJSON('.vibe-codex.json', importedConfig, { spaces: 2 });
    console.log(chalk.green('✅ Configuration imported successfully'));
  }
}

/**
 * Preview configuration impact
 */
async function previewConfig() {
  const configPath = '.vibe-codex.json';
  
  if (!await fs.pathExists(configPath)) {
    console.log(chalk.yellow('No configuration found. Run "vibe-codex config" to create one.'));
    return;
  }
  
  const config = await fs.readJSON(configPath);
  
  console.log(chalk.blue('\n📊 vibe-codex Configuration Preview\n'));
  console.log(chalk.bold('Project Type:'), config.projectType);
  console.log(chalk.bold('Enforcement:'), config.enforcementLevel);
  
  console.log(chalk.blue('\n📦 Enabled Modules:'));
  Object.entries(config.modules).forEach(([name, moduleConfig]) => {
    if (moduleConfig.enabled) {
      console.log(chalk.green(`  ✓ ${name}`));
    }
  });
  
  // Calculate impact
  let totalRules = 0;
  let hookCount = 0;
  
  Object.values(config.modules).forEach(module => {
    if (module.enabled) {
      totalRules += 10; // Estimate
      hookCount += 2; // Estimate
    }
  });
  
  console.log(chalk.blue('\n📈 Estimated Impact:'));
  console.log(`  - Active rules: ~${totalRules}`);
  console.log(`  - Git hooks: ${hookCount}`);
  console.log(`  - Pre-commit time: ~${Math.ceil(totalRules / 10)} seconds`);
  console.log(`  - CI pipeline time: ~${Math.ceil(totalRules / 5)} minutes`);
}

module.exports = config;