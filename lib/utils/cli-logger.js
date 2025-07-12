/**
 * CLI Logger utility
 * Provides consistent logging interface for CLI commands
 * In production, this outputs to console as needed for CLI interaction
 */

const chalk = require('chalk');

// For CLI tools, console output is the primary interface
// This wrapper allows for future enhancements like log levels or output redirection
const logger = {
  log: (...args) => console.log(...args),
  error: (...args) => console.error(...args),
  warn: (...args) => console.warn(...args),
  info: (...args) => console.log(...args),
  debug: (...args) => {
    if (process.env.DEBUG || process.env.NODE_ENV === 'development') {
      console.log(chalk.gray('[DEBUG]'), ...args);
    }
  },
  // Colored output helpers
  success: (message) => console.log(chalk.green(message)),
  warning: (message) => console.log(chalk.yellow(message)),
  danger: (message) => console.error(chalk.red(message)),
  blue: (message) => console.log(chalk.blue(message)),
  gray: (message) => console.log(chalk.gray(message)),
  bold: (message) => console.log(chalk.bold(message))
};

module.exports = logger;