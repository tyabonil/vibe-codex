/**
 * Logger utility for vibe-codex
 * Provides environment-aware logging with levels
 */

import chalk from 'chalk';

class Logger {
  constructor(name = 'vibe-codex') {
    this.name = name;
    this.isDevelopment = process.env.NODE_ENV === 'development';
    this.isDebug = process.env.DEBUG || process.env.VIBE_CODEX_DEBUG;
    this.isSilent = process.env.VIBE_CODEX_SILENT || process.env.CI;
  }

  log(level, message, ...args) {
    if (this.isSilent && level !== 'error') return;
    
    const timestamp = new Date().toISOString();
    const prefix = this.isDevelopment ? `[${timestamp}] [${this.name}]` : `[${this.name}]`;
    
    switch (level) {
      case 'error':
        console.error(chalk.red(`${prefix} ERROR:`), message, ...args);
        break;
      case 'warn':
        if (!this.isSilent) {
          console.warn(chalk.yellow(`${prefix} WARN:`), message, ...args);
        }
        break;
      case 'info':
        if (!this.isSilent) {
          console.info(chalk.blue(`${prefix} INFO:`), message, ...args);
        }
        break;
      case 'debug':
        if (this.isDebug) {
          console.debug(chalk.gray(`${prefix} DEBUG:`), message, ...args);
        }
        break;
      case 'success':
        if (!this.isSilent) {
          console.log(chalk.green(`${prefix} SUCCESS:`), message, ...args);
        }
        break;
      default:
        if (!this.isSilent) {
          console.log(`${prefix}`, message, ...args);
        }
    }
  }

  error(message, ...args) {
    this.log('error', message, ...args);
  }

  warn(message, ...args) {
    this.log('warn', message, ...args);
  }

  info(message, ...args) {
    this.log('info', message, ...args);
  }

  debug(message, ...args) {
    this.log('debug', message, ...args);
  }

  success(message, ...args) {
    this.log('success', message, ...args);
  }

  // For CLI output that should always show (not logging)
  output(message, ...args) {
    console.log(message, ...args);
  }
}

// Create singleton instance
const logger = new Logger();

// Export both the class and instance
export default logger;
export { Logger };