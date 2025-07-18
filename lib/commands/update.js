/**
 * Update command - Update vibe-codex rules and modules
 */

const chalk = require("chalk");
const semver = require("semver");
const fs = require("fs-extra");
const { installRules, downloadFile } = require("../installer/rules");
const { downloadHookScripts } = require("../installer/hooks-downloader");
const { installGitHooks } = require("../installer/git-hooks");
const { getLogger } = require("../utils/simple-logger");

module.exports = async function update(options) {
  const logger = getLogger({
    quiet: options.quiet,
    json: options.json,
    verbose: options.verbose
  });
  
  const task = logger.startTask("Checking for updates");

  try {
    // Load current configuration
    const configPath = ".vibe-codex.json";
    if (!(await fs.pathExists(configPath))) {
      task.fail("No vibe-codex configuration found");
      logger.warning('Run "npx vibe-codex init" to set up vibe-codex');
      return;
    }

    const config = await fs.readJSON(configPath);
    const currentVersion = config.version || "0.0.0";

    // TODO: Check npm registry for latest version
    const latestVersion = require("../../package.json").version;

    if (semver.gte(currentVersion, latestVersion) && !options.force) {
      task.succeed("vibe-codex is up to date");
      logger.info(`Current version: ${currentVersion}`);
      return;
    }

    task.succeed(`Found update: ${currentVersion} → ${latestVersion}`);
    logger.section("Starting update process");

    // Backup existing configuration
    const backupPath = `.vibe-codex.backup.${Date.now()}.json`;
    await fs.copy(configPath, backupPath);
    logger.info(`Configuration backed up to ${backupPath}`);

    // Update MANDATORY-RULES.md
    const rulesTask = logger.startTask("Updating MANDATORY rules");
    try {
      await downloadFile(
        "https://raw.githubusercontent.com/tyabonil/vibe-codex/main/MANDATORY-RULES.md",
        "MANDATORY-RULES.md",
      );
      rulesTask.succeed("MANDATORY rules updated");
    } catch (error) {
      rulesTask.fail("Failed to update MANDATORY rules");
      logger.verbose(error.message);
    }

    // Update hook scripts if hooks directory exists
    if (await fs.pathExists("hooks")) {
      const hooksTask = logger.startTask("Updating hook scripts");
      try {
        await downloadHookScripts(config);
        hooksTask.succeed("Hook scripts updated");
      } catch (error) {
        hooksTask.fail("Failed to update some hook scripts");
        logger.verbose(error.message);
      }
    }

    // Re-install git hooks
    if (config.modules?.core?.gitHooks !== false) {
      const gitHooksTask = logger.startTask("Updating git hooks");
      try {
        await installGitHooks(config);
        gitHooksTask.succeed("Git hooks updated");
      } catch (error) {
        gitHooksTask.fail("Failed to update git hooks");
        logger.verbose(error.message);
      }
    }

    // Update configuration files
    const configTask = logger.startTask("Updating configuration files");
    try {
      // Update .cursorrules
      const { createCursorRulesFile } = require("../installer/rules");
      await createCursorRulesFile(config);

      // Update config files
      const { createConfigFiles } = require("../installer/rules");
      await createConfigFiles(config);

      configTask.succeed("Configuration files updated");
    } catch (error) {
      configTask.fail("Failed to update some configuration files");
      logger.verbose(error.message);
    }

    // Migrate configuration if needed
    config.version = latestVersion;
    config.lastModified = new Date().toISOString();

    // Add any new default modules
    if (!config.modules.quality && semver.lt(currentVersion, "1.1.0")) {
      config.modules.quality = { enabled: false };
      logger.info('Added new "quality" module (disabled by default)');
    }

    await fs.writeJSON(configPath, config, { spaces: 2 });

    logger.success(`Updated to version ${latestVersion}`);

    // Run validation to check status
    logger.section("Running post-update validation");
    const RuleValidator = require("../validator");
    const validator = new RuleValidator(config);
    const results = await validator.validate({ silent: true });

    logger.section("Update Summary");
    logger.info(`Updated from version ${currentVersion} to ${latestVersion}`);
    logger.info("MANDATORY rules: Updated");
    logger.info("Configuration: Migrated");
    logger.info(`Validation: ${results.violations.length === 0 ? "Passed" : `${results.violations.length} violations`}`);

    if (results.violations.length > 0) {
      logger.warning("Some violations were found after update.");
      logger.info('Run "npx vibe-codex validate" for details');
    }

    logger.success("Update complete!");

    // Clean up old backup files (keep last 3)
    await cleanupBackups();
  } catch (error) {
    logger.error(`Update failed: ${error.message}`);
    throw error;
  }
};

/**
 * Clean up old backup files, keeping only the most recent ones
 * @param {number} keepCount - Number of backups to keep
 */
async function cleanupBackups(keepCount = 3) {
  try {
    const files = await fs.readdir(".");
    const backupFiles = files
      .filter((f) => f.startsWith(".vibe-codex.backup.") && f.endsWith(".json"))
      .sort()
      .reverse();

    if (backupFiles.length > keepCount) {
      const toDelete = backupFiles.slice(keepCount);
      for (const file of toDelete) {
        await fs.remove(file);
      }
      console.log(
        chalk.gray(`  ✓ Cleaned up ${toDelete.length} old backup(s)`),
      );
    }
  } catch (error) {
    // Ignore cleanup errors
  }
}
