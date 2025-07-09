#!/usr/bin/env node

/**
 * vibe-codex CLI
 * Interactive configuration and rule management for development workflows
 */

const { program } = require('commander');
const chalk = require('chalk');
const packageJson = require('../package.json');

// Commands
const init = require('../lib/commands/init');
const config = require('../lib/commands/config');
const validate = require('../lib/commands/validate');
const doctor = require('../lib/commands/doctor');
const update = require('../lib/commands/update');
const status = require('../lib/commands/status');

// Display banner
console.log(chalk.blue(`
╔═══════════════════════════════════════╗
║           vibe-codex v${packageJson.version}          ║
║   Interactive Development Workflow    ║
╚═══════════════════════════════════════╝
`));

// Main program
program
  .name('vibe-codex')
  .description('Interactive configuration and rule management for development workflows')
  .version(packageJson.version);

// Init command
program
  .command('init')
  .description('Initialize vibe-codex in your project')
  .option('-f, --force', 'Force initialization (overwrite existing config)')
  .option('-m, --minimal', 'Create minimal configuration')
  .option('-t, --type <type>', 'Project type (web, api, fullstack, library)')
  .action(init);

// Config command - NEW!
program
  .command('config')
  .description('Interactive configuration management')
  .option('-l, --list', 'List current configuration')
  .option('-s, --set <key> <value>', 'Set a configuration value')
  .option('-r, --reset', 'Reset to default configuration')
  .option('-e, --export <path>', 'Export configuration to file')
  .option('-i, --import <path>', 'Import configuration from file')
  .option('-p, --preview', 'Preview configuration impact')
  .action(config);

// Validate command
program
  .command('validate')
  .description('Run validation checks against configured rules')
  .option('-l, --level <level>', 'Minimum rule level to check (1-5)', '3')
  .option('-m, --module <modules...>', 'Only check specific modules')
  .option('-f, --fix', 'Attempt to auto-fix violations')
  .option('-j, --json', 'Output results as JSON')
  .option('-v, --verbose', 'Show detailed output')
  .action(validate);

// Doctor command
program
  .command('doctor')
  .description('Diagnose and fix common vibe-codex issues')
  .option('-f, --fix', 'Attempt to fix issues automatically')
  .option('-v, --verbose', 'Show detailed diagnostic information')
  .action(doctor);

// Update command
program
  .command('update')
  .description('Update vibe-codex rules and modules')
  .option('-c, --check', 'Check for updates without installing')
  .option('-m, --module <modules...>', 'Update specific modules only')
  .action(update);

// Status command
program
  .command('status')
  .description('Show vibe-codex status and statistics')
  .option('-d, --detailed', 'Show detailed statistics')
  .option('-m, --module <module>', 'Show status for specific module')
  .action(status);

// Module management commands
const moduleCmd = program
  .command('module')
  .description('Manage vibe-codex modules');

moduleCmd
  .command('list')
  .description('List available modules')
  .action(async () => {
    const moduleLoader = require('../lib/modules/loader');
    const modules = moduleLoader.getAvailableModules();
    
    console.log(chalk.blue('\n📦 Available vibe-codex Modules:\n'));
    
    modules.forEach(module => {
      console.log(chalk.bold(`  ${module.name}`));
      console.log(chalk.gray(`    ${module.description}`));
      console.log(chalk.gray(`    Version: ${module.version}`));
      console.log();
    });
  });

moduleCmd
  .command('enable <module>')
  .description('Enable a module')
  .action(async (moduleName) => {
    console.log(chalk.green(`Enabling module: ${moduleName}`));
    // Implementation would modify config
  });

moduleCmd
  .command('disable <module>')
  .description('Disable a module')
  .action(async (moduleName) => {
    console.log(chalk.yellow(`Disabling module: ${moduleName}`));
    // Implementation would modify config
  });

// Hook management commands
const hookCmd = program
  .command('hook')
  .description('Manage git hooks');

hookCmd
  .command('install')
  .description('Install git hooks')
  .action(async () => {
    const gitHooks = require('../lib/installer/git-hooks');
    const config = require('../lib/utils/config-loader').load();
    await gitHooks.installGitHooks(config);
    console.log(chalk.green('✅ Git hooks installed'));
  });

hookCmd
  .command('uninstall')
  .description('Uninstall git hooks')
  .action(async () => {
    const gitHooks = require('../lib/installer/git-hooks');
    await gitHooks.uninstallGitHooks();
    console.log(chalk.yellow('Git hooks uninstalled'));
  });

// Error handling
program.exitOverride();

try {
  program.parse(process.argv);
} catch (error) {
  if (error.code === 'commander.unknownCommand') {
    console.error(chalk.red(`\n❌ Unknown command: ${error.message}\n`));
    program.outputHelp();
  } else if (error.code === 'commander.help') {
    // Help was requested, exit gracefully
    process.exit(0);
  } else {
    console.error(chalk.red(`\n❌ Error: ${error.message}\n`));
    process.exit(1);
  }
}

// Show help if no command provided
if (!process.argv.slice(2).length) {
  program.outputHelp();
}