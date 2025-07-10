/**
 * Tests for PR file validation logic in rule-engine.js
 * Ensures only NEW files (status: 'added') are checked for test coverage
 */

const RuleEngine = require('../scripts/rule-engine');

describe('Rule Engine - PR File Validation', () => {
  let ruleEngine;
  let mockPrData;
  let mockGithubClient;

  beforeEach(() => {
    ruleEngine = new RuleEngine();
    mockPrData = {
      user: { login: 'testuser' },
      comments: 0
    };
    mockGithubClient = {};
  });

  describe('checkLevel3Quality - Test Coverage for NEW Files Only', () => {
    it('should NOT flag modified files without tests', async () => {
      const files = [
        {
          filename: 'src/existing-feature.js',
          status: 'modified',
          additions: 50,
          deletions: 10
        }
      ];

      const violations = await ruleEngine.checkLevel3Quality(mockPrData, files, mockGithubClient);
      const testViolations = violations.filter(v => v.rule === '100% TEST COVERAGE FOR NEW CODE');
      
      expect(testViolations).toHaveLength(0);
    });

    it('should flag NEW code files without tests', async () => {
      const files = [
        {
          filename: 'src/new-feature.js',
          status: 'added',
          additions: 100
        }
      ];

      const violations = await ruleEngine.checkLevel3Quality(mockPrData, files, mockGithubClient);
      const testViolations = violations.filter(v => v.rule === '100% TEST COVERAGE FOR NEW CODE');
      
      expect(testViolations).toHaveLength(1);
      expect(testViolations[0].message).toContain('Missing tests for 1 new code file');
      expect(testViolations[0].evidence).toContain('src/new-feature.js (new file)');
    });

    it('should NOT flag NEW code files when tests are included', async () => {
      const files = [
        {
          filename: 'src/new-feature.js',
          status: 'added',
          additions: 100
        },
        {
          filename: 'tests/new-feature.test.js',
          status: 'added',
          additions: 50
        }
      ];

      const violations = await ruleEngine.checkLevel3Quality(mockPrData, files, mockGithubClient);
      const testViolations = violations.filter(v => v.rule === '100% TEST COVERAGE FOR NEW CODE');
      
      expect(testViolations).toHaveLength(0);
    });

    it('should ignore non-code files', async () => {
      const files = [
        {
          filename: 'README.md',
          status: 'added',
          additions: 50
        },
        {
          filename: 'config.json',
          status: 'added',
          additions: 20
        },
        {
          filename: '.github/workflows/test.yml',
          status: 'added',
          additions: 30
        }
      ];

      const violations = await ruleEngine.checkLevel3Quality(mockPrData, files, mockGithubClient);
      const testViolations = violations.filter(v => v.rule === '100% TEST COVERAGE FOR NEW CODE');
      
      expect(testViolations).toHaveLength(0);
    });

    it('should not flag test files themselves', async () => {
      const files = [
        {
          filename: 'tests/integration.test.js',
          status: 'added',
          additions: 100
        },
        {
          filename: 'src/utils.spec.ts',
          status: 'added',
          additions: 80
        }
      ];

      const violations = await ruleEngine.checkLevel3Quality(mockPrData, files, mockGithubClient);
      const testViolations = violations.filter(v => v.rule === '100% TEST COVERAGE FOR NEW CODE');
      
      expect(testViolations).toHaveLength(0);
    });

    it('should handle multiple new code files', async () => {
      const files = [
        {
          filename: 'src/feature1.js',
          status: 'added',
          additions: 100
        },
        {
          filename: 'src/feature2.ts',
          status: 'added',
          additions: 150
        },
        {
          filename: 'src/helper.py',
          status: 'added',
          additions: 50
        }
      ];

      const violations = await ruleEngine.checkLevel3Quality(mockPrData, files, mockGithubClient);
      const testViolations = violations.filter(v => v.rule === '100% TEST COVERAGE FOR NEW CODE');
      
      expect(testViolations).toHaveLength(1);
      expect(testViolations[0].message).toContain('Missing tests for 3 new code file');
      expect(testViolations[0].evidence).toHaveLength(3);
    });

    it('should recognize various code file extensions', async () => {
      const codeFiles = [
        { filename: 'app.js', status: 'added' },
        { filename: 'component.jsx', status: 'added' },
        { filename: 'service.ts', status: 'added' },
        { filename: 'view.tsx', status: 'added' },
        { filename: 'script.py', status: 'added' },
        { filename: 'Main.java', status: 'added' },
        { filename: 'handler.go', status: 'added' },
        { filename: 'model.rb', status: 'added' },
        { filename: 'program.cpp', status: 'added' },
        { filename: 'util.c', status: 'added' },
        { filename: 'Helper.cs', status: 'added' }
      ];

      for (const file of codeFiles) {
        const violations = await ruleEngine.checkLevel3Quality(mockPrData, [file], mockGithubClient);
        const testViolations = violations.filter(v => v.rule === '100% TEST COVERAGE FOR NEW CODE');
        
        expect(testViolations).toHaveLength(1);
      }
    });

    it('should exclude files in node_modules and build directories', async () => {
      const files = [
        {
          filename: 'node_modules/package/index.js',
          status: 'added',
          additions: 1000
        },
        {
          filename: 'dist/bundle.js',
          status: 'added',
          additions: 5000
        },
        {
          filename: 'build/app.js',
          status: 'added',
          additions: 3000
        }
      ];

      const violations = await ruleEngine.checkLevel3Quality(mockPrData, files, mockGithubClient);
      const testViolations = violations.filter(v => v.rule === '100% TEST COVERAGE FOR NEW CODE');
      
      expect(testViolations).toHaveLength(0);
    });
  });

  describe('checkLevel3Quality - Self Review Requirement', () => {
    it('should require self-review when PR has no comments', async () => {
      const violations = await ruleEngine.checkLevel3Quality(mockPrData, [], mockGithubClient);
      const selfReviewViolations = violations.filter(v => v.rule === 'SELF-REVIEW REQUIREMENT');
      
      expect(selfReviewViolations).toHaveLength(1);
    });

    it('should not require self-review when PR has comments', async () => {
      mockPrData.comments = 1;
      
      const violations = await ruleEngine.checkLevel3Quality(mockPrData, [], mockGithubClient);
      const selfReviewViolations = violations.filter(v => v.rule === 'SELF-REVIEW REQUIREMENT');
      
      expect(selfReviewViolations).toHaveLength(0);
    });
  });
});