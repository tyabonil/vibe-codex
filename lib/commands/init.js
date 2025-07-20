/**
 * Init command - Initialize vibe-codex in a project
 */

const chalk = require("chalk");
const ora = require("ora");
const inquirer = require("../utils/inquirer-fix");
const fs = require("fs-extra");
const path = require("path");
const semver = require("semver");
const { detectProjectType, detectTestFramework } = require("../utils/detector");
const { preflightChecks } = require("../utils/preflight");
const { installGitHooks } = require("../installer/git-hooks");
const { installGitHubActions } = require("../installer/github-actions");
const { installLocalRules } = require("../installer/local-rules");
const { createConfiguration, applyProjectDefaults, createIgnoreFile, createProjectContext } = require("../utils/config-creator");
const moduleLoader = require("../modules/loader-wrapper");
const { configExamples } = require("../modules/config-schema-commonjs");
const {
  validateSetup,
  getInstallInstructions,
} = require("../utils/package-manager");
const logger = require("../utils/logger");
const { createRollbackPoint, rollback } = require("../utils/rollback");
const { processInitArgs } = require("../utils/cli-args");

module.exports = async function init(options) {
  console.log(chalk.blue("\n🎯 Welcome to vibe-codex!\n"));

  const spinner = ora("Running pre-flight checks...").start();
  let rollbackPath = null;

  try {
    // Validate package manager setup
    const setupValidation = await validateSetup();

    if (setupValidation.errors.length > 0) {
      spinner.fail("Setup validation failed");
      logger.output(chalk.red("\n❌ Setup errors:"));
      setupValidation.errors.forEach((err) =>
        logger.output(chalk.red(`   - ${err}`)),
      );
      process.exit(1);
    }

    if (setupValidation.warnings.length > 0) {
      spinner.warn("Setup validation completed with warnings");
      logger.output(chalk.yellow("\n⚠️  Warnings:"));
      setupValidation.warnings.forEach((warn) =>
        logger.output(chalk.yellow(`   - ${warn}`)),
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
      spinner.succeed("Setup validation passed");
    }

    // Run pre-flight checks
    const { packageManager } = await preflightChecks(options);
    spinner.succeed("Pre-flight checks passed");

    // Create rollback point after pre-flight checks
    if (!options.skipRollback) {
      spinner.start("Creating rollback point...");
      rollbackPath = await createRollbackPoint();
      spinner.succeed("Rollback point created");
    }

    // Process CLI arguments
    const cliConfig = processInitArgs(options);
    
    // Detect or ask for project type
    let projectType = options.type;
    if (projectType === "auto") {
      projectType = await detectProjectType();
      if (!projectType && !cliConfig.interactive) {
        // In non-interactive mode, default to custom
        projectType = "custom";
        logger.output(chalk.yellow("⚠️  Could not detect project type, using 'custom'"));
      } else if (!projectType) {
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
        logger.output(chalk.green(`✓ Detected project type: ${projectType}`));
      }
    }

    // Ask about module selection for modular rules
    let selectedModules = {};
    
    // Check if modules were specified via CLI
    if (cliConfig.modules) {
      selectedModules = cliConfig.modules;
      logger.output(chalk.green(`✓ Using modules from command line: ${Object.keys(selectedModules).filter(m => selectedModules[m].enabled).join(', ')}`));
    } else if (options.minimal) {
      // Use minimal configuration
      selectedModules = {
        core: { enabled: true },
        ...configExamples.minimal.modules,
      };
    } else if (options.modules === "all") {
      // Install all modules
      selectedModules = {
        core: { enabled: true },
        "github-workflow": { enabled: true },
        testing: { enabled: true },
        deployment: { enabled: true },
        documentation: { enabled: true },
        patterns: { enabled: true },
      };
    } else if (!cliConfig.interactive) {
      // Non-interactive mode without explicit modules - use project defaults
      selectedModules = cliConfig.modules || require("../utils/cli-args").getProjectDefaults(projectType);
      logger.output(chalk.green(`✓ Using default modules for ${projectType} project`));
    } else {
      // Interactive mode
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
    }

    // Ask about advanced hooks
    let advancedHooksConfig = null;

    // Check if advanced hooks specified via CLI
    if (cliConfig.advancedHooks) {
      advancedHooksConfig = cliConfig.advancedHooks;
      logger.output(
        chalk.green(
          `✓ Will install advanced hooks: ${advancedHooksConfig.categories.join(", ")}`,
        ),
      );
    } else if (options.withAdvancedHooks) {
      // Legacy CLI option support
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
    // Skip advanced hooks in minimal mode, non-interactive mode, or when running tests
    else if (!options.minimal && cliConfig.interactive && process.env.NODE_ENV !== "test") {
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
    spinner.start("Creating configuration...");
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
    spinner.succeed("Configuration created");

    // Install local rules and related files
    spinner.start("Installing vibe-codex rules...");
    await installLocalRules(vibeCodexConfig, options);
    spinner.succeed("vibe-codex rules installed");

    // Install git hooks
    if (options.gitHooks !== false) {
      spinner.start("Installing git hooks...");
      await installGitHooks(config, advancedHooksConfig);
      spinner.succeed("Git hooks installed");
    }

    // Install GitHub Actions
    if (
      selectedModules["github-workflow"] &&
      selectedModules["github-workflow"].enabled
    ) {
      spinner.start("Setting up GitHub Actions...");
      await installGitHubActions(config);
      spinner.succeed("GitHub Actions configured");
    }

    // Update package.json
    spinner.start("Updating package.json...");
    await updatePackageJson(config, packageManager);
    spinner.succeed("package.json updated");

    // Initialize module loader to validate configuration
    spinner.start("Validating module configuration...");
    await moduleLoader.initialize(process.cwd());
    spinner.succeed("Module configuration validated");

    // Run initial validation
    spinner.start("Running initial validation...");
    try {
      const validate = require("./validate");
      const originalExitCode = process.exitCode;
      await validate({ json: true, silent: true });

      if (process.exitCode && process.exitCode !== 0) {
        spinner.warn("Initial validation completed with warnings");
        process.exitCode = originalExitCode; // Reset exit code for init
      } else {
        spinner.succeed("Initial validation passed");
      }
    } catch (validationError) {
      spinner.warn(`Initial validation failed: ${validationError.message}`);
    }

    // Show success message and next steps
    showSuccessMessage(
      config,
      selectedModules,
      setupValidation.packageManager,
      advancedHooksConfig,
    );
  } catch (error) {
    spinner.fail(`Installation failed: ${error.message}`);

    // Attempt rollback on failure
    if (rollbackPath && !options.skipRollback) {
      console.log(chalk.yellow("\n⚠️  Attempting to rollback changes..."));
      try {
        await rollback(rollbackPath);
        console.log(chalk.green("✓ Successfully rolled back changes"));
      } catch (rollbackError) {
        console.error(chalk.red("❌ Rollback failed:"), rollbackError.message);
        console.log(chalk.yellow("Manual cleanup may be required"));
      }
    }

    throw error;
  }
};

async function updatePackageJson(config, packageManager) {
  const pkgPath = "package.json";

  if (!(await fs.pathExists(pkgPath))) {
    logger.warn("No package.json found, skipping script updates");
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
