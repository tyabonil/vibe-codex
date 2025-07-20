/**
 * Pre-flight checks for vibe-codex installation
 */

const semver = require("semver");
const simpleGit = require("simple-git");
const fs = require("fs-extra");
const { detectPackageManager } = require("./detector");

async function preflightChecks(options = {}) {
  const checks = [];

  // Check Node.js version
  const nodeVersion = process.version;
  if (!semver.satisfies(nodeVersion, ">=14.0.0")) {
    throw new Error(
      `Node.js 14 or higher required. Current version: ${nodeVersion}`,
    );
  }
  checks.push({ name: "Node.js version", status: "passed" });

  // Check if in git repository
  const git = simpleGit();
  const isRepo = await git.checkIsRepo();

  if (!isRepo) {
    throw new Error(
      "Git repository required. Run 'git init' first to initialize a repository.",
    );
  }
  checks.push({ name: "Git repository", status: "found" });

  // Check for existing vibe-codex configuration
  const configPath = ".vibe-codex.json";
  if ((await fs.pathExists(configPath)) && !options.force) {
    throw new Error(
      "vibe-codex is already installed. Use --force to reinstall or 'vibe-codex update' to update.",
    );
  }

  if ((await fs.pathExists(configPath)) && options.force) {
    // Backup existing configuration
    await fs.copy(configPath, `${configPath}.backup`);
    checks.push({ name: "Existing config", status: "backed up" });
  }

  // Detect package manager
  const packageManager = await detectPackageManager();
  checks.push({ name: "Package manager", status: packageManager });

  // Check write permissions
  try {
    await fs.ensureDir(".vibe-codex-temp");
    await fs.remove(".vibe-codex-temp");
    checks.push({ name: "Write permissions", status: "verified" });
  } catch (error) {
    throw new Error("Insufficient permissions to write files");
  }

  return {
    checks,
    packageManager,
    isNewInstall: !(await fs.pathExists(configPath)),
  };
}

module.exports = {
  preflightChecks,
};