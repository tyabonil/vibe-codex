/**
 * Tests for testing module
 */

import { TestingModule } from '../../../lib/modules/testing/index.js';
import fs from 'fs/promises';
import path from 'path';

jest.mock('fs/promises');
jest.mock('child_process', () => ({
  exec: jest.fn(),
  promisify: () => jest.fn()
}));

describe('TestingModule', () => {
  let module;
  let mockContext;

  beforeEach(() => {
    module = new TestingModule();
    mockContext = {
      projectPath: '/test/project',
      config: {
        testing: {
          coverageThreshold: 85
        }
      },
      files: [],
      stagedFiles: []
    };
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should initialize with correct defaults', () => {
      expect(module.name).toBe('testing');
      expect(module.version).toBe('1.0.0');
      expect(module.description).toBe('Test framework, coverage, and test quality rules');
      expect(module.dependencies).toEqual([]);
      expect(module.options.coverageThreshold).toBe(80);
      expect(module.options.requireTestFiles).toBe(true);
    });
  });

  describe('TEST-1: Test Coverage Threshold', () => {
    it('should pass when coverage meets threshold', async () => {
      const coverageData = {
        total: {
          lines: { pct: 90 },
          statements: { pct: 92 },
          functions: { pct: 88 },
          branches: { pct: 85 }
        }
      };
      
      fs.readFile.mockResolvedValue(JSON.stringify(coverageData));
      
      await module.loadRules();
      const rule = module.rules.find(r => r.id === 'TEST-1');
      const violations = await rule.check(mockContext);
      
      expect(violations).toEqual([]);
    });

    it('should fail when coverage is below threshold', async () => {
      const coverageData = {
        total: {
          lines: { pct: 70 },
          statements: { pct: 75 },
          functions: { pct: 60 },
          branches: { pct: 65 }
        }
      };
      
      fs.readFile.mockResolvedValue(JSON.stringify(coverageData));
      
      await module.loadRules();
      const rule = module.rules.find(r => r.id === 'TEST-1');
      const violations = await rule.check(mockContext);
      
      expect(violations).toHaveLength(4);
      expect(violations[0]).toMatchObject({
        metric: 'lines',
        coverage: '70%',
        threshold: '85%'
      });
    });

    it('should report when coverage report is not found', async () => {
      fs.readFile.mockRejectedValue(new Error('File not found'));
      
      await module.loadRules();
      const rule = module.rules.find(r => r.id === 'TEST-1');
      const violations = await rule.check(mockContext);
      
      expect(violations).toEqual([{
        message: 'Coverage report not found. Run tests with coverage first.'
      }]);
    });
  });

  describe('TEST-2: Test Files Exist', () => {
    it('should pass when test files exist for source files', async () => {
      mockContext.files = [
        { path: '/src/utils/helper.js', content: 'export function helper() {}' },
        { path: '/src/utils/helper.test.js', content: 'test()' }
      ];
      
      fs.access.mockImplementation((path) => {
        if (path.includes('.test.js')) {
          return Promise.resolve();
        }
        return Promise.reject(new Error('Not found'));
      });
      
      await module.loadRules();
      const rule = module.rules.find(r => r.id === 'TEST-2');
      const violations = await rule.check(mockContext);
      
      expect(violations).toEqual([]);
    });

    it('should fail when test files are missing', async () => {
      mockContext.files = [
        { path: '/src/utils/helper.js', content: 'export function helper() {}' },
        { path: '/src/components/Button.js', content: 'export const Button = () => {}' }
      ];
      
      fs.access.mockRejectedValue(new Error('Not found'));
      
      await module.loadRules();
      const rule = module.rules.find(r => r.id === 'TEST-2');
      const violations = await rule.check(mockContext);
      
      expect(violations).toHaveLength(2);
      expect(violations[0]).toMatchObject({
        file: '/src/utils/helper.js',
        message: 'No test file found for source file'
      });
    });
  });

  describe('TEST-3: Test Naming Convention', () => {
    it('should pass with good test descriptions', async () => {
      mockContext.files = [{
        path: '/src/utils.test.js',
        content: `
          describe('Utils module', () => {
            it('should calculate sum correctly', () => {});
            it('returns null for invalid input', () => {});
            test('handles edge cases properly', () => {});
          });
        `
      }];
      
      await module.loadRules();
      const rule = module.rules.find(r => r.id === 'TEST-3');
      const violations = await rule.check(mockContext);
      
      expect(violations).toEqual([]);
    });

    it('should fail with vague test descriptions', async () => {
      mockContext.files = [{
        path: '/src/utils.test.js',
        content: `
          describe('test', () => {
            it('works', () => {});
            it('test', () => {});
            test('ok', () => {});
          });
        `
      }];
      
      await module.loadRules();
      const rule = module.rules.find(r => r.id === 'TEST-3');
      const violations = await rule.check(mockContext);
      
      expect(violations.length).toBeGreaterThan(0);
      expect(violations[0]).toMatchObject({
        file: '/src/utils.test.js',
        message: expect.stringContaining('too vague')
      });
    });
  });

  describe('TEST-4: No Skipped Tests', () => {
    it('should pass when no tests are skipped', async () => {
      mockContext.files = [{
        path: '/src/utils.test.js',
        content: `
          describe('Utils', () => {
            it('should work', () => {});
            it('should also work', () => {});
          });
        `
      }];
      
      await module.loadRules();
      const rule = module.rules.find(r => r.id === 'TEST-4');
      const violations = await rule.check(mockContext);
      
      expect(violations).toEqual([]);
    });

    it('should fail when tests are skipped', async () => {
      mockContext.files = [{
        path: '/src/utils.test.js',
        content: `
          describe('Utils', () => {
            it.skip('should work', () => {});
            it('should also work', () => {});
            describe.skip('Skipped suite', () => {});
          });
        `
      }];
      
      await module.loadRules();
      const rule = module.rules.find(r => r.id === 'TEST-4');
      const violations = await rule.check(mockContext);
      
      expect(violations).toHaveLength(2);
      expect(violations[0]).toMatchObject({
        file: '/src/utils.test.js',
        message: 'Skipped test found without justification'
      });
    });
  });

  describe('validators', () => {
    beforeEach(async () => {
      await module.loadValidators();
    });

    describe('test-framework validator', () => {
      it('should pass when test framework is configured', async () => {
        const packageJson = {
          devDependencies: { jest: '^29.0.0' },
          scripts: { test: 'jest' }
        };
        
        fs.readFile.mockResolvedValue(JSON.stringify(packageJson));
        
        const result = await module.validators['test-framework']('/test/project');
        expect(result.valid).toBe(true);
      });

      it('should fail when no test framework is found', async () => {
        const packageJson = {
          devDependencies: {},
          scripts: {}
        };
        
        fs.readFile.mockResolvedValue(JSON.stringify(packageJson));
        
        const result = await module.validators['test-framework']('/test/project');
        expect(result.valid).toBe(false);
        expect(result.message).toBe('No test framework configured');
      });
    });

    describe('coverage-config validator', () => {
      it('should pass when coverage is configured', async () => {
        fs.access.mockImplementation((path) => {
          if (path.includes('jest.config.js')) {
            return Promise.resolve();
          }
          return Promise.reject(new Error('Not found'));
        });
        
        const result = await module.validators['coverage-config']('/test/project');
        expect(result.valid).toBe(true);
      });

      it('should check package.json for coverage config', async () => {
        fs.access.mockRejectedValue(new Error('Not found'));
        
        const packageJson = {
          jest: { collectCoverage: true }
        };
        
        fs.readFile.mockResolvedValue(JSON.stringify(packageJson));
        
        const result = await module.validators['coverage-config']('/test/project');
        expect(result.valid).toBe(true);
      });
    });
  });
});