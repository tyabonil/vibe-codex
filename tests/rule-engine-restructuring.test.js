/**
 * Tests for repository restructuring detection in rule-engine.js
 * Ensures major restructuring is blocked when open PRs exist
 */

const RuleEngine = require('../scripts/rule-engine');

describe('Rule Engine - Repository Restructuring Detection', () => {
  let ruleEngine;
  let mockGithubClient;

  beforeEach(() => {
    ruleEngine = new RuleEngine();
    mockGithubClient = {
      context: {
        repo: {
          owner: 'testowner',
          repo: 'testrepo'
        },
        issue: {
          number: 100
        }
      },
      github: {
        rest: {
          pulls: {
            list: jest.fn()
          }
        }
      }
    };
  });

  describe('checkRepositoryRestructuring', () => {
    it('should not flag small changes', async () => {
      const files = [
        { filename: 'src/utils.js', status: 'modified' },
        { filename: 'src/helper.js', status: 'added' },
        { filename: 'tests/utils.test.js', status: 'modified' }
      ];

      const violations = await ruleEngine.checkRepositoryRestructuring(files, mockGithubClient);
      
      expect(violations).toHaveLength(0);
      expect(mockGithubClient.github.rest.pulls.list).not.toHaveBeenCalled();
    });

    it('should detect mass file movements (>20 files)', async () => {
      const files = Array(25).fill(null).map((_, i) => ({
        filename: `new-src/file${i}.js`,
        previous_filename: `src/file${i}.js`,
        status: 'renamed'
      }));

      mockGithubClient.github.rest.pulls.list.mockResolvedValue({
        data: []
      });

      const violations = await ruleEngine.checkRepositoryRestructuring(files, mockGithubClient);
      
      expect(mockGithubClient.github.rest.pulls.list).toHaveBeenCalled();
      expect(violations).toHaveLength(1); // Only documentation warning
      expect(violations[0].rule).toBe('DOCUMENT RESTRUCTURING MAPPINGS');
    });

    it('should detect directory-level movements', async () => {
      const files = [
        {
          filename: 'lib/index.js',
          previous_filename: 'src/index.js',
          status: 'renamed'
        },
        {
          filename: 'lib/utils.js',
          previous_filename: 'src/utils.js',
          status: 'renamed'
        }
      ];

      mockGithubClient.github.rest.pulls.list.mockResolvedValue({
        data: []
      });

      const violations = await ruleEngine.checkRepositoryRestructuring(files, mockGithubClient);
      
      expect(mockGithubClient.github.rest.pulls.list).toHaveBeenCalled();
      expect(violations).toHaveLength(0); // No violations if no open PRs
    });

    it('should block restructuring when other PRs are open', async () => {
      const files = Array(25).fill(null).map((_, i) => ({
        filename: `new-src/file${i}.js`,
        previous_filename: `src/file${i}.js`,
        status: 'renamed'
      }));

      mockGithubClient.github.rest.pulls.list.mockResolvedValue({
        data: [
          { number: 100, title: 'Current PR' }, // This PR
          { number: 101, title: 'Another open PR' },
          { number: 102, title: 'Yet another PR' }
        ]
      });

      const violations = await ruleEngine.checkRepositoryRestructuring(files, mockGithubClient);
      
      expect(violations.length).toBeGreaterThanOrEqual(2);
      
      const blockingViolation = violations.find(v => v.rule === 'REPOSITORY RESTRUCTURING WITH OPEN PRS');
      expect(blockingViolation).toBeDefined();
      expect(blockingViolation.severity).toBe('BLOCKER');
      expect(blockingViolation.message).toContain('2 open PR(s)');
      expect(blockingViolation.evidence).toContain('• PR #101: Another open PR');
      expect(blockingViolation.evidence).toContain('• PR #102: Yet another PR');
    });

    it('should not require documentation for small restructuring', async () => {
      const files = [
        {
          filename: 'lib/utils.js',
          previous_filename: 'src/utils.js',
          status: 'renamed'
        },
        {
          filename: 'lib/helper.js',
          previous_filename: 'src/helper.js',
          status: 'renamed'
        }
      ];

      mockGithubClient.github.rest.pulls.list.mockResolvedValue({
        data: [{ number: 100, title: 'Current PR' }]
      });

      const violations = await ruleEngine.checkRepositoryRestructuring(files, mockGithubClient);
      
      expect(violations).toHaveLength(0);
    });

    it('should require documentation for large restructuring', async () => {
      const files = Array(10).fill(null).map((_, i) => ({
        filename: `lib/file${i}.js`,
        previous_filename: `src/file${i}.js`,
        status: 'renamed'
      }));

      mockGithubClient.github.rest.pulls.list.mockResolvedValue({
        data: [{ number: 100, title: 'Current PR' }]
      });

      const violations = await ruleEngine.checkRepositoryRestructuring(files, mockGithubClient);
      
      const docViolation = violations.find(v => v.rule === 'DOCUMENT RESTRUCTURING MAPPINGS');
      expect(docViolation).toBeDefined();
      expect(docViolation.severity).toBe('MANDATORY');
      expect(docViolation.message).toContain('Missing file mapping documentation');
    });

    it('should not require documentation if mapping file exists', async () => {
      const files = [
        ...Array(10).fill(null).map((_, i) => ({
          filename: `lib/file${i}.js`,
          previous_filename: `src/file${i}.js`,
          status: 'renamed'
        })),
        {
          filename: 'RESTRUCTURING.md',
          status: 'added'
        }
      ];

      mockGithubClient.github.rest.pulls.list.mockResolvedValue({
        data: [{ number: 100, title: 'Current PR' }]
      });

      const violations = await ruleEngine.checkRepositoryRestructuring(files, mockGithubClient);
      
      const docViolation = violations.find(v => v.rule === 'DOCUMENT RESTRUCTURING MAPPINGS');
      expect(docViolation).toBeUndefined();
    });

    it('should handle API errors gracefully', async () => {
      const files = Array(25).fill(null).map((_, i) => ({
        filename: `new-src/file${i}.js`,
        previous_filename: `src/file${i}.js`,
        status: 'renamed'
      }));

      mockGithubClient.github.rest.pulls.list.mockRejectedValue(new Error('API Error'));

      const violations = await ruleEngine.checkRepositoryRestructuring(files, mockGithubClient);
      
      // Should still detect need for documentation
      expect(violations).toHaveLength(1);
      expect(violations[0].rule).toBe('DOCUMENT RESTRUCTURING MAPPINGS');
    });

    it('should consider deleted files in restructuring detection', async () => {
      const files = [
        ...Array(10).fill(null).map((_, i) => ({
          filename: `src/file${i}.js`,
          status: 'removed'
        })),
        ...Array(15).fill(null).map((_, i) => ({
          filename: `lib/file${i}.js`,
          status: 'added'
        }))
      ];

      mockGithubClient.github.rest.pulls.list.mockResolvedValue({
        data: []
      });

      const violations = await ruleEngine.checkRepositoryRestructuring(files, mockGithubClient);
      
      // Deleted files alone don't trigger restructuring detection, only moved files
      expect(mockGithubClient.github.rest.pulls.list).not.toHaveBeenCalled();
      expect(violations).toHaveLength(0);
    });
  });
});