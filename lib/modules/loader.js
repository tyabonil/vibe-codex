/**
 * Module loader for vibe-codex
 * Dynamically loads and manages rule modules based on configuration
 */
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import logger from '../utils/logger.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export class ModuleLoader {
  constructor() {
    this.modules = new Map();
    this.config = null;
    this.projectPath = process.cwd();
  }

  /**
   * Initialize the module loader with project configuration
   * @param {string} projectPath - Project root path
   * @returns {Promise<void>}
   */
  async initialize(projectPath = process.cwd()) {
    this.projectPath = projectPath;
    
    // Load configuration
    this.config = await this.loadConfiguration();
    
    // Load enabled modules
    await this.loadEnabledModules();
  }

  /**
   * Load project configuration
   * @returns {Promise<Object>}
   */
  async loadConfiguration() {
    const configPaths = [
      path.join(this.projectPath, '.vibe-codex.json'),
      path.join(this.projectPath, 'vibe-codex.config.json'),
      path.join(this.projectPath, 'package.json')
    ];

    for (const configPath of configPaths) {
      try {
        const content = await fs.readFile(configPath, 'utf-8');
        const data = JSON.parse(content);
        
        // Extract vibe-codex config from package.json if needed
        if (configPath.endsWith('package.json')) {
          if (data['vibe-codex']) {
            return data['vibe-codex'];
          }
        } else {
          return data;
        }
      } catch (error) {
        // Config file not found or invalid, continue to next
      }
    }

    // Return default configuration
    return {
      version: '1.0.0',
      modules: {
        core: { enabled: true }
      }
    };
  }

  /**
   * Load all enabled modules
   * @returns {Promise<void>}
   */
  async loadEnabledModules() {
    const moduleConfig = this.config.modules || {};
    
    // Core module is always loaded
    await this.loadModule('core', moduleConfig.core || { enabled: true });
    
    // Load other enabled modules
    for (const [moduleName, config] of Object.entries(moduleConfig)) {
      if (moduleName !== 'core' && config && config.enabled) {
        await this.loadModule(moduleName, config);
      }
    }
    
    // Validate module dependencies
    await this.validateDependencies();
  }

  /**
   * Load a specific module
   * @param {string} moduleName - Module name
   * @param {Object} config - Module configuration
   * @returns {Promise<void>}
   */
  async loadModule(moduleName, config) {
    try {
      // Try to load built-in module
      const modulePath = path.join(__dirname, moduleName, 'index.js');
      const module = await import(modulePath);
      
      const instance = module.default || new module[Object.keys(module)[0]]();
      
      // Apply module configuration
      if (config.options) {
        Object.assign(instance.options, config.options);
      }
      
      // Initialize module
      await instance.initialize();
      
      this.modules.set(moduleName, instance);
      logger.debug(`✅ Loaded module: ${moduleName}`);
    } catch (error) {
      // Try to load custom module
      if (this.config.customModules && this.config.customModules[moduleName]) {
        try {
          const customPath = path.join(this.projectPath, this.config.customModules[moduleName]);
          const module = await import(customPath);
          const instance = module.default || new module[Object.keys(module)[0]]();
          
          await instance.initialize();
          this.modules.set(moduleName, instance);
          logger.debug(`✅ Loaded custom module: ${moduleName}`);
        } catch (customError) {
          logger.error(`❌ Failed to load module ${moduleName}:`, customError.message);
        }
      } else {
        logger.warn(`⚠️ Module ${moduleName} not found`);
      }
    }
  }

  /**
   * Validate module dependencies
   * @returns {Promise<void>}
   */
  async validateDependencies() {
    const errors = [];
    
    for (const [moduleName, module] of this.modules) {
      const validationErrors = module.validateConfig({
        modules: Object.fromEntries(
          Array.from(this.modules.entries()).map(([name, mod]) => [name, { enabled: true }])
        )
      });
      
      errors.push(...validationErrors);
    }
    
    if (errors.length > 0) {
      logger.error('❌ Module dependency errors:');
      errors.forEach(error => {
        logger.error(`  - ${error.module}: ${error.message}`);
      });
      throw new Error('Module dependency validation failed');
    }
  }

  /**
   * Get all rules from enabled modules
   * @returns {Array<Object>}
   */
  getAllRules() {
    const rules = [];
    
    for (const module of this.modules.values()) {
      rules.push(...module.getEnabledRules());
    }
    
    return rules;
  }

  /**
   * Get rules by level
   * @param {number} level - Rule level
   * @returns {Array<Object>}
   */
  getRulesByLevel(level) {
    const rules = [];
    
    for (const module of this.modules.values()) {
      rules.push(...module.getRulesByLevel(level));
    }
    
    return rules;
  }

  /**
   * Get all hooks for an event
   * @param {string} event - Hook event name
   * @returns {Array<Function>}
   */
  getHooks(event) {
    const hooks = [];
    
    for (const module of this.modules.values()) {
      hooks.push(...module.getHooks(event));
    }
    
    return hooks;
  }

  /**
   * Run all validators
   * @param {Object} context - Validation context
   * @returns {Promise<Object>}
   */
  async runValidators(context) {
    const results = {};
    
    for (const [moduleName, module] of this.modules) {
      results[moduleName] = {};
      
      for (const [validatorName, validator] of Object.entries(module.validators)) {
        try {
          results[moduleName][validatorName] = await validator(context);
        } catch (error) {
          results[moduleName][validatorName] = {
            valid: false,
            error: error.message
          };
        }
      }
    }
    
    return results;
  }

  /**
   * Get module by name
   * @param {string} name - Module name
   * @returns {RuleModule|null}
   */
  getModule(name) {
    return this.modules.get(name) || null;
  }

  /**
   * Get loaded module names
   * @returns {Array<string>}
   */
  getLoadedModules() {
    return Array.from(this.modules.keys());
  }

  /**
   * Save configuration
   * @param {Object} config - Configuration to save
   * @returns {Promise<void>}
   */
  async saveConfiguration(config) {
    const configPath = path.join(this.projectPath, '.vibe-codex.json');
    await fs.writeFile(configPath, JSON.stringify(config, null, 2));
    this.config = config;
  }
}

// Export singleton instance
export default new ModuleLoader();