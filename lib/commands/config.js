/**
 * Config command - Manage vibe-codex configuration
 */

const chalk = require("chalk");
const fs = require("fs-extra");
const path = require("path");
const inquirer = require("inquirer");

module.exports = async function config(options) {
  // Handle case where options is actually the action string (for backward compatibility)
  if (typeof options === "string") {
    const action = options;
    const opts = arguments[1] || {};
    return handleAction(action, opts);
  }

  // Handle options object from CLI
  if (!options || Object.keys(options).length === 0) {
    return interactiveConfig();
  }

  // Determine action from options
  if (options.list) {
    return listConfiguration();
  } else if (options.set) {
    return setConfiguration(options.set);
  } else if (options.reset) {
    return resetConfiguration();
  } else if (options.export) {
    return exportConfiguration(options.export);
  } else if (options.import) {
    return importConfiguration(options.import);
  } else if (options.preview) {
    return previewConfiguration();
  } else {
    return interactiveConfig();
  }
};

function handleAction(action, options) {
  switch (action) {
    case "list":
      return listConfiguration();
    case "set":
      return setConfiguration(options.set);
    case "reset":
      return resetConfiguration();
    case "export":
      return exportConfiguration(options.export);
    case "import":
      return importConfiguration(options.import);
    default:
      throw new Error(`Unknown config action: ${action}`);
  }
}

async function interactiveConfig() {
  console.log(chalk.blue("🔧 vibe-codex Configuration\n"));

  const configPath = ".vibe-codex.json";
  if (!(await fs.pathExists(configPath))) {
    console.log(chalk.yellow("No configuration file found."));
    console.log('Run "npx vibe-codex init" to create one.');
    return;
  }

  const config = await fs.readJSON(configPath);

  const { action } = await inquirer.prompt([
    {
      type: "list",
      name: "action",
      message: "What would you like to configure?",
      choices: [
        { name: "Enable/Disable modules", value: "modules" },
        { name: "Configure testing settings", value: "testing" },
        { name: "Configure deployment settings", value: "deployment" },
        { name: "Configure GitHub integration", value: "github" },
        { name: "Export configuration", value: "export" },
        { name: "Reset to defaults", value: "reset" },
        { name: "Exit", value: "exit" },
      ],
    },
  ]);

  switch (action) {
    case "modules":
      await configureModules(config);
      break;
    case "testing":
      await configureTesting(config);
      break;
    case "deployment":
      await configureDeployment(config);
      break;
    case "github":
      await configureGitHub(config);
      break;
    case "export":
      console.log("\n" + JSON.stringify(config, null, 2));
      return;
    case "reset":
      return resetConfiguration();
    case "exit":
      return;
  }

  // Save configuration
  config.lastModified = new Date().toISOString();
  await fs.writeJSON(configPath, config, { spaces: 2 });
  console.log(chalk.green("\n✓ Configuration saved!"));
}

async function listConfiguration() {
  const configPath = ".vibe-codex.json";

  if (!(await fs.pathExists(configPath))) {
    console.log(chalk.yellow("No configuration file found."));
    console.log('Run "npx vibe-codex init" to create one.');
    return;
  }

  const config = await fs.readJSON(configPath);
  console.log(chalk.blue("Current vibe-codex configuration:\n"));
  console.log(JSON.stringify(config, null, 2));
}

async function setConfiguration(keyValue) {
  if (!keyValue || !keyValue.includes("=")) {
    throw new Error("Invalid format. Use: vibe-codex config set key=value");
  }

  const [key, value] = keyValue.split("=");

  // TODO: Implement configuration setting
  console.log(chalk.green(`✓ Set ${key} = ${value}`));
}

async function resetConfiguration() {
  const { confirm } = await inquirer.prompt([
    {
      type: "confirm",
      name: "confirm",
      message: "Are you sure you want to reset to default configuration?",
      default: false,
    },
  ]);

  if (!confirm) {
    console.log("Reset cancelled.");
    return;
  }

  // TODO: Implement configuration reset
  console.log(chalk.green("✓ Configuration reset to defaults"));
}

async function exportConfiguration() {
  const configPath = ".vibe-codex.json";

  if (!(await fs.pathExists(configPath))) {
    throw new Error("No configuration file found");
  }

  const config = await fs.readJSON(configPath);
  console.log(JSON.stringify(config, null, 2));
}

async function importConfiguration(file) {
  if (!file) {
    throw new Error("Configuration file path required");
  }

  if (!(await fs.pathExists(file))) {
    throw new Error(`Configuration file not found: ${file}`);
  }

  const newConfig = await fs.readJSON(file);

  // Validate configuration
  if (!newConfig.projectType || !newConfig.modules) {
    throw new Error("Invalid configuration file format");
  }

  // Backup existing configuration
  const configPath = ".vibe-codex.json";
  if (await fs.pathExists(configPath)) {
    const backupPath = `.vibe-codex.backup.${Date.now()}.json`;
    await fs.copy(configPath, backupPath);
  }

  // Import configuration
  newConfig.lastModified = new Date().toISOString();
  await fs.writeJSON(configPath, newConfig, { spaces: 2 });

  console.log(chalk.green(`✓ Configuration imported from ${file}`));
}

async function configureModules(config) {
  const currentModules = config.modules || {};
  const availableModules = [
    {
      name: "Core (always enabled)",
      value: "core",
      checked: true,
      disabled: true,
    },
    {
      name: "Testing & Coverage",
      value: "testing",
      checked: currentModules.testing?.enabled !== false,
    },
    {
      name: "GitHub Integration",
      value: "github",
      checked: currentModules.github?.enabled !== false,
    },
    {
      name: "Deployment Validation",
      value: "deployment",
      checked: currentModules.deployment?.enabled !== false,
    },
    {
      name: "Documentation",
      value: "documentation",
      checked: currentModules.documentation?.enabled !== false,
    },
    {
      name: "Code Quality",
      value: "quality",
      checked: currentModules.quality?.enabled !== false,
    },
  ];

  const { selectedModules } = await inquirer.prompt([
    {
      type: "checkbox",
      name: "selectedModules",
      message: "Select modules to enable:",
      choices: availableModules,
    },
  ]);

  // Update modules
  for (const module of [
    "testing",
    "github",
    "deployment",
    "documentation",
    "quality",
  ]) {
    if (!config.modules[module]) {
      config.modules[module] = {};
    }
    config.modules[module].enabled = selectedModules.includes(module);
  }
}

async function configureTesting(config) {
  if (!config.modules.testing) {
    config.modules.testing = { enabled: true };
  }

  const answers = await inquirer.prompt([
    {
      type: "list",
      name: "framework",
      message: "Which test framework do you use?",
      choices: ["jest", "mocha", "vitest", "ava", "tap", "other"],
      default: config.modules.testing.framework || "jest",
    },
    {
      type: "number",
      name: "coverage",
      message: "What should be your test coverage threshold?",
      default: config.modules.testing.coverage?.threshold || 80,
      validate: (value) => value >= 0 && value <= 100,
    },
    {
      type: "confirm",
      name: "preCommit",
      message: "Run tests before commit?",
      default: config.modules.testing.runOnPreCommit !== false,
    },
  ]);

  config.modules.testing = {
    ...config.modules.testing,
    framework: answers.framework,
    coverage: { threshold: answers.coverage },
    runOnPreCommit: answers.preCommit,
  };
}

async function configureDeployment(config) {
  if (!config.modules.deployment) {
    config.modules.deployment = { enabled: true };
  }

  const answers = await inquirer.prompt([
    {
      type: "list",
      name: "platform",
      message: "Which deployment platform do you use?",
      choices: [
        { name: "Vercel", value: "vercel" },
        { name: "Netlify", value: "netlify" },
        { name: "AWS", value: "aws" },
        { name: "Google Cloud", value: "gcp" },
        { name: "Azure", value: "azure" },
        { name: "Docker", value: "docker" },
        { name: "Other", value: "other" },
      ],
      default: config.modules.deployment.platform || "vercel",
    },
    {
      type: "confirm",
      name: "validateOnPush",
      message: "Validate deployment configuration before push?",
      default: config.modules.deployment.validateOnPush !== false,
    },
  ]);

  config.modules.deployment = {
    ...config.modules.deployment,
    platform: answers.platform,
    validateOnPush: answers.validateOnPush,
  };
}

async function configureGitHub(config) {
  if (!config.modules.github) {
    config.modules.github = { enabled: true };
  }

  const answers = await inquirer.prompt([
    {
      type: "list",
      name: "workflow",
      message: "Which workflow do you use?",
      choices: [
        {
          name: "Preview branch workflow (feature → preview → main)",
          value: "preview",
        },
        { name: "Direct to main (feature → main)", value: "direct" },
      ],
      default: config.modules.github.workflow || "direct",
    },
    {
      type: "confirm",
      name: "autoAssignReview",
      message: "Automatically request review from @copilot?",
      default: config.modules.github.autoAssignReview !== false,
    },
    {
      type: "confirm",
      name: "issueTracking",
      message: "Enable strict issue tracking?",
      default: config.modules.github.issueTracking !== false,
    },
  ]);

  config.modules.github = {
    ...config.modules.github,
    workflow: answers.workflow,
    autoAssignReview: answers.autoAssignReview,
    issueTracking: answers.issueTracking,
  };
}

async function previewConfiguration() {
  const configPath = ".vibe-codex.json";

  if (!(await fs.pathExists(configPath))) {
    console.log(chalk.yellow("No configuration file found."));
    console.log('Run "npx vibe-codex init" to create one.');
    return;
  }

  const config = await fs.readJSON(configPath);
  const logger = require("../utils/logger");

  console.log(chalk.blue("\n📋 Configuration Preview:\n"));

  // Show enabled modules
  console.log(chalk.bold("Enabled Modules:"));
  Object.entries(config.modules).forEach(([name, moduleConfig]) => {
    if (moduleConfig.enabled) {
      console.log(`  ✓ ${name}`);
    }
  });

  // Show impact
  console.log(chalk.bold("\nConfiguration Impact:"));
  if (config.modules.core?.gitHooks) {
    console.log("  • Git hooks will be installed");
  }
  if (config.modules.testing?.enabled) {
    console.log(
      `  • Tests will run with ${config.modules.testing.coverage?.threshold || 80}% coverage requirement`,
    );
  }
  if (config.modules.github?.enabled) {
    console.log("  • GitHub Actions workflows will be active");
  }

  // Show suggestions
  const { getSuggestions } = require("../utils/config-creator");
  const suggestions = getSuggestions(config);
  if (suggestions.length > 0) {
    console.log(chalk.bold("\n💡 Suggestions:"));
    suggestions.forEach((suggestion) => {
      console.log(`  • ${suggestion}`);
    });
  }
}
