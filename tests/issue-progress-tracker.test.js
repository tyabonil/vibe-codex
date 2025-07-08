/**
 * Simplified tests for issue-progress-tracker.sh hook
 * Focuses on achievable test coverage without complex mocking
 */

const { describe, test, expect, beforeEach, afterEach } = require('@jest/globals');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Path to the hook script
const HOOK_PATH = path.join(__dirname, '../hooks/issue-progress-tracker.sh');

describe('Issue Progress Tracker Hook - Simple Tests', () => {
  let originalCwd;
  let testDir;
  
  beforeEach(() => {
    originalCwd = process.cwd();
    
    // Create temporary test directory
    testDir = fs.mkdtempSync(path.join(__dirname, 'tmp-test-'));
    process.chdir(testDir);
    
    // Initialize git repo
    execSync('git init', { stdio: 'pipe' });
    execSync('git config user.email "test@example.com"', { stdio: 'pipe' });
    execSync('git config user.name "Test User"', { stdio: 'pipe' });
  });
  
  afterEach(() => {
    process.chdir(originalCwd);
    
    // Clean up test directory
    if (testDir && fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true, force: true });
    }
  });

  describe('Help and Usage', () => {
    test('should show usage when no arguments provided', () => {
      const result = runHookScript([]);
      
      expect(result.exitCode).toBe(1);
      expect(result.output).toContain('Usage:');
      expect(result.output).toContain('Actions:');
    });

    test('should show help with --help flag', () => {
      const result = runHookScript(['--help']);
      
      expect(result.exitCode).toBe(0);
      expect(result.output).toContain('Usage:');
      expect(result.output).toContain('Examples:');
    });

    test('should show help with -h flag', () => {
      const result = runHookScript(['-h']);
      
      expect(result.exitCode).toBe(0);
      expect(result.output).toContain('Usage:');
    });

    test('should handle unknown action', () => {
      const result = runHookScript(['unknown-action']);
      
      expect(result.exitCode).toBe(1);
      expect(result.output).toContain('Unknown action: unknown-action');
    });
  });

  describe('Input Validation', () => {
    test('should require issue number for start action', () => {
      const result = runHookScript(['start']);
      
      expect(result.exitCode).toBe(1);
      expect(result.output).toContain('Issue number required for start action');
    });

    test('should require issue number and message for update action', () => {
      const result = runHookScript(['update']);
      
      expect(result.exitCode).toBe(1);
      expect(result.output).toContain('Issue number and message required for update action');
    });

    test('should require issue number and PR number for link-pr action', () => {
      const result = runHookScript(['link-pr']);
      
      expect(result.exitCode).toBe(1);
      expect(result.output).toContain('Issue number and PR number required for link-pr action');
    });

    test('should require issue number and PR number for complete action', () => {
      const result = runHookScript(['complete']);
      
      expect(result.exitCode).toBe(1);
      expect(result.output).toContain('Issue number and PR number required for complete action');
    });

    test('should require issue number for validate action', () => {
      const result = runHookScript(['validate']);
      
      expect(result.exitCode).toBe(1);
      expect(result.output).toContain('Issue number required for validate action');
    });
  });

  describe('Auto mode', () => {
    test('should fail for unknown auto action', () => {
      // Create a branch that has an issue number
      execSync('git checkout -b feature/issue-123-test', { stdio: 'pipe' });
      
      const result = runHookScript(['auto', 'unknown']);
      
      expect(result.exitCode).toBe(1);
      expect(result.output).toContain('Unknown auto action: unknown');
    });

    test('should fail when no issue in branch name', () => {
      execSync('git checkout -b wrong-branch-name', { stdio: 'pipe' });
      
      const result = runHookScript(['auto', 'commit']);
      
      expect(result.exitCode).toBe(1);
      expect(result.output).toContain('No issue number detected in branch name');
    });
  });

  describe('Error handling', () => {
    test('should handle missing auto action', () => {
      const result = runHookScript(['auto']);
      
      expect(result.exitCode).toBe(1);
      expect(result.output).toContain('Auto action required');
    });
    
    test('should handle update without message', () => {
      const result = runHookScript(['update', '123']);
      
      expect(result.exitCode).toBe(1);
      expect(result.output).toContain('Issue number and message required for update action');
    });

    test('should handle link-pr without PR number', () => {
      const result = runHookScript(['link-pr', '123']);
      
      expect(result.exitCode).toBe(1);
      expect(result.output).toContain('Issue number and PR number required for link-pr action');
    });

    test('should handle complete without PR number', () => {
      const result = runHookScript(['complete', '123']);
      
      expect(result.exitCode).toBe(1);
      expect(result.output).toContain('Issue number and PR number required for complete action');
    });
  });

  // Helper functions
  function runHookScript(args) {
    try {
      const output = execSync(`bash "${HOOK_PATH}" ${args.join(' ')}`, {
        encoding: 'utf8',
        stdio: 'pipe'
      });
      return { exitCode: 0, output: stripAnsiCodes(output) };
    } catch (error) {
      return {
        exitCode: error.status || 1,
        output: stripAnsiCodes((error.stdout || '') + (error.stderr || ''))
      };
    }
  }

  function stripAnsiCodes(str) {
    // Remove ANSI escape sequences for colors
    // eslint-disable-next-line no-control-regex
    return str.replace(/\x1b\[[0-9;]*m/g, '');
  }
});