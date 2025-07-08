/**
 * Module loader and manager
 */

module.exports = {
  // Load all available modules
  available: {
    core: require('./core'),
    testing: require('./testing'),
    github: require('./github'),
    deployment: require('./deployment'),
    documentation: require('./documentation')
  },
  
  // Load modules based on configuration
  load(config) {
    const loaded = {};
    
    for (const [name, moduleConfig] of Object.entries(config.modules || {})) {
      if (moduleConfig.enabled !== false && this.available[name]) {
        loaded[name] = {
          ...this.available[name],
          config: moduleConfig
        };
      }
    }
    
    return loaded;
  }
};