/**
 * CLI argument parsing utilities
 */

/**
 * Parse comma-separated module list
 * @param {string} modulesArg - Comma-separated list or 'all'
 * @returns {string[]} Array of module names
 */
function parseModuleList(modulesArg) {
  if (!modulesArg) {
    return [];
  }

  if (modulesArg === 'all') {
    return ['core', 'github-workflow', 'testing', 'deployment', 'documentation', 'patterns'];
  }

  return modulesArg
    .split(',')
    .map(m => m.trim())
    .filter(m => m);
}

/**
 * Convert CLI module list to module config object
 * @param {string[]} moduleList - Array of module names
 * @returns {Object} Module configuration object
 */
function modulesToConfig(moduleList) {
  const config = {
    core: { enabled: true } // Core is always enabled
  };

  moduleList.forEach(module => {
    if (module !== 'core') {
      config[module] = { enabled: true };
    }
  });

  return config;
}

/**
 * Parse advanced hooks argument
 * @param {string} hooksArg - Comma-separated list of hook categories
 * @returns {Object|null} Advanced hooks configuration
 */
function parseAdvancedHooks(hooksArg) {
  if (!hooksArg) {
    return null;
  }

  const categories = hooksArg
    .split(',')
    .map(c => c.trim())
    .filter(c => c);

  if (categories.length === 0) {
    return null;
  }

  return {
    enabled: true,
    categories: categories
  };
}

/**
 * Get default modules for project type
 * @param {string} projectType - The project type
 * @returns {Object} Default module configuration
 */
function getProjectDefaults(projectType) {
  const defaults = {
    web: {
      core: { enabled: true },
      'github-workflow': { enabled: true },
      testing: { enabled: true },
      documentation: { enabled: true }
    },
    api: {
      core: { enabled: true },
      'github-workflow': { enabled: true },
      testing: { enabled: true },
      documentation: { enabled: true }
    },
    fullstack: {
      core: { enabled: true },
      'github-workflow': { enabled: true },
      testing: { enabled: true },
      deployment: { enabled: true },
      documentation: { enabled: true }
    },
    library: {
      core: { enabled: true },
      'github-workflow': { enabled: true },
      documentation: { enabled: true }
    },
    custom: {
      core: { enabled: true }
    }
  };

  return defaults[projectType] || defaults.custom;
}

/**
 * Process init command CLI arguments
 * @param {Object} options - CLI options
 * @returns {Object} Processed configuration
 */
function processInitArgs(options) {
  const config = {
    interactive: options.interactive || false
  };

  // Handle project type
  if (options.type && options.type !== 'auto') {
    config.projectType = options.type;
  }

  // Handle modules
  if (options.minimal) {
    config.modules = { core: { enabled: true } };
  } else if (options.modules) {
    const moduleList = parseModuleList(options.modules);
    config.modules = modulesToConfig(moduleList);
  } else if (options.preset && config.projectType) {
    config.modules = getProjectDefaults(config.projectType);
  }

  // Handle advanced hooks
  if (options.withAdvancedHooks) {
    config.advancedHooks = parseAdvancedHooks(options.withAdvancedHooks);
  }

  return config;
}

module.exports = {
  parseModuleList,
  modulesToConfig,
  parseAdvancedHooks,
  getProjectDefaults,
  processInitArgs
};