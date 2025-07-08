/**
 * vibe-codex - Automated development rules and workflow enforcement
 * Main library entry point
 */

module.exports = {
  // Commands
  init: require('./commands/init'),
  config: require('./commands/config'),
  update: require('./commands/update'),
  validate: require('./commands/validate'),
  status: require('./commands/status'),
  
  // Core utilities
  modules: require('./modules'),
  installer: require('./installer'),
  utils: require('./utils'),
  
  // Version info
  version: require('../package.json').version
};