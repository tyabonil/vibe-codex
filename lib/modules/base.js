/**
 * Base module interface for vibe-codex rule modules
 */
export class RuleModule {
  /**
   * @param {Object} config - Module configuration
   * @param {string} config.name - Module name
   * @param {string} config.version - Module version
   * @param {string} config.description - Module description
   * @param {Array<string>} config.dependencies - Required module dependencies
   * @param {Object} config.options - Module-specific options
   */
  constructor(config) {
    this.name = config.name;
    this.version = config.version;
    this.description = config.description;
    this.dependencies = config.dependencies || [];
    this.options = config.options || {};
    this.enabled = true;
    this.rules = [];
    this.hooks = {};
    this.validators = {};
  }

  /**
   * Initialize the module
   * @returns {Promise<void>}
   */
  async initialize() {
    try {
      // Load rules, hooks, and validators
      await this.loadRules();
      await this.loadHooks();
      await this.loadValidators();
    } catch (error) {
      throw new Error(
        `Failed to initialize module ${this.name}: ${error.message}`,
      );
    }
  }

  /**
   * Load module rules
   * @returns {Promise<void>}
   */
  async loadRules() {
    throw new Error(`Module ${this.name} must implement loadRules()`);
  }

  /**
   * Load module hooks
   * @returns {Promise<void>}
   */
  async loadHooks() {
    // Default implementation - modules can override
    return {};
  }

  /**
   * Load module validators
   * @returns {Promise<void>}
   */
  async loadValidators() {
    // Default implementation - modules can override
    return {};
  }

  /**
   * Validate module configuration
   * @param {Object} projectConfig - Project configuration
   * @returns {Array<Object>} - Validation errors
   */
  validateConfig(projectConfig) {
    const errors = [];

    // Check dependencies
    for (const dep of this.dependencies) {
      if (!projectConfig.modules[dep] || !projectConfig.modules[dep].enabled) {
        errors.push({
          module: this.name,
          type: "dependency",
          message: `Module '${this.name}' requires '${dep}' module to be enabled`,
        });
      }
    }

    return errors;
  }

  /**
   * Get rules for a specific level
   * @param {number} level - Rule level (1-5)
   * @returns {Array<Object>} - Rules for the level
   */
  getRulesByLevel(level) {
    return this.rules.filter((rule) => rule.level === level);
  }

  /**
   * Get all enabled rules
   * @returns {Array<Object>} - All enabled rules
   */
  getEnabledRules() {
    return this.rules.filter((rule) => rule.enabled !== false);
  }

  /**
   * Get hooks for a specific event
   * @param {string} event - Hook event name
   * @returns {Array<Function>} - Hook functions
   */
  getHooks(event) {
    return this.hooks[event] || [];
  }

  /**
   * Register a new rule
   * @param {Object} rule - Rule definition
   */
  registerRule(rule) {
    this.rules.push({
      module: this.name,
      ...rule,
    });
  }

  /**
   * Register a new hook
   * @param {string} event - Hook event name
   * @param {Function} handler - Hook handler function
   */
  registerHook(event, handler) {
    if (!this.hooks[event]) {
      this.hooks[event] = [];
    }
    this.hooks[event].push(handler);
  }

  /**
   * Register a new validator
   * @param {string} name - Validator name
   * @param {Function} validator - Validator function
   */
  registerValidator(name, validator) {
    this.validators[name] = validator;
  }
}

/**
 * Rule definition structure
 */
export const RuleDefinition = {
  id: "", // Unique rule ID
  name: "", // Human-readable name
  description: "", // Detailed description
  level: 1, // Rule level (1-5)
  category: "", // Rule category
  severity: "", // 'error', 'warning', 'info'
  enabled: true, // Whether rule is enabled
  check: null, // Validation function
  fix: null, // Auto-fix function (optional)
  docs: "", // Documentation URL
  tags: [], // Rule tags for filtering
};
