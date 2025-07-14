/**
 * Pre-flight checks for vibe-codex installation
 */

const chalk = require("chalk");
const semver = require("semver");
const simpleGit = require("simple-git");
const fs = require("fs-extra");
const inquirer = require("./inquirer-fix");
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
    const { initGit } = await inquirer.prompt([
      {
        type: "confirm",
        name: "initGit",
        message: "No git repository found. Initialize one?",
        default: true,
      },
    ]);

    if (initGit) {
      await git.init();
      await git.add(".");
      await git.commit("Initial commit");
      checks.push({ name: "Git repository", status: "initialized" });
    } else {
      throw new Error("Git repository required for vibe-codex");
    }
  } else {
    checks.push({ name: "Git repository", status: "found" });
  }

  // Check for existing vibe-codex configuration
  const configPath = ".vibe-codex.json";
  if ((await fs.pathExists(configPath)) && !options.force) {
    const { overwrite } = await inquirer.prompt([
      {
        type: "confirm",
        name: "overwrite",
        message: "vibe-codex is already installed. Reinstall?",
        default: false,
      },
    ]);

    if (!overwrite) {
      console.log(chalk.yellow("\nInstallation cancelled."));
      console.log('Use "npx vibe-codex update" to update your installation');
      process.exit(0);
    }

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
