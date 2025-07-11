/**
 * Configuration loader for vibe-codex
 * Loads and manages rule configurations using registry.json
 */

const fs = require('fs-extra');
const path = require('path');
const { validateConfig, migrateV2ToV3 } = require('./schema');

/**
 * Load the rule registry
 */
async function loadRegistry() {
  const registryPath = path.join(__dirname, '../../rules/registry.json');
  try {
    return await fs.readJSON(registryPath);
  } catch (error) {
    throw new Error(`Failed to load rule registry: ${error.message}`);
  }
}

/**
 * Load configuration from file
 */
async function loadConfig(configPath = '.vibe-codex.json') {
  try {
    const config = await fs.readJSON(configPath);
    
    // Check if migration is needed
    if (config.version === '2.0.0' || config.version === '1.0.0') {
      console.log('Migrating configuration to v3.0.0...');
      const migrated = migrateV2ToV3(config);
      
      // Save migrated config
      await fs.writeJSON(configPath, migrated, { spaces: 2 });
      console.log('Configuration migrated successfully');
      
      return migrated;
    }
    
    // Validate configuration
    const validation = validateConfig(config);
    if (!validation.valid) {
      throw new Error(`Invalid configuration: ${validation.errors.map(e => e.message).join(', ')}`);
    }
    
    return validation.value;
  } catch (error) {
    if (error.code === 'ENOENT') {
      return null; // No config file exists
    }
    throw error;
  }
}

/**
 * Save configuration to file
 */
async function saveConfig(config, configPath = '.vibe-codex.json') {
  // Update last modified
  config.lastModified = new Date().toISOString();
  
  // Validate before saving
  const validation = validateConfig(config);
  if (!validation.valid) {
    throw new Error(`Invalid configuration: ${validation.errors.map(e => e.message).join(', ')}`);
  }
  
  await fs.writeJSON(configPath, validation.value, { spaces: 2 });
}

/**
 * Apply a preset to configuration
 */
async function applyPreset(presetName) {
  const registry = await loadRegistry();
  const preset = registry.presets[presetName];
  
  if (!preset) {
    throw new Error(`Unknown preset: ${presetName}`);
  }
  
  const config = {
    version: '3.0.0',
    preset: presetName,
    rules: {},
    projectContext: {
      enabled: presetName === 'ai-developer' || presetName === 'enterprise'
    },
    hooks: {
      'pre-commit': true,
      'commit-msg': true,
      'pre-push': true
    },
    createdAt: new Date().toISOString(),
    lastModified: new Date().toISOString()
  };
  
  // Enable rules from preset
  preset.rules.forEach(ruleId => {
    config.rules[ruleId] = { enabled: true };
  });
  
  return config;
}

/**
 * Get enabled rules from configuration
 */
async function getEnabledRules(config) {
  const registry = await loadRegistry();
  const enabledRules = [];
  
  Object.entries(config.rules).forEach(([ruleId, ruleConfig]) => {
    if (ruleConfig.enabled) {
      const rule = registry.rules.find(r => r.id === ruleId);
      if (rule) {
        enabledRules.push({
          ...rule,
          options: ruleConfig.options || {}
        });
      }
    }
  });
  
  return enabledRules;
}

/**
 * Get rules by category
 */
async function getRulesByCategory() {
  const registry = await loadRegistry();
  const categories = {};
  
  registry.rules.forEach(rule => {
    if (!categories[rule.category]) {
      categories[rule.category] = [];
    }
    categories[rule.category].push(rule);
  });
  
  return categories;
}

/**
 * Get hook implementations for enabled rules
 */
async function getHookImplementations(config) {
  const enabledRules = await getEnabledRules(config);
  const hooks = {
    'pre-commit': [],
    'commit-msg': [],
    'pre-push': [],
    'post-commit': [],
    'post-merge': []
  };
  
  enabledRules.forEach(rule => {
    if (rule.implementation && hooks[rule.implementation]) {
      hooks[rule.implementation].push({
        ruleId: rule.id,
        name: rule.name,
        script: getHookScriptPath(rule.id)
      });
    }
  });
  
  return hooks;
}

/**
 * Get hook script path for a rule
 */
function getHookScriptPath(ruleId) {
  // Map rule IDs to hook scripts
  const hookMappings = {
    'sec-001': 'templates/hooks/pre-commit-simple.sh',
    'sec-002': 'templates/hooks/pre-commit-simple.sh',
    'sec-003': 'templates/hooks/pre-commit-simple.sh',
    'cmt-001': 'templates/hooks/commit-msg-simple.sh',
    'cmt-002': 'templates/hooks/commit-msg-simple.sh',
    'wfl-005': 'templates/hooks/work-tracking-pre-commit.sh',
    'wfl-006': 'templates/hooks/pre-push-conflict-check.sh',
    'doc-004': 'templates/hooks/doc-update-check.sh',
    // Add more mappings as needed
  };
  
  return hookMappings[ruleId] || null;
}

/**
 * Create default configuration
 */
async function createDefaultConfig(projectType = 'custom') {
  const registry = await loadRegistry();
  const preset = projectType === 'custom' ? 'minimal' : 'standard';
  
  return applyPreset(preset);
}

/**
 * Update rule configuration
 */
function updateRule(config, ruleId, enabled, options = {}) {
  if (!config.rules) {
    config.rules = {};
  }
  
  config.rules[ruleId] = {
    enabled,
    ...(Object.keys(options).length > 0 && { options })
  };
  
  config.lastModified = new Date().toISOString();
  return config;
}

/**
 * Get configuration summary
 */
async function getConfigSummary(config) {
  const registry = await loadRegistry();
  const enabledRules = await getEnabledRules(config);
  
  const summary = {
    version: config.version,
    preset: config.preset,
    totalRules: registry.rules.length,
    enabledRules: enabledRules.length,
    categories: {},
    hooks: Object.entries(config.hooks || {}).filter(([, enabled]) => enabled).map(([name]) => name)
  };
  
  // Count rules by category
  enabledRules.forEach(rule => {
    if (!summary.categories[rule.category]) {
      summary.categories[rule.category] = 0;
    }
    summary.categories[rule.category]++;
  });
  
  return summary;
}

module.exports = {
  loadRegistry,
  loadConfig,
  saveConfig,
  applyPreset,
  getEnabledRules,
  getRulesByCategory,
  getHookImplementations,
  createDefaultConfig,
  updateRule,
  getConfigSummary
};