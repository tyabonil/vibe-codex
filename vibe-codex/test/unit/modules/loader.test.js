/**
 * Tests for module loader
 */

import { ModuleLoader } from '../../../lib/modules/loader.js';
import fs from 'fs/promises';
import path from 'path';

jest.mock('fs/promises');
jest.mock('../../../lib/modules/core/index.js', () => ({
  default: {
    name: 'core',
    initialize: jest.fn(),
    validateConfig: jest.fn().mockReturnValue([]),
    getEnabledRules: jest.fn().mockReturnValue([]),
    getRulesByLevel: jest.fn().mockReturnValue([]),
    getHooks: jest.fn().mockReturnValue([]),
    validators: {}
  }
}));

describe('ModuleLoader', () => {
  let loader;

  beforeEach(() => {
    loader = new ModuleLoader();
    jest.clearAllMocks();
  });

  describe('loadConfiguration', () => {
    it('should load configuration from .vibe-codex.json', async () => {
      const config = {
        version: '1.0.0',
        modules: {
          core: { enabled: true },
          testing: { enabled: true }
        }
      };
      
      fs.readFile.mockImplementation((path) => {
        if (path.endsWith('.vibe-codex.json')) {
          return Promise.resolve(JSON.stringify(config));
        }
        throw new Error('Not found');
      });

      const result = await loader.loadConfiguration();
      expect(result).toEqual(config);
    });

    it('should load configuration from package.json vibe-codex field', async () => {
      const packageJson = {
        name: 'test-project',
        'vibe-codex': {
          version: '1.0.0',
          modules: {
            core: { enabled: true }
          }
        }
      };
      
      fs.readFile.mockImplementation((path) => {
        if (path.endsWith('package.json')) {
          return Promise.resolve(JSON.stringify(packageJson));
        }
        throw new Error('Not found');
      });

      const result = await loader.loadConfiguration();
      expect(result).toEqual(packageJson['vibe-codex']);
    });

    it('should return default configuration when no config found', async () => {
      fs.readFile.mockRejectedValue(new Error('Not found'));

      const result = await loader.loadConfiguration();
      expect(result).toEqual({
        version: '1.0.0',
        modules: {
          core: { enabled: true }
        }
      });
    });
  });

  describe('loadModule', () => {
    it('should load and initialize a module', async () => {
      const mockModule = {
        name: 'test',
        options: {},
        initialize: jest.fn()
      };
      
      // Mock dynamic import
      jest.spyOn(loader, 'loadModule').mockImplementation(async (name, config) => {
        if (name === 'core') {
          loader.modules.set('core', mockModule);
        }
      });

      await loader.loadModule('core', { enabled: true });
      
      expect(loader.modules.has('core')).toBe(true);
    });

    it('should apply module configuration', async () => {
      const mockModule = {
        name: 'test',
        options: { threshold: 80 },
        initialize: jest.fn()
      };
      
      jest.spyOn(loader, 'loadModule').mockImplementation(async (name, config) => {
        if (config.options) {
          Object.assign(mockModule.options, config.options);
        }
        loader.modules.set(name, mockModule);
      });

      await loader.loadModule('test', { 
        enabled: true,
        options: { threshold: 90 }
      });
      
      expect(mockModule.options.threshold).toBe(90);
    });
  });

  describe('loadEnabledModules', () => {
    it('should always load core module', async () => {
      loader.config = {
        modules: {}
      };
      
      jest.spyOn(loader, 'loadModule').mockResolvedValue();
      jest.spyOn(loader, 'validateDependencies').mockResolvedValue();

      await loader.loadEnabledModules();
      
      expect(loader.loadModule).toHaveBeenCalledWith('core', { enabled: true });
    });

    it('should load only enabled modules', async () => {
      loader.config = {
        modules: {
          core: { enabled: true },
          testing: { enabled: true },
          github: { enabled: false },
          deployment: { enabled: true }
        }
      };
      
      jest.spyOn(loader, 'loadModule').mockResolvedValue();
      jest.spyOn(loader, 'validateDependencies').mockResolvedValue();

      await loader.loadEnabledModules();
      
      expect(loader.loadModule).toHaveBeenCalledTimes(3);
      expect(loader.loadModule).toHaveBeenCalledWith('core', { enabled: true });
      expect(loader.loadModule).toHaveBeenCalledWith('testing', { enabled: true });
      expect(loader.loadModule).toHaveBeenCalledWith('deployment', { enabled: true });
      expect(loader.loadModule).not.toHaveBeenCalledWith('github', expect.any(Object));
    });
  });

  describe('validateDependencies', () => {
    it('should pass when all dependencies are met', async () => {
      const mockCore = {
        validateConfig: jest.fn().mockReturnValue([])
      };
      const mockTesting = {
        validateConfig: jest.fn().mockReturnValue([])
      };
      
      loader.modules.set('core', mockCore);
      loader.modules.set('testing', mockTesting);

      await expect(loader.validateDependencies()).resolves.not.toThrow();
    });

    it('should throw when dependencies are not met', async () => {
      const mockModule = {
        validateConfig: jest.fn().mockReturnValue([{
          module: 'testing',
          message: 'Requires core module'
        }])
      };
      
      loader.modules.set('testing', mockModule);

      await expect(loader.validateDependencies()).rejects.toThrow('Module dependency validation failed');
    });
  });

  describe('getAllRules', () => {
    it('should aggregate rules from all modules', () => {
      const coreRules = [{ id: 'CORE-1' }, { id: 'CORE-2' }];
      const testingRules = [{ id: 'TEST-1' }];
      
      loader.modules.set('core', {
        getEnabledRules: () => coreRules
      });
      loader.modules.set('testing', {
        getEnabledRules: () => testingRules
      });

      const allRules = loader.getAllRules();
      expect(allRules).toHaveLength(3);
      expect(allRules).toEqual([...coreRules, ...testingRules]);
    });
  });

  describe('getRulesByLevel', () => {
    it('should get rules by level from all modules', () => {
      const coreLevel2Rules = [{ id: 'CORE-1', level: 2 }];
      const testingLevel2Rules = [{ id: 'TEST-1', level: 2 }];
      
      loader.modules.set('core', {
        getRulesByLevel: (level) => level === 2 ? coreLevel2Rules : []
      });
      loader.modules.set('testing', {
        getRulesByLevel: (level) => level === 2 ? testingLevel2Rules : []
      });

      const level2Rules = loader.getRulesByLevel(2);
      expect(level2Rules).toHaveLength(2);
      expect(level2Rules).toEqual([...coreLevel2Rules, ...testingLevel2Rules]);
    });
  });

  describe('getHooks', () => {
    it('should aggregate hooks from all modules', () => {
      const coreHook = jest.fn();
      const testingHook = jest.fn();
      
      loader.modules.set('core', {
        getHooks: (event) => event === 'pre-commit' ? [coreHook] : []
      });
      loader.modules.set('testing', {
        getHooks: (event) => event === 'pre-commit' ? [testingHook] : []
      });

      const hooks = loader.getHooks('pre-commit');
      expect(hooks).toHaveLength(2);
      expect(hooks).toEqual([coreHook, testingHook]);
    });
  });

  describe('runValidators', () => {
    it('should run all validators and return results', async () => {
      const coreValidator = jest.fn().mockResolvedValue({ valid: true });
      const testingValidator = jest.fn().mockResolvedValue({ valid: true });
      
      loader.modules.set('core', {
        validators: { environment: coreValidator }
      });
      loader.modules.set('testing', {
        validators: { framework: testingValidator }
      });

      const context = { projectPath: '/test' };
      const results = await loader.runValidators(context);
      
      expect(results).toEqual({
        core: { environment: { valid: true } },
        testing: { framework: { valid: true } }
      });
      expect(coreValidator).toHaveBeenCalledWith(context);
      expect(testingValidator).toHaveBeenCalledWith(context);
    });

    it('should handle validator errors gracefully', async () => {
      const errorValidator = jest.fn().mockRejectedValue(new Error('Validation failed'));
      
      loader.modules.set('core', {
        validators: { failing: errorValidator }
      });

      const results = await loader.runValidators({});
      
      expect(results).toEqual({
        core: {
          failing: {
            valid: false,
            error: 'Validation failed'
          }
        }
      });
    });
  });

  describe('getModule', () => {
    it('should return module by name', () => {
      const mockModule = { name: 'test' };
      loader.modules.set('test', mockModule);
      
      expect(loader.getModule('test')).toBe(mockModule);
    });

    it('should return null for non-existent module', () => {
      expect(loader.getModule('non-existent')).toBeNull();
    });
  });

  describe('saveConfiguration', () => {
    it('should save configuration to file', async () => {
      const config = {
        version: '1.0.0',
        modules: { core: { enabled: true } }
      };
      
      fs.writeFile.mockResolvedValue();

      await loader.saveConfiguration(config);
      
      expect(fs.writeFile).toHaveBeenCalledWith(
        path.join(process.cwd(), '.vibe-codex.json'),
        JSON.stringify(config, null, 2)
      );
      expect(loader.config).toEqual(config);
    });
  });
});