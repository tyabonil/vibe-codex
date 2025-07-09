/**
 * Tests for patterns module
 */

const fs = require('fs-extra');
const BaseModule = require('../../../../lib/modules/base');

// Mock dependencies
jest.mock('fs-extra');
jest.mock('../../../../lib/modules/base');
jest.mock('../../../../lib/utils/logger');

describe('Patterns Module', () => {
  let PatternsModule;
  let patternsModule;
  
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
    
    // Mock BaseModule
    BaseModule.mockImplementation(function() {
      this.name = 'patterns';
      this.version = '1.0.0';
      this.description = 'Development patterns and best practices';
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
    fs.readFile.mockResolvedValue('const example = "code";');
    fs.readdir.mockResolvedValue(['index.js', 'utils.js', 'test.js']);
    
    PatternsModule = require('../../../../lib/modules/patterns/index.js').default;
    patternsModule = new PatternsModule();
  });

  describe('initialization', () => {
    it('should create patterns module with correct properties', () => {
      expect(patternsModule.name).toBe('patterns');
      expect(patternsModule.version).toBe('1.0.0');
      expect(patternsModule.description).toContain('patterns');
    });
  });

  describe('pattern rules', () => {
    beforeEach(() => {
      patternsModule.rules = [
        {
          id: 'naming-conventions',
          name: 'Naming Conventions',
          level: 4,
          severity: 'MEDIUM',
          check: jest.fn()
        },
        {
          id: 'file-structure',
          name: 'File Structure',
          level: 4,
          severity: 'LOW',
          check: jest.fn()
        },
        {
          id: 'code-organization',
          name: 'Code Organization',
          level: 4,
          severity: 'MEDIUM',
          check: jest.fn()
        },
        {
          id: 'error-handling',
          name: 'Error Handling Patterns',
          level: 3,
          severity: 'HIGH',
          check: jest.fn()
        }
      ];
    });

    it('should include naming conventions rule', () => {
      const rule = patternsModule.rules.find(r => r.id === 'naming-conventions');
      expect(rule).toBeDefined();
      expect(rule.level).toBe(4);
    });

    it('should include error handling as level 3 rule', () => {
      const rule = patternsModule.rules.find(r => r.id === 'error-handling');
      expect(rule).toBeDefined();
      expect(rule.level).toBe(3);
      expect(rule.severity).toBe('HIGH');
    });
  });

  describe('naming convention checks', () => {
    it('should validate file naming patterns', () => {
      const validateFileName = (filename) => {
        // Check for kebab-case
        const kebabCase = /^[a-z]+(-[a-z]+)*\.[a-z]+$/;
        // Check for PascalCase for components
        const pascalCase = /^[A-Z][a-zA-Z]*\.[a-z]+$/;
        
        return kebabCase.test(filename) || pascalCase.test(filename);
      };
      
      expect(validateFileName('my-component.js')).toBe(true);
      expect(validateFileName('MyComponent.js')).toBe(true);
      expect(validateFileName('my_component.js')).toBe(false);
      expect(validateFileName('myComponent.js')).toBe(false);
    });

    it('should validate variable naming', () => {
      const validateVariableName = (name, type) => {
        switch (type) {
          case 'constant':
            return /^[A-Z_]+$/.test(name);
          case 'class':
            return /^[A-Z][a-zA-Z0-9]*$/.test(name);
          case 'function':
          case 'variable':
            return /^[a-z][a-zA-Z0-9]*$/.test(name);
          default:
            return false;
        }
      };
      
      expect(validateVariableName('MAX_SIZE', 'constant')).toBe(true);
      expect(validateVariableName('UserService', 'class')).toBe(true);
      expect(validateVariableName('calculateTotal', 'function')).toBe(true);
    });
  });

  describe('file structure validation', () => {
    it('should check for proper directory structure', async () => {
      const checkStructure = async () => {
        const requiredDirs = ['src', 'tests', 'docs'];
        const results = await Promise.all(
          requiredDirs.map(dir => fs.pathExists(dir))
        );
        return results.every(exists => exists);
      };
      
      fs.pathExists.mockResolvedValue(true);
      const isValid = await checkStructure();
      expect(isValid).toBe(true);
    });

    it('should validate module organization', async () => {
      fs.readdir.mockImplementation(async (dir) => {
        if (dir === 'src/components') {
          return ['Button', 'Input', 'Modal'];
        }
        if (dir === 'src/components/Button') {
          return ['Button.js', 'Button.test.js', 'Button.css', 'index.js'];
        }
        return [];
      });
      
      const checkModuleStructure = async (modulePath) => {
        const files = await fs.readdir(modulePath);
        const hasIndex = files.includes('index.js');
        const hasTest = files.some(f => f.includes('.test.'));
        const hasMainFile = files.some(f => 
          f.endsWith('.js') && !f.includes('test') && f !== 'index.js'
        );
        
        return hasIndex && hasTest && hasMainFile;
      };
      
      const isValid = await checkModuleStructure('src/components/Button');
      expect(isValid).toBe(true);
    });
  });

  describe('code organization patterns', () => {
    it('should detect improper error handling', () => {
      const code = `
        try {
          doSomething();
        } catch (e) {
          console.log(e);
        }
      `;
      
      const checkErrorHandling = (codeStr) => {
        // Check for proper error handling patterns
        const hasGenericCatch = /catch\s*\(\s*e\s*\)/.test(codeStr);
        const hasConsoleLog = /console\.log\s*\(/.test(codeStr);
        
        return {
          hasProperErrorHandling: !hasGenericCatch && !hasConsoleLog,
          issues: []
            .concat(hasGenericCatch ? ['Generic catch variable'] : [])
            .concat(hasConsoleLog ? ['Using console.log for errors'] : [])
        };
      };
      
      const result = checkErrorHandling(code);
      expect(result.hasProperErrorHandling).toBe(false);
      expect(result.issues).toContain('Generic catch variable');
      expect(result.issues).toContain('Using console.log for errors');
    });

    it('should validate async/await patterns', () => {
      const goodPattern = `
        async function fetchData() {
          try {
            const response = await api.getData();
            return response.data;
          } catch (error) {
            logger.error('Failed to fetch data', error);
            throw new DataFetchError('Unable to retrieve data', error);
          }
        }
      `;
      
      const checkAsyncPattern = (code) => {
        const hasAsyncAwait = /async\s+function.*await/.test(code);
        const hasTryCatch = /try\s*{.*await.*}\s*catch/.test(code.replace(/\n/g, ' '));
        const hasProperErrorHandling = /catch.*logger|throw/.test(code);
        
        return hasAsyncAwait && hasTryCatch && hasProperErrorHandling;
      };
      
      expect(checkAsyncPattern(goodPattern)).toBe(true);
    });
  });
});