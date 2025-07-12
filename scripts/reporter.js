/**
 * Compatibility wrapper for legacy reporter
 * DEPRECATED: This file exists only for backward compatibility
 * The actual implementation has moved to legacy/cursor-rules/
 * 
 * Migration: Use vibe-codex CLI and rules/registry.json instead
 */

// Only show deprecation warning if not in production or if debug is enabled
if (process.env.NODE_ENV !== 'production' || process.env.DEBUG) {
  console.warn('⚠️ DEPRECATION WARNING: reporter.js is deprecated');
  console.warn('Please migrate to vibe-codex CLI and the modular rule system');
  console.warn('See https://github.com/tyabonil/vibe-codex/issues/276');
}

// Re-export from legacy location for backward compatibility
try {
  module.exports = require('../legacy/cursor-rules/reporter.js');
} catch (error) {
  if (process.env.NODE_ENV !== 'production' || process.env.DEBUG) {
    console.error('❌ Legacy reporter.js not found. Please use vibe-codex CLI instead.');
  }
  throw new Error('This compatibility wrapper requires legacy/cursor-rules/ directory. See issue #276 for migration.');
}