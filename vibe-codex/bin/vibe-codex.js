#!/usr/bin/env node

const { program } = require('commander');
const packageJson = require('../package.json');
const chalk = require('chalk');

// Set up the main program
program
  .name('vibe-codex')
  .description(packageJson.description)
  .version(packageJson.version, '-v, --version', 'output the current version')
  .option('-d, --debug', 'enable debug mode');

// Init command - Initialize vibe-codex in your project
program
  .command('init')
  .description('Initialize vibe-codex in your project')
  .option('-t, --type <type>', 'project type (web, api, fullstack, library)', 'auto')
  .option('-c, --config <path>', 'path to configuration file')
  .option('--skip-install', 'skip dependency installation')
  .option('--no-git-hooks', 'skip git hook installation')
  .option('--force', 'overwrite existing configuration')
  .action(async (options) => {
    try {
      const init = require('../lib/commands/init');
      await init(options);
    } catch (error) {
      console.error(chalk.red('Error:'), error.message);
      if (program.opts().debug) {
        console.error(error.stack);
      }
      process.exit(1);
    }
  });

// Config command - Configure vibe-codex modules and settings
program
  .command('config [action]')
  .description('Configure vibe-codex modules and settings')
  .option('-l, --list', 'list current configuration')
  .option('-s, --set <key=value>', 'set configuration value')
  .option('-r, --reset', 'reset to defaults')
  .option('-e, --export', 'export configuration')
  .option('-i, --import <file>', 'import configuration from file')
  .action(async (action, options) => {
    try {
      const config = require('../lib/commands/config');
      await config(action, options);
    } catch (error) {
      console.error(chalk.red('Error:'), error.message);
      if (program.opts().debug) {
        console.error(error.stack);
      }
      process.exit(1);
    }
  });

// Update command - Update vibe-codex rules and modules
program
  .command('update')
  .description('Update vibe-codex rules and modules')
  .option('--check', 'check for updates without installing')
  .option('--force', 'force update even if no changes detected')
  .action(async (options) => {
    try {
      const update = require('../lib/commands/update');
      await update(options);
    } catch (error) {
      console.error(chalk.red('Error:'), error.message);
      if (program.opts().debug) {
        console.error(error.stack);
      }
      process.exit(1);
    }
  });

// Validate command - Validate project against configured rules
program
  .command('validate')
  .description('Validate project against configured rules')
  .option('--fix', 'attempt to auto-fix violations')
  .option('--json', 'output results as JSON')
  .option('-m, --module <name>', 'validate specific module only')
  .action(async (options) => {
    try {
      const validate = require('../lib/commands/validate');
      await validate(options);
    } catch (error) {
      console.error(chalk.red('Error:'), error.message);
      if (program.opts().debug) {
        console.error(error.stack);
      }
      process.exit(1);
    }
  });

// Status command - Show vibe-codex installation status
program
  .command('status')
  .description('Show vibe-codex installation status')
  .option('--json', 'output as JSON')
  .action(async (options) => {
    try {
      const status = require('../lib/commands/status');
      await status(options);
    } catch (error) {
      console.error(chalk.red('Error:'), error.message);
      if (program.opts().debug) {
        console.error(error.stack);
      }
      process.exit(1);
    }
  });

// Handle unknown commands
program.on('command:*', function () {
  console.error(chalk.red('Invalid command:'), program.args.join(' '));
  console.log('See --help for a list of available commands.');
  process.exit(1);
});

// Show help if no command provided
if (!process.argv.slice(2).length) {
  program.outputHelp();
}

// Parse command line arguments
program.parse(process.argv);