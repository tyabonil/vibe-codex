/**
 * Status command - Show vibe-codex installation status
 */

const chalk = require('chalk');
const fs = require('fs-extra');
const path = require('path');

module.exports = async function status(options) {
  console.log(chalk.blue('\n📊 vibe-codex Status\n'));
  
  try {
    // Check if vibe-codex is installed
    const configPath = '.vibe-codex.json';
    const hasConfig = await fs.pathExists(configPath);
    
    if (!hasConfig) {
      console.log(chalk.yellow('⚠ vibe-codex is not installed in this project'));
      console.log(chalk.gray('\nRun "npx vibe-codex init" to get started'));
      return;
    }
    
    // Load configuration
    const config = await fs.readJSON(configPath);
    
    // Display status information
    console.log(chalk.bold('Installation:'));
    console.log(`  Version: ${chalk.green(config.version || 'unknown')}`);
    console.log(`  Project Type: ${chalk.cyan(config.projectType)}`);
    console.log(`  Created: ${chalk.gray(config.createdAt || 'unknown')}`);
    console.log(`  Last Modified: ${chalk.gray(config.lastModified || 'unknown')}`);
    
    // Show enabled modules
    console.log(chalk.bold('\nEnabled Modules:'));
    const modules = Object.keys(config.modules || {});
    if (modules.length === 0) {
      console.log(chalk.gray('  No modules enabled'));
    } else {
      for (const module of modules) {
        const moduleConfig = config.modules[module];
        const status = moduleConfig.enabled !== false ? chalk.green('✓') : chalk.red('✗');
        console.log(`  ${status} ${module}`);
        
        // Show module-specific details
        if (module === 'testing' && moduleConfig.framework) {
          console.log(chalk.gray(`     Framework: ${moduleConfig.framework}`));
          if (moduleConfig.coverage?.threshold) {
            console.log(chalk.gray(`     Coverage: ${moduleConfig.coverage.threshold}%`));
          }
        }
        if (module === 'deployment' && moduleConfig.platform) {
          console.log(chalk.gray(`     Platform: ${moduleConfig.platform}`));
        }
      }
    }
    
    // Check git hooks
    console.log(chalk.bold('\nGit Hooks:'));
    const hooksDir = '.git/hooks';
    const hooks = ['pre-commit', 'commit-msg', 'pre-push'];
    for (const hook of hooks) {
      const hookPath = path.join(hooksDir, hook);
      const exists = await fs.pathExists(hookPath);
      const status = exists ? chalk.green('✓') : chalk.gray('✗');
      console.log(`  ${status} ${hook}`);
    }
    
    // Check GitHub Actions
    console.log(chalk.bold('\nGitHub Actions:'));
    const workflowsDir = '.github/workflows';
    if (await fs.pathExists(workflowsDir)) {
      const workflows = await fs.readdir(workflowsDir);
      const vibeWorkflows = workflows.filter(w => w.includes('vibe-codex'));
      if (vibeWorkflows.length > 0) {
        for (const workflow of vibeWorkflows) {
          console.log(`  ${chalk.green('✓')} ${workflow}`);
        }
      } else {
        console.log(chalk.gray('  No vibe-codex workflows found'));
      }
    } else {
      console.log(chalk.gray('  No workflows directory found'));
    }
    
    // Output as JSON if requested
    if (options.json) {
      const statusData = {
        installed: true,
        version: config.version,
        projectType: config.projectType,
        modules: config.modules,
        gitHooks: {},
        workflows: []
      };
      
      console.log('\n' + JSON.stringify(statusData, null, 2));
    }
    
  } catch (error) {
    console.error(chalk.red('Error reading status:'), error.message);
    throw error;
  }
};