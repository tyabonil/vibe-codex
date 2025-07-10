/**
 * Tests for module loader functionality
 */

const { ModuleLoader } = require('../../../lib/modules/loader');

// Mock the ES modules
jest.mock('../../../lib/modules/core/index.js', () => ({
  default: {
    name: 'core',
    version: '1.0.0',
    rules: [],
    hooks: {},
    validators: {},
    initialize: jest.fn().mockResolvedValue(true),
    getRulesByLevel: jest.fn().mockReturnValue([]),
    getEnabledRules: jest.fn().mockReturnValue([])
  }
}));

jest.mock('../../../lib/modules/testing/index.js', () => ({
  default: {
    name: 'testing',
    version: '1.0.0',
    rules: [],
    hooks: {},
    validators: {},
    initialize: jest.fn().mockResolvedValue(true),
    getRulesByLevel: jest.fn().mockReturnValue([]),
    getEnabledRules: jest.fn().mockReturnValue([])
  }
}));

describe('ModuleLoader', () => {
  let loader;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create a module loader instance', () => {
    loader = new ModuleLoader();
    expect(loader).toBeDefined();
    expect(loader.modules).toEqual({});
    expect(loader.config).toEqual({});
  });

  it('should load modules based on configuration', async () => {
    loader = new ModuleLoader();
    const config = {
      modules: {
        core: { enabled: true },
        testing: { enabled: true },
        github: { enabled: false }
      }
    };

    const modules = await loader.loadModules(config, '/test/project');
    
    expect(modules).toBeDefined();
    expect(typeof modules).toBe('object');
    // Core is always loaded
    expect(modules.core).toBeDefined();
    // Testing is enabled
    expect(modules.testing).toBeDefined();
    // GitHub is disabled
    expect(modules.github).toBeUndefined();
  });

  it('should validate module dependencies', () => {
    loader = new ModuleLoader();
    const modules = {
      core: { dependencies: [] },
      testing: { dependencies: ['core'] }
    };

    const result = loader.validateDependencies(modules);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('should detect missing dependencies', () => {
    loader = new ModuleLoader();
    const modules = {
      testing: { dependencies: ['core'] }
    };

    const result = loader.validateDependencies(modules);
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it('should get rules from loaded modules', async () => {
    loader = new ModuleLoader();
    const config = {
      modules: {
        core: { enabled: true }
      }
    };

    await loader.loadModules(config, '/test/project');
    
    const rules = loader.getRules();
    expect(Array.isArray(rules)).toBe(true);
  });

  it('should get hooks from loaded modules', async () => {
    loader = new ModuleLoader();
    const config = {
      modules: {
        core: { enabled: true }
      }
    };

    await loader.loadModules(config, '/test/project');
    
    const hooks = loader.getHooks('pre-commit');
    expect(Array.isArray(hooks)).toBe(true);
  });

  it('should reload modules', async () => {
    loader = new ModuleLoader();
    const config = {
      modules: {
        core: { enabled: true }
      }
    };

    await loader.loadModules(config, '/test/project');
    const initialModules = Object.keys(loader.modules).length;

    const newConfig = {
      modules: {
        core: { enabled: true },
        testing: { enabled: true }
      }
    };

    await loader.reload(newConfig);
    const reloadedModules = Object.keys(loader.modules).length;

    expect(reloadedModules).toBeGreaterThan(initialModules);
  });

  it('should get module info', async () => {
    loader = new ModuleLoader();
    const config = {
      modules: {
        core: { enabled: true }
      }
    };

    await loader.loadModules(config, '/test/project');
    
    const info = loader.getModuleInfo('core');
    expect(info).toBeDefined();
    expect(info.name).toBe('core');
    expect(info.version).toBe('1.0.0');
  });

  it('should return null for non-existent module info', async () => {
    loader = new ModuleLoader();
    const info = loader.getModuleInfo('non-existent');
    expect(info).toBeNull();
  });
});