/**
 * Tests for base module functionality
 */

// Mock logger
jest.mock('../../../lib/utils/logger.js', () => ({
  default: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    success: jest.fn()
  }
}));

// Since RuleModule is ES module, we need to handle it specially
let RuleModule;

beforeAll(async () => {
  const module = await import('../../../lib/modules/base.js');
  RuleModule = module.RuleModule;
});

describe('RuleModule Base Class', () => {
  let module;

  beforeEach(() => {
    module = new RuleModule({
      name: 'test-module',
      version: '1.0.0',
      description: 'Test module',
      dependencies: ['core'],
      options: { testOption: true }
    });
  });

  describe('constructor', () => {
    it('should initialize with provided configuration', () => {
      expect(module.name).toBe('test-module');
      expect(module.version).toBe('1.0.0');
      expect(module.description).toBe('Test module');
      expect(module.dependencies).toEqual(['core']);
      expect(module.options).toEqual({ testOption: true });
      expect(module.enabled).toBe(true);
      expect(module.rules).toEqual([]);
      expect(module.hooks).toEqual({});
      expect(module.validators).toEqual({});
    });

    it('should set default values for optional properties', () => {
      const minimalModule = new RuleModule({
        name: 'minimal',
        version: '1.0.0',
        description: 'Minimal module'
      });
      expect(minimalModule.dependencies).toEqual([]);
      expect(minimalModule.options).toEqual({});
    });
  });

  describe('initialize', () => {
    it('should throw error if loadRules is not implemented', async () => {
      await expect(module.initialize()).rejects.toThrow(
        'Failed to initialize module test-module: Module test-module must implement loadRules()'
      );
    });

    it('should call all load methods when properly implemented', async () => {
      module.loadRules = jest.fn().mockResolvedValue();
      module.loadHooks = jest.fn().mockResolvedValue();
      module.loadValidators = jest.fn().mockResolvedValue();

      await module.initialize();

      expect(module.loadRules).toHaveBeenCalled();
      expect(module.loadHooks).toHaveBeenCalled();
      expect(module.loadValidators).toHaveBeenCalled();
    });
  });

  describe('validateConfig', () => {
    it('should return no errors when dependencies are met', () => {
      const projectConfig = {
        modules: {
          core: { enabled: true }
        }
      };
      const errors = module.validateConfig(projectConfig);
      expect(errors).toEqual([]);
    });

    it('should return errors when dependencies are missing', () => {
      const projectConfig = {
        modules: {
          other: { enabled: true }
        }
      };
      const errors = module.validateConfig(projectConfig);
      expect(errors).toHaveLength(1);
      expect(errors[0]).toEqual({
        module: 'test-module',
        type: 'dependency',
        message: "Module 'test-module' requires 'core' module to be enabled"
      });
    });

    it('should return errors when dependencies are disabled', () => {
      const projectConfig = {
        modules: {
          core: { enabled: false }
        }
      };
      const errors = module.validateConfig(projectConfig);
      expect(errors).toHaveLength(1);
      expect(errors[0].type).toBe('dependency');
    });
  });

  describe('rule management', () => {
    beforeEach(() => {
      module.rules = [
        { id: 'RULE-1', level: 1, enabled: true },
        { id: 'RULE-2', level: 2, enabled: true },
        { id: 'RULE-3', level: 2, enabled: false },
        { id: 'RULE-4', level: 3, enabled: true }
      ];
    });

    describe('getRulesByLevel', () => {
      it('should return rules for specific level', () => {
        const level2Rules = module.getRulesByLevel(2);
        expect(level2Rules).toHaveLength(2);
        expect(level2Rules.map(r => r.id)).toEqual(['RULE-2', 'RULE-3']);
      });

      it('should return empty array for non-existent level', () => {
        const level5Rules = module.getRulesByLevel(5);
        expect(level5Rules).toEqual([]);
      });
    });

    describe('getEnabledRules', () => {
      it('should return only enabled rules', () => {
        const enabledRules = module.getEnabledRules();
        expect(enabledRules).toHaveLength(3);
        expect(enabledRules.map(r => r.id)).toEqual(['RULE-1', 'RULE-2', 'RULE-4']);
      });
    });

    describe('registerRule', () => {
      it('should add rule with module name', () => {
        const newRule = { id: 'RULE-5', level: 1 };
        module.registerRule(newRule);
        
        expect(module.rules).toHaveLength(5);
        const addedRule = module.rules[4];
        expect(addedRule).toEqual({
          module: 'test-module',
          id: 'RULE-5',
          level: 1
        });
      });
    });
  });

  describe('hook management', () => {
    describe('registerHook', () => {
      it('should register new hook', () => {
        const handler = jest.fn();
        module.registerHook('pre-commit', handler);
        
        expect(module.hooks['pre-commit']).toEqual([handler]);
      });

      it('should append to existing hooks', () => {
        const handler1 = jest.fn();
        const handler2 = jest.fn();
        
        module.registerHook('pre-commit', handler1);
        module.registerHook('pre-commit', handler2);
        
        expect(module.hooks['pre-commit']).toEqual([handler1, handler2]);
      });
    });

    describe('getHooks', () => {
      it('should return hooks for event', () => {
        const handler = jest.fn();
        module.registerHook('pre-push', handler);
        
        expect(module.getHooks('pre-push')).toEqual([handler]);
      });

      it('should return empty array for non-existent event', () => {
        expect(module.getHooks('non-existent')).toEqual([]);
      });
    });
  });

  describe('validator management', () => {
    describe('registerValidator', () => {
      it('should register validator function', () => {
        const validator = jest.fn();
        module.registerValidator('test-validator', validator);
        
        expect(module.validators['test-validator']).toBe(validator);
      });

      it('should overwrite existing validator', () => {
        const validator1 = jest.fn();
        const validator2 = jest.fn();
        
        module.registerValidator('test', validator1);
        module.registerValidator('test', validator2);
        
        expect(module.validators['test']).toBe(validator2);
      });
    });
  });
});