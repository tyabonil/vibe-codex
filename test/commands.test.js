/**
 * Tests for simplified commands
 */

const { init, config, uninstall } = require('../lib/commands');
const inquirer = require('inquirer');
const path = require('path');

// Mock dependencies
jest.mock('inquirer');
jest.mock('fs', () => ({
  promises: {
    access: jest.fn(),
    mkdir: jest.fn(),
    writeFile: jest.fn(),
    readFile: jest.fn(),
    unlink: jest.fn()
  }
}));
jest.mock('../lib/installer', () => ({
  installHooks: jest.fn(),
  uninstallHooks: jest.fn()
}));

const fs = require('fs').promises;

describe('Commands', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('init', () => {
    it('should initialize vibe-codex with selected features', async () => {
      const { installHooks } = require('../lib/installer');
      
      // Mock file doesn't exist
      fs.access.mockRejectedValue(new Error('Not found'));
      
      // Mock user selections
      inquirer.prompt
        .mockResolvedValueOnce({ features: ['gitHooks'] })
        .mockResolvedValueOnce({ rules: ['security', 'commit-format'] });
      
      // Mock file write
      fs.writeFile.mockResolvedValue();
      
      await init();
      
      // Verify config was saved
      expect(fs.writeFile).toHaveBeenCalledWith(
        expect.stringContaining('.vibe-codex.json'),
        expect.stringContaining('"gitHooks": true')
      );
      
      // Verify hooks were installed
      expect(installHooks).toHaveBeenCalledWith(
        expect.objectContaining({
          gitHooks: true,
          rules: ['security', 'commit-format']
        })
      );
    });

    it('should handle existing configuration', async () => {
      // Mock file exists
      fs.access.mockResolvedValue();
      
      // Mock user declines overwrite
      inquirer.prompt.mockResolvedValueOnce({ overwrite: false });
      
      await init();
      
      expect(fs.writeFile).not.toHaveBeenCalled();
      expect(console.log).toHaveBeenCalledWith(expect.stringContaining('cancelled'));
    });

    it('should install GitHub Actions when selected', async () => {
      fs.access.mockRejectedValue(new Error('Not found'));
      
      inquirer.prompt
        .mockResolvedValueOnce({ features: ['githubActions'] });
      
      fs.writeFile.mockResolvedValue();
      fs.mkdir.mockResolvedValue();
      
      await init();
      
      // Verify workflow directory was created
      expect(fs.mkdir).toHaveBeenCalledWith(
        expect.stringContaining('.github'),
        { recursive: true }
      );
      
      // Verify workflow file was written
      expect(fs.writeFile).toHaveBeenCalledWith(
        expect.stringContaining('vibe-codex.yml'),
        expect.stringContaining('name: vibe-codex checks')
      );
    });
  });

  describe('config', () => {
    it('should load and modify existing configuration', async () => {
      // Mock existing config
      fs.access.mockResolvedValue();
      fs.readFile.mockResolvedValue(JSON.stringify({
        version: '3.0.0',
        gitHooks: true,
        rules: ['security']
      }));
      
      // Mock user selects to modify rules
      inquirer.prompt
        .mockResolvedValueOnce({ action: 'rules' })
        .mockResolvedValueOnce({ rules: ['security', 'testing'] });
      
      fs.writeFile.mockResolvedValue();
      
      await config();
      
      // Verify updated config was saved
      expect(fs.writeFile).toHaveBeenCalledWith(
        expect.stringContaining('.vibe-codex.json'),
        expect.stringContaining('"testing"')
      );
    });

    it('should handle missing configuration', async () => {
      fs.access.mockRejectedValue(new Error('Not found'));
      
      await config();
      
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('No configuration found')
      );
    });
  });

  describe('uninstall', () => {
    it('should remove hooks and configuration when confirmed', async () => {
      const { uninstallHooks } = require('../lib/installer');
      
      // Mock user confirms
      inquirer.prompt.mockResolvedValueOnce({ confirm: true });
      
      // Mock file operations
      fs.unlink.mockResolvedValue();
      
      await uninstall();
      
      expect(uninstallHooks).toHaveBeenCalled();
      expect(fs.unlink).toHaveBeenCalledWith(
        expect.stringContaining('.vibe-codex.json')
      );
    });

    it('should cancel when user declines', async () => {
      const { uninstallHooks } = require('../lib/installer');
      
      // Mock user declines
      inquirer.prompt.mockResolvedValueOnce({ confirm: false });
      
      await uninstall();
      
      expect(uninstallHooks).not.toHaveBeenCalled();
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('cancelled')
      );
    });
  });
});