/**
 * Init command - Initialize vibe-codex in a project
 */

const chalk = require("chalk");
const inquirer = require("../utils/inquirer-fix");
const fs = require("fs-extra");
const path = require("path");
const { detectProjectType } = require("../utils/detector");
const { preflightChecks } = require("../utils/preflight");
const { installGitHooks } = require("../installer/git-hooks");
const { installGitHubActions } = require("../installer/github-actions");
const { installLocalRules } = require("../installer/local-rules");
const { createIgnoreFile, createProjectContext, applyProjectDefaults } = require("../utils/config-creator");
const moduleLoader = require("../modules/loader-wrapper");
const { configExamples } = require("../modules/config-schema-commonjs");
const {
  validateSetup,
  getInstallInstructions,
} = require("../utils/package-manager");
const logger = require("../utils/logger");
const { createRollbackPoint, rollback } = require("../utils/rollback");
const { getLogger } = require("../utils/simple-logger");

module.exports = async function init(options) {
  const simpleLogger = getLogger({
    quiet: options.quiet,
    json: options.json,
    verbose: options.verbose
  });
  
  if (!options.quiet && !options.json) {
    console.log(chalk.blue("\n🎯 Welcome to vibe-codex!\n"));
  }

  const task = simpleLogger.startTask("Running pre-flight checks");
  let rollbackPath = null;

  try {
    // Validate package manager setup
    const setupValidation = await validateSetup();

    if (setupValidation.errors.length > 0) {
      task.fail("Setup validation failed");
      simpleLogger.error("Setup errors:");
      setupValidation.errors.forEach((err) =>
        simpleLogger.error(`   - ${err}`)
      );
      process.exit(1);
    }

    if (setupValidation.warnings.length > 0) {
      task.fail("Setup validation completed with warnings");
      simpleLogger.warning("Warnings:");
      setupValidation.warnings.forEach((warn) =>
        simpleLogger.warning(`   - ${warn}`)
      );

      if (!setupValidation.npxAvailable) {
        const instructions = getInstallInstructions(
          setupValidation.packageManager,
        );
        console.log(
          chalk.blue(
            "\n💡 To ensure best compatibility, consider upgrading npm:",
          ),
        );
        console.log(chalk.cyan("   npm install -g npm@latest"));
        console.log(chalk.blue("\nOr install vibe-codex locally:"));
        console.log(chalk.cyan(`   ${instructions.local}`));
      }
    } else {
      task.succeed("Setup validation passed");
    }

    // Run pre-flight checks
    await preflightChecks(options);
    const preflightTask = simpleLogger.startTask("Running pre-flight checks");
    preflightTask.succeed("Pre-flight checks passed");

    // Create rollback point after pre-flight checks
    if (!options.skipRollback) {
      const rollbackTask = simpleLogger.startTask("Creating rollback point");
      rollbackPath = await createRollbackPoint();
      rollbackTask.succeed("Rollback point created");
    }

    // Detect or ask for project type
    let projectType = options.type;
    if (projectType === "auto") {
      projectType = await detectProjectType();
      if (!projectType) {
        const answer = await inquirer.prompt([
          {
            type: "list",
            name: "projectType",
            message: "What type of project is this?",
            choices: [
              { name: "Web Application (Frontend)", value: "web" },
              { name: "API/Backend Service", value: "api" },
              { name: "Full-Stack Application", value: "fullstack" },
              { name: "npm Library/Package", value: "library" },
              { name: "Custom Configuration", value: "custom" },
            ],
          },
        ]);
        projectType = answer.projectType;
      } else {
        simpleLogger.success(`Detected project type: ${projectType}`);
      }
    }

    // Ask about module selection for modular rules
    let selectedModules = {};
    if (options.minimal) {
      // Use minimal configuration
      selectedModules = {
        core: { enabled: true },
        ...configExamples.minimal.modules,
      };
    } else if (options.modules !== "all") {
      const { useModular } = await inquirer.prompt([
        {
          type: "confirm",
          name: "useModular",
          message: "Would you like to customize which rule modules to install?",
          default: true,
        },
      ]);

      if (useModular) {
        const { modules } = await inquirer.prompt([
          {
            type: "checkbox",
            name: "modules",
            message: "Select rule modules to install:",
            choices: [
              {
                name: "Core (Essential security & workflow rules)",
                value: "core",
                checked: true,
                disabled: true,
              },
              {
                name: "GitHub Workflow (PR templates, issue tracking)",
                value: "github-workflow",
                checked: true,
              },
              {
                name: "Testing (Test coverage, framework rules)",
                value: "testing",
                checked: projectType !== "library",
              },
              {
                name: "Deployment (Platform-specific checks)",
                value: "deployment",
                checked: projectType === "fullstack",
              },
              {
                name: "Documentation (README, architecture docs)",
                value: "documentation",
                checked: true,
              },
              {
                name: "Development Patterns (Code organization)",
                value: "patterns",
                checked: false,
              },
            ],
          },
        ]);

        // Always include core
        selectedModules["core"] = { enabled: true };
        modules.forEach((mod) => {
          selectedModules[mod] = { enabled: true };
        });
      } else {
        // Use preset based on project type - always include core
        selectedModules = {
          core: { enabled: true },
        };

        if (projectType === "fullstack") {
          selectedModules = {
            ...selectedModules,
            ...configExamples.fullStack.modules,
          };
        } else if (projectType === "web" || projectType === "api") {
          selectedModules = {
            ...selectedModules,
            ...configExamples.frontend.modules,
          };
        } else {
          selectedModules = {
            ...selectedModules,
            ...configExamples.minimal.modules,
          };
        }
      }
    } else {
      // Install all modules
      selectedModules = {
        core: { enabled: true },
        "github-workflow": { enabled: true },
        testing: { enabled: true },
        deployment: { enabled: true },
        documentation: { enabled: true },
        patterns: { enabled: true },
      };
    }

    // Ask about advanced hooks
    let advancedHooksConfig = null;

    // Check if advanced hooks specified via CLI
    if (options.withAdvancedHooks) {
      const categories = options.withAdvancedHooks
        .split(",")
        .map((c) => c.trim())
        .filter((c) => c);
      if (categories.length > 0) {
        advancedHooksConfig = {
          enabled: true,
          categories: categories,
        };
        logger.output(
          chalk.green(
            `✓ Will install advanced hooks: ${categories.join(", ")}`,
          ),
        );
      }
    }
    // Skip advanced hooks in minimal mode or when running tests
    else if (!options.minimal && process.env.NODE_ENV !== "test") {
      const response = await inquirer.prompt([
        {
          type: "confirm",
          name: "installAdvancedHooks",
          message:
            "Install advanced development hooks? (PR health checks, issue tracking, etc.)",
          default: false,
        },
      ]);

      if (response && response.installAdvancedHooks) {
        const { advancedHooks } = require("../config/advanced-hooks");
        const hookChoices = Object.entries(advancedHooks).map(
          ([key, value]) => ({
            name: `${value.name} - ${value.description}`,
            value: key,
            checked: key === "issue-tracking", // Default check issue tracking
          }),
        );

        const { selectedCategories } = await inquirer.prompt([
          {
            type: "checkbox",
            name: "selectedCategories",
            message: "Select advanced hook categories to install:",
            choices: hookChoices,
          },
        ]);

        advancedHooksConfig = {
          enabled: true,
          categories: selectedCategories,
        };
      }
    }

    // Create vibe-codex configuration
    const configTask = simpleLogger.startTask("Creating configuration");
    const vibeCodexConfig = {
      version: "2.0.0",
      modules: selectedModules,
      projectType,
      advancedHooks: advancedHooksConfig,
    };

    // Save configuration
    await fs.writeFile(
      path.join(process.cwd(), ".vibe-codex.json"),
      JSON.stringify(vibeCodexConfig, null, 2),
    );

    // Create legacy configuration object (without writing file)
    const config = {
      version: "2.0.0",
      projectType,
      modules: vibeCodexConfig.modules,
      createdAt: new Date().toISOString(),
      lastModified: new Date().toISOString(),
    };

    // Apply project defaults
    applyProjectDefaults(config, projectType);

    // Create ignore and context files
    await createIgnoreFile();
    await createProjectContext();
    configTask.succeed("Configuration created");

    // Install local rules and related files
    const rulesTask = simpleLogger.startTask("Installing vibe-codex rules");
    await installLocalRules(vibeCodexConfig, options);
    rulesTask.succeed("vibe-codex rules installed");

    // Install git hooks
    if (options.gitHooks !== false) {
      const gitHooksTask = simpleLogger.startTask("Installing git hooks");
      await installGitHooks(config, advancedHooksConfig);
      gitHooksTask.succeed("Git hooks installed");
    }

    // Install GitHub Actions
    if (
      selectedModules["github-workflow"] &&
      selectedModules["github-workflow"].enabled
    ) {
      const actionsTask = simpleLogger.startTask("Setting up GitHub Actions");
      await installGitHubActions(config);
      actionsTask.succeed("GitHub Actions configured");
    }

    // Update package.json
    const pkgTask = simpleLogger.startTask("Updating package.json");
    await updatePackageJson(/* config, packageManager */);
    pkgTask.succeed("package.json updated");

    // Initialize module loader to validate configuration
    const moduleTask = simpleLogger.startTask("Validating module configuration");
    await moduleLoader.initialize(process.cwd());
    moduleTask.succeed("Module configuration validated");

    // Run initial validation
    const validationTask = simpleLogger.startTask("Running initial validation");
    try {
      const validate = require("./validate");
      const originalExitCode = process.exitCode;
      await validate({ json: true, silent: true });

      if (process.exitCode && process.exitCode !== 0) {
        validationTask.fail("Initial validation completed with warnings");
        process.exitCode = originalExitCode; // Reset exit code for init
      } else {
        validationTask.succeed("Initial validation passed");
      }
    } catch (validationError) {
      validationTask.fail(`Initial validation failed: ${validationError.message}`);
    }

    // Show success message and next steps
    showSuccessMessage(
      config,
      selectedModules,
      setupValidation.packageManager,
      advancedHooksConfig,
    );
  } catch (error) {
    if (task) {
      task.fail(`Installation failed: ${error.message}`);
    } else {
      simpleLogger.error(`Installation failed: ${error.message}`);
    }

    // Attempt rollback on failure
    if (rollbackPath && !options.skipRollback) {
      simpleLogger.warning("Attempting to rollback changes...");
      try {
        await rollback(rollbackPath);
        simpleLogger.success("Successfully rolled back changes");
      } catch (rollbackError) {
        simpleLogger.error(`Rollback failed: ${rollbackError.message}`);
        simpleLogger.warning("Manual cleanup may be required");
      }
    }

    throw error;
  }
};

async function updatePackageJson(/* config, packageManager */) {
  const pkgPath = "package.json";

  if (!(await fs.pathExists(pkgPath))) {
    const simpleLogger = getLogger();
  simpleLogger.warning("No package.json found, skipping script updates");
    return;
  }

  const pkg = await fs.readJSON(pkgPath);

  // Add vibe-codex scripts
  pkg.scripts = pkg.scripts || {};
  pkg.scripts["vibe:validate"] = "vibe-codex validate";
  pkg.scripts["vibe:update"] = "vibe-codex update";
  pkg.scripts["vibe:config"] = "vibe-codex config";

  await fs.writeJSON(pkgPath, pkg, { spaces: 2 });
}

function showSuccessMessage(
  config,
  selectedModules,
  packageManager = "npm",
  advancedHooksConfig = null,
) {
  console.log(chalk.green("\n✨ vibe-codex installed successfully!\n"));

  console.log(chalk.bold("Installed modules:"));
  Object.entries(selectedModules).forEach(([name, config]) => {
    if (config.enabled) {
      console.log(chalk.green(`  ✓ ${name}`));
    }
  });

  if (advancedHooksConfig && advancedHooksConfig.enabled) {
    console.log(chalk.bold("\nInstalled advanced hooks:"));
    const { advancedHooks } = require("../config/advanced-hooks");
    advancedHooksConfig.categories.forEach((category) => {
      if (advancedHooks[category]) {
        console.log(chalk.green(`  ✓ ${advancedHooks[category].name}`));
      }
    });
  }

  const { getRunCommand } = require("../utils/package-manager");
  const runCmd = getRunCommand(packageManager, false);

  console.log(chalk.bold("\nNext steps:"));
  console.log("1. Review your configuration:");
  console.log(chalk.cyan("   cat .vibe-codex.json"));

  console.log("\n2. Run validation:");
  if (packageManager === "npm" || runCmd.includes("npx")) {
    console.log(chalk.cyan("   npx vibe-codex validate"));
  } else {
    console.log(chalk.cyan(`   ${runCmd} vibe-codex validate`));
  }

  console.log("\n3. Configure additional modules:");
  if (packageManager === "npm" || runCmd.includes("npx")) {
    console.log(chalk.cyan("   npx vibe-codex config"));
  } else {
    console.log(chalk.cyan(`   ${runCmd} vibe-codex config`));
  }

  console.log("\n4. Commit your changes:");
  console.log(chalk.cyan("   git add ."));
  console.log(
    chalk.cyan('   git commit -m "feat: add vibe-codex configuration"'),
  );

  console.log(chalk.bold("\n💡 Tips:"));
  console.log(`  - Git hooks are installed and will run automatically`);
  console.log(
    `  - To skip hooks temporarily: SKIP_VIBE_CODEX=1 git commit ...`,
  );
  console.log(`  - Package manager detected: ${packageManager}`);

  console.log("\nFor more help:");
  console.log(
    chalk.gray(
      `   ${packageManager === "npm" ? "npx" : runCmd} vibe-codex --help`,
    ),
  );
  console.log(chalk.gray("   https://github.com/tyabonil/vibe-codex"));
}
