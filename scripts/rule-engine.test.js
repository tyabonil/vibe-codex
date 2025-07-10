/**
 * Tests for rule engine PR file validation
 */

const RuleEngine = require('./rule-engine');

describe('RuleEngine - PR File Validation', () => {
  let ruleEngine;
  let mockGitHubClient;

  beforeEach(() => {
    // Mock the rules config
    jest.mock('../config/rules.json', () => ({
      rules: {
        level1_security: {
          checks: {
            secrets_detection: { patterns: [] },
            env_files_protection: { patterns: [] },
            private_repo_references: { enabled: false }
          }
        },
        level2_workflow: {
          checks: {
            issue_reference: { patterns: ['#\\d+'] },
            branch_naming: { required_patterns: ['feature/issue-\\d+-.*'] },
            token_efficiency: { max_files_per_pr: 20 }
          }
        }
      }
    }), { virtual: true });

    ruleEngine = new RuleEngine();
    mockGitHubClient = {
      github: {},
      context: {}
    };
  });

  describe('checkLevel3Quality - Test Coverage', () => {
    test('should not flag modified files without tests', async () => {
      const prData = {
        user: { login: 'testuser' },
        comments: 1
      };

      const files = [
        {
          filename: 'src/existing-file.js',
          status: 'modified',
          additions: 50,
          deletions: 10
        }
      ];

      const violations = await ruleEngine.checkLevel3Quality(prData, files, mockGitHubClient);
      
      // Should not have test coverage violations for modified files
      const testViolations = violations.filter(v => v.rule.includes('TEST COVERAGE'));
      expect(testViolations).toHaveLength(0);
    });

    test('should flag new code files without tests', async () => {
      const prData = {
        user: { login: 'testuser' },
        comments: 1
      };

      const files = [
        {
          filename: 'src/new-feature.js',
          status: 'added',
          additions: 100
        },
        {
          filename: 'src/another-feature.ts',
          status: 'added',
          additions: 50
        }
      ];

      const violations = await ruleEngine.checkLevel3Quality(prData, files, mockGitHubClient);
      
      const testViolations = violations.filter(v => v.rule.includes('TEST COVERAGE'));
      expect(testViolations).toHaveLength(1);
      expect(testViolations[0].message).toContain('2 new code file(s)');
      expect(testViolations[0].evidence).toContain('- src/new-feature.js');
      expect(testViolations[0].evidence).toContain('- src/another-feature.ts');
    });

    test('should not flag new code files that have tests', async () => {
      const prData = {
        user: { login: 'testuser' },
        comments: 1
      };

      const files = [
        {
          filename: 'src/new-feature.js',
          status: 'added',
          additions: 100
        },
        {
          filename: 'src/new-feature.test.js',
          status: 'added',
          additions: 50
        }
      ];

      const violations = await ruleEngine.checkLevel3Quality(prData, files, mockGitHubClient);
      
      const testViolations = violations.filter(v => v.rule.includes('TEST COVERAGE'));
      expect(testViolations).toHaveLength(0);
    });

    test('should not flag new non-code files', async () => {
      const prData = {
        user: { login: 'testuser' },
        comments: 1
      };

      const files = [
        {
          filename: 'README.md',
          status: 'added',
          additions: 50
        },
        {
          filename: 'package.json',
          status: 'added',
          additions: 20
        },
        {
          filename: '.github/workflows/test.yml',
          status: 'added',
          additions: 30
        }
      ];

      const violations = await ruleEngine.checkLevel3Quality(prData, files, mockGitHubClient);
      
      const testViolations = violations.filter(v => v.rule.includes('TEST COVERAGE'));
      expect(testViolations).toHaveLength(0);
    });

    test('should not flag test files themselves', async () => {
      const prData = {
        user: { login: 'testuser' },
        comments: 1
      };

      const files = [
        {
          filename: 'src/component.test.js',
          status: 'added',
          additions: 100
        },
        {
          filename: 'src/utils.spec.ts',
          status: 'added',
          additions: 80
        }
      ];

      const violations = await ruleEngine.checkLevel3Quality(prData, files, mockGitHubClient);
      
      const testViolations = violations.filter(v => v.rule.includes('TEST COVERAGE'));
      expect(testViolations).toHaveLength(0);
    });

    test('should handle mixed file statuses correctly', async () => {
      const prData = {
        user: { login: 'testuser' },
        comments: 1
      };

      const files = [
        {
          filename: 'src/existing.js',
          status: 'modified',
          additions: 50
        },
        {
          filename: 'src/new-feature.js',
          status: 'added',
          additions: 100
        },
        {
          filename: 'src/deleted.js',
          status: 'removed',
          deletions: 200
        },
        {
          filename: 'src/renamed.js',
          status: 'renamed',
          additions: 10,
          deletions: 5
        }
      ];

      const violations = await ruleEngine.checkLevel3Quality(prData, files, mockGitHubClient);
      
      const testViolations = violations.filter(v => v.rule.includes('TEST COVERAGE'));
      expect(testViolations).toHaveLength(1);
      expect(testViolations[0].message).toContain('1 new code file(s)');
      expect(testViolations[0].evidence).toContain('- src/new-feature.js');
    });

    test('should still check self-review requirement', async () => {
      const prData = {
        user: { login: 'testuser' },
        comments: 0 // No comments
      };

      const files = [];

      const violations = await ruleEngine.checkLevel3Quality(prData, files, mockGitHubClient);
      
      const selfReviewViolations = violations.filter(v => v.rule.includes('SELF-REVIEW'));
      expect(selfReviewViolations).toHaveLength(1);
    });
  });
});