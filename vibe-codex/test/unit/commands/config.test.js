/**
 * Tests for config command
 */

const fs = require('fs-extra');
const inquirer = require('inquirer');
const chalk = require('chalk');
const ora = require('ora');

// Mock dependencies
jest.mock('fs-extra');
jest.mock('inquirer');
jest.mock('chalk', () => ({
  blue: jest.fn(text => text),
  green: jest.fn(text => text),
  yellow: jest.fn(text => text),
  red: jest.fn(text => text),
  gray: jest.fn(text => text),
  bold: jest.fn(text => text)
}));
jest.mock('ora', () => {
  const spinner = {
    start: jest.fn().mockReturnThis(),
    succeed: jest.fn().mockReturnThis(),
    fail: jest.fn().mockReturnThis(),
    stop: jest.fn().mockReturnThis(),
    text: ''
  };
  return jest.fn(() => spinner);
});

// Mock other dependencies
jest.mock('../../../lib/utils/detector', () => ({
  detectProjectType: jest.fn(),
  detectTestFramework: jest.fn(),
  detectDeploymentPlatform: jest.fn(),
  detectPackageManager: jest.fn(),
  readPackageJsonSafe: jest.fn()
}));
jest.mock('../../../lib/utils/config-creator', () => ({
  createConfig: jest.fn(),
  createAutoConfig: jest.fn(),
  createConfiguration: jest.fn(),
  mergeConfigs: jest.fn(),
  getTemplate: jest.fn(),
  applyProjectDefaults: jest.fn(),
  configureTestingModule: jest.fn(),
  configureGitHubModule: jest.fn(),
  configureDeploymentModule: jest.fn(),
  validateConfig: jest.fn(),
  getSuggestions: jest.fn().mockReturnValue([]),
  createEnvironmentConfig: jest.fn(),
  createIgnoreFile: jest.fn(),
  createProjectContext: jest.fn()
}));
jest.mock('../../../lib/utils/logger', () => ({
  log: jest.fn(),
  debug: jest.fn(),
  error: jest.fn()
}));
jest.mock('../../../lib/installer/git-hooks', () => ({
  installGitHooks: jest.fn()
}));
jest.mock('../../../lib/installer/hooks-downloader', () => ({
  downloadHookScripts: jest.fn()
}));

describe('Config Command', () => {
  let config;
  let mockSpinner;
  
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
    
    // Setup spinner mock
    mockSpinner = ora();
    
    // Setup default mocks
    fs.pathExists.mockResolvedValue(false);
    fs.writeJSON.mockResolvedValue();
    fs.readJSON.mockResolvedValue({
      version: '2.0.0',
      modules: { core: { enabled: true } }
    });
    
    inquirer.prompt.mockResolvedValue({
      projectType: 'web',
      selectedModules: ['core', 'testing'],
      enforcementLevel: 'error'
    });
    
    // Require the module after mocks are set up
    config = require('../../../lib/commands/config');
  });

  describe('interactive configuration', () => {
    it('should create new configuration interactively', async () => {
      const detector = require('../../../lib/utils/detector');
      detector.detectProjectType.mockResolvedValue('web');
      detector.detectPackageManager.mockResolvedValue('npm');
      detector.detectTestFramework.mockResolvedValue('jest');
      
      inquirer.prompt
        .mockResolvedValueOnce({ projectType: 'web' })
        .mockResolvedValueOnce({ selectedModules: ['core', 'testing', 'github'] })
        .mockResolvedValueOnce({ // Testing config
          framework: 'jest',
          coverageThreshold: 80,
          options: ['requireNewFileTests', 'failOnConsole']
        })
        .mockResolvedValueOnce({ // GitHub config
          features: ['prChecks', 'issueTracking'],
          requireIssueReference: true,
          autoAssignReviewers: false
        })
        .mockResolvedValueOnce({ enforcementLevel: 'error' })
        .mockResolvedValueOnce({ confirmSave: true })
        .mockResolvedValueOnce({ installHooks: false });
      
      await config();
      
      expect(mockSpinner.succeed).toHaveBeenCalledWith('Project settings detected');
      expect(fs.writeJSON).toHaveBeenCalledWith(
        '.vibe-codex.json',
        expect.objectContaining({
          version: '2.0.0',
          projectType: 'web',
          modules: expect.objectContaining({
            core: { enabled: true },
            testing: expect.objectContaining({
              enabled: true,
              framework: 'jest',
              coverage: { threshold: 80, perFile: true }
            }),
            github: expect.objectContaining({
              enabled: true,
              requireIssueReference: true
            })
          }),
          enforcementLevel: 'error'
        }),
        { spaces: 2 }
      );
    });

    it('should handle existing configuration', async () => {
      fs.pathExists.mockResolvedValueOnce(true);
      fs.readJSON.mockResolvedValueOnce({
        version: '1.0.0',
        projectType: 'api',
        modules: {
          core: { enabled: true },
          testing: { enabled: true, framework: 'mocha' }
        }
      });
      
      await config();
      
      expect(console.log).toHaveBeenCalledWith(expect.stringContaining('Existing configuration found'));
    });

    it('should install git hooks when requested', async () => {
      const gitHooks = require('../../../lib/installer/git-hooks');
      gitHooks.installGitHooks.mockResolvedValue(true);
      
      inquirer.prompt
        .mockResolvedValueOnce({ projectType: 'web' })
        .mockResolvedValueOnce({ selectedModules: ['core'] })
        .mockResolvedValueOnce({ enforcementLevel: 'error' })
        .mockResolvedValueOnce({ confirmSave: true })
        .mockResolvedValueOnce({ installHooks: true });
      
      await config();
      
      expect(gitHooks.installGitHooks).toHaveBeenCalled();
      expect(console.log).toHaveBeenCalledWith(expect.stringContaining('Git hooks installed'));
    });
  });

  describe('config subcommands', () => {
    it('should list current configuration', async () => {
      fs.pathExists.mockResolvedValueOnce(true);
      
      await config({ list: true });
      
      expect(fs.readJSON).toHaveBeenCalledWith('.vibe-codex.json');
      expect(console.log).toHaveBeenCalledWith(expect.stringContaining('Current vibe-codex Configuration'));
    });

    it('should handle missing config for list command', async () => {
      fs.pathExists.mockResolvedValueOnce(false);
      
      await config({ list: true });
      
      expect(console.log).toHaveBeenCalledWith(expect.stringContaining('No configuration found'));
    });

    it('should set configuration value', async () => {
      fs.pathExists.mockResolvedValueOnce(true);
      fs.readJSON.mockResolvedValueOnce({
        version: '2.0.0',
        modules: { core: { enabled: true } }
      });
      
      await config({ set: 'modules.testing.coverage.threshold', value: '90' });
      
      expect(fs.writeJSON).toHaveBeenCalledWith(
        '.vibe-codex.json',
        expect.objectContaining({
          modules: expect.objectContaining({
            testing: { coverage: { threshold: 90 } }
          })
        }),
        { spaces: 2 }
      );
    });

    it('should reset configuration to defaults', async () => {
      inquirer.prompt.mockResolvedValueOnce({ confirmReset: true });
      
      const configCreator = require('../../../lib/utils/config-creator');
      configCreator.createConfig.mockReturnValue({
        version: '2.0.0',
        projectType: 'custom',
        modules: { core: { enabled: true } }
      });
      
      await config({ reset: true });
      
      expect(fs.writeJSON).toHaveBeenCalledWith(
        '.vibe-codex.json',
        expect.objectContaining({
          version: '2.0.0',
          projectType: 'custom'
        }),
        { spaces: 2 }
      );
    });

    it('should export configuration', async () => {
      fs.pathExists.mockResolvedValueOnce(true);
      
      await config({ export: 'config-backup.json' });
      
      expect(fs.readJSON).toHaveBeenCalledWith('.vibe-codex.json');
      expect(fs.writeJSON).toHaveBeenCalledWith(
        'config-backup.json',
        expect.any(Object),
        { spaces: 2 }
      );
    });

    it('should import configuration', async () => {
      fs.pathExists.mockResolvedValueOnce(true);
      fs.readJSON.mockResolvedValueOnce({
        version: '2.0.0',
        modules: { core: { enabled: true } }
      });
      
      const configCreator = require('../../../lib/utils/config-creator');
      configCreator.validateConfig.mockReturnValue({ valid: true, errors: [] });
      
      inquirer.prompt.mockResolvedValueOnce({ confirmImport: true });
      
      await config({ import: 'config-backup.json' });
      
      expect(fs.writeJSON).toHaveBeenCalledWith(
        '.vibe-codex.json',
        expect.objectContaining({
          lastModified: expect.any(String)
        }),
        { spaces: 2 }
      );
    });

    it('should show configuration preview', async () => {
      fs.pathExists.mockResolvedValueOnce(true);
      fs.readJSON.mockResolvedValueOnce({
        version: '2.0.0',
        projectType: 'fullstack',
        enforcementLevel: 'error',
        modules: {
          core: { enabled: true },
          testing: { enabled: true },
          github: { enabled: true }
        }
      });
      
      await config({ preview: true });
      
      expect(console.log).toHaveBeenCalledWith(expect.stringContaining('Configuration Preview'));
      expect(console.log).toHaveBeenCalledWith(expect.stringContaining('fullstack'));
      expect(console.log).toHaveBeenCalledWith(expect.stringContaining('✓ core'));
      expect(console.log).toHaveBeenCalledWith(expect.stringContaining('✓ testing'));
    });
  });

  describe('module configuration', () => {
    it('should configure testing module with all options', async () => {
      inquirer.prompt
        .mockResolvedValueOnce({ projectType: 'web' })
        .mockResolvedValueOnce({ selectedModules: ['core', 'testing'] })
        .mockResolvedValueOnce({ // Testing config
          framework: 'vitest',
          coverageThreshold: 90,
          options: ['requireNewFileTests', 'enforceTestNaming']
        })
        .mockResolvedValueOnce({ enforcementLevel: 'warning' })
        .mockResolvedValueOnce({ confirmSave: true })
        .mockResolvedValueOnce({ installHooks: false });
      
      await config();
      
      const savedConfig = fs.writeJSON.mock.calls[0][1];
      expect(savedConfig.modules.testing).toEqual({
        enabled: true,
        framework: 'vitest',
        coverage: { threshold: 90, perFile: true },
        options: {
          requireNewFileTests: true,
          enforceTestNaming: true
        }
      });
    });

    it('should configure deployment module', async () => {
      inquirer.prompt
        .mockResolvedValueOnce({ projectType: 'api' })
        .mockResolvedValueOnce({ selectedModules: ['core', 'deployment'] })
        .mockResolvedValueOnce({ // Deployment config
          platform: 'aws',
          environments: ['development', 'staging', 'production'],
          requireStagingBeforeProduction: true
        })
        .mockResolvedValueOnce({ enforcementLevel: 'error' })
        .mockResolvedValueOnce({ confirmSave: true })
        .mockResolvedValueOnce({ installHooks: false });
      
      await config();
      
      const savedConfig = fs.writeJSON.mock.calls[0][1];
      expect(savedConfig.modules.deployment).toEqual({
        enabled: true,
        platform: 'aws',
        environments: ['development', 'staging', 'production'],
        requireStagingBeforeProduction: true
      });
    });
  });

  describe('error handling', () => {
    it('should handle configuration errors gracefully', async () => {
      const error = new Error('Write failed');
      fs.writeJSON.mockRejectedValueOnce(error);
      
      inquirer.prompt
        .mockResolvedValueOnce({ projectType: 'web' })
        .mockResolvedValueOnce({ selectedModules: ['core'] })
        .mockResolvedValueOnce({ enforcementLevel: 'error' })
        .mockResolvedValueOnce({ confirmSave: true });
      
      await expect(config()).rejects.toThrow('Write failed');
      expect(mockSpinner.fail).toHaveBeenCalledWith('Configuration failed');
    });

    it('should validate imported configuration', async () => {
      fs.pathExists.mockResolvedValueOnce(true);
      
      const configCreator = require('../../../lib/utils/config-creator');
      configCreator.validateConfig.mockReturnValue({
        valid: false,
        errors: ['version is required', 'modules must be an object']
      });
      
      await config({ import: 'invalid-config.json' });
      
      expect(console.log).toHaveBeenCalledWith(expect.stringContaining('Invalid configuration'));
      expect(console.log).toHaveBeenCalledWith(expect.stringContaining('version is required'));
    });
  });
});