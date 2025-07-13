/**
 * Init command - Initialize vibe-codex in a project
 */

const chalk = require('chalk');
const ora = require('ora');
const inquirer = require('../utils/inquirer-fix');
const fs = require('fs-extra');
const path = require('path');
const semver = require('semver');
const { detectProjectType, detectTestFramework } = require('../utils/detector');
const { preflightChecks } = require('../utils/preflight');
const { installGitHooks } = require('../installer/git-hooks');
const { installGitHubActions } = require('../installer/github-actions');
const { installLocalRules } = require('../installer/local-rules');
const { createConfiguration } = require('../utils/config-creator');
const moduleLoader = require('../modules/loader-wrapper');
const { configExamples } = require('../modules/config-schema-commonjs');
const { validateSetup, getInstallInstructions } = require('../utils/package-manager');
const logger = require('../utils/logger');
const { createRollbackPoint, rollback } = require('../utils/rollback');

module.exports = async function init(options) {
  console.log(chalk.blue('\n🎯 Welcome to vibe-codex!\n'));
  
  const spinner = ora('Running pre-flight checks...').start();
  let rollbackPath = null;
  
  try {
    // Validate package manager setup
    const setupValidation = await validateSetup();
    
    if (setupValidation.errors.length > 0) {
      spinner.fail('Setup validation failed');
      logger.output(chalk.red('\n❌ Setup errors:'));
      setupValidation.errors.forEach(err => logger.output(chalk.red(`   - ${err}`)));
      process.exit(1);
    }
    
    if (setupValidation.warnings.length > 0) {
      spinner.warn('Setup validation completed with warnings');
      logger.output(chalk.yellow('\n⚠️  Warnings:'));
      setupValidation.warnings.forEach(warn => logger.output(chalk.yellow(`   - ${warn}`)));
      
      if (!setupValidation.npxAvailable) {
        const instructions = getInstallInstructions(setupValidation.packageManager);
        console.log(chalk.blue('\n💡 To ensure best compatibility, consider upgrading npm:'));
        console.log(chalk.cyan('   npm install -g npm@latest'));
        console.log(chalk.blue('\nOr install vibe-codex locally:'));
        console.log(chalk.cyan(`   ${instructions.local}`));
      }
    } else {
      spinner.succeed('Setup validation passed');
    }
    
    // Run pre-flight checks
    const { packageManager } = await preflightChecks(options);
    spinner.succeed('Pre-flight checks passed');
    
    // Create rollback point after pre-flight checks
    if (!options.skipRollback) {
      spinner.start('Creating rollback point...');
      rollbackPath = await createRollbackPoint();
      spinner.succeed('Rollback point created');
    }
    
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
        logger.output(chalk.green(`✓ Detected project type: ${projectType}`));
      }
    }
    
    // Ask about module selection for modular rules
    let selectedModules = {};
    if (options.modules !== 'all') {
      const { useModular } = await inquirer.prompt([{
        type: 'confirm',
        name: 'useModular',
        message: 'Would you like to customize which rule modules to install?',
        default: true
      }]);
      
      if (useModular) {
        const { modules } = await inquirer.prompt([{
          type: 'checkbox',
          name: 'modules',
          message: 'Select rule modules to install:',
          choices: [
            { name: 'Core (Essential security & workflow rules)', value: 'core', checked: true, disabled: true },
            { name: 'GitHub Workflow (PR templates, issue tracking)', value: 'github-workflow', checked: true },
            { name: 'Testing (Test coverage, framework rules)', value: 'testing', checked: projectType !== 'library' },
            { name: 'Deployment (Platform-specific checks)', value: 'deployment', checked: projectType === 'fullstack' },
            { name: 'Documentation (README, architecture docs)', value: 'documentation', checked: true },
            { name: 'Development Patterns (Code organization)', value: 'patterns', checked: false }
          ]
        }]);
        
        modules.forEach(mod => {
          selectedModules[mod] = { enabled: true };
        });
      } else {
        // Use preset based on project type
        if (projectType === 'fullstack') {
          selectedModules = configExamples.fullStack.modules;
        } else if (projectType === 'web' || projectType === 'api') {
          selectedModules = configExamples.frontend.modules;
        } else {
          selectedModules = configExamples.minimal.modules;
        }
      }
    } else {
      // Install all modules
      selectedModules = {
        core: { enabled: true },
        'github-workflow': { enabled: true },
        testing: { enabled: true },
        deployment: { enabled: true },
        documentation: { enabled: true },
        patterns: { enabled: true }
      };
    }
    
    // Create vibe-codex configuration
    spinner.start('Creating configuration...');
    const vibeCodexConfig = {
      version: '2.0.0',
      modules: selectedModules,
      projectType
    };
    
    // Save configuration
    await fs.writeFile(
      path.join(process.cwd(), '.vibe-codex.json'),
      JSON.stringify(vibeCodexConfig, null, 2)
    );
    
    // Create legacy configuration for backward compatibility
    const config = await createConfiguration({
      selectedModules: Object.keys(selectedModules).filter(m => selectedModules[m].enabled),
      projectType
    });
    spinner.succeed('Configuration created');
    
    // Install local rules and related files
    spinner.start('Installing vibe-codex rules...');
    await installLocalRules(vibeCodexConfig, options);
    spinner.succeed('vibe-codex rules installed');
    
    // Install git hooks
    if (!options.gitHooks === false) {
      spinner.start('Installing git hooks...');
      await installGitHooks(config);
      spinner.succeed('Git hooks installed');
    }
    
    // Install GitHub Actions
    if (selectedModules['github-workflow'] && selectedModules['github-workflow'].enabled) {
      spinner.start('Setting up GitHub Actions...');
      await installGitHubActions(config);
      spinner.succeed('GitHub Actions configured');
    }
    
    // Update package.json
    spinner.start('Updating package.json...');
    await updatePackageJson(config, packageManager);
    spinner.succeed('package.json updated');
    
    // Initialize module loader to validate configuration
    spinner.start('Validating module configuration...');
    await moduleLoader.initialize(process.cwd());
    spinner.succeed('Module configuration validated');
    
    // Run initial validation
    spinner.start('Running initial validation...');
    const validate = require('./validate');
    const validationResult = await validate({ json: true, silent: true });
    
    if (!validationResult.valid) {
      spinner.warn(`Initial validation found ${validationResult.violations.length} issues`);
    } else {
      spinner.succeed('Initial validation passed');
    }
    
    // Show success message and next steps
    showSuccessMessage(config, selectedModules, setupValidation.packageManager);
    
  } catch (error) {
    spinner.fail(`Installation failed: ${error.message}`);
    
    // Attempt rollback on failure
    if (rollbackPath && !options.skipRollback) {
      console.log(chalk.yellow('\n⚠️  Attempting to rollback changes...'));
      try {
        await rollback(rollbackPath);
        console.log(chalk.green('✓ Successfully rolled back changes'));
      } catch (rollbackError) {
        console.error(chalk.red('❌ Rollback failed:'), rollbackError.message);
        console.log(chalk.yellow('Manual cleanup may be required'));
      }
    }
    
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
    logger.warn('No package.json found, skipping script updates');
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

function showSuccessMessage(config, selectedModules, packageManager = 'npm') {
  console.log(chalk.green('\n✨ vibe-codex installed successfully!\n'));
  
  console.log(chalk.bold('Installed modules:'));
  Object.entries(selectedModules).forEach(([name, config]) => {
    if (config.enabled) {
      console.log(chalk.green(`  ✓ ${name}`));
    }
  });
  
  const { getRunCommand } = require('../utils/package-manager');
  const runCmd = getRunCommand(packageManager, false);
  
  console.log(chalk.bold('\nNext steps:'));
  console.log('1. Review your configuration:');
  console.log(chalk.cyan('   cat .vibe-codex.json'));
  
  console.log('\n2. Run validation:');
  if (packageManager === 'npm' || runCmd.includes('npx')) {
    console.log(chalk.cyan('   npx vibe-codex validate'));
  } else {
    console.log(chalk.cyan(`   ${runCmd} vibe-codex validate`));
  }
  
  console.log('\n3. Configure additional modules:');
  if (packageManager === 'npm' || runCmd.includes('npx')) {
    console.log(chalk.cyan('   npx vibe-codex config'));
  } else {
    console.log(chalk.cyan(`   ${runCmd} vibe-codex config`));
  }
  
  console.log('\n4. Commit your changes:');
  console.log(chalk.cyan('   git add .'));
  console.log(chalk.cyan('   git commit -m "feat: add vibe-codex configuration"'));
  
  console.log(chalk.bold('\n💡 Tips:'));
  console.log(`  - Git hooks are installed and will run automatically`);
  console.log(`  - To skip hooks temporarily: SKIP_VIBE_CODEX=1 git commit ...`);
  console.log(`  - Package manager detected: ${packageManager}`);
  
  console.log('\nFor more help:');
  console.log(chalk.gray(`   ${packageManager === 'npm' ? 'npx' : runCmd} vibe-codex --help`));
  console.log(chalk.gray('   https://github.com/tyabonil/vibe-codex'));
}