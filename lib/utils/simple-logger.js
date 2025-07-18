const chalk = require('chalk');

/**
 * Simple logger for consistent output formatting
 * Replaces ora spinners and complex UI elements
 */
class SimpleLogger {
  constructor(options = {}) {
    this.prefix = options.prefix || 'vibe-codex';
    this.quiet = options.quiet || false;
    this.json = options.json || false;
    this.verboseMode = options.verbose || false;
  }

  /**
   * Log a message with optional type
   * @param {string} message - The message to log
   * @param {string} type - Type of message (info, success, error, warning)
   */
  log(message, type = 'info') {
    if (this.quiet) return;

    if (this.json) {
      console.log(JSON.stringify({
        timestamp: new Date().toISOString(),
        type,
        message,
        prefix: this.prefix
      }));
      return;
    }

    const prefix = `${this.prefix}:`;
    
    switch (type) {
      case 'success':
        console.log(chalk.green(`${prefix} ${message}`));
        break;
      case 'error':
        console.error(chalk.red(`${prefix} error: ${message}`));
        break;
      case 'warning':
        console.warn(chalk.yellow(`${prefix} warning: ${message}`));
        break;
      case 'verbose':
        if (this.verboseMode) {
          console.log(chalk.gray(`${prefix} ${message}`));
        }
        break;
      case 'info':
      default:
        console.log(`${prefix} ${message}`);
        break;
    }
  }

  /**
   * Convenience methods
   */
  info(message) {
    this.log(message, 'info');
  }

  success(message) {
    this.log(message, 'success');
  }

  error(message) {
    this.log(message, 'error');
  }

  warning(message) {
    this.log(message, 'warning');
  }

  verbose(message) {
    this.log(message, 'verbose');
  }

  /**
   * Start a task (replaces ora spinner)
   * @param {string} message - Task description
   * @returns {Object} Task object with succeed/fail methods
   */
  startTask(message) {
    this.log(message + '...', 'info');
    
    return {
      succeed: (successMessage) => {
        this.success(successMessage || 'done');
      },
      fail: (errorMessage) => {
        this.error(errorMessage || 'failed');
      }
    };
  }

  /**
   * Log a list of items
   * @param {Array} items - Items to list
   * @param {Object} options - Formatting options
   */
  list(items, options = {}) {
    if (this.quiet) return;

    if (this.json) {
      console.log(JSON.stringify({
        type: 'list',
        items,
        ...options
      }));
      return;
    }

    items.forEach(item => {
      if (typeof item === 'string') {
        console.log(`  ${item}`);
      } else if (typeof item === 'object') {
        const { name, value, status } = item;
        let line = `  ${name || value}`;
        if (status) {
          line += ` [${status}]`;
        }
        console.log(line);
      }
    });
  }

  /**
   * Create a section header
   * @param {string} title - Section title
   */
  section(title) {
    if (this.quiet || this.json) return;
    console.log(`\n${chalk.bold(title)}`);
  }

  /**
   * Clear any previous output (no-op for simple logger)
   */
  clear() {
    // No-op - we don't clear output in simple mode
  }

  /**
   * Set options dynamically
   * @param {Object} options - Options to set
   */
  setOptions(options) {
    Object.assign(this, options);
  }
}

// Singleton instance for global use
let instance;

/**
 * Get or create the logger instance
 * @param {Object} options - Logger options
 * @returns {SimpleLogger} Logger instance
 */
function getLogger(options) {
  if (!instance) {
    instance = new SimpleLogger(options);
  } else if (options) {
    instance.setOptions(options);
  }
  return instance;
}

module.exports = {
  SimpleLogger,
  getLogger
};