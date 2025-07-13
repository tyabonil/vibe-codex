/**
 * Validate command - Run validation checks against configured rules
 */

const chalk = require('chalk');
const ora = require('ora');
const fs = require('fs-extra');
const RuleValidator = require('../validator');
const moduleLoader = require('../modules/loader-wrapper');
const logger = require('../utils/logger');

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
    
    // Initialize module loader
    spinner.start('Loading rule modules...');
    await moduleLoader.initialize(process.cwd());
    const loadedModules = moduleLoader.getLoadedModules();
    spinner.succeed(`Loaded ${loadedModules.length} modules: ${loadedModules.join(', ')}`);
    
    // Run validation with modular rules
    spinner.start('Checking rules compliance...');
    const results = await runModularValidation(options);
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
/**
 * Run modular validation
 * @param {Object} options - Validation options
 * @returns {Promise<Object>} - Validation results
 */
async function runModularValidation(options) {
  const results = {
    violations: [],
    warnings: [],
    passed: [],
    summary: {}
  };

  // Get all rules from loaded modules
  const rules = moduleLoader.getAllRules();
  
  // Group rules by level
  const rulesByLevel = {};
  rules.forEach(rule => {
    if (!rulesByLevel[rule.level]) {
      rulesByLevel[rule.level] = [];
    }
    rulesByLevel[rule.level].push(rule);
  });

  // Create validation context
  const context = {
    projectPath: process.cwd(),
    files: await getProjectFiles(options),
    branch: await getCurrentBranch(),
    commits: await getRecentCommits(),
    pr: await getCurrentPR(),
    issue: await getCurrentIssue()
  };

  // Run rules by level
  for (const [level, levelRules] of Object.entries(rulesByLevel)) {
    console.log(chalk.blue(`\nChecking Level ${level} rules...`));
    
    for (const rule of levelRules) {
      try {
        const violations = await rule.check(context);
        
        if (violations.length > 0) {
          violations.forEach(v => {
            results.violations.push({
              rule: rule.id,
              name: rule.name,
              level: rule.level,
              module: rule.module,
              severity: rule.severity,
              ...v
            });
          });
          console.log(chalk.red(`  ✗ ${rule.name}`));
        } else {
          results.passed.push(rule);
          console.log(chalk.green(`  ✓ ${rule.name}`));
        }
      } catch (error) {
        console.log(chalk.yellow(`  ⚠ ${rule.name}: ${error.message}`));
        results.warnings.push({
          rule: rule.id,
          name: rule.name,
          error: error.message
        });
      }
    }
  }

  // Calculate summary
  results.summary = {
    total: rules.length,
    passed: results.passed.length,
    violations: results.violations.length,
    warnings: results.warnings.length,
    score: Math.round((results.passed.length / rules.length) * 100)
  };

  return results;
}

async function getProjectFiles(options) {
  // Implementation would scan project files
  return [];
}

async function getCurrentBranch() {
  // Implementation would get current git branch
  return 'main';
}

async function getRecentCommits() {
  // Implementation would get recent commits
  return [];
}

async function getCurrentPR() {
  // Implementation would get current PR if any
  return null;
}

async function getCurrentIssue() {
  // Implementation would extract issue from branch name
  return null;
}
