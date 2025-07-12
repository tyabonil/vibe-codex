/**
 * Compatibility wrapper for legacy rule-engine
 * The actual implementation has moved to legacy/cursor-rules/
 */

// Only show deprecation warning if not in production or if debug is enabled
if (process.env.NODE_ENV !== 'production' || process.env.DEBUG) {
  console.warn('⚠️ DEPRECATION WARNING: rule-engine.js has been moved to legacy/cursor-rules/');
  console.warn('Please update your scripts to use vibe-codex CLI instead.');
}

// Re-export from legacy location for backward compatibility
module.exports = require('../legacy/cursor-rules/rule-engine.js');