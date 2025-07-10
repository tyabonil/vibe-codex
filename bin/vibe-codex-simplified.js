#!/usr/bin/env node

/**
 * vibe-codex - Simple CLI tool to install development rules and git hooks
 */

const chalk = require('chalk');
const { mainMenu } = require('../lib/menu');

// Simple argument handling
const args = process.argv.slice(2);
const command = args[0];

// Display banner
console.log(chalk.blue(`
╔═══════════════════════════════════════╗
║           vibe-codex v3.0.0           ║
║     Simple Rules & Hooks Installer    ║
╚═══════════════════════════════════════╝
`));

async function main() {
  try {
    // Handle direct commands
    switch (command) {
      case 'init':
        const { init } = require('../lib/commands');
        await init();
        break;
      
      case 'config':
        const { config } = require('../lib/commands');
        await config();
        break;
      
      case 'uninstall':
        const { uninstall } = require('../lib/commands');
        await uninstall();
        break;
      
      case 'help':
      case '--help':
      case '-h':
        showHelp();
        break;
      
      case 'version':
      case '--version':
      case '-v':
        console.log('3.0.0');
        break;
      
      default:
        // No command or unknown command - show interactive menu
        if (command && !command.startsWith('-')) {
          console.log(chalk.yellow(`Unknown command: ${command}\n`));
        }
        await mainMenu();
        break;
    }
  } catch (error) {
    console.error(chalk.red('\n❌ Error:'), error.message);
    process.exit(1);
  }
}

function showHelp() {
  console.log(`
${chalk.bold('Usage:')} vibe-codex [command]

${chalk.bold('Commands:')}
  init        Initialize vibe-codex in your project
  config      Configure rules and hooks
  uninstall   Remove vibe-codex from your project
  help        Show this help message
  version     Show version

${chalk.bold('Interactive Mode:')}
  Run without any command to use the interactive menu

${chalk.bold('Examples:')}
  ${chalk.gray('# Interactive setup (recommended)')}
  npx vibe-codex

  ${chalk.gray('# Quick initialization')}
  npx vibe-codex init

  ${chalk.gray('# Configure rules')}
  npx vibe-codex config
`);
}

// Run the main function
main().catch(error => {
  console.error(chalk.red('Fatal error:'), error);
  process.exit(1);
});