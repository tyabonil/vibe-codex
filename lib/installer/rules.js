/**
 * Rules installer - Downloads and installs MANDATORY rules
 */

const fs = require("fs-extra");
const path = require("path");
const chalk = require("chalk");
const fetch = require("node-fetch");

const RULES_URL =
  "https://raw.githubusercontent.com/tyabonil/vibe-codex/main/MANDATORY-RULES.md";
const PROJECT_CONTEXT_URL =
  "https://raw.githubusercontent.com/tyabonil/vibe-codex/main/PROJECT_CONTEXT.md";

/**
 * Install MANDATORY rules and related files
 * @param {Object} config - Configuration object
 * @param {Object} options - Installation options
 * @returns {Promise<void>}
 */
async function installRules(config, options = {}) {
  const files = [];

  // Always install MANDATORY-RULES.md
  if (!options.skipRules) {
    console.log(chalk.blue("📋 Installing MANDATORY-RULES.md..."));
    await downloadFile(RULES_URL, "MANDATORY-RULES.md");
    files.push("MANDATORY-RULES.md");
  }

  // Install PROJECT_CONTEXT.md template if it doesn't exist
  const projectContextPath = "PROJECT_CONTEXT.md";
  if (!(await fs.pathExists(projectContextPath)) && !options.skipContext) {
    console.log(chalk.blue("📄 Creating PROJECT_CONTEXT.md template..."));
    await downloadFile(PROJECT_CONTEXT_URL, projectContextPath);
    files.push(projectContextPath);
  }

  // Create .cursorrules file with reference to MANDATORY-RULES.md
  if (!options.skipCursorRules) {
    await createCursorRulesFile(config);
    files.push(".cursorrules");
  }

  // Create config directory and files
  if (!options.skipConfig) {
    await createConfigFiles(config);
    files.push("config/");
  }

  return files;
}

/**
 * Download a file from URL
 * @param {string} url - URL to download from
 * @param {string} destination - Local file path
 * @returns {Promise<void>}
 */
async function downloadFile(url, destination) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to download: ${response.statusText}`);
    }

    const content = await response.text();
    await fs.writeFile(destination, content, "utf-8");
  } catch (error) {
    console.error(chalk.red(`Failed to download ${url}: ${error.message}`));
    throw error;
  }
}

/**
 * Create .cursorrules file
 * @param {Object} config - Configuration object
 * @returns {Promise<void>}
 */
async function createCursorRulesFile(config) {
  const cursorRules = `# Cursor Rules

This project follows the MANDATORY rules defined in MANDATORY-RULES.md

## Quick Reference

1. **ALWAYS** create an issue before starting work
2. **ALWAYS** follow the branching strategy: feature/issue-{number}-{description}
3. **ALWAYS** create a PR as soon as you make your first commit
4. **ALWAYS** request review from @copilot immediately after creating the PR
5. **NEVER** commit secrets or credentials

## Project Configuration

- Type: ${config.projectType}
- Modules: ${
    config.modules
      ? Object.keys(config.modules)
          .filter((m) => config.modules[m].enabled)
          .join(", ")
      : "core"
  }

For full rules, see MANDATORY-RULES.md
`;

  await fs.writeFile(".cursorrules", cursorRules, "utf-8");
}

/**
 * Create configuration files
 * @param {Object} config - Configuration object
 * @returns {Promise<void>}
 */
async function createConfigFiles(config) {
  await fs.ensureDir("config");

  // Create project-patterns.json
  const projectPatterns = {
    workflowPatterns: {
      previewBranchWorkflow: {
        enabled: config.modules?.github?.workflow === "preview",
        description: "Use preview branch as integration branch before main",
      },
      directToMainWorkflow: {
        enabled: config.modules?.github?.workflow !== "preview",
        description: "Direct PR to main branch workflow",
      },
    },
    platformPreferences: {
      preferGitHubCLI: true,
      preferVercelCLI: config.modules?.deployment?.platform === "vercel",
      preferAWSCLI: config.modules?.deployment?.platform === "aws",
    },
  };

  await fs.writeJSON("config/project-patterns.json", projectPatterns, {
    spaces: 2,
  });

  // Create rules.json with project-specific overrides
  const rules = {
    version: "1.0.0",
    projectType: config.projectType,
    enabledModules: Object.keys(config.modules || {}).filter(
      (m) => config.modules[m].enabled,
    ),
    customRules: [],
  };

  await fs.writeJSON("config/rules.json", rules, { spaces: 2 });

  // Create commit-msg.json
  const commitMsg = {
    types: {
      feat: "A new feature",
      fix: "A bug fix",
      docs: "Documentation only changes",
      style: "Changes that do not affect the meaning of the code",
      refactor: "A code change that neither fixes a bug nor adds a feature",
      perf: "A code change that improves performance",
      test: "Adding missing tests or correcting existing tests",
      build: "Changes that affect the build system or external dependencies",
      ci: "Changes to our CI configuration files and scripts",
      chore: "Other changes that don't modify src or test files",
      revert: "Reverts a previous commit",
    },
    maxLength: 100,
    requireScope: false,
    requireBody: false,
  };

  await fs.writeJSON("config/commit-msg.json", commitMsg, { spaces: 2 });
}

module.exports = {
  installRules,
  downloadFile,
  createCursorRulesFile,
  createConfigFiles,
};
