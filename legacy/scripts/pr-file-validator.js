/**
 * Compatibility wrapper for legacy pr-file-validator
 * DEPRECATED: This file exists only for backward compatibility
 * 
 * Migration: Use vibe-codex CLI and rules/registry.json instead
 */

// Only show deprecation warning if not in production or if debug is enabled
if (process.env.NODE_ENV !== 'production' || process.env.DEBUG) {
  console.warn('⚠️ DEPRECATION WARNING: pr-file-validator.js is deprecated');
  console.warn('Please migrate to vibe-codex CLI and the modular rule system');
  console.warn('See https://github.com/tyabonil/vibe-codex/issues/276');
}

// This file may not exist in legacy, provide a stub
module.exports = {
  validate: () => {
    throw new Error('pr-file-validator.js is deprecated. Use vibe-codex CLI instead.');
  }
};