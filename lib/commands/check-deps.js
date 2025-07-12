/**
 * Check dependencies command - Verify files can be safely deleted
 */

const chalk = require('chalk');
const path = require('path');
const { execSync } = require('child_process');
const logger = require('../utils/logger');

module.exports = async function checkDeps(files, options) {
  console.log(chalk.blue('\n🔍 Checking dependencies...\n'));
  
  if (!files || files.length === 0) {
    console.log(chalk.yellow('No files specified. Usage: vibe-codex check-deps <file1> [file2] ...'));
    return;
  }
  
  const hookPath = path.join(__dirname, '../../templates/hooks/dependency-check-hook.sh');
  
  let hasFailures = false;
  
  for (const file of files) {
    try {
      console.log(chalk.gray(`Checking: ${file}`));
      
      // Run the dependency check hook
      execSync(`bash "${hookPath}" "${file}"`, { 
        stdio: 'inherit',
        encoding: 'utf8'
      });
      
    } catch (error) {
      hasFailures = true;
      // Error message already displayed by the hook
    }
  }
  
  if (hasFailures) {
    console.log(chalk.red('\n❌ Some files have active dependencies'));
    console.log(chalk.yellow('Please migrate dependencies before deleting these files'));
    process.exit(1);
  } else {
    console.log(chalk.green('\n✅ All files are safe to delete'));
  }
};

module.exports.description = 'Check if files have dependencies before deletion';
module.exports.usage = 'vibe-codex check-deps <file1> [file2] ...';