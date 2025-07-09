/**
 * Tests for git hooks installer
 */

const fs = require('fs-extra');
const path = require('path');

// Mock dependencies
jest.mock('fs-extra');
jest.mock('path');

describe('Git Hooks Installer', () => {
  let gitHooks;
  
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
    
    // Setup default mocks
    fs.pathExists.mockResolvedValue(true);
    fs.readdir.mockResolvedValue(['pre-commit', 'pre-push']);
    fs.readFile.mockResolvedValue('#!/bin/sh\necho "test"');
    fs.writeFile.mockResolvedValue();
    fs.ensureDir.mockResolvedValue();
    fs.chmod.mockResolvedValue();
    
    path.join.mockImplementation((...args) => args.join('/'));
    path.resolve.mockImplementation((p) => `/absolute/${p}`);
    
    gitHooks = require('../../../lib/installer/git-hooks.js');
  });

  describe('installGitHooks', () => {
    it('should install git hooks successfully', async () => {
      const config = {
        hooks: {
          'pre-commit': true,
          'pre-push': true
        }
      };
      
      const result = await gitHooks.installGitHooks(config);
      
      expect(result).toBe(true);
      expect(fs.ensureDir).toHaveBeenCalledWith('.git/hooks');
    });

    it('should skip installation if .git directory does not exist', async () => {
      fs.pathExists.mockResolvedValueOnce(false);
      
      const result = await gitHooks.installGitHooks({});
      
      expect(result).toBe(false);
      expect(fs.ensureDir).not.toHaveBeenCalled();
    });

    it('should handle errors gracefully', async () => {
      fs.ensureDir.mockRejectedValueOnce(new Error('Permission denied'));
      
      await expect(gitHooks.installGitHooks({})).rejects.toThrow('Permission denied');
    });
  });

  describe('uninstallGitHooks', () => {
    it('should uninstall git hooks successfully', async () => {
      const result = await gitHooks.uninstallGitHooks();
      
      expect(result).toBe(true);
      expect(fs.readdir).toHaveBeenCalledWith('.git/hooks');
    });

    it('should handle missing hooks directory', async () => {
      fs.pathExists.mockResolvedValueOnce(false);
      
      const result = await gitHooks.uninstallGitHooks();
      
      expect(result).toBe(false);
      expect(fs.readdir).not.toHaveBeenCalled();
    });
  });

  describe('createHookScript', () => {
    it('should create a valid hook script', () => {
      const script = gitHooks.createHookScript('pre-commit', {
        command: 'npm test'
      });
      
      expect(script).toContain('#!/bin/sh');
      expect(script).toContain('npm test');
    });

    it('should include vibe-codex validation', () => {
      const script = gitHooks.createHookScript('pre-commit', {
        validate: true
      });
      
      expect(script).toContain('vibe-codex validate');
    });
  });
});