/**
 * Tests for deployment module
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

const DeploymentModule = require('../../../../lib/modules/deployment');

describe('Deployment Module', () => {
  let module;

  beforeEach(() => {
    jest.clearAllMocks();
    module = new DeploymentModule();
    
    fs.pathExists.mockResolvedValue(false);
    fs.readJSON.mockResolvedValue({});
  });

  test('should extend BaseModule', () => {
    expect(module.name).toBe('deployment');
    expect(module.initialize).toBeDefined();
  });

  test('should validate deployment configuration', async () => {
    fs.pathExists.mockResolvedValue(true);
    fs.readJSON.mockResolvedValue({
      build: { command: 'npm run build' },
      deploy: { platform: 'vercel' }
    });

    const result = await module.validateDeploymentConfig();
    
    expect(result.valid).toBe(true);
  });

  test('should detect missing deployment config', async () => {
    fs.pathExists.mockResolvedValue(false);

    const result = await module.validateDeploymentConfig();
    
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('No deployment configuration found');
  });

  test('should check build scripts exist', async () => {
    fs.pathExists.mockResolvedValue(true);
    fs.readJSON.mockResolvedValue({
      scripts: {
        build: 'webpack build',
        start: 'node server.js'
      }
    });

    const result = await module.checkBuildScripts();
    
    expect(result.valid).toBe(true);
  });

  test('should validate environment variables', async () => {
    const config = {
      requiredEnvVars: ['API_KEY', 'DATABASE_URL']
    };

    process.env.API_KEY = 'test-key';
    process.env.DATABASE_URL = 'postgres://localhost';

    const result = await module.validateEnvironmentVariables(config);
    
    expect(result.valid).toBe(true);

    delete process.env.API_KEY;
    delete process.env.DATABASE_URL;
  });

  test('should detect missing environment variables', async () => {
    const config = {
      requiredEnvVars: ['MISSING_VAR']
    };

    const result = await module.validateEnvironmentVariables(config);
    
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Missing required environment variable: MISSING_VAR');
  });

  test('should validate platform-specific configs', async () => {
    const platforms = {
      vercel: { projectId: '123', orgId: '456' },
      netlify: { siteId: '789' }
    };

    const result = await module.validatePlatformConfigs(platforms);
    
    expect(result.valid).toBe(true);
  });

  test('should check deployment hooks', async () => {
    const hooks = {
      preDeploy: 'npm test',
      postDeploy: 'npm run smoke-test'
    };

    const result = await module.validateDeploymentHooks(hooks);
    
    expect(result.valid).toBe(true);
  });

  test('should validate Docker configuration', async () => {
    fs.pathExists.mockResolvedValue(true);
    fs.readFile = jest.fn().mockResolvedValue('FROM node:14\nCOPY . .\nCMD ["npm", "start"]');

    const result = await module.validateDockerConfig();
    
    expect(result.valid).toBe(true);
    expect(fs.pathExists).toHaveBeenCalledWith('Dockerfile');
  });

  test('should check for security in deployment', async () => {
    const config = {
      env: {
        API_KEY: 'hardcoded-secret-key'
      }
    };

    const result = await module.checkDeploymentSecurity(config);
    
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Hardcoded secrets detected in deployment config');
  });

  test('should validate build output', async () => {
    fs.pathExists.mockResolvedValue(true);
    fs.readdir = jest.fn().mockResolvedValue(['index.html', 'bundle.js', 'styles.css']);

    const result = await module.validateBuildOutput();
    
    expect(result.valid).toBe(true);
  });

  test('should run pre-deploy hook', async () => {
    const context = {
      environment: 'production',
      branch: 'main'
    };

    const result = await module.runPreDeployHook(context);
    
    expect(result.valid).toBe(true);
  });

  test('should prevent deploy from non-main branches to production', async () => {
    const context = {
      environment: 'production',
      branch: 'feature/test'
    };

    const result = await module.runPreDeployHook(context);
    
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Production deployments must be from main branch');
  });
});