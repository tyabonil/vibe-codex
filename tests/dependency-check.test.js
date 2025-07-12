/**
 * Tests for dependency safety check (WFL-009)
 */

const { describe, test, expect, beforeEach, afterEach } = require('@jest/globals');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

describe('Dependency Safety Check', () => {
  let testDir;
  let originalCwd;
  
  beforeEach(() => {
    originalCwd = process.cwd();
    
    // Create temporary test directory
    testDir = fs.mkdtempSync(path.join(__dirname, 'tmp-dep-test-'));
    process.chdir(testDir);
    
    // Initialize git repo
    execSync('git init', { stdio: 'pipe' });
    execSync('git config user.email "test@example.com"', { stdio: 'pipe' });
    execSync('git config user.name "Test User"', { stdio: 'pipe' });
    
    // Create some test files
    fs.mkdirSync('src');
    fs.writeFileSync('src/index.js', 'module.exports = require("./utils");');
    fs.writeFileSync('src/utils.js', 'module.exports = { helper: () => {} };');
    fs.writeFileSync('test.js', 'const utils = require("./src/utils");');
    
    // Commit files
    execSync('git add .', { stdio: 'pipe' });
    execSync('git commit -m "initial commit"', { stdio: 'pipe' });
  });
  
  afterEach(() => {
    process.chdir(originalCwd);
    
    // Clean up test directory
    if (testDir && fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true, force: true });
    }
  });
  
  describe('Hook functionality', () => {
    test('should detect dependencies in working directory', () => {
      const hookPath = path.join(originalCwd, 'templates/hooks/dependency-check-hook.sh');
      
      // Check utils.js which has dependencies
      const result = runScript(`bash "${hookPath}" src/utils.js`);
      
      expect(result.exitCode).toBe(1);
      expect(result.output).toContain('DEPENDENCIES FOUND');
      expect(result.output).toContain('src/index.js');
      expect(result.output).toContain('test.js');
    });
    
    test('should pass for files without dependencies', () => {
      const hookPath = path.join(originalCwd, 'templates/hooks/dependency-check-hook.sh');
      
      // Create a file with no dependencies
      fs.writeFileSync('standalone.js', 'console.log("standalone");');
      
      const result = runScript(`bash "${hookPath}" standalone.js`);
      
      expect(result.exitCode).toBe(0);
      expect(result.output).toContain('No dependencies found');
    });
  });
  
  describe('CLI command', () => {
    test('should check multiple files', () => {
      // Skip if vibe-codex is not available
      try {
        execSync('which vibe-codex', { stdio: 'pipe' });
      } catch {
        console.log('Skipping CLI test - vibe-codex not in PATH');
        return;
      }
      
      const result = runScript('vibe-codex check-deps src/utils.js test.js');
      
      expect(result.output).toContain('Checking: src/utils.js');
      expect(result.output).toContain('Checking: test.js');
    });
  });
  
  describe('Git hook integration', () => {
    test('should block deletion of files with dependencies', () => {
      // Simulate pre-commit check for deleted file
      execSync('git rm src/utils.js', { stdio: 'pipe' });
      
      const hookPath = path.join(originalCwd, 'templates/hooks/dependency-check-hook.sh');
      const result = runScript(`bash "${hookPath}" src/utils.js`);
      
      expect(result.exitCode).toBe(1);
      expect(result.output).toContain('DEPENDENCIES FOUND');
    });
  });
});

// Helper function to run scripts
function runScript(command, cwd = process.cwd()) {
  try {
    const output = execSync(command, {
      cwd,
      encoding: 'utf8',
      stdio: 'pipe'
    });
    return { exitCode: 0, output };
  } catch (error) {
    return { 
      exitCode: error.status || 1, 
      output: error.stdout ? error.stdout.toString() : error.message 
    };
  }
}