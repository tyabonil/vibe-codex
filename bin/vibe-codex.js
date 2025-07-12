#!/usr/bin/env node

/**
 * vibe-codex CLI
 * Interactive configuration and rule management for development workflows
 */

const { program } = require('commander');
const chalk = require('chalk');
const packageJson = require('../package.json');

// Display banner
console.log(chalk.blue(`
╔═══════════════════════════════════════╗
║           vibe-codex v${packageJson.version}          ║
║   Interactive Development Workflow    ║
╚═══════════════════════════════════════╝
`));

// Set up the main program
program
  .name('vibe-codex')
  .description('Interactive configuration and rule management for development workflows')
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
  .option('-f, --force', 'overwrite existing configuration')
  .option('-m, --minimal', 'create minimal configuration')
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

// Config command - Interactive configuration management
program
  .command('config')
  .description('Interactive configuration management')
  .option('-l, --list', 'list current configuration')
  .option('-s, --set <key> <value>', 'set a configuration value')
  .option('-r, --reset', 'reset to default configuration')
  .option('-e, --export <path>', 'export configuration to file')
  .option('-i, --import <path>', 'import configuration from file')
  .option('-p, --preview', 'preview configuration impact')
  .action(async (options) => {
    try {
      const config = require('../lib/commands/config-v3');
      await config(options);
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
  .option('-l, --level <level>', 'minimum rule level to check (1-5)', '3')
  .option('-m, --module <modules...>', 'only check specific modules')
  .option('-f, --fix', 'attempt to auto-fix violations')
  .option('-j, --json', 'output results as JSON')
  .option('-v, --verbose', 'show detailed output')
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

// Doctor command - Diagnose and fix common vibe-codex issues
program
  .command('doctor')
  .description('Diagnose and fix common vibe-codex issues')
  .option('-f, --fix', 'attempt to fix issues automatically')
  .option('-v, --verbose', 'show detailed diagnostic information')
  .action(async (options) => {
    try {
      const doctor = require('../lib/commands/doctor');
      await doctor(options);
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
  .option('-c, --check', 'check for updates without installing')
  .option('--force', 'force update even if no changes detected')
  .option('-m, --module <modules...>', 'update specific modules only')
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

// Status command - Show vibe-codex status and statistics
program
  .command('status')
  .description('Show vibe-codex status and statistics')
  .option('-d, --detailed', 'show detailed statistics')
  .option('--json', 'output as JSON')
  .option('-m, --module <module>', 'show status for specific module')
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

// Module management commands
const moduleCmd = program
  .command('module')
  .description('Manage vibe-codex modules');

moduleCmd
  .command('list')
  .description('List available modules')
  .action(async () => {
    try {
      const moduleLoader = require('../lib/modules/loader');
      const modules = moduleLoader.getAvailableModules();
      
      console.log(chalk.blue('\n📦 Available vibe-codex Modules:\n'));
      
      modules.forEach(module => {
        console.log(chalk.bold(`  ${module.name}`));
        console.log(chalk.gray(`    ${module.description}`));
        console.log(chalk.gray(`    Version: ${module.version}`));
        console.log();
      });
    } catch (error) {
      console.error(chalk.red('Error:'), error.message);
      if (program.opts().debug) {
        console.error(error.stack);
      }
      process.exit(1);
    }
  });

moduleCmd
  .command('enable <module>')
  .description('Enable a module')
  .action(async (moduleName) => {
    try {
      console.log(chalk.green(`Enabling module: ${moduleName}`));
      // Implementation would modify config
    } catch (error) {
      console.error(chalk.red('Error:'), error.message);
      if (program.opts().debug) {
        console.error(error.stack);
      }
      process.exit(1);
    }
  });

moduleCmd
  .command('disable <module>')
  .description('Disable a module')
  .action(async (moduleName) => {
    try {
      console.log(chalk.yellow(`Disabling module: ${moduleName}`));
      // Implementation would modify config
    } catch (error) {
      console.error(chalk.red('Error:'), error.message);
      if (program.opts().debug) {
        console.error(error.stack);
      }
      process.exit(1);
    }
  });

// Hook management commands
const hookCmd = program
  .command('hook')
  .description('Manage git hooks');

hookCmd
  .command('install')
  .description('Install git hooks')
  .action(async () => {
    try {
      const gitHooks = require('../lib/installer/git-hooks');
      const fs = require('fs-extra');
      const configPath = '.vibe-codex.json';
      
      let config = {};
      if (await fs.pathExists(configPath)) {
        config = await fs.readJSON(configPath);
      }
      
      await gitHooks.installGitHooks(config);
      console.log(chalk.green('✅ Git hooks installed'));
    } catch (error) {
      console.error(chalk.red('Error:'), error.message);
      if (program.opts().debug) {
        console.error(error.stack);
      }
      process.exit(1);
    }
  });

hookCmd
  .command('uninstall')
  .description('Uninstall git hooks')
  .action(async () => {
    try {
      const gitHooks = require('../lib/installer/git-hooks');
      await gitHooks.uninstallGitHooks();
      console.log(chalk.yellow('Git hooks uninstalled'));
    } catch (error) {
      console.error(chalk.red('Error:'), error.message);
      if (program.opts().debug) {
        console.error(error.stack);
      }
      process.exit(1);
    }
  });

// Update issues command - Interactive issue update interface
program
  .command('update-issues')
  .description('Interactively update related GitHub issues')
  .option('--dry-run', 'show what would be updated without making changes')
  .action(async (options) => {
    try {
      const updateIssues = require('../lib/commands/update-issues');
      await updateIssues(options);
    } catch (error) {
      console.error(chalk.red('Error:'), error.message);
      if (program.opts().debug) {
        console.error(error.stack);
      }
      process.exit(1);
    }
  });

// Check issue updates command - Used by git hooks
program
  .command('check-issue-updates')
  .description('Check if issues need updates (used by git hooks)')
  .option('--hook <hook>', 'specify which hook is calling (post-commit, pre-push)')
  .action(async (options) => {
    try {
      const checkIssueUpdates = require('../lib/commands/check-issue-updates');
      await checkIssueUpdates(options);
    } catch (error) {
      // Don't output errors for hook commands
      if (program.opts().debug) {
        console.error(error.stack);
      }
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