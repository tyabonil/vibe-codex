/**
 * Tests for config creator utility
 */

const fs = require('fs-extra');
const detector = require('../../../lib/utils/detector');

// Mock dependencies
jest.mock('fs-extra');
jest.mock('../../../lib/utils/detector');

describe('Config Creator', () => {
  let configCreator;
  
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
    
    // Setup default mocks
    detector.detectFramework.mockReturnValue('react');
    detector.detectPackageManager.mockReturnValue('npm');
    detector.detectTestingFramework.mockReturnValue('jest');
    detector.detectCICD.mockReturnValue(['github-actions']);
    
    fs.readJSON.mockResolvedValue({
      name: 'test-project',
      version: '1.0.0'
    });
    
    configCreator = require('../../../lib/utils/config-creator');
  });

  describe('createConfig', () => {
    it('should create basic configuration', () => {
      const config = configCreator.createConfig({
        projectType: 'web',
        modules: ['core', 'testing']
      });
      
      expect(config.version).toBe('2.0.0');
      expect(config.projectType).toBe('web');
      expect(config.modules.core.enabled).toBe(true);
      expect(config.modules.testing.enabled).toBe(true);
    });

    it('should auto-detect project settings', async () => {
      const config = await configCreator.createAutoConfig();
      
      expect(config.framework).toBe('react');
      expect(config.packageManager).toBe('npm');
      expect(config.testing.framework).toBe('jest');
      expect(config.ci).toContain('github-actions');
    });

    it('should merge with existing config', () => {
      const existing = {
        version: '1.0.0',
        modules: {
          core: { enabled: true, customRule: true }
        }
      };
      
      const updates = {
        version: '2.0.0',
        modules: {
          testing: { enabled: true }
        }
      };
      
      const merged = configCreator.mergeConfigs(existing, updates);
      
      expect(merged.version).toBe('2.0.0');
      expect(merged.modules.core.customRule).toBe(true);
      expect(merged.modules.testing.enabled).toBe(true);
    });
  });

  describe('project templates', () => {
    it('should provide web project template', () => {
      const template = configCreator.getTemplate('web');
      
      expect(template.modules).toContain('core');
      expect(template.modules).toContain('testing');
      expect(template.modules).toContain('github');
      expect(template.hooks['pre-commit']).toBe(true);
    });

    it('should provide API project template', () => {
      const template = configCreator.getTemplate('api');
      
      expect(template.modules).toContain('core');
      expect(template.modules).toContain('testing');
      expect(template.modules).toContain('deployment');
      expect(template.testing.coverage.threshold).toBeGreaterThanOrEqual(80);
    });

    it('should provide fullstack template', () => {
      const template = configCreator.getTemplate('fullstack');
      
      expect(template.modules).toContain('core');
      expect(template.modules).toContain('testing');
      expect(template.modules).toContain('github');
      expect(template.modules).toContain('deployment');
      expect(template.monorepo).toBeDefined();
    });
  });

  describe('module configuration', () => {
    it('should configure testing module based on framework', () => {
      detector.detectTestingFramework.mockReturnValue('vitest');
      
      const config = configCreator.configureTestingModule();
      
      expect(config.framework).toBe('vitest');
      expect(config.coverage.tool).toBe('c8');
      expect(config.scripts.test).toContain('vitest');
    });

    it('should configure GitHub module with workflows', () => {
      const config = configCreator.configureGitHubModule({
        workflows: ['ci', 'deploy']
      });
      
      expect(config.actions.enabled).toBe(true);
      expect(config.workflows).toContain('ci');
      expect(config.workflows).toContain('deploy');
      expect(config.pr.autoAssign).toBe(true);
    });

    it('should configure deployment module by platform', () => {
      const config = configCreator.configureDeploymentModule({
        platform: 'vercel'
      });
      
      expect(config.platform).toBe('vercel');
      expect(config.checks).toContain('build');
      expect(config.environments).toContain('production');
      expect(config.hooks['pre-deploy']).toBeDefined();
    });
  });

  describe('validation', () => {
    it('should validate configuration schema', () => {
      const validConfig = {
        version: '2.0.0',
        modules: {
          core: { enabled: true }
        }
      };
      
      const result = configCreator.validateConfig(validConfig);
      
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should detect invalid configuration', () => {
      const invalidConfig = {
        // Missing version
        modules: {
          core: { enabled: 'yes' } // Wrong type
        }
      };
      
      const result = configCreator.validateConfig(invalidConfig);
      
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('version is required');
      expect(result.errors).toContain('enabled must be boolean');
    });

    it('should suggest fixes for common issues', () => {
      const config = {
        version: '1.0.0', // Old version
        modules: {
          testing: { coverage: 50 } // Low coverage
        }
      };
      
      const suggestions = configCreator.getSuggestions(config);
      
      expect(suggestions).toContain('Update to version 2.0.0');
      expect(suggestions).toContain('Consider increasing coverage threshold');
    });
  });

  describe('environment-specific configs', () => {
    it('should create development config', () => {
      const config = configCreator.createEnvironmentConfig('development');
      
      expect(config.strictMode).toBe(false);
      expect(config.hooks['pre-push']).toBe(true);
      expect(config.hooks['pre-commit']).toBe(true);
    });

    it('should create production config', () => {
      const config = configCreator.createEnvironmentConfig('production');
      
      expect(config.strictMode).toBe(true);
      expect(config.modules.testing.coverage.threshold).toBeGreaterThanOrEqual(80);
      expect(config.modules.deployment.enabled).toBe(true);
    });

    it('should create CI config', () => {
      const config = configCreator.createEnvironmentConfig('ci');
      
      expect(config.ci).toBe(true);
      expect(config.reporting.format).toContain('junit');
      expect(config.failFast).toBe(true);
    });
  });
});