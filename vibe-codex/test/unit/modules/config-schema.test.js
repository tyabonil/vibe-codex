/**
 * Tests for config schema module
 */

describe('Config Schema', () => {
  let configSchema;
  
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
    configSchema = require('../../../lib/modules/config-schema.js');
  });

  describe('schema structure', () => {
    it('should export a valid schema object', () => {
      expect(configSchema).toBeDefined();
      expect(configSchema.type).toBe('object');
      expect(configSchema.properties).toBeDefined();
      expect(configSchema.required).toEqual(['version']);
    });

    it('should define all required top-level properties', () => {
      const props = configSchema.properties;
      
      expect(props.version).toBeDefined();
      expect(props.modules).toBeDefined();
      expect(props.hooks).toBeDefined();
      expect(props.rules).toBeDefined();
      expect(props.github).toBeDefined();
      expect(props.monorepo).toBeDefined();
    });
  });

  describe('version property', () => {
    it('should require version as a string', () => {
      const versionSchema = configSchema.properties.version;
      
      expect(versionSchema.type).toBe('string');
      expect(versionSchema.description).toContain('version');
    });
  });

  describe('modules property', () => {
    it('should define module configuration schema', () => {
      const modulesSchema = configSchema.properties.modules;
      
      expect(modulesSchema.type).toBe('object');
      expect(modulesSchema.properties).toBeDefined();
      expect(modulesSchema.properties.core).toBeDefined();
      expect(modulesSchema.properties.testing).toBeDefined();
      expect(modulesSchema.properties.github).toBeDefined();
    });

    it('should define proper schema for each module', () => {
      const coreModule = configSchema.properties.modules.properties.core;
      
      expect(coreModule.type).toBe('object');
      expect(coreModule.properties.enabled.type).toBe('boolean');
      expect(coreModule.properties.rules).toBeDefined();
    });
  });

  describe('hooks property', () => {
    it('should define hooks configuration', () => {
      const hooksSchema = configSchema.properties.hooks;
      
      expect(hooksSchema.type).toBe('object');
      expect(hooksSchema.additionalProperties).toBeDefined();
      expect(hooksSchema.additionalProperties.type).toBe('object');
    });
  });

  describe('github property', () => {
    it('should define GitHub integration schema', () => {
      const githubSchema = configSchema.properties.github;
      
      expect(githubSchema.type).toBe('object');
      expect(githubSchema.properties.actions).toBeDefined();
      expect(githubSchema.properties.pr).toBeDefined();
      expect(githubSchema.properties.issues).toBeDefined();
    });
  });

  describe('rules property', () => {
    it('should allow custom rule configuration', () => {
      const rulesSchema = configSchema.properties.rules;
      
      expect(rulesSchema.type).toBe('object');
      expect(rulesSchema.additionalProperties).toBeDefined();
    });
  });
});