/**
 * Validate command - Run validation checks against configured rules
 */

const chalk = require('chalk');
const ora = require('ora');
const fs = require('fs-extra');
const RuleValidator = require('../validator');

module.exports = async function validate(options) {
  const spinner = ora('Loading configuration...').start();
  
  try {
    // Load configuration
    const configPath = '.vibe-codex.json';
    if (!await fs.pathExists(configPath)) {
      spinner.fail('No vibe-codex configuration found');
      console.log(chalk.yellow('\nRun "npx vibe-codex init" to set up vibe-codex'));
      return;
    }
    
    const config = await fs.readJSON(configPath);
    spinner.succeed('Configuration loaded');
    
    console.log(chalk.blue('\n🔍 Running vibe-codex validation...\n'));
    
    // Create validator instance
    const validator = new RuleValidator(config);
    
    // Run validation
    spinner.start('Checking MANDATORY rules compliance...');
    const results = await validator.validate(options);
    spinner.stop();
    
    // Display results
    displayResults(results, options);
    
    // Exit with appropriate code
    const exitCode = results.violations.length > 0 ? 1 : 0;
    process.exitCode = exitCode;
    
  } catch (error) {
    spinner.fail(`Validation failed: ${error.message}`);
    throw error;
  }
};

/**
 * Display validation results
 * @param {Object} results - Validation results
 * @param {Object} options - Display options
 */
function displayResults(results, options) {
  // Display violations
  if (results.violations.length > 0) {
    console.log(chalk.red('\n❌ Violations Found:\n'));
    results.violations.forEach(violation => {
      console.log(chalk.red(`  • [${violation.rule}] ${violation.message}`));
      if (violation.fix) {
        console.log(chalk.gray(`    Fix: ${violation.fix}`));
      }
    });
  }
  
  // Display warnings
  if (results.warnings.length > 0) {
    console.log(chalk.yellow('\n⚠️  Warnings:\n'));
    results.warnings.forEach(warning => {
      console.log(chalk.yellow(`  • [${warning.rule}] ${warning.message}`));
      if (warning.fix) {
        console.log(chalk.gray(`    Fix: ${warning.fix}`));
      }
    });
  }
  
  // Display passed rules
  if (options.verbose && results.passed.length > 0) {
    console.log(chalk.green('\n✅ Passed:\n'));
    results.passed.forEach(pass => {
      console.log(chalk.green(`  • [${pass.rule}] ${pass.message}`));
    });
  }
  
  // Display summary
  console.log(chalk.blue('\n📊 Validation Summary:\n'));
  console.log(`  Total checks: ${results.summary.total}`);
  console.log(`  ${chalk.green('Passed')}: ${results.summary.passed}`);
  console.log(`  ${chalk.yellow('Warnings')}: ${results.summary.warnings}`);
  console.log(`  ${chalk.red('Violations')}: ${results.summary.violations}`);
  
  // Status message
  if (results.violations.length === 0) {
    console.log(chalk.green('\n✨ All mandatory rules passed!'));
  } else {
    console.log(chalk.red(`\n❌ ${results.violations.length} violation(s) must be fixed.`));
  }
  
  // JSON output
  if (options.json) {
    console.log('\nJSON Output:');
    console.log(JSON.stringify(results, null, 2));
  }
}