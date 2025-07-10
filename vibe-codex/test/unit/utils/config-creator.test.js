/**
 * Tests for config-creator utility
 */

const fs = require('fs-extra');
const Joi = require('joi');

// Mock dependencies
jest.mock('fs-extra');
jest.mock('joi');

jest.mock('../../../lib/utils/detector', () => ({
  detectFramework: jest.fn(),
  detectPackageManager: jest.fn(),
  detectTestingFramework: jest.fn(),
  detectCICD: jest.fn()
}));

const {
  createConfig,
  createAutoConfig,
  createConfiguration,
  mergeConfigs,
  getTemplate,
  validateConfig,
  getSuggestions,
  configureTestingModule,
  configureGitHubModule,
  configureDeploymentModule
} = require('../../../lib/utils/config-creator');

describe('Config Creator', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    fs.writeJSON.mockResolvedValue();
    fs.writeFile.mockResolvedValue();
    fs.pathExists.mockResolvedValue(false);
    
    Joi.object = jest.fn(() => ({
      validate: jest.fn().mockReturnValue({ error: null })
    }));
  });

  describe('createConfig', () => {
    test('should create basic configuration', () => {
      const config = createConfig();
      
      expect(config).toMatchObject({
        version: '2.0.0',
        projectType: 'custom',
        modules: {
          core: { enabled: true }
        },
        enforcementLevel: 'error'
      });
    });

    test('should create config with options', () => {
      const config = createConfig({
        projectType: 'web',
        modules: ['core', 'testing', 'github'],
        enforcementLevel: 'warning'
      });
      
      expect(config.projectType).toBe('web');
      expect(config.modules.testing).toEqual({ enabled: true });
      expect(config.modules.github).toEqual({ enabled: true });
      expect(config.enforcementLevel).toBe('warning');
    });
  });

  describe('createAutoConfig', () => {
    test('should auto-detect configuration', async () => {
      const detector = require('../../../lib/utils/detector');
      detector.detectFramework.mockResolvedValue('react');
      detector.detectPackageManager.mockResolvedValue('npm');
      detector.detectTestingFramework.mockResolvedValue('jest');
      detector.detectCICD.mockResolvedValue(['github-actions']);
      
      const config = await createAutoConfig();
      
      expect(config.framework).toBe('react');
      expect(config.packageManager).toBe('npm');
      expect(config.modules.testing.enabled).toBe(true);
      expect(config.modules.github.enabled).toBe(true);
    });
  });

  describe('createConfiguration', () => {
    test('should create and save configuration', async () => {
      const options = {
        projectType: 'web',
        selectedModules: ['testing'],
        moduleConfigs: {
          testing: { framework: 'jest' }
        }
      };
      
      const config = await createConfiguration(options);
      
      expect(fs.writeJSON).toHaveBeenCalledWith(
        '.vibe-codex.json',
        expect.objectContaining({
          projectType: 'web',
          modules: expect.objectContaining({
            testing: { enabled: true, framework: 'jest' }
          })
        }),
        { spaces: 2 }
      );
    });

    test('should create ignore file', async () => {
      await createConfiguration({});
      
      expect(fs.writeFile).toHaveBeenCalledWith(
        '.vibe-codexignore',
        expect.stringContaining('node_modules/')
      );
    });
  });

  describe('mergeConfigs', () => {
    test('should merge configurations correctly', () => {
      const existing = {
        version: '1.0.0',
        modules: {
          core: { enabled: true },
          testing: { enabled: false }
        }
      };
      
      const updates = {
        version: '2.0.0',
        modules: {
          testing: { enabled: true, framework: 'jest' },
          github: { enabled: true }
        }
      };
      
      const merged = mergeConfigs(existing, updates);
      
      expect(merged.version).toBe('2.0.0');
      expect(merged.modules.testing).toEqual({ enabled: true, framework: 'jest' });
      expect(merged.modules.github).toEqual({ enabled: true });
      expect(merged.modules.core).toEqual({ enabled: true });
    });
  });

  describe('getTemplate', () => {
    test('should return web template', () => {
      const template = getTemplate('web');
      
      expect(template.modules).toContain('core');
      expect(template.modules).toContain('testing');
      expect(template.hooks['pre-commit']).toBe(true);
    });

    test('should return api template', () => {
      const template = getTemplate('api');
      
      expect(template.modules).toContain('deployment');
      expect(template.testing.coverage.threshold).toBe(85);
    });

    test('should return default template for unknown type', () => {
      const template = getTemplate('unknown');
      
      expect(template).toBeDefined();
      expect(template.modules).toContain('core');
    });
  });

  describe('validateConfig', () => {
    test('should validate valid configuration', () => {
      const config = {
        version: '2.0.0',
        projectType: 'web',
        modules: { core: { enabled: true } }
      };
      
      const result = validateConfig(config);
      
      expect(result.valid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    test('should return errors for invalid config', () => {
      Joi.object = jest.fn(() => ({
        validate: jest.fn().mockReturnValue({
          error: {
            details: [{ message: 'Invalid version' }]
          }
        })
      }));
      
      const result = validateConfig({ version: 'invalid' });
      
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Invalid version');
    });
  });

  describe('getSuggestions', () => {
    test('should suggest version update', () => {
      const config = { version: '1.0.0', modules: {} };
      const suggestions = getSuggestions(config);
      
      expect(suggestions).toContain('Update to version 2.0.0 for latest features');
    });

    test('should suggest enabling testing', () => {
      const config = {
        version: '2.0.0',
        modules: { core: { enabled: true } }
      };
      const suggestions = getSuggestions(config);
      
      expect(suggestions).toContain('Enable testing module for better code quality');
    });

    test('should suggest coverage threshold increase', () => {
      const config = {
        version: '2.0.0',
        modules: {
          testing: { enabled: true, coverage: { threshold: 50 } }
        }
      };
      const suggestions = getSuggestions(config);
      
      expect(suggestions).toContain('Consider increasing test coverage threshold to at least 70%');
    });
  });

  describe('module configurators', () => {
    test('should configure testing module', () => {
      const config = configureTestingModule('jest');
      
      expect(config.framework).toBe('jest');
      expect(config.coverage.tool).toBe('jest');
      expect(config.scripts.test).toBe('jest');
    });

    test('should configure GitHub module', () => {
      const config = configureGitHubModule({
        workflows: ['ci', 'cd']
      });
      
      expect(config.enabled).toBe(true);
      expect(config.workflows).toEqual(['ci', 'cd']);
      expect(config.pr.requireApproval).toBe(true);
    });

    test('should configure deployment module', () => {
      const config = configureDeploymentModule({
        platform: 'aws'
      });
      
      expect(config.platform).toBe('aws');
      expect(config.services).toContain('s3');
      expect(config.environments).toContain('production');
    });
  });
});