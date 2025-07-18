const SchemaValidator = require('../../lib/config/schema-validator');
const path = require('path');
const fs = require('fs-extra');

describe('SchemaValidator', () => {
  let validator;

  beforeEach(() => {
    validator = new SchemaValidator();
  });

  describe('validate()', () => {
    test('should validate a valid rule definition', () => {
      const validRule = {
        version: '1.0',
        id: 'test-rule',
        type: 'rule',
        platforms: ['git'],
        metadata: {
          name: 'Test Rule',
          description: 'A test rule',
          category: 'security'
        },
        implementation: {
          git: {
            hooks: ['pre-commit'],
            command: 'echo test'
          }
        }
      };

      const result = validator.validate(validRule, 'rule');
      expect(result.valid).toBe(true);
      expect(result.value).toBeDefined();
    });

    test('should reject invalid rule definition', () => {
      const invalidRule = {
        version: '2.0', // Invalid version
        id: 'Test Rule', // Invalid format (uppercase)
        type: 'invalid', // Invalid type
        // Missing required fields
      };

      const result = validator.validate(invalidRule, 'rule');
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });

    test('should validate a valid ruleset definition', () => {
      const validRuleset = {
        version: '1.0',
        id: 'test-ruleset',
        name: 'Test Ruleset',
        rules: ['rule1', 'rule2']
      };

      const result = validator.validate(validRuleset, 'ruleset');
      expect(result.valid).toBe(true);
    });

    test('should apply default values', () => {
      const rule = {
        version: '1.0',
        id: 'test-rule',
        type: 'rule',
        metadata: {
          name: 'Test',
          description: 'Test',
          category: 'security'
          // severity should default to 'medium'
        },
        implementation: {}
      };

      const result = validator.validate(rule, 'rule');
      expect(result.valid).toBe(true);
      expect(result.value.metadata.severity).toBe('medium');
      expect(result.value.metadata.enabled_by_default).toBe(false);
    });
  });

  describe('validateFile()', () => {
    const testDir = path.join(__dirname, 'test-rules');
    const validRulePath = path.join(testDir, 'valid-rule.json');
    const invalidRulePath = path.join(testDir, 'invalid-rule.json');

    beforeAll(async () => {
      await fs.ensureDir(testDir);
      
      await fs.writeJSON(validRulePath, {
        version: '1.0',
        id: 'valid-test',
        type: 'rule',
        metadata: {
          name: 'Valid Test',
          description: 'A valid test rule',
          category: 'security'
        },
        implementation: {
          git: {
            hooks: ['pre-commit']
          }
        }
      });

      await fs.writeJSON(invalidRulePath, {
        version: '3.0', // Invalid version
        id: 'invalid test', // Invalid ID format
        // Missing required fields
      });
    });

    afterAll(async () => {
      await fs.remove(testDir);
    });

    test('should validate a valid file', async () => {
      const result = await validator.validateFile(validRulePath, 'rule');
      expect(result.valid).toBe(true);
    });

    test('should reject an invalid file', async () => {
      const result = await validator.validateFile(invalidRulePath, 'rule');
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.file).toBe(invalidRulePath);
    });

    test('should handle non-existent file', async () => {
      const result = await validator.validateFile('/non/existent/file.json', 'rule');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Failed to read file');
    });
  });

  describe('validateDirectory()', () => {
    const testDir = path.join(__dirname, 'test-rules-dir');

    beforeAll(async () => {
      await fs.ensureDir(testDir);
      
      // Create some test files
      await fs.writeJSON(path.join(testDir, 'rule1.json'), {
        version: '1.0',
        id: 'rule1',
        type: 'rule',
        metadata: {
          name: 'Rule 1',
          description: 'First rule',
          category: 'security'
        },
        implementation: {}
      });

      await fs.writeJSON(path.join(testDir, 'rule2.json'), {
        version: '1.0',
        id: 'rule2',
        type: 'rule',
        metadata: {
          name: 'Rule 2',
          description: 'Second rule',
          category: 'quality'
        },
        implementation: {}
      });

      await fs.writeJSON(path.join(testDir, 'invalid.json'), {
        id: 'invalid'
        // Missing required fields
      });

      // Non-JSON file should be ignored
      await fs.writeFile(path.join(testDir, 'readme.txt'), 'This is not JSON');
    });

    afterAll(async () => {
      await fs.remove(testDir);
    });

    test('should validate all JSON files in directory', async () => {
      const results = await validator.validateDirectory(testDir, 'rule');
      
      expect(results.total).toBe(3); // 3 JSON files
      expect(results.valid).toHaveLength(2);
      expect(results.invalid).toHaveLength(1);
      expect(results.valid).toContain('rule1.json');
      expect(results.valid).toContain('rule2.json');
      expect(results.invalid[0].file).toBe('invalid.json');
    });
  });
});