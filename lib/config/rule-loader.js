const fs = require('fs-extra');
const path = require('path');
const SchemaValidator = require('./schema-validator');

/**
 * RuleLoader - Loads and manages rule and hook definitions
 */
class RuleLoader {
  constructor(options = {}) {
    this.rulesDir = options.rulesDir || path.join(__dirname, '../../rules');
    this.definitionsDir = path.join(this.rulesDir, 'definitions');
    this.rulesetsDir = path.join(this.rulesDir, 'rulesets');
    this.scriptsDir = path.join(this.rulesDir, 'scripts');
    
    this.validator = new SchemaValidator();
    this.cache = new Map();
    this.rulesetCache = new Map();
  }

  /**
   * Load a rule or hook definition by ID
   * @param {string} id - The rule/hook ID
   * @returns {Promise<Object>} The validated rule/hook definition
   */
  async loadRule(id) {
    // Check cache first
    if (this.cache.has(id)) {
      return this.cache.get(id);
    }

    const filePath = path.join(this.definitionsDir, `${id}.json`);
    
    try {
      const exists = await fs.pathExists(filePath);
      if (!exists) {
        throw new Error(`Rule definition not found: ${id}`);
      }

      const definition = await fs.readJSON(filePath);
      
      // Validate the definition
      const validation = this.validator.validate(definition, 'rule');
      if (!validation.valid) {
        throw new Error(`Invalid rule definition for ${id}: ${validation.error}`);
      }

      // Cache the validated definition
      this.cache.set(id, validation.value);
      return validation.value;
    } catch (error) {
      throw new Error(`Failed to load rule ${id}: ${error.message}`);
    }
  }

  /**
   * Load multiple rules by IDs
   * @param {string[]} ids - Array of rule/hook IDs
   * @returns {Promise<Object[]>} Array of validated definitions
   */
  async loadRules(ids) {
    const rules = await Promise.all(
      ids.map(id => this.loadRule(id))
    );
    return rules;
  }

  /**
   * Load a ruleset by ID
   * @param {string} id - The ruleset ID
   * @returns {Promise<Object>} The validated ruleset with expanded rules
   */
  async loadRuleset(id) {
    // Check cache first
    if (this.rulesetCache.has(id)) {
      return this.rulesetCache.get(id);
    }

    const filePath = path.join(this.rulesetsDir, `${id}.json`);
    
    try {
      const exists = await fs.pathExists(filePath);
      if (!exists) {
        throw new Error(`Ruleset not found: ${id}`);
      }

      const ruleset = await fs.readJSON(filePath);
      
      // Validate the ruleset
      const validation = this.validator.validate(ruleset, 'ruleset');
      if (!validation.valid) {
        throw new Error(`Invalid ruleset ${id}: ${validation.error}`);
      }

      // Expand extended rulesets
      let allRules = [...(validation.value.rules || [])];
      let allHooks = [...(validation.value.hooks || [])];
      
      if (validation.value.extends) {
        for (const parentId of validation.value.extends) {
          const parent = await this.loadRuleset(parentId);
          allRules = [...new Set([...parent.rules, ...allRules])];
          allHooks = [...new Set([...parent.hooks, ...allHooks])];
        }
      }

      // Create expanded ruleset
      const expandedRuleset = {
        ...validation.value,
        rules: allRules,
        hooks: allHooks,
        // Load actual rule definitions
        loadedRules: await this.loadRules(allRules)
      };

      // Cache the expanded ruleset
      this.rulesetCache.set(id, expandedRuleset);
      return expandedRuleset;
    } catch (error) {
      throw new Error(`Failed to load ruleset ${id}: ${error.message}`);
    }
  }

  /**
   * List all available rules
   * @returns {Promise<Object[]>} Array of rule metadata
   */
  async listRules() {
    try {
      const files = await fs.readdir(this.definitionsDir);
      const jsonFiles = files.filter(f => f.endsWith('.json'));
      
      const rules = [];
      for (const file of jsonFiles) {
        try {
          const rule = await this.loadRule(path.basename(file, '.json'));
          rules.push({
            id: rule.id,
            name: rule.metadata.name,
            type: rule.type,
            category: rule.metadata.category,
            platforms: rule.platforms || ['all'],
            enabled_by_default: rule.metadata.enabled_by_default
          });
        } catch (error) {
          console.warn(`Skipping invalid rule ${file}: ${error.message}`);
        }
      }
      
      return rules;
    } catch (error) {
      throw new Error(`Failed to list rules: ${error.message}`);
    }
  }

  /**
   * List all available rulesets
   * @returns {Promise<Object[]>} Array of ruleset metadata
   */
  async listRulesets() {
    try {
      const files = await fs.readdir(this.rulesetsDir);
      const jsonFiles = files.filter(f => f.endsWith('.json'));
      
      const rulesets = [];
      for (const file of jsonFiles) {
        try {
          const filePath = path.join(this.rulesetsDir, file);
          const ruleset = await fs.readJSON(filePath);
          
          const validation = this.validator.validate(ruleset, 'ruleset');
          if (validation.valid) {
            rulesets.push({
              id: ruleset.id,
              name: ruleset.name,
              description: ruleset.description,
              ruleCount: ruleset.rules.length,
              extends: ruleset.extends
            });
          }
        } catch (error) {
          console.warn(`Skipping invalid ruleset ${file}: ${error.message}`);
        }
      }
      
      return rulesets;
    } catch (error) {
      throw new Error(`Failed to list rulesets: ${error.message}`);
    }
  }

  /**
   * Filter rules by platform
   * @param {string} platform - The platform to filter by (git, claude, etc.)
   * @returns {Promise<Object[]>} Filtered rules
   */
  async getRulesByPlatform(platform) {
    const allRules = await this.listRules();
    return allRules.filter(rule => 
      rule.platforms.includes(platform) || rule.platforms.includes('all')
    );
  }

  /**
   * Filter rules by category
   * @param {string} category - The category to filter by
   * @returns {Promise<Object[]>} Filtered rules
   */
  async getRulesByCategory(category) {
    const allRules = await this.listRules();
    return allRules.filter(rule => rule.category === category);
  }

  /**
   * Get the script path for a rule implementation
   * @param {Object} rule - The rule definition
   * @param {string} platform - The platform
   * @returns {string|null} The script path or null
   */
  getScriptPath(rule, platform) {
    const impl = rule.implementation[platform];
    if (!impl || !impl.script) {
      return null;
    }
    
    return path.join(this.scriptsDir, impl.script);
  }

  /**
   * Clear all caches
   */
  clearCache() {
    this.cache.clear();
    this.rulesetCache.clear();
  }
}

module.exports = RuleLoader;