/**
 * Local rules installer - Installs rules from the modular system
 */

const fs = require("fs-extra");
const path = require("path");
const chalk = require("chalk");
const logger = require("../utils/logger");

/**
 * Install rules based on selected modules
 * @param {Object} config - Configuration object
 * @param {Object} options - Installation options
 * @returns {Promise<Array>} - List of installed files
 */
async function installLocalRules(config, options = {}) {
  const files = [];

  // Create .vibe-codexignore file
  if (!options.skipIgnore) {
    logger.info("Creating .vibe-codexignore...");
    await createIgnoreFile();
    files.push(".vibe-codexignore");
  }

  // Create PROJECT_CONTEXT.md template if it doesn't exist
  if (!(await fs.pathExists("PROJECT_CONTEXT.md")) && !options.skipContext) {
    logger.info("Creating PROJECT_CONTEXT.md template...");
    await createProjectContextTemplate(config);
    files.push("PROJECT_CONTEXT.md");
  }

  // Create config directory and files
  if (!options.skipConfig) {
    await createConfigFiles(config);
    files.push("config/");
  }

  return files;
}

/**
 * Create .vibe-codexignore file
 */
async function createIgnoreFile() {
  const ignoreContent = `# Dependencies
node_modules/
bower_components/

# Build outputs
dist/
build/
out/
.next/
.nuxt/

# Test coverage
coverage/
.nyc_output/

# Environment files
.env*
!.env.example

# IDE files
.vscode/
.idea/
*.sublime-*

# OS files
.DS_Store
Thumbs.db

# Logs
*.log
logs/

# Temporary files
tmp/
temp/
.cache/
`;

  await fs.writeFile(".vibe-codexignore", ignoreContent, "utf-8");
}

/**
 * Create PROJECT_CONTEXT.md template
 */
async function createProjectContextTemplate(config) {
  const template = `# Project Context

## Project Overview
<!-- Describe your project's purpose and goals -->

## Technology Stack
- **Type**: ${config.projectType}
- **Framework**: <!-- e.g., React, Vue, Express -->
- **Language**: <!-- e.g., TypeScript, JavaScript -->
- **Testing**: ${config.modules?.testing?.framework || "jest"}
- **Deployment**: ${config.modules?.deployment?.platform || "not configured"}

## Architecture
<!-- Describe your project structure and key architectural decisions -->

## Development Workflow
- **Branching Strategy**: feature/issue-{number}-{description}
- **PR Target**: ${config.modules?.github?.workflow === "preview" ? "preview branch" : "main branch"}
- **Review Process**: <!-- Describe your review requirements -->

## Key Dependencies
<!-- List critical dependencies and their purposes -->

## Testing Strategy
- **Unit Tests**: <!-- Coverage targets and approach -->
- **Integration Tests**: <!-- Scope and tools -->
- **E2E Tests**: <!-- If applicable -->

## Deployment
<!-- Describe deployment process and environments -->

## Team Conventions
<!-- Document agreed-upon conventions and patterns -->

## vibe-codex Configuration
- **Enabled Modules**: ${Object.keys(config.modules || {})
    .filter((m) => config.modules[m].enabled)
    .join(", ")}
- **Test Coverage**: ${config.modules?.testing?.coverage?.threshold || 80}%

---
*This file helps AI assistants understand your project context. Keep it updated!*
`;

  await fs.writeFile("PROJECT_CONTEXT.md", template, "utf-8");
}

/**
 * Create configuration files
 */
async function createConfigFiles(config) {
  await fs.ensureDir("config");

  // Create project-patterns.json
  const projectPatterns = {
    workflowPatterns: {
      previewBranchWorkflow: {
        enabled: config.modules?.["github-workflow"]?.workflow === "preview",
        description: "Use preview branch as integration branch before main",
      },
      directToMainWorkflow: {
        enabled: config.modules?.["github-workflow"]?.workflow !== "preview",
        description: "Direct PR to main branch workflow",
      },
    },
    moduleConfiguration: {
      enabledModules: Object.keys(config.modules || {}).filter(
        (m) => config.modules[m].enabled,
      ),
      projectType: config.projectType,
    },
    platformPreferences: {
      preferGitHubCLI: true,
      preferVercelCLI: config.modules?.deployment?.platform === "vercel",
      preferNetlifyCLI: config.modules?.deployment?.platform === "netlify",
      preferAWSCLI: config.modules?.deployment?.platform === "aws",
    },
  };

  await fs.writeJSON("config/project-patterns.json", projectPatterns, {
    spaces: 2,
  });

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
      ci: "Changes to CI configuration files and scripts",
      chore: "Other changes that don't modify src or test files",
      revert: "Reverts a previous commit",
    },
    maxLength: 100,
    requireScope: false,
    requireBody: false,
    requireIssueReference: true,
  };

  await fs.writeJSON("config/commit-msg.json", commitMsg, { spaces: 2 });
}

module.exports = {
  installLocalRules,
  createIgnoreFile,
  createProjectContextTemplate,
  createConfigFiles,
};
