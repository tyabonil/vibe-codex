/**
 * File scanner for validation rules
 * Actually scans file contents for patterns and violations
 */

const fs = require('fs-extra');
const path = require('path');
const glob = require('fast-glob');

class FileScanner {
  constructor() {
    this.violations = [];
    this.scannedFiles = 0;
  }

  /**
   * Scan files for security violations
   * @param {Array} patterns - Patterns to search for
   * @param {Array} filePatterns - File glob patterns to check
   * @param {Array} excludePatterns - Patterns to exclude
   * @returns {Promise<Array>} Array of violations
   */
  async scanForSecrets(patterns, filePatterns, excludePatterns = []) {
    const defaultExcludes = [
      '**/node_modules/**',
      '**/.git/**',
      '**/dist/**',
      '**/build/**',
      '**/coverage/**',
      '**/.next/**',
      '**/.nuxt/**',
      '**/vendor/**',
      '**/*.min.js',
      '**/*.map',
      ...excludePatterns
    ];

    try {
      // Find all files matching patterns
      const files = await glob(filePatterns, {
        ignore: defaultExcludes,
        dot: true,
        absolute: true
      });

      const violations = [];

      // Scan each file
      for (const filePath of files) {
        const content = await fs.readFile(filePath, 'utf-8');
        const relativePath = path.relative(process.cwd(), filePath);
        
        // Check each pattern
        for (const { pattern, name } of patterns) {
          const matches = content.matchAll(pattern);
          
          for (const match of matches) {
            // Get line number
            const lines = content.substring(0, match.index).split('\n');
            const lineNumber = lines.length;
            
            violations.push({
              file: relativePath,
              line: lineNumber,
              type: name,
              match: match[0].substring(0, 100), // Truncate for safety
              rule: 'SEC-001'
            });
          }
        }
        
        this.scannedFiles++;
      }

      return violations;
    } catch (error) {
      throw new Error(`File scanning error: ${error.message}`);
    }
  }

  /**
   * Scan for code quality issues
   * @param {Array} filePatterns - File patterns to check
   * @returns {Promise<Array>} Array of violations
   */
  async scanForQualityIssues(filePatterns) {
    const patterns = [
      { 
        pattern: /console\.(log|debug|info|warn|error)\s*\(/g, 
        name: 'Console statement',
        rule: 'QA-001'
      },
      { 
        pattern: /debugger;/g, 
        name: 'Debugger statement',
        rule: 'QA-002'
      },
      { 
        pattern: /TODO:|FIXME:|HACK:|XXX:/gi, 
        name: 'TODO comment',
        rule: 'QA-003',
        severity: 'warning'
      },
      {
        pattern: /\.(only|skip)\s*\(/g,
        name: 'Test focus/skip',
        rule: 'QA-004'
      }
    ];

    const defaultExcludes = [
      '**/node_modules/**',
      '**/.git/**',
      '**/dist/**',
      '**/build/**',
      '**/coverage/**',
      '**/*.test.js',
      '**/*.spec.js',
      '**/*.test.ts',
      '**/*.spec.ts'
    ];

    try {
      const files = await glob(filePatterns, {
        ignore: defaultExcludes,
        dot: true,
        absolute: true
      });

      const violations = [];

      for (const filePath of files) {
        const content = await fs.readFile(filePath, 'utf-8');
        const relativePath = path.relative(process.cwd(), filePath);
        
        for (const { pattern, name, rule, severity = 'error' } of patterns) {
          const matches = content.matchAll(pattern);
          
          for (const match of matches) {
            const lines = content.substring(0, match.index).split('\n');
            const lineNumber = lines.length;
            
            violations.push({
              file: relativePath,
              line: lineNumber,
              type: name,
              match: match[0],
              rule,
              severity
            });
          }
        }
        
        this.scannedFiles++;
      }

      return violations;
    } catch (error) {
      throw new Error(`Quality scan error: ${error.message}`);
    }
  }

  /**
   * Check for missing required files
   * @param {Array} requiredFiles - Files that must exist
   * @returns {Promise<Array>} Array of missing files
   */
  async checkRequiredFiles(requiredFiles) {
    const missing = [];
    
    for (const { file, rule, description } of requiredFiles) {
      const exists = await fs.pathExists(file);
      if (!exists) {
        missing.push({
          file,
          rule,
          description,
          type: 'Missing required file'
        });
      }
    }
    
    return missing;
  }

  /**
   * Scan for test coverage
   * @param {Array} sourcePatterns - Source file patterns
   * @param {Array} testPatterns - Test file patterns
   * @returns {Promise<Object>} Coverage summary
   */
  async checkTestCoverage(sourcePatterns, testPatterns) {
    const defaultExcludes = [
      '**/node_modules/**',
      '**/.git/**',
      '**/dist/**',
      '**/build/**',
      '**/coverage/**'
    ];

    try {
      const sourceFiles = await glob(sourcePatterns, {
        ignore: defaultExcludes,
        absolute: true
      });

      const testFiles = await glob(testPatterns, {
        ignore: defaultExcludes,
        absolute: true
      });

      const missingTests = [];
      
      // Check each source file for corresponding test
      for (const sourceFile of sourceFiles) {
        const baseName = path.basename(sourceFile, path.extname(sourceFile));
        const hasTest = testFiles.some(testFile => {
          const testBaseName = path.basename(testFile);
          return testBaseName.includes(baseName) && 
                 (testBaseName.includes('.test.') || testBaseName.includes('.spec.'));
        });
        
        if (!hasTest) {
          missingTests.push({
            file: path.relative(process.cwd(), sourceFile),
            rule: 'TEST-001',
            type: 'Missing test file'
          });
        }
      }

      return {
        sourceFiles: sourceFiles.length,
        testFiles: testFiles.length,
        coverage: sourceFiles.length > 0 
          ? Math.round((testFiles.length / sourceFiles.length) * 100) 
          : 0,
        missingTests
      };
    } catch (error) {
      throw new Error(`Test coverage scan error: ${error.message}`);
    }
  }

  /**
   * Get scan statistics
   * @returns {Object} Scan statistics
   */
  getStats() {
    return {
      filesScanned: this.scannedFiles,
      violations: this.violations.length
    };
  }
}

module.exports = FileScanner;