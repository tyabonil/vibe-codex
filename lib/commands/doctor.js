/**
 * Doctor command - Diagnose vibe-codex installation issues
 */

const chalk = require("chalk");
const fs = require("fs-extra");
const path = require("path");
const { exec } = require("child_process");
const { promisify } = require("util");
const {
  validateSetup,
  detectPackageManager,
  checkNpxAvailability,
  getInstallInstructions,
} = require("../utils/package-manager");
const { getLogger } = require("../utils/simple-logger");

const execAsync = promisify(exec);

module.exports = async function doctor(options) {
  const logger = getLogger({
    quiet: options.quiet,
    json: options.json,
    verbose: options.verbose
  });
  
  if (!options.quiet && !options.json) {
    console.log(chalk.blue("\n🩺 Running vibe-codex diagnostics...\n"));
  }

  const checks = [];
  const issues = [];
  const suggestions = [];

  // Check Node.js version
  const nodeCheck = await checkNodeVersion();
  checks.push(nodeCheck);
  if (!nodeCheck.passed) issues.push(nodeCheck);

  // Check npm/npx availability
  const npxCheck = await checkNpx();
  checks.push(npxCheck);
  if (!npxCheck.passed) issues.push(npxCheck);

  // Check package manager
  const pmCheck = await checkPackageManager();
  checks.push(pmCheck);
  if (!pmCheck.passed) issues.push(pmCheck);

  // Check Git installation
  const gitCheck = await checkGit();
  checks.push(gitCheck);
  if (!gitCheck.passed) issues.push(gitCheck);

  // Check vibe-codex installation
  const vibeCheck = await checkVibeCodex();
  checks.push(vibeCheck);
  if (!vibeCheck.passed) issues.push(vibeCheck);

  // Check configuration
  const configCheck = await checkConfiguration();
  checks.push(configCheck);
  if (!configCheck.passed) issues.push(configCheck);

  // Check Git hooks
  const hooksCheck = await checkGitHooks();
  checks.push(hooksCheck);
  if (!hooksCheck.passed) issues.push(hooksCheck);

  // Display results
  console.log(chalk.bold("\n📋 Diagnostic Results:\n"));

  checks.forEach((check) => {
    const icon = check.passed ? chalk.green("✓") : chalk.red("✗");
    const status = check.passed ? chalk.green("PASSED") : chalk.red("FAILED");
    console.log(`${icon} ${check.name}: ${status}`);
    if (!check.passed && check.details) {
      console.log(chalk.gray(`  ${check.details}`));
    }
  });

  // Display issues and fixes
  if (issues.length > 0) {
    console.log(chalk.red(`\n❌ Found ${issues.length} issue(s):\n`));

    issues.forEach((issue, index) => {
      console.log(chalk.red(`${index + 1}. ${issue.name}`));
      console.log(chalk.gray(`   ${issue.details}`));
      if (issue.fix) {
        console.log(chalk.yellow(`   Fix: ${issue.fix}`));
      }
      console.log();
    });

    if (options.fix) {
      console.log(chalk.blue("\n🔧 Attempting automatic fixes...\n"));
      await attemptFixes(issues);
    } else {
      console.log(
        chalk.yellow("💡 Run with --fix flag to attempt automatic fixes"),
      );
    }
  } else {
    console.log(
      chalk.green(
        "\n✨ All checks passed! vibe-codex is properly configured.\n",
      ),
    );
  }

  // Show additional suggestions
  if (suggestions.length > 0) {
    console.log(chalk.blue("\n💡 Suggestions:\n"));
    suggestions.forEach((suggestion) => {
      console.log(`- ${suggestion}`);
    });
  }
};

async function checkNodeVersion() {
  try {
    const { stdout } = await execAsync("node --version");
    const version = stdout.trim();
    const major = parseInt(version.slice(1).split(".")[0]);

    if (major < 14) {
      return {
        name: "Node.js version",
        passed: false,
        details: `Version ${version} is too old (minimum: v14.0.0)`,
        fix: "Update Node.js to v14 or higher",
      };
    }

    return {
      name: "Node.js version",
      passed: true,
      details: version,
    };
  } catch (error) {
    return {
      name: "Node.js version",
      passed: false,
      details: "Node.js not found",
      fix: "Install Node.js from https://nodejs.org",
    };
  }
}

async function checkNpx() {
  const npxInfo = await checkNpxAvailability();

  if (!npxInfo.available) {
    return {
      name: "npx availability",
      passed: false,
      details: `npm ${npxInfo.npmVersion || "unknown"} - npx not available`,
      fix: "Update npm: npm install -g npm@latest",
    };
  }

  return {
    name: "npx availability",
    passed: true,
    details: `npm ${npxInfo.npmVersion}`,
  };
}

async function checkPackageManager() {
  try {
    const pm = await detectPackageManager();
    const { stdout } = await execAsync(`${pm} --version`);

    return {
      name: "Package manager",
      passed: true,
      details: `${pm} ${stdout.trim()}`,
    };
  } catch (error) {
    return {
      name: "Package manager",
      passed: false,
      details: "Package manager not detected",
      fix: "Ensure npm, yarn, or pnpm is installed",
    };
  }
}

async function checkGit() {
  try {
    const { stdout } = await execAsync("git --version");
    const version = stdout.trim();

    // Check if in a git repository
    try {
      await execAsync("git rev-parse --is-inside-work-tree");
      return {
        name: "Git",
        passed: true,
        details: `${version} (in repository)`,
      };
    } catch {
      return {
        name: "Git",
        passed: false,
        details: `${version} (not in a git repository)`,
        fix: "Run: git init",
      };
    }
  } catch (error) {
    return {
      name: "Git",
      passed: false,
      details: "Git not found",
      fix: "Install Git from https://git-scm.com",
    };
  }
}

async function checkVibeCodex() {
  // Check if vibe-codex is accessible
  const checks = [
    { method: "npx", command: "npx --no-install vibe-codex --version" },
    { method: "local", command: "./node_modules/.bin/vibe-codex --version" },
    { method: "global", command: "vibe-codex --version" },
  ];

  for (const check of checks) {
    try {
      const { stdout } = await execAsync(check.command);
      return {
        name: "vibe-codex installation",
        passed: true,
        details: `Found via ${check.method}: ${stdout.trim()}`,
      };
    } catch {
      // Continue to next method
    }
  }

  const pm = await detectPackageManager();
  const instructions = getInstallInstructions(pm);

  return {
    name: "vibe-codex installation",
    passed: false,
    details: "vibe-codex not found in PATH",
    fix: `Install with: ${instructions.local}`,
  };
}

async function checkConfiguration() {
  const configPath = path.join(process.cwd(), ".vibe-codex.json");

  try {
    const config = await fs.readJSON(configPath);

    // Validate configuration structure
    if (!config.version || !config.modules) {
      return {
        name: "Configuration file",
        passed: false,
        details: "Invalid configuration structure",
        fix: "Run: npx vibe-codex init --force",
      };
    }

    const moduleCount = Object.keys(config.modules).filter(
      (m) => config.modules[m].enabled,
    ).length;

    return {
      name: "Configuration file",
      passed: true,
      details: `Valid (${moduleCount} modules enabled)`,
    };
  } catch (error) {
    return {
      name: "Configuration file",
      passed: false,
      details: "Configuration file not found",
      fix: "Run: npx vibe-codex init",
    };
  }
}

async function checkGitHooks() {
  const hooksDir = path.join(process.cwd(), ".git", "hooks");
  const requiredHooks = ["pre-commit", "commit-msg"];
  const foundHooks = [];
  const missingHooks = [];

  for (const hook of requiredHooks) {
    const hookPath = path.join(hooksDir, hook);
    try {
      const content = await fs.readFile(hookPath, "utf8");
      if (content.includes("vibe-codex")) {
        foundHooks.push(hook);
      } else {
        missingHooks.push(hook);
      }
    } catch {
      missingHooks.push(hook);
    }
  }

  if (missingHooks.length > 0) {
    return {
      name: "Git hooks",
      passed: false,
      details: `Missing hooks: ${missingHooks.join(", ")}`,
      fix: "Run: npx vibe-codex update --hooks",
    };
  }

  return {
    name: "Git hooks",
    passed: true,
    details: `All hooks installed (${foundHooks.join(", ")})`,
  };
}

async function attemptFixes(issues) {
  const logger = getLogger();

  for (const issue of issues) {
    if (issue.fix && issue.fix.startsWith("Run:")) {
      const command = issue.fix.replace("Run: ", "");
      const task = logger.startTask(`Fixing: ${issue.name}`);

      try {
        await execAsync(command);
        task.succeed(`Fixed: ${issue.name}`);
      } catch (error) {
        task.fail(`Failed to fix: ${issue.name}`);
        logger.error(`  ${error.message}`);
      }
    } else {
      logger.warning(`Manual fix required for: ${issue.name}`);
      logger.info(`   ${issue.fix}`);
    }
  }
}
