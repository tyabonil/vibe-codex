/**
 * Tests for github-workflow module
 */

const fs = require('fs-extra');
const path = require('path');
const logger = require('../../../../lib/utils/logger');

// Mock dependencies
jest.mock('fs-extra');
jest.mock('path');
jest.mock('../../../../lib/utils/logger', () => ({
  log: jest.fn(),
  debug: jest.fn(),
  error: jest.fn()
}));

// Mock base module
jest.mock('../../../../lib/modules/base', () => {
  return class BaseModule {
    constructor(name) {
      this.name = name;
      this.rules = [];
      this.hooks = {};
      this.validators = {};
    }
    initialize = jest.fn();
    loadRules = jest.fn();
    loadHooks = jest.fn();
    loadValidators = jest.fn();
    validateRule = jest.fn().mockResolvedValue({ valid: true });
    runHook = jest.fn().mockResolvedValue(true);
  };
});

const GitHubWorkflowModule = require('../../../../lib/modules/github-workflow');

describe('GitHub Workflow Module', () => {
  let module;

  beforeEach(() => {
    jest.clearAllMocks();
    module = new GitHubWorkflowModule();
  });

  test('should extend BaseModule', () => {
    expect(module.name).toBe('github-workflow');
    expect(module.initialize).toBeDefined();
  });

  test('should check GitHub Actions status', async () => {
    const context = {
      github: {
        checks: [
          { name: 'test', status: 'completed', conclusion: 'success' }
        ]
      }
    };

    const result = await module.checkGitHubActionsStatus(context);
    expect(result.valid).toBe(true);
  });

  test('should fail when Actions checks fail', async () => {
    const context = {
      github: {
        checks: [
          { name: 'test', status: 'completed', conclusion: 'failure' }
        ]
      }
    };

    const result = await module.checkGitHubActionsStatus(context);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('GitHub Actions check failed: test');
  });

  test('should validate workflow files', async () => {
    const files = [
      { path: '.github/workflows/ci.yml', content: 'name: CI\n' }
    ];

    const result = await module.validateWorkflows(files);
    expect(result.valid).toBe(true);
  });

  test('should detect invalid workflow syntax', async () => {
    const files = [
      { path: '.github/workflows/bad.yml', content: 'invalid: [yaml' }
    ];

    const result = await module.validateWorkflows(files);
    expect(result.valid).toBe(false);
  });

  test('should check branch protection', async () => {
    const context = {
      github: {
        repository: {
          defaultBranch: 'main',
          branchProtection: {
            requirePullRequestReviews: true,
            requiredStatusChecks: ['test']
          }
        }
      }
    };

    const result = await module.checkBranchProtection(context);
    expect(result.valid).toBe(true);
  });

  test('should warn about missing branch protection', async () => {
    const context = {
      github: {
        repository: {
          defaultBranch: 'main',
          branchProtection: null
        }
      }
    };

    const result = await module.checkBranchProtection(context);
    expect(result.valid).toBe(false);
    expect(result.warnings).toContain('No branch protection rules configured');
  });

  test('should validate PR template exists', async () => {
    fs.pathExists.mockResolvedValue(true);

    const result = await module.checkPRTemplate();
    expect(result.valid).toBe(true);
    expect(fs.pathExists).toHaveBeenCalledWith('.github/pull_request_template.md');
  });

  test('should suggest PR template creation', async () => {
    fs.pathExists.mockResolvedValue(false);

    const result = await module.checkPRTemplate();
    expect(result.valid).toBe(false);
    expect(result.suggestions).toContain('Create a PR template at .github/pull_request_template.md');
  });

  test('should handle errors gracefully', async () => {
    const context = {
      github: {
        checks: null
      }
    };

    const result = await module.checkGitHubActionsStatus(context);
    expect(result.valid).toBe(true);
    expect(result.warnings).toContain('No GitHub Actions checks found');
  });
});