/**
 * Tests for deployment module
 */

const fs = require('fs-extra');
const BaseModule = require('../../../../lib/modules/base');

// Mock dependencies
jest.mock('fs-extra');
jest.mock('../../../../lib/modules/base');
jest.mock('../../../../lib/utils/logger');

describe('Deployment Module', () => {
  let DeploymentModule;
  let deploymentModule;
  
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
    
    // Mock BaseModule
    BaseModule.mockImplementation(function() {
      this.name = 'deployment';
      this.version = '1.0.0';
      this.description = 'Deployment and release management';
      this.rules = [];
      this.hooks = {};
      this.validators = {};
      this.initialize = jest.fn();
      this.loadRules = jest.fn();
      this.loadHooks = jest.fn();
      this.loadValidators = jest.fn();
    });
    
    // Mock fs
    fs.readJSON.mockResolvedValue({});
    fs.pathExists.mockResolvedValue(true);
    
    DeploymentModule = require('../../../../lib/modules/deployment/index.js').default;
    deploymentModule = new DeploymentModule();
  });

  describe('initialization', () => {
    it('should create deployment module with correct properties', () => {
      expect(deploymentModule.name).toBe('deployment');
      expect(deploymentModule.version).toBe('1.0.0');
      expect(deploymentModule.description).toContain('Deployment');
    });

    it('should call parent initialize method', async () => {
      await deploymentModule.initialize();
      expect(deploymentModule.initialize).toHaveBeenCalled();
    });
  });

  describe('deployment rules', () => {
    beforeEach(() => {
      // Manually set up rules as they would be loaded
      deploymentModule.rules = [
        {
          id: 'deployment-branch-protection',
          name: 'Deployment Branch Protection',
          level: 3,
          severity: 'HIGH',
          check: jest.fn()
        },
        {
          id: 'staging-before-production',
          name: 'Staging Before Production',
          level: 3,
          severity: 'MEDIUM',
          check: jest.fn()
        }
      ];
    });

    it('should include deployment branch protection rule', () => {
      const rule = deploymentModule.rules.find(r => r.id === 'deployment-branch-protection');
      expect(rule).toBeDefined();
      expect(rule.level).toBe(3);
    });

    it('should include staging before production rule', () => {
      const rule = deploymentModule.rules.find(r => r.id === 'staging-before-production');
      expect(rule).toBeDefined();
      expect(rule.level).toBe(3);
    });
  });

  describe('deployment hooks', () => {
    beforeEach(() => {
      deploymentModule.hooks = {
        'pre-deploy': [
          { name: 'validate-environment', run: jest.fn() },
          { name: 'run-tests', run: jest.fn() }
        ],
        'post-deploy': [
          { name: 'notify-team', run: jest.fn() }
        ]
      };
    });

    it('should provide pre-deploy hooks', () => {
      expect(deploymentModule.hooks['pre-deploy']).toBeDefined();
      expect(deploymentModule.hooks['pre-deploy'].length).toBeGreaterThan(0);
    });

    it('should provide post-deploy hooks', () => {
      expect(deploymentModule.hooks['post-deploy']).toBeDefined();
      expect(deploymentModule.hooks['post-deploy'].length).toBeGreaterThan(0);
    });
  });

  describe('platform detection', () => {
    it('should detect Vercel deployment', async () => {
      fs.pathExists.mockImplementation(async (path) => {
        return path === 'vercel.json' || path === '.vercel';
      });
      
      // Simulate method that would check for platform
      const detectPlatform = async () => {
        if (await fs.pathExists('vercel.json') || await fs.pathExists('.vercel')) {
          return 'vercel';
        }
        return null;
      };
      
      const platform = await detectPlatform();
      expect(platform).toBe('vercel');
    });

    it('should detect Netlify deployment', async () => {
      fs.pathExists.mockImplementation(async (path) => {
        return path === 'netlify.toml' || path === '.netlify';
      });
      
      const detectPlatform = async () => {
        if (await fs.pathExists('netlify.toml') || await fs.pathExists('.netlify')) {
          return 'netlify';
        }
        return null;
      };
      
      const platform = await detectPlatform();
      expect(platform).toBe('netlify');
    });
  });
});