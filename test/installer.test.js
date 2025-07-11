/**
 * Tests for simplified installer
 */

const { installHooks, uninstallHooks } = require('../lib/installer');
const path = require('path');

// Mock fs.promises
jest.mock('fs', () => ({
  promises: {
    access: jest.fn(),
    mkdir: jest.fn(),
    writeFile: jest.fn(),
    readFile: jest.fn(),
    unlink: jest.fn(),
    copyFile: jest.fn()
  }
}));

const fs = require('fs').promises;

describe('Installer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('installHooks', () => {
    it('should install git hooks with correct permissions', async () => {
      const config = {
        gitHooks: true,
        rules: ['security', 'commit-format']
      };

      // Mock git directory exists
      fs.access.mockResolvedValue();
      fs.mkdir.mockResolvedValue();
      fs.writeFile.mockResolvedValue();

      await installHooks(config);

      // Verify hooks directory was created
      expect(fs.mkdir).toHaveBeenCalledWith(
        expect.stringContaining('.git/hooks'),
        { recursive: true }
      );

      // Verify pre-commit hook was written
      expect(fs.writeFile).toHaveBeenCalledWith(
        expect.stringContaining('pre-commit'),
        expect.stringContaining('Security check'),
        { mode: 0o755 }
      );

      // Verify commit-msg hook was written
      expect(fs.writeFile).toHaveBeenCalledWith(
        expect.stringContaining('commit-msg'),
        expect.stringContaining('commit message format'),
        { mode: 0o755 }
      );
    });

    it('should skip installation if not a git repository', async () => {
      const config = { gitHooks: true };

      // Mock git directory doesn't exist
      fs.access.mockRejectedValue(new Error('Not found'));

      await installHooks(config);

      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('Not a git repository')
      );
      expect(fs.writeFile).not.toHaveBeenCalled();
    });

    it('should backup existing hooks', async () => {
      const config = { gitHooks: true, rules: [] };

      fs.access.mockResolvedValue();
      fs.mkdir.mockResolvedValue();
      fs.copyFile.mockResolvedValue();
      fs.writeFile.mockResolvedValue();

      await installHooks(config);

      // Verify backup was created
      expect(fs.copyFile).toHaveBeenCalledWith(
        expect.stringContaining('pre-commit'),
        expect.stringContaining('.vibe-codex-backup')
      );
    });

    it('should generate hooks based on selected rules', async () => {
      const config = {
        gitHooks: true,
        rules: ['testing', 'documentation']
      };

      fs.access.mockResolvedValue();
      fs.mkdir.mockResolvedValue();
      fs.writeFile.mockResolvedValue();

      await installHooks(config);

      // Verify testing check is included
      expect(fs.writeFile).toHaveBeenCalledWith(
        expect.stringContaining('pre-commit'),
        expect.stringContaining('Running tests'),
        expect.any(Object)
      );
    });

    it('should include .env.example bypass in security check', async () => {
      const config = {
        gitHooks: true,
        rules: ['security']
      };

      fs.access.mockResolvedValue();
      fs.mkdir.mockResolvedValue();
      fs.writeFile.mockResolvedValue();

      await installHooks(config);

      // Verify security check includes .env.example bypass
      const writeCall = fs.writeFile.mock.calls.find(call => 
        call[0].includes('pre-commit')
      );
      expect(writeCall).toBeDefined();
      const hookContent = writeCall[1];
      
      // Check for .env.example bypass logic
      expect(hookContent).toContain('example|sample|template');
      expect(hookContent).toContain('Skip .env.example and similar files');
    });
  });

  describe('uninstallHooks', () => {
    it('should remove vibe-codex hooks', async () => {
      // Mock hook exists with vibe-codex content
      fs.access.mockResolvedValue();
      fs.readFile.mockResolvedValue('#!/bin/sh\n# vibe-codex pre-commit hook');
      fs.unlink.mockResolvedValue();

      await uninstallHooks();

      expect(fs.unlink).toHaveBeenCalledWith(
        expect.stringContaining('pre-commit')
      );
      expect(fs.unlink).toHaveBeenCalledWith(
        expect.stringContaining('commit-msg')
      );
    });

    it('should restore backed up hooks', async () => {
      // Mock hook and backup exist
      fs.access.mockResolvedValue();
      fs.readFile.mockResolvedValue('# vibe-codex hook');
      fs.copyFile.mockResolvedValue();
      fs.unlink.mockResolvedValue();

      await uninstallHooks();

      // Verify backup was restored
      expect(fs.copyFile).toHaveBeenCalledWith(
        expect.stringContaining('.vibe-codex-backup'),
        expect.not.stringContaining('.vibe-codex-backup')
      );

      // Verify backup was removed
      expect(fs.unlink).toHaveBeenCalledWith(
        expect.stringContaining('.vibe-codex-backup')
      );
    });

    it('should handle missing hooks gracefully', async () => {
      // Mock hooks don't exist
      fs.access.mockRejectedValue(new Error('Not found'));

      await expect(uninstallHooks()).resolves.not.toThrow();
    });
  });
});