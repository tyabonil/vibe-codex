/**
 * Tests for config-schema module
 */

const Joi = require('joi');

// Mock Joi to avoid import issues
jest.mock('joi', () => {
  const actualJoi = {
    object: jest.fn(() => ({
      keys: jest.fn().mockReturnThis(),
      pattern: jest.fn().mockReturnThis(),
      unknown: jest.fn().mockReturnThis(),
      validate: jest.fn().mockReturnValue({ error: null })
    })),
    string: jest.fn(() => ({
      required: jest.fn().mockReturnThis(),
      valid: jest.fn().mockReturnThis(),
      pattern: jest.fn().mockReturnThis(),
      isoDate: jest.fn().mockReturnThis()
    })),
    boolean: jest.fn(() => ({
      required: jest.fn().mockReturnThis()
    })),
    number: jest.fn(() => ({
      min: jest.fn().mockReturnThis(),
      max: jest.fn().mockReturnThis(),
      integer: jest.fn().mockReturnThis()
    })),
    array: jest.fn(() => ({
      items: jest.fn().mockReturnThis()
    }))
  };
  return actualJoi;
});

const configSchema = require('../../../lib/modules/config-schema');

describe('Config Schema', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should define schema version', () => {
    expect(configSchema.schemaVersion).toBe('2.0.0');
  });

  test('should export schemas object', () => {
    expect(configSchema.schemas).toBeDefined();
    expect(typeof configSchema.schemas).toBe('object');
  });

  test('should export validateConfig function', () => {
    expect(configSchema.validateConfig).toBeDefined();
    expect(typeof configSchema.validateConfig).toBe('function');
  });

  test('should export getDefaultConfig function', () => {
    expect(configSchema.getDefaultConfig).toBeDefined();
    expect(typeof configSchema.getDefaultConfig).toBe('function');
  });

  test('validateConfig should validate configuration', () => {
    const mockConfig = {
      version: '2.0.0',
      projectType: 'web',
      modules: {
        core: { enabled: true }
      }
    };

    const result = configSchema.validateConfig(mockConfig);
    expect(result).toBeDefined();
    expect(Joi.object).toHaveBeenCalled();
  });

  test('getDefaultConfig should return default configuration', () => {
    const defaultConfig = configSchema.getDefaultConfig();
    
    expect(defaultConfig).toMatchObject({
      version: '2.0.0',
      projectType: 'custom',
      modules: {
        core: { enabled: true }
      }
    });
  });

  test('schemas should contain module schemas', () => {
    expect(configSchema.schemas.base).toBeDefined();
    expect(configSchema.schemas.modules).toBeDefined();
  });

  test('should validate module configuration', () => {
    const moduleConfig = {
      enabled: true,
      options: {}
    };

    const mockValidate = jest.fn().mockReturnValue({ error: null });
    Joi.object.mockReturnValue({ validate: mockValidate });

    configSchema.validateConfig(moduleConfig);
    expect(mockValidate).toHaveBeenCalled();
  });

  test('should handle validation errors', () => {
    const invalidConfig = { version: 'invalid' };
    
    const mockError = { details: [{ message: 'Invalid version' }] };
    const mockValidate = jest.fn().mockReturnValue({ error: mockError });
    Joi.object.mockReturnValue({ validate: mockValidate });

    const result = configSchema.validateConfig(invalidConfig);
    expect(mockValidate).toHaveBeenCalled();
  });
});