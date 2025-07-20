/**
 * Default configuration values for vibe-codex
 * These can be overridden by environment variables or configuration files
 */

module.exports = {
  // Repository configuration
  repository: {
    // Base URL for downloading rules and templates
    // Can be overridden with VIBE_CODEX_REPO_URL environment variable
    baseUrl: process.env.VIBE_CODEX_REPO_URL || 'https://raw.githubusercontent.com/your-org/vibe-codex/main',
    
    // Repository owner and name for API calls
    // Can be overridden with VIBE_CODEX_REPO environment variable
    repo: process.env.VIBE_CODEX_REPO || 'your-org/vibe-codex'
  },
  
  // File and directory names
  files: {
    // Configuration file name
    config: '.vibe-codex.json',
    
    // Ignore file name
    ignore: '.vibe-codexignore',
    
    // Work directory
    workDir: '.vibe-codex',
    
    // Backup directory
    backupDir: '.vibe-codex-backup'
  },
  
  // Default rule files
  rules: {
    mandatory: 'MANDATORY-RULES.md',
    context: 'PROJECT_CONTEXT.md'
  },
  
  // Hook configuration
  hooks: {
    // Base path for downloading hooks
    basePath: 'hooks'
  }
};