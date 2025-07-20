/**
 * Config command - CLI-only configuration management
 */

const chalk = require("chalk");
const logger = require("../utils/logger");
const {
  loadConfig,
  saveConfig,
  loadRegistry,
  getRulesByCategory,
  getConfigSummary,
  updateRule,
  applyPreset,
} = require("../config/loader");

module.exports = async function config(options) {
  // Check for non-interactive mode
  const isNonInteractive = process.env.CI || process.env.NONINTERACTIVE || options.nonInteractive;

  // If no options provided and not in non-interactive mode, show help
  if (!options || Object.keys(options).length === 0) {
    if (isNonInteractive) {
      throw new Error("No configuration action specified. Use --list, --set, --reset, --export, --import, or --preview");
    }
    showHelp();
    return;
  }

  // Route to appropriate action
  if (options.list) {
    return listConfiguration();
  } else if (options.set) {
    return setConfiguration(options.set);
  } else if (options.reset) {
    return resetConfiguration(options.force || isNonInteractive);
  } else if (options.export) {
    return exportConfiguration(options.export);
  } else if (options.import) {
    return importConfiguration(options.import);
  } else if (options.preview) {
    return previewConfiguration();
  } else {
    showHelp();
  }
};

/**
 * Show help message
 */
function showHelp() {
  console.log(chalk.blue("🔧 vibe-codex Configuration\n"));
  console.log("Usage:");
  console.log("  vibe-codex config --list                    # List current configuration");
  console.log("  vibe-codex config --set <key>=<value>       # Set configuration value");
  console.log("  vibe-codex config --reset [--force]         # Reset to defaults");
  console.log("  vibe-codex config --export [file]           # Export configuration");
  console.log("  vibe-codex config --import <file>           # Import configuration");
  console.log("  vibe-codex config --preview                 # Preview configuration");
  console.log();
  console.log("Examples:");
  console.log("  vibe-codex config --set rule.no-console=disabled");
  console.log("  vibe-codex config --set testing.coverage.threshold=90");
  console.log("  vibe-codex config --export config-backup.json");
}

/**
 * List configuration
 */
async function listConfiguration() {
  try {
    const config = await loadConfig();
    if (!config) {
      logger.warn("No configuration file found.");
      logger.info('Run "npx vibe-codex init" to create one.');
      return;
    }
    
    const summary = await getConfigSummary(config);
    
    console.log(chalk.blue("📋 Current Configuration\n"));
    console.log(chalk.gray(`Version: ${config.version}`));
    console.log(chalk.gray(`Preset: ${config.preset || 'custom'}`));
    console.log(chalk.gray(`Project Type: ${config.projectType || 'unknown'}`));
    console.log(chalk.gray(`Enabled Rules: ${summary.enabledRules}/${summary.totalRules}`));
    console.log();
    
    // Show modules
    if (config.modules) {
      console.log(chalk.yellow("Modules:"));
      Object.entries(config.modules).forEach(([name, module]) => {
        const status = module.enabled ? chalk.green('✓') : chalk.red('✗');
        console.log(`  ${status} ${name}`);
      });
      console.log();
    }
    
    // Show rules summary by category
    const registry = await loadRegistry();
    const categories = Object.keys(registry.categories || {});
    
    if (categories.length > 0) {
      console.log(chalk.yellow("Rules by Category:"));
      for (const category of categories) {
        const rules = await getRulesByCategory(config, category);
        const enabledCount = rules.filter(r => r.enabled).length;
        console.log(`  ${category}: ${enabledCount}/${rules.length} enabled`);
      }
    }
    
  } catch (error) {
    logger.error("Error listing configuration:", error.message);
    throw error;
  }
}

/**
 * Set configuration value
 */
async function setConfiguration(keyValue) {
  try {
    if (!keyValue || !keyValue.includes("=")) {
      throw new Error(
        "Invalid format. Use: vibe-codex config --set key=value"
      );
    }
    
    const [key, value] = keyValue.split("=");
    const config = await loadConfig();
    
    if (!config) {
      throw new Error("No configuration file found");
    }
    
    // Parse the key path
    const keys = key.split(".");
    let current = config;
    
    // Navigate to the parent object
    for (let i = 0; i < keys.length - 1; i++) {
      if (!current[keys[i]]) {
        current[keys[i]] = {};
      }
      current = current[keys[i]];
    }
    
    // Set the value
    const lastKey = keys[keys.length - 1];
    const parsedValue = parseValue(value);
    current[lastKey] = parsedValue;
    
    // Save configuration
    await saveConfig(config);
    logger.success(`Configuration updated: ${key} = ${value}`);
    
  } catch (error) {
    logger.error("Error setting configuration:", error.message);
    throw error;
  }
}

/**
 * Parse configuration value
 */
function parseValue(value) {
  // Boolean values
  if (value === "true") return true;
  if (value === "false") return false;
  
  // Numeric values
  if (/^\d+$/.test(value)) return parseInt(value, 10);
  if (/^\d+\.\d+$/.test(value)) return parseFloat(value);
  
  // Array values (comma-separated)
  if (value.includes(",")) {
    return value.split(",").map(v => v.trim());
  }
  
  // String value
  return value;
}

/**
 * Reset configuration
 */
async function resetConfiguration(force = false) {
  try {
    if (!force) {
      console.log(chalk.yellow("⚠️  This will reset all configuration to defaults."));
      console.log("Use --force to confirm reset without prompting.");
      return;
    }
    
    const newConfig = await applyPreset("minimal");
    await saveConfig(newConfig);
    logger.success("Configuration reset to defaults");
    
  } catch (error) {
    logger.error("Error resetting configuration:", error.message);
    throw error;
  }
}

/**
 * Export configuration
 */
async function exportConfiguration(file) {
  try {
    const config = await loadConfig();
    if (!config) {
      throw new Error("No configuration file found");
    }
    
    if (file && file !== true) {
      const fs = require("fs-extra");
      await fs.writeJSON(file, config, { spaces: 2 });
      logger.success(`Configuration exported to ${file}`);
    } else {
      // Output to stdout
      console.log(JSON.stringify(config, null, 2));
    }
    
  } catch (error) {
    logger.error("Error exporting configuration:", error.message);
    throw error;
  }
}

/**
 * Import configuration
 */
async function importConfiguration(file) {
  try {
    if (!file || file === true) {
      throw new Error("Configuration file path required");
    }
    
    const fs = require("fs-extra");
    if (!(await fs.pathExists(file))) {
      throw new Error(`Configuration file not found: ${file}`);
    }
    
    const newConfig = await fs.readJSON(file);
    
    // Validate configuration
    const { validateConfig } = require("../config/schema");
    const validation = validateConfig(newConfig);
    
    if (!validation.valid) {
      throw new Error(`Invalid configuration: ${validation.errors.join(", ")}`);
    }
    
    // Save configuration
    await saveConfig(newConfig);
    logger.success("Configuration imported successfully");
    
  } catch (error) {
    logger.error("Error importing configuration:", error.message);
    throw error;
  }
}

/**
 * Preview configuration
 */
async function previewConfiguration() {
  try {
    const config = await loadConfig();
    if (!config) {
      console.log(chalk.yellow("No configuration file found."));
      return;
    }
    
    const summary = await getConfigSummary(config);
    
    console.log(chalk.blue("📋 Configuration Preview\n"));
    console.log(chalk.yellow("This configuration will:"));
    console.log(`  • Enable ${summary.enabledRules} rules`);
    console.log(`  • Check ${summary.categories.length} categories`);
    
    if (config.modules) {
      const enabledModules = Object.entries(config.modules)
        .filter(([_, m]) => m.enabled)
        .map(([name]) => name);
      console.log(`  • Use modules: ${enabledModules.join(", ")}`);
    }
    
    if (config.hooks) {
      const hooks = Object.keys(config.hooks);
      console.log(`  • Install hooks: ${hooks.join(", ")}`);
    }
    
    console.log();
    console.log(chalk.gray("Run 'vibe-codex validate' to check compliance"));
    
  } catch (error) {
    logger.error("Error previewing configuration:", error.message);
    throw error;
  }
}