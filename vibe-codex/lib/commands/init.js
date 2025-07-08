/**
 * Init command - Initialize vibe-codex in a project
 */

const chalk = require('chalk');
const ora = require('ora');
const inquirer = require('inquirer');
const fs = require('fs-extra');
const path = require('path');
const semver = require('semver');
const { detectProjectType, detectTestFramework } = require('../utils/detector');
const { preflightChecks } = require('../utils/preflight');
const { installGitHooks } = require('../installer/git-hooks');
const { installGitHubActions } = require('../installer/github-actions');
const { createConfiguration } = require('../utils/config-creator');

module.exports = async function init(options) {
  console.log(chalk.blue('\n🎯 Welcome to vibe-codex!\n'));
  
  const spinner = ora('Running pre-flight checks...').start();
  
  try {
    // Run pre-flight checks
    const { packageManager } = await preflightChecks(options);
    spinner.succeed('Pre-flight checks passed');
    
    // Detect or ask for project type
    let projectType = options.type;
    if (projectType === 'auto') {
      projectType = await detectProjectType();
      if (!projectType) {
        const answer = await inquirer.prompt([{
          type: 'list',
          name: 'projectType',
          message: 'What type of project is this?',
          choices: [
            { name: 'Web Application (Frontend)', value: 'web' },
            { name: 'API/Backend Service', value: 'api' },
            { name: 'Full-Stack Application', value: 'fullstack' },
            { name: 'npm Library/Package', value: 'library' },
            { name: 'Custom Configuration', value: 'custom' }
          ]
        }]);
        projectType = answer.projectType;
      } else {
        console.log(chalk.green(`✓ Detected project type: ${projectType}`));
      }
    }
    
    // Interactive configuration
    const answers = await configureModules(projectType);
    
    // Create configuration
    spinner.start('Creating configuration...');
    const config = await createConfiguration({
      ...answers,
      projectType
    });
    spinner.succeed('Configuration created');
    
    // Install git hooks
    if (!options.gitHooks === false) {
      spinner.start('Installing git hooks...');
      await installGitHooks(config);
      spinner.succeed('Git hooks installed');
    }
    
    // Install GitHub Actions
    if (answers.selectedModules.includes('github')) {
      spinner.start('Setting up GitHub Actions...');
      await installGitHubActions(config);
      spinner.succeed('GitHub Actions configured');
    }
    
    // Update package.json
    spinner.start('Updating package.json...');
    await updatePackageJson(config, packageManager);
    spinner.succeed('package.json updated');
    
    // Show success message and next steps
    showSuccessMessage(config);
    
  } catch (error) {
    spinner.fail(`Installation failed: ${error.message}`);
    throw error;
  }
};

async function configureModules(projectType) {
  // Module selection based on project type
  const defaultModules = getDefaultModules(projectType);
  
  const { selectedModules } = await inquirer.prompt([{
    type: 'checkbox',
    name: 'selectedModules',
    message: 'Select the features you want to enable:',
    choices: [
      { name: 'Testing & Coverage', value: 'testing', checked: defaultModules.includes('testing') },
      { name: 'GitHub Workflow Integration', value: 'github', checked: defaultModules.includes('github') },
      { name: 'Deployment Validation', value: 'deployment', checked: defaultModules.includes('deployment') },
      { name: 'Documentation Requirements', value: 'documentation', checked: defaultModules.includes('documentation') },
      { name: 'Code Quality (ESLint/Prettier)', value: 'quality', checked: defaultModules.includes('quality') }
    ]
  }]);
  
  // Module-specific configuration
  const moduleConfigs = {};
  
  if (selectedModules.includes('testing')) {
    const testFramework = await detectTestFramework() || 'jest';
    const { coverage } = await inquirer.prompt([{
      type: 'number',
      name: 'coverage',
      message: 'What should be your test coverage threshold?',
      default: 80,
      validate: (value) => value >= 0 && value <= 100
    }]);
    
    moduleConfigs.testing = {
      framework: testFramework,
      coverage: { threshold: coverage }
    };
  }
  
  if (selectedModules.includes('deployment')) {
    const { platform } = await inquirer.prompt([{
      type: 'list',
      name: 'platform',
      message: 'Which deployment platform do you use?',
      choices: [
        { name: 'Vercel', value: 'vercel' },
        { name: 'Netlify', value: 'netlify' },
        { name: 'AWS', value: 'aws' },
        { name: 'Other/None', value: 'none' }
      ]
    }]);
    
    moduleConfigs.deployment = { platform };
  }
  
  return {
    selectedModules,
    moduleConfigs
  };
}

function getDefaultModules(projectType) {
  const defaults = {
    web: ['testing', 'github', 'quality', 'documentation'],
    api: ['testing', 'github', 'documentation'],
    fullstack: ['testing', 'github', 'deployment', 'quality', 'documentation'],
    library: ['testing', 'github', 'documentation'],
    custom: []
  };
  
  return defaults[projectType] || [];
}

async function updatePackageJson(config, packageManager) {
  const pkgPath = 'package.json';
  
  if (!await fs.pathExists(pkgPath)) {
    console.log(chalk.yellow('⚠ No package.json found, skipping script updates'));
    return;
  }
  
  const pkg = await fs.readJSON(pkgPath);
  
  // Add vibe-codex scripts
  pkg.scripts = pkg.scripts || {};
  pkg.scripts['vibe:validate'] = 'vibe-codex validate';
  pkg.scripts['vibe:update'] = 'vibe-codex update';
  pkg.scripts['vibe:config'] = 'vibe-codex config';
  
  await fs.writeJSON(pkgPath, pkg, { spaces: 2 });
}

function showSuccessMessage(config) {
  console.log(chalk.green('\n✨ vibe-codex installed successfully!\n'));
  
  console.log(chalk.bold('Next steps:'));
  console.log('1. Review your configuration:');
  console.log(chalk.cyan('   cat .vibe-codex.json'));
  
  console.log('\n2. Run validation:');
  console.log(chalk.cyan('   npx vibe-codex validate'));
  
  console.log('\n3. Commit your changes:');
  console.log(chalk.cyan('   git add .'));
  console.log(chalk.cyan('   git commit -m "Add vibe-codex configuration"'));
  
  console.log('\nFor more help:');
  console.log(chalk.gray('   npx vibe-codex --help'));
  console.log(chalk.gray('   https://github.com/tyabonil/vibe-codex'));
}