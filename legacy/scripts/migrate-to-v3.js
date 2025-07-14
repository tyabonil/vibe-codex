#!/usr/bin/env node

/**
 * Migration script from vibe-codex v2 to v3
 * This script helps transition from the complex modular system to the simplified version
 */

const fs = require('fs').promises;
const path = require('path');
const chalk = require('chalk');

async function migrate() {
  console.log(chalk.blue(`
╔═══════════════════════════════════════╗
║     vibe-codex v3 Migration Tool      ║
╚═══════════════════════════════════════╝
`));

  console.log('This script will help migrate your project to vibe-codex v3\n');

  // Check for existing v2 configuration
  const v2ConfigPath = path.join(process.cwd(), '.vibe-codex.json');
  const v2Exists = await fs.access(v2ConfigPath).then(() => true).catch(() => false);

  if (!v2Exists) {
    console.log(chalk.yellow('No existing vibe-codex configuration found.'));
    console.log('Run "npx vibe-codex init" to set up v3 fresh.\n');
    return;
  }

  console.log(chalk.green('✓ Found existing vibe-codex configuration'));
  
  try {
    const v2Config = JSON.parse(await fs.readFile(v2ConfigPath, 'utf8'));
    console.log('\nCurrent configuration:');
    console.log(chalk.gray(JSON.stringify(v2Config, null, 2)));

    // Create v3 configuration
    const v3Config = {
      version: '3.0.0',
      gitHooks: true,
      githubActions: false,
      rules: [],
      created: v2Config.created || new Date().toISOString(),
      updated: new Date().toISOString()
    };

    // Map v2 modules to v3 rules
    if (v2Config.modules) {
      // Core module -> security rule
      if (v2Config.modules.core) {
        v3Config.rules.push('security');
        v3Config.rules.push('commit-format');
      }

      // Testing module -> testing rule
      if (v2Config.modules.testing) {
        v3Config.rules.push('testing');
      }

      // Documentation module -> documentation rule
      if (v2Config.modules.documentation) {
        v3Config.rules.push('documentation');
      }

      // GitHub module -> GitHub Actions
      if (v2Config.modules.github || v2Config.modules['github-workflow']) {
        v3Config.githubActions = true;
      }
    }

    // Remove duplicates
    v3Config.rules = [...new Set(v3Config.rules)];

    console.log('\n' + chalk.blue('Migrated configuration:'));
    console.log(chalk.gray(JSON.stringify(v3Config, null, 2)));

    // Backup old config
    const backupPath = v2ConfigPath + '.v2-backup';
    await fs.copyFile(v2ConfigPath, backupPath);
    console.log(chalk.green(`\n✓ Backed up old configuration to ${backupPath}`));

    // Write new config
    await fs.writeFile(v2ConfigPath, JSON.stringify(v3Config, null, 2));
    console.log(chalk.green('✓ Updated configuration to v3 format'));

    // Clean up old files
    console.log('\n' + chalk.blue('Cleaning up old files...'));
    
    // Remove old hook files if they exist
    const oldHooksToRemove = [
      '.vibe-codex-state.json',
      '.vibe-codex-backup.json'
    ];

    for (const file of oldHooksToRemove) {
      const filePath = path.join(process.cwd(), file);
      if (await fs.access(filePath).then(() => true).catch(() => false)) {
        await fs.unlink(filePath);
        console.log(chalk.gray(`  Removed ${file}`));
      }
    }

    console.log(chalk.green('\n✅ Migration completed successfully!'));
    console.log('\nNext steps:');
    console.log('1. Review the migrated configuration');
    console.log('2. Run "npx vibe-codex" to access the new interactive menu');
    console.log('3. Delete this migration script when done');

  } catch (error) {
    console.error(chalk.red('\n❌ Migration failed:'), error.message);
    process.exit(1);
  }
}

// Run migration
migrate().catch(error => {
  console.error(chalk.red('Fatal error:'), error);
  process.exit(1);
});