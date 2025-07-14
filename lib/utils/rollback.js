/**
 * Rollback support for vibe-codex installation
 */

const fs = require("fs-extra");
const path = require("path");
const chalk = require("chalk");
const logger = require("./logger");

/**
 * Create a rollback point before installation
 * @returns {Promise<string>} Backup directory path
 */
async function createRollbackPoint() {
  const backupDir = ".vibe-codex-backup";
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const backupPath = path.join(backupDir, timestamp);

  // Create backup directory
  await fs.ensureDir(backupPath);

  // Files to backup
  const filesToBackup = [
    ".vibe-codex.json",
    ".cursorrules",
    "PROJECT_CONTEXT.md",
    ".vibe-codexignore",
  ];

  const backedUpFiles = [];

  // Backup existing files
  for (const file of filesToBackup) {
    if (await fs.pathExists(file)) {
      await fs.copy(file, path.join(backupPath, file));
      backedUpFiles.push(file);
    }
  }

  // Backup git hooks
  const hooksDir = ".git/hooks";
  if (await fs.pathExists(hooksDir)) {
    const hooks = await fs.readdir(hooksDir);
    for (const hook of hooks) {
      if (!hook.includes(".sample") && !hook.includes(".backup")) {
        const hookPath = path.join(hooksDir, hook);
        const stats = await fs.stat(hookPath);
        if (stats.isFile()) {
          await fs.copy(hookPath, path.join(backupPath, "hooks", hook));
          backedUpFiles.push(`.git/hooks/${hook}`);
        }
      }
    }
  }

  // Backup GitHub Actions if they exist
  const workflowsDir = ".github/workflows";
  if (await fs.pathExists(workflowsDir)) {
    const workflows = await fs.readdir(workflowsDir);
    for (const workflow of workflows) {
      if (workflow.startsWith("vibe-codex-")) {
        await fs.copy(
          path.join(workflowsDir, workflow),
          path.join(backupPath, "workflows", workflow),
        );
        backedUpFiles.push(`.github/workflows/${workflow}`);
      }
    }
  }

  // Save rollback manifest
  const manifest = {
    timestamp: new Date().toISOString(),
    files: backedUpFiles,
    version: require("../../package.json").version,
    backupPath: backupPath,
  };

  await fs.writeJSON(path.join(backupPath, "manifest.json"), manifest, {
    spaces: 2,
  });

  logger.debug(`Created rollback point at ${backupPath}`);
  return backupPath;
}

/**
 * Rollback to previous state
 * @param {string} backupPath - Optional specific backup to restore
 * @returns {Promise<void>}
 */
async function rollback(backupPath = null) {
  const backupDir = ".vibe-codex-backup";

  if (!(await fs.pathExists(backupDir))) {
    throw new Error("No rollback points found");
  }

  // If no specific backup path, use the latest
  if (!backupPath) {
    const backups = await fs.readdir(backupDir);
    if (backups.length === 0) {
      throw new Error("No rollback points found");
    }

    // Sort by timestamp (newest first)
    backups.sort().reverse();
    backupPath = path.join(backupDir, backups[0]);
  }

  const manifestPath = path.join(backupPath, "manifest.json");
  if (!(await fs.pathExists(manifestPath))) {
    throw new Error("Invalid rollback point: missing manifest");
  }

  const manifest = await fs.readJSON(manifestPath);
  logger.info(`Rolling back to ${manifest.timestamp}...`);

  // Remove current vibe-codex files
  const currentFiles = [
    ".vibe-codex.json",
    ".cursorrules",
    ".vibe-codexignore",
    "config/project-patterns.json",
    "config/commit-msg.json",
  ];

  for (const file of currentFiles) {
    if (await fs.pathExists(file)) {
      await fs.remove(file);
    }
  }

  // Remove vibe-codex git hooks
  const hooksDir = ".git/hooks";
  if (await fs.pathExists(hooksDir)) {
    const hooks = [
      "pre-commit",
      "commit-msg",
      "pre-push",
      "post-commit",
      "post-merge",
    ];
    for (const hook of hooks) {
      const hookPath = path.join(hooksDir, hook);
      if (await fs.pathExists(hookPath)) {
        const content = await fs.readFile(hookPath, "utf-8");
        if (content.includes("vibe-codex")) {
          await fs.remove(hookPath);
        }
      }
    }
  }

  // Remove vibe-codex workflows
  const workflowsDir = ".github/workflows";
  if (await fs.pathExists(workflowsDir)) {
    const workflows = await fs.readdir(workflowsDir);
    for (const workflow of workflows) {
      if (workflow.startsWith("vibe-codex-")) {
        await fs.remove(path.join(workflowsDir, workflow));
      }
    }
  }

  // Restore backed up files
  for (const file of manifest.files) {
    const backupFile = path.join(
      backupPath,
      file.replace(/^\.git\//, "").replace(/^\.github\//, ""),
    );
    if (await fs.pathExists(backupFile)) {
      await fs.copy(backupFile, file);
      logger.debug(`Restored ${file}`);
    }
  }

  logger.success("Rollback completed successfully");

  // Optionally clean up backup
  try {
    const inquirer = require("./inquirer-fix");
    const { cleanup } = await inquirer.prompt([
      {
        type: "confirm",
        name: "cleanup",
        message: "Remove rollback point?",
        default: true,
      },
    ]);

    if (cleanup) {
      await fs.remove(backupPath);
    }
  } catch (error) {
    // If inquirer fails, just log and continue
    logger.debug("Could not prompt for cleanup:", error.message);
  }
}

/**
 * List available rollback points
 * @returns {Promise<Array>} List of rollback points
 */
async function listRollbackPoints() {
  const backupDir = ".vibe-codex-backup";

  if (!(await fs.pathExists(backupDir))) {
    return [];
  }

  const backups = await fs.readdir(backupDir);
  const rollbackPoints = [];

  for (const backup of backups) {
    const manifestPath = path.join(backupDir, backup, "manifest.json");
    if (await fs.pathExists(manifestPath)) {
      const manifest = await fs.readJSON(manifestPath);
      rollbackPoints.push({
        path: path.join(backupDir, backup),
        timestamp: manifest.timestamp,
        files: manifest.files.length,
        version: manifest.version,
      });
    }
  }

  return rollbackPoints.sort(
    (a, b) => new Date(b.timestamp) - new Date(a.timestamp),
  );
}

/**
 * Clean up old rollback points
 * @param {number} keepCount - Number of recent backups to keep
 * @returns {Promise<void>}
 */
async function cleanupRollbackPoints(keepCount = 3) {
  const rollbackPoints = await listRollbackPoints();

  if (rollbackPoints.length <= keepCount) {
    return;
  }

  // Remove oldest backups
  const toRemove = rollbackPoints.slice(keepCount);
  for (const rollback of toRemove) {
    await fs.remove(rollback.path);
    logger.debug(`Removed old rollback point: ${rollback.timestamp}`);
  }
}

module.exports = {
  createRollbackPoint,
  rollback,
  listRollbackPoints,
  cleanupRollbackPoints,
};
