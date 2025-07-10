/**
 * Compatibility wrapper for legacy github-client
 * The actual implementation has moved to legacy/cursor-rules/
 */

console.warn('⚠️ DEPRECATION WARNING: github-client.js has been moved to legacy/cursor-rules/');
console.warn('Please update your scripts to use vibe-codex CLI instead.');

// Re-export from legacy location for backward compatibility
module.exports = require('../legacy/cursor-rules/github-client.js');