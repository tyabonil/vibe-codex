/**
 * Tests for GitHub module
 */

import { GitHubModule } from '../../../lib/modules/github/index.js';
import fs from 'fs/promises';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

jest.mock('fs/promises');
jest.mock('child_process');

const execAsync = promisify(exec);

describe('GitHubModule', () => {
  let module;
  let mockContext;

  beforeEach(() => {
    module = new GitHubModule();
    mockContext = {
      projectPath: '/test/project',
      config: {
        github: {
          requirePRTemplate: true,
          requireIssueTemplates: true,
          requireCodeOwners: false,
          requireContributing: true
        }
      },
      files: []
    };
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should initialize with correct defaults', () => {
      expect(module.name).toBe('github');
      expect(module.version).toBe('1.0.0');
      expect(module.dependencies).toEqual(['core']);
      expect(module.options.requirePRTemplate).toBe(true);
      expect(module.options.requireIssueTemplates).toBe(true);
    });
  });

  describe('GH-1: Pull Request Template', () => {
    beforeEach(async () => {
      await module.loadRules();
    });

    it('should pass when PR template exists', async () => {
      fs.access.mockImplementation((path) => {
        if (path.includes('pull_request_template.md')) {
          return Promise.resolve();
        }
        return Promise.reject(new Error('Not found'));
      });

      const rule = module.rules.find(r => r.id === 'GH-1');
      const violations = await rule.check(mockContext);
      
      expect(violations).toEqual([]);
    });

    it('should fail when PR template is missing', async () => {
      fs.access.mockRejectedValue(new Error('Not found'));

      const rule = module.rules.find(r => r.id === 'GH-1');
      const violations = await rule.check(mockContext);
      
      expect(violations).toHaveLength(1);
      expect(violations[0].message).toContain('No pull request template found');
    });

    it('should create PR template when fix is called', async () => {
      fs.mkdir.mockResolvedValue();
      fs.writeFile.mockResolvedValue();

      const rule = module.rules.find(r => r.id === 'GH-1');
      const result = await rule.fix(mockContext);
      
      expect(result).toBe(true);
      expect(fs.mkdir).toHaveBeenCalledWith(
        path.join(mockContext.projectPath, '.github'),
        { recursive: true }
      );
      expect(fs.writeFile).toHaveBeenCalledWith(
        path.join(mockContext.projectPath, '.github', 'pull_request_template.md'),
        expect.stringContaining('## Description')
      );
    });
  });

  describe('GH-2: Issue Templates', () => {
    beforeEach(async () => {
      await module.loadRules();
    });

    it('should pass when issue templates exist', async () => {
      fs.readdir.mockResolvedValue(['bug_report.md', 'feature_request.md']);

      const rule = module.rules.find(r => r.id === 'GH-2');
      const violations = await rule.check(mockContext);
      
      expect(violations).toEqual([]);
    });

    it('should fail when templates directory is empty', async () => {
      fs.readdir.mockResolvedValue([]);

      const rule = module.rules.find(r => r.id === 'GH-2');
      const violations = await rule.check(mockContext);
      
      expect(violations).toHaveLength(1);
      expect(violations[0].message).toContain('no templates');
    });

    it('should fail when missing specific template types', async () => {
      fs.readdir.mockResolvedValue(['custom_template.md']);

      const rule = module.rules.find(r => r.id === 'GH-2');
      const violations = await rule.check(mockContext);
      
      expect(violations).toHaveLength(1);
      expect(violations[0].message).toContain('Missing issue templates for');
    });

    it('should create issue templates when fix is called', async () => {
      fs.mkdir.mockResolvedValue();
      fs.writeFile.mockResolvedValue();

      const rule = module.rules.find(r => r.id === 'GH-2');
      const result = await rule.fix(mockContext);
      
      expect(result).toBe(true);
      expect(fs.writeFile).toHaveBeenCalledTimes(2);
      expect(fs.writeFile).toHaveBeenCalledWith(
        expect.stringContaining('bug_report.md'),
        expect.stringContaining('Bug report')
      );
      expect(fs.writeFile).toHaveBeenCalledWith(
        expect.stringContaining('feature_request.md'),
        expect.stringContaining('Feature request')
      );
    });
  });

  describe('GH-3: CODEOWNERS File', () => {
    beforeEach(async () => {
      await module.loadRules();
    });

    it('should skip check when not required', async () => {
      mockContext.config.github.requireCodeOwners = false;

      const rule = module.rules.find(r => r.id === 'GH-3');
      const violations = await rule.check(mockContext);
      
      expect(violations).toEqual([]);
      expect(fs.access).not.toHaveBeenCalled();
    });

    it('should pass when CODEOWNERS exists', async () => {
      mockContext.config.github.requireCodeOwners = true;
      fs.access.mockImplementation((path) => {
        if (path.includes('CODEOWNERS')) {
          return Promise.resolve();
        }
        return Promise.reject(new Error('Not found'));
      });

      const rule = module.rules.find(r => r.id === 'GH-3');
      const violations = await rule.check(mockContext);
      
      expect(violations).toEqual([]);
    });
  });

  describe('GH-4: Contributing Guidelines', () => {
    beforeEach(async () => {
      await module.loadRules();
    });

    it('should pass when CONTRIBUTING.md exists', async () => {
      fs.access.mockImplementation((path) => {
        if (path.includes('CONTRIBUTING.md')) {
          return Promise.resolve();
        }
        return Promise.reject(new Error('Not found'));
      });

      const rule = module.rules.find(r => r.id === 'GH-4');
      const violations = await rule.check(mockContext);
      
      expect(violations).toEqual([]);
    });

    it('should create CONTRIBUTING.md when fix is called', async () => {
      fs.writeFile.mockResolvedValue();

      const rule = module.rules.find(r => r.id === 'GH-4');
      const result = await rule.fix(mockContext);
      
      expect(result).toBe(true);
      expect(fs.writeFile).toHaveBeenCalledWith(
        path.join(mockContext.projectPath, 'CONTRIBUTING.md'),
        expect.stringContaining('Contributing to')
      );
    });
  });

  describe('GH-5: GitHub Actions Workflows', () => {
    beforeEach(async () => {
      await module.loadRules();
    });

    it('should pass when workflows exist', async () => {
      fs.readdir.mockResolvedValue(['ci.yml', 'test.yml']);
      fs.readFile.mockImplementation((path) => {
        if (path.includes('ci.yml')) {
          return Promise.resolve('on:\n  push:\n  pull_request:\n\njobs:\n  test:');
        }
        return Promise.resolve('name: Test\n\njobs:\n  lint:');
      });

      const rule = module.rules.find(r => r.id === 'GH-5');
      const violations = await rule.check(mockContext);
      
      expect(violations).toEqual([]);
    });

    it('should suggest missing workflow types', async () => {
      fs.readdir.mockResolvedValue(['deploy.yml']);
      fs.readFile.mockResolvedValue('name: Deploy\n\njobs:\n  deploy:');

      const rule = module.rules.find(r => r.id === 'GH-5');
      const violations = await rule.check(mockContext);
      
      expect(violations).toHaveLength(1);
      expect(violations[0].message).toContain('Consider adding workflows for');
    });
  });

  describe('hooks', () => {
    beforeEach(async () => {
      await module.loadHooks();
    });

    it('should prevent direct pushes to main/master', async () => {
      exec.mockImplementation((cmd, callback) => {
        callback(null, { stdout: 'main\n' });
      });

      const hook = module.hooks['pre-push'][0];
      const result = await hook(mockContext);
      
      expect(result).toBe(false);
    });

    it('should allow pushes to feature branches', async () => {
      exec.mockImplementation((cmd, callback) => {
        callback(null, { stdout: 'feature/test-branch\n' });
      });

      const hook = module.hooks['pre-push'][0];
      const result = await hook(mockContext);
      
      expect(result).toBe(true);
    });
  });

  describe('validators', () => {
    beforeEach(async () => {
      await module.loadValidators();
    });

    describe('github-repo validator', () => {
      it('should pass for GitHub repository', async () => {
        fs.access.mockResolvedValue();
        exec.mockImplementation((cmd, opts, callback) => {
          callback(null, { stdout: 'origin  https://github.com/user/repo.git (fetch)' });
        });

        const result = await module.validators['github-repo']('/test/project');
        expect(result.valid).toBe(true);
      });

      it('should fail for non-GitHub repository', async () => {
        fs.access.mockResolvedValue();
        exec.mockImplementation((cmd, opts, callback) => {
          callback(null, { stdout: 'origin  https://gitlab.com/user/repo.git (fetch)' });
        });

        const result = await module.validators['github-repo']('/test/project');
        expect(result.valid).toBe(false);
        expect(result.message).toBe('No GitHub remote found');
      });
    });

    describe('github-cli validator', () => {
      it('should pass when gh is installed', async () => {
        exec.mockImplementation((cmd, callback) => {
          callback(null, { stdout: 'gh version 2.20.0' });
        });

        const result = await module.validators['github-cli']();
        expect(result.valid).toBe(true);
      });

      it('should fail when gh is not installed', async () => {
        exec.mockImplementation((cmd, callback) => {
          callback(new Error('command not found'));
        });

        const result = await module.validators['github-cli']();
        expect(result.valid).toBe(false);
        expect(result.message).toContain('not installed');
      });
    });
  });
});