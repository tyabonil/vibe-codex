/**
 * Tests for CLI-only config command
 */

const chalk = require('chalk');
const fs = require('fs-extra');
const path = require('path');

// Mock dependencies
jest.mock('fs-extra');
jest.mock('../../lib/utils/logger');
jest.mock('../../lib/config/loader');
jest.mock('../../lib/config/schema');

const logger = require('../../lib/utils/logger');
const configLoader = require('../../lib/config/loader');
const { validateConfig } = require('../../lib/config/schema');
const configCommand = require('../../lib/commands/config-cli');

describe('Config CLI Command', () => {
  let consoleLogSpy;
  let processExitSpy;
  
  beforeEach(() => {
    jest.clearAllMocks();
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
    processExitSpy = jest.spyOn(process, 'exit').mockImplementation(() => {
      throw new Error('process.exit called');
    });
    
    // Default mock implementations
    configLoader.loadConfig.mockResolvedValue({
      version: '1.0.0',
      preset: 'minimal',
      projectType: 'node',
      modules: {
        core: { enabled: true },
        testing: { enabled: true }
      },
      rules: {
        'sec-001': { enabled: true },
        'sec-002': { enabled: false }
      }
    });
    
    configLoader.getConfigSummary.mockResolvedValue({
      enabledRules: 1,
      totalRules: 2,
      categories: ['security']
    });
    
    configLoader.loadRegistry.mockResolvedValue({
      categories: {
        security: { name: 'Security', icon: '🔒' }
      }
    });
    
    configLoader.getRulesByCategory.mockResolvedValue([
      { id: 'sec-001', name: 'No console', enabled: true },
      { id: 'sec-002', name: 'No eval', enabled: false }
    ]);
  });
  
  afterEach(() => {
    consoleLogSpy.mockRestore();
    processExitSpy.mockRestore();
  });
  
  describe('help display', () => {
    it('should show help when no options provided', async () => {
      await configCommand({});
      
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('vibe-codex Configuration'));
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('Usage:'));
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('--list'));
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('--set'));
    });
    
    it('should throw error in non-interactive mode with no options', async () => {
      process.env.CI = 'true';
      
      await expect(configCommand({})).rejects.toThrow('No configuration action specified');
      
      delete process.env.CI;
    });
  });
  
  describe('list configuration', () => {
    it('should list current configuration', async () => {
      await configCommand({ list: true });
      
      expect(configLoader.loadConfig).toHaveBeenCalled();
      expect(configLoader.getConfigSummary).toHaveBeenCalled();
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('Current Configuration'));
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('Version: 1.0.0'));
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('Preset: minimal'));
    });
    
    it('should handle missing configuration', async () => {
      configLoader.loadConfig.mockResolvedValue(null);
      
      await configCommand({ list: true });
      
      expect(logger.warn).toHaveBeenCalledWith('No configuration file found.');
      expect(logger.info).toHaveBeenCalledWith('Run "npx vibe-codex init" to create one.');
    });
    
    it('should show modules status', async () => {
      await configCommand({ list: true });
      
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('Modules:'));
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('✓ core'));
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('✓ testing'));
    });
    
    it('should show rules by category', async () => {
      await configCommand({ list: true });
      
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('Rules by Category:'));
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('security: 1/2 enabled'));
    });
  });
  
  describe('set configuration', () => {
    it('should set configuration value', async () => {
      await configCommand({ set: 'rule.no-console=disabled' });
      
      expect(configLoader.loadConfig).toHaveBeenCalled();
      expect(configLoader.saveConfig).toHaveBeenCalled();
      expect(logger.success).toHaveBeenCalledWith('Configuration updated: rule.no-console = disabled');
    });
    
    it('should handle invalid format', async () => {
      await expect(configCommand({ set: 'invalid' })).rejects.toThrow(
        'Invalid format. Use: vibe-codex config --set key=value'
      );
    });
    
    it('should handle missing configuration', async () => {
      configLoader.loadConfig.mockResolvedValue(null);
      
      await expect(configCommand({ set: 'key=value' })).rejects.toThrow(
        'No configuration file found'
      );
    });
    
    it('should parse boolean values', async () => {
      const config = { rules: {} };
      configLoader.loadConfig.mockResolvedValue(config);
      
      await configCommand({ set: 'testing.enabled=true' });
      
      expect(configLoader.saveConfig).toHaveBeenCalledWith(
        expect.objectContaining({
          testing: { enabled: true }
        })
      );
    });
    
    it('should parse numeric values', async () => {
      const config = { testing: {} };
      configLoader.loadConfig.mockResolvedValue(config);
      
      await configCommand({ set: 'testing.coverage.threshold=90' });
      
      expect(configLoader.saveConfig).toHaveBeenCalledWith(
        expect.objectContaining({
          testing: { coverage: { threshold: 90 } }
        })
      );
    });
    
    it('should parse array values', async () => {
      const config = {};
      configLoader.loadConfig.mockResolvedValue(config);
      
      await configCommand({ set: 'ignore=node_modules,dist,build' });
      
      expect(configLoader.saveConfig).toHaveBeenCalledWith(
        expect.objectContaining({
          ignore: ['node_modules', 'dist', 'build']
        })
      );
    });
  });
  
  describe('reset configuration', () => {
    it('should show warning without force flag', async () => {
      await configCommand({ reset: true });
      
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('This will reset all configuration to defaults')
      );
      expect(configLoader.applyPreset).not.toHaveBeenCalled();
    });
    
    it('should reset with force flag', async () => {
      configLoader.applyPreset.mockResolvedValue({ preset: 'minimal' });
      
      await configCommand({ reset: true, force: true });
      
      expect(configLoader.applyPreset).toHaveBeenCalledWith('minimal');
      expect(configLoader.saveConfig).toHaveBeenCalled();
      expect(logger.success).toHaveBeenCalledWith('Configuration reset to defaults');
    });
    
    it('should reset in non-interactive mode', async () => {
      process.env.CI = 'true';
      configLoader.applyPreset.mockResolvedValue({ preset: 'minimal' });
      
      await configCommand({ reset: true });
      
      expect(configLoader.applyPreset).toHaveBeenCalledWith('minimal');
      expect(configLoader.saveConfig).toHaveBeenCalled();
      
      delete process.env.CI;
    });
  });
  
  describe('export configuration', () => {
    it('should export to stdout when no file specified', async () => {
      const config = { test: 'config' };
      configLoader.loadConfig.mockResolvedValue(config);
      
      await configCommand({ export: true });
      
      expect(consoleLogSpy).toHaveBeenCalledWith(JSON.stringify(config, null, 2));
    });
    
    it('should export to file when path specified', async () => {
      const config = { test: 'config' };
      configLoader.loadConfig.mockResolvedValue(config);
      
      await configCommand({ export: 'backup.json' });
      
      expect(fs.writeJSON).toHaveBeenCalledWith('backup.json', config, { spaces: 2 });
      expect(logger.success).toHaveBeenCalledWith('Configuration exported to backup.json');
    });
    
    it('should handle missing configuration', async () => {
      configLoader.loadConfig.mockResolvedValue(null);
      
      await expect(configCommand({ export: true })).rejects.toThrow(
        'No configuration file found'
      );
    });
  });
  
  describe('import configuration', () => {
    beforeEach(() => {
      fs.pathExists.mockResolvedValue(true);
      fs.readJSON.mockResolvedValue({ test: 'config' });
      validateConfig.mockReturnValue({ valid: true });
    });
    
    it('should import configuration from file', async () => {
      await configCommand({ import: 'config.json' });
      
      expect(fs.pathExists).toHaveBeenCalledWith('config.json');
      expect(fs.readJSON).toHaveBeenCalledWith('config.json');
      expect(validateConfig).toHaveBeenCalled();
      expect(configLoader.saveConfig).toHaveBeenCalled();
      expect(logger.success).toHaveBeenCalledWith('Configuration imported successfully');
    });
    
    it('should require file path', async () => {
      await expect(configCommand({ import: true })).rejects.toThrow(
        'Configuration file path required'
      );
    });
    
    it('should handle missing file', async () => {
      fs.pathExists.mockResolvedValue(false);
      
      await expect(configCommand({ import: 'missing.json' })).rejects.toThrow(
        'Configuration file not found: missing.json'
      );
    });
    
    it('should validate configuration', async () => {
      validateConfig.mockReturnValue({
        valid: false,
        errors: ['Invalid preset', 'Missing version']
      });
      
      await expect(configCommand({ import: 'invalid.json' })).rejects.toThrow(
        'Invalid configuration: Invalid preset, Missing version'
      );
    });
  });
  
  describe('preview configuration', () => {
    it('should preview configuration impact', async () => {
      await configCommand({ preview: true });
      
      expect(configLoader.loadConfig).toHaveBeenCalled();
      expect(configLoader.getConfigSummary).toHaveBeenCalled();
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('Configuration Preview'));
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('Enable 1 rules'));
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('Check 1 categories'));
    });
    
    it('should show enabled modules', async () => {
      await configCommand({ preview: true });
      
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('Use modules: core, testing'));
    });
    
    it('should show hooks if configured', async () => {
      configLoader.loadConfig.mockResolvedValue({
        modules: { core: { enabled: true } },
        hooks: { 'pre-commit': {}, 'pre-push': {} }
      });
      
      await configCommand({ preview: true });
      
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('Install hooks: pre-commit, pre-push'));
    });
    
    it('should handle missing configuration', async () => {
      configLoader.loadConfig.mockResolvedValue(null);
      
      await configCommand({ preview: true });
      
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('No configuration file found'));
    });
  });
  
  describe('error handling', () => {
    it('should handle errors in list command', async () => {
      configLoader.loadConfig.mockRejectedValue(new Error('Load failed'));
      
      await expect(configCommand({ list: true })).rejects.toThrow('Load failed');
      expect(logger.error).toHaveBeenCalledWith('Error listing configuration:', 'Load failed');
    });
    
    it('should handle errors in set command', async () => {
      configLoader.loadConfig.mockRejectedValue(new Error('Load failed'));
      
      await expect(configCommand({ set: 'key=value' })).rejects.toThrow('Load failed');
      expect(logger.error).toHaveBeenCalledWith('Error setting configuration:', 'Load failed');
    });
    
    it('should handle errors in reset command', async () => {
      configLoader.applyPreset.mockRejectedValue(new Error('Preset failed'));
      
      await expect(configCommand({ reset: true, force: true })).rejects.toThrow('Preset failed');
      expect(logger.error).toHaveBeenCalledWith('Error resetting configuration:', 'Preset failed');
    });
  });
});