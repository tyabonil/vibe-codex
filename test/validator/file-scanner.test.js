/**
 * Tests for file scanner
 */

const fs = require('fs-extra');
const path = require('path');
const FileScanner = require('../../lib/validator/file-scanner');

// Mock dependencies
jest.mock('fs-extra');
jest.mock('fast-glob');

const glob = require('fast-glob');

describe('FileScanner', () => {
  let scanner;
  
  beforeEach(() => {
    jest.clearAllMocks();
    scanner = new FileScanner();
  });
  
  describe('scanForSecrets', () => {
    it('should find API keys in files', async () => {
      const testFile = '/project/src/config.js';
      glob.mockResolvedValue([testFile]);
      fs.readFile.mockResolvedValue(`
        const config = {
          api_key = "sk-1234567890abcdef",
          endpoint: "https://api.example.com"
        };
      `);
      
      const patterns = [
        { pattern: /api[_-]?key\s*=\s*['"][^'"]+['"]/gi, name: "API key" }
      ];
      
      const violations = await scanner.scanForSecrets(patterns, ['**/*.js']);
      
      expect(violations).toHaveLength(1);
      expect(violations[0]).toMatchObject({
        file: expect.stringContaining('config.js'),
        line: 3,
        type: 'API key',
        rule: 'SEC-001'
      });
    });
    
    it('should find multiple secrets in the same file', async () => {
      const testFile = '/project/src/config.js';
      glob.mockResolvedValue([testFile]);
      fs.readFile.mockResolvedValue(`
        const config = {
          api_key = "sk-1234567890abcdef",
          password = "super_secret_123",
          token = "bearer_token_xyz"
        };
      `);
      
      const patterns = [
        { pattern: /api[_-]?key\s*=\s*['"][^'"]+['"]/gi, name: "API key" },
        { pattern: /password\s*=\s*['"][^'"]+['"]/gi, name: "Password" },
        { pattern: /token\s*=\s*['"][^'"]+['"]/gi, name: "Token" }
      ];
      
      const violations = await scanner.scanForSecrets(patterns, ['**/*.js']);
      
      expect(violations).toHaveLength(3);
      expect(violations.map(v => v.type)).toEqual(['API key', 'Password', 'Token']);
    });
    
    it('should exclude specified patterns', async () => {
      glob.mockResolvedValue([]);
      
      await scanner.scanForSecrets([], ['**/*.js'], ['**/test/**']);
      
      expect(glob).toHaveBeenCalledWith(['**/*.js'], expect.objectContaining({
        ignore: expect.arrayContaining(['**/test/**'])
      }));
    });
    
    it('should handle file read errors gracefully', async () => {
      const testFile = '/project/src/config.js';
      glob.mockResolvedValue([testFile]);
      fs.readFile.mockRejectedValue(new Error('File read error'));
      
      await expect(scanner.scanForSecrets([], ['**/*.js'])).rejects.toThrow('File scanning error');
    });
  });
  
  describe('scanForQualityIssues', () => {
    it('should find console statements', async () => {
      const testFile = '/project/src/utils.js';
      glob.mockResolvedValue([testFile]);
      fs.readFile.mockResolvedValue(`
        function debug() {
          console.log("Debug message");
          console.error("Error message");
        }
      `);
      
      const violations = await scanner.scanForQualityIssues(['**/*.js']);
      
      expect(violations).toHaveLength(2);
      expect(violations[0]).toMatchObject({
        file: expect.stringContaining('utils.js'),
        line: 3,
        type: 'Console statement',
        rule: 'QA-001'
      });
    });
    
    it('should find debugger statements', async () => {
      const testFile = '/project/src/debug.js';
      glob.mockResolvedValue([testFile]);
      fs.readFile.mockResolvedValue(`
        function troubleshoot() {
          debugger;
          return true;
        }
      `);
      
      const violations = await scanner.scanForQualityIssues(['**/*.js']);
      
      expect(violations).toHaveLength(1);
      expect(violations[0]).toMatchObject({
        type: 'Debugger statement',
        rule: 'QA-002',
        line: 3
      });
    });
    
    it('should find TODO comments as warnings', async () => {
      const testFile = '/project/src/app.js';
      glob.mockResolvedValue([testFile]);
      fs.readFile.mockResolvedValue(`
        // TODO: Implement this feature
        function feature() {
          // FIXME: This is broken
        }
      `);
      
      const violations = await scanner.scanForQualityIssues(['**/*.js']);
      
      expect(violations).toHaveLength(2);
      expect(violations[0]).toMatchObject({
        type: 'TODO comment',
        rule: 'QA-003',
        severity: 'warning'
      });
    });
    
    it('should exclude test files by default', async () => {
      glob.mockResolvedValue([]);
      
      await scanner.scanForQualityIssues(['**/*.js']);
      
      expect(glob).toHaveBeenCalledWith(['**/*.js'], expect.objectContaining({
        ignore: expect.arrayContaining(['**/*.test.js', '**/*.spec.js'])
      }));
    });
  });
  
  describe('checkRequiredFiles', () => {
    it('should identify missing required files', async () => {
      fs.pathExists.mockResolvedValueOnce(true)   // First file exists
        .mockResolvedValueOnce(false)  // Second file missing
        .mockResolvedValueOnce(false); // Third file missing
      
      const requiredFiles = [
        { file: 'README.md', rule: 'DOC-001', description: 'Project documentation' },
        { file: 'LICENSE', rule: 'LEGAL-001', description: 'License file' },
        { file: '.gitignore', rule: 'GIT-001', description: 'Git ignore file' }
      ];
      
      const missing = await scanner.checkRequiredFiles(requiredFiles);
      
      expect(missing).toHaveLength(2);
      expect(missing[0]).toMatchObject({
        file: 'LICENSE',
        rule: 'LEGAL-001',
        type: 'Missing required file'
      });
    });
    
    it('should return empty array when all files exist', async () => {
      fs.pathExists.mockResolvedValue(true);
      
      const requiredFiles = [
        { file: 'README.md', rule: 'DOC-001', description: 'Project documentation' }
      ];
      
      const missing = await scanner.checkRequiredFiles(requiredFiles);
      
      expect(missing).toHaveLength(0);
    });
  });
  
  describe('checkTestCoverage', () => {
    it('should calculate test coverage percentage', async () => {
      glob.mockResolvedValueOnce([
        '/project/lib/module1.js',
        '/project/lib/module2.js',
        '/project/lib/module3.js'
      ]).mockResolvedValueOnce([
        '/project/test/module1.test.js',
        '/project/test/module2.test.js'
      ]);
      
      const coverage = await scanner.checkTestCoverage(['lib/**/*.js'], ['**/*.test.js']);
      
      expect(coverage).toMatchObject({
        sourceFiles: 3,
        testFiles: 2,
        coverage: 67
      });
    });
    
    it('should identify files missing tests', async () => {
      glob.mockResolvedValueOnce([
        '/project/lib/utils.js',
        '/project/lib/helpers.js'
      ]).mockResolvedValueOnce([
        '/project/test/utils.test.js'
      ]);
      
      const coverage = await scanner.checkTestCoverage(['lib/**/*.js'], ['**/*.test.js']);
      
      expect(coverage.missingTests).toHaveLength(1);
      expect(coverage.missingTests[0]).toMatchObject({
        file: expect.stringContaining('helpers.js'),
        rule: 'TEST-001',
        type: 'Missing test file'
      });
    });
    
    it('should handle no source files', async () => {
      glob.mockResolvedValueOnce([]).mockResolvedValueOnce([]);
      
      const coverage = await scanner.checkTestCoverage(['lib/**/*.js'], ['**/*.test.js']);
      
      expect(coverage).toMatchObject({
        sourceFiles: 0,
        testFiles: 0,
        coverage: 0
      });
    });
  });
  
  describe('getStats', () => {
    it('should return scan statistics', async () => {
      const testFile = '/project/src/config.js';
      glob.mockResolvedValue([testFile]);
      fs.readFile.mockResolvedValue('const x = 1;');
      
      await scanner.scanForSecrets([], ['**/*.js']);
      
      const stats = scanner.getStats();
      expect(stats).toMatchObject({
        filesScanned: 1,
        violations: 0
      });
    });
  });
});