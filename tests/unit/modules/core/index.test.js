/**
 * Tests for core module
 */

const fs = require('fs-extra');
const logger = require('../../../../lib/utils/logger');

// Mock dependencies
jest.mock('fs-extra');
jest.mock('../../../../lib/utils/logger', () => ({
  log: jest.fn(),
  debug: jest.fn(),
  error: jest.fn()
}));

// Mock base module
jest.mock('../../../../lib/modules/base', () => {
  return class BaseModule {
    constructor(name) {
      this.name = name;
      this.rules = [];
      this.hooks = {};
      this.validators = {};
    }
    initialize = jest.fn();
    loadRules = jest.fn();
    loadHooks = jest.fn();
    loadValidators = jest.fn();
    validateRule = jest.fn().mockResolvedValue({ valid: true });
    runHook = jest.fn().mockResolvedValue(true);
  };
});

const CoreModule = require('../../../../lib/modules/core');

describe('Core Module', () => {
  let module;

  beforeEach(() => {
    jest.clearAllMocks();
    module = new CoreModule();
  });

  test('should extend BaseModule', () => {
    expect(module.name).toBe('core');
    expect(module.initialize).toBeDefined();
  });

  test('should validate git repository', async () => {
    fs.pathExists.mockResolvedValue(true);
    
    const result = await module.validateGitRepository();
    
    expect(result.valid).toBe(true);
    expect(fs.pathExists).toHaveBeenCalledWith('.git');
  });

  test('should fail when not a git repository', async () => {
    fs.pathExists.mockResolvedValue(false);
    
    const result = await module.validateGitRepository();
    
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Not a git repository');
  });

  test('should check commit message format', async () => {
    const validMessage = 'feat: add new feature';
    const result = await module.validateCommitMessage(validMessage);
    
    expect(result.valid).toBe(true);
  });

  test('should reject invalid commit messages', async () => {
    const invalidMessage = 'bad commit';
    const result = await module.validateCommitMessage(invalidMessage);
    
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Invalid commit message format');
  });

  test('should validate file naming conventions', async () => {
    const files = [
      { path: 'src/components/Button.js' },
      { path: 'src/utils/helpers.js' }
    ];
    
    const result = await module.validateFileNaming(files);
    expect(result.valid).toBe(true);
  });

  test('should detect security issues', async () => {
    const files = [
      { 
        path: 'config.js',
        content: 'const apiKey = "sk-1234567890";'
      }
    ];
    
    const result = await module.checkSecurity(files);
    
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Potential secret detected');
  });

  test('should validate required files exist', async () => {
    fs.pathExists
      .mockResolvedValueOnce(true)  // README.md
      .mockResolvedValueOnce(true)  // LICENSE
      .mockResolvedValueOnce(true); // .gitignore
    
    const result = await module.validateRequiredFiles();
    
    expect(result.valid).toBe(true);
  });

  test('should detect missing required files', async () => {
    fs.pathExists
      .mockResolvedValueOnce(false) // README.md missing
      .mockResolvedValueOnce(true)  // LICENSE
      .mockResolvedValueOnce(true); // .gitignore
    
    const result = await module.validateRequiredFiles();
    
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Missing required file: README.md');
  });

  test('should run pre-commit hook', async () => {
    const context = {
      files: ['src/index.js'],
      branch: 'feature/test'
    };
    
    const result = await module.runPreCommitHook(context);
    
    expect(result.valid).toBe(true);
  });

  test('should prevent commits to protected branches', async () => {
    const context = {
      files: ['src/index.js'],
      branch: 'main'
    };
    
    const result = await module.runPreCommitHook(context);
    
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Cannot commit directly to main branch');
  });

  test('should validate branch naming', async () => {
    const validBranch = 'feature/add-new-component';
    const result = await module.validateBranchName(validBranch);
    
    expect(result.valid).toBe(true);
  });

  test('should reject invalid branch names', async () => {
    const invalidBranch = 'my branch';
    const result = await module.validateBranchName(invalidBranch);
    
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Invalid branch name format');
  });
});