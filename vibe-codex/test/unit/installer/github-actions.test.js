/**
 * Tests for GitHub Actions installer
 */

const fs = require('fs-extra');
const path = require('path');
const yaml = require('yaml');

// Mock dependencies
jest.mock('fs-extra');
jest.mock('yaml');

describe('GitHub Actions Installer', () => {
  let githubActions;
  
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
    
    // Setup default mocks
    fs.pathExists.mockResolvedValue(true);
    fs.readFile.mockResolvedValue('name: Test\non: push\njobs:\n  test:\n    runs-on: ubuntu-latest');
    fs.writeFile.mockResolvedValue();
    fs.ensureDir.mockResolvedValue();
    
    yaml.parse.mockReturnValue({
      name: 'Test',
      on: 'push',
      jobs: { test: { 'runs-on': 'ubuntu-latest' } }
    });
    yaml.stringify.mockImplementation(obj => JSON.stringify(obj));
    
    githubActions = require('../../../lib/installer/github-actions.js');
  });

  describe('installGitHubActions', () => {
    it('should install GitHub Actions workflow successfully', async () => {
      const config = {
        github: {
          actions: {
            enabled: true,
            workflow: 'vibe-codex'
          }
        }
      };
      
      const result = await githubActions.installGitHubActions(config);
      
      expect(result).toBe(true);
      expect(fs.ensureDir).toHaveBeenCalledWith('.github/workflows');
    });

    it('should skip if actions are disabled', async () => {
      const config = {
        github: {
          actions: {
            enabled: false
          }
        }
      };
      
      const result = await githubActions.installGitHubActions(config);
      
      expect(result).toBe(false);
      expect(fs.ensureDir).not.toHaveBeenCalled();
    });

    it('should handle errors gracefully', async () => {
      fs.ensureDir.mockRejectedValueOnce(new Error('Permission denied'));
      
      const config = {
        github: {
          actions: {
            enabled: true
          }
        }
      };
      
      await expect(githubActions.installGitHubActions(config)).rejects.toThrow('Permission denied');
    });
  });

  describe('createWorkflow', () => {
    it('should create a valid workflow configuration', () => {
      const workflow = githubActions.createWorkflow({
        name: 'vibe-codex',
        triggers: ['push', 'pull_request']
      });
      
      expect(workflow).toBeDefined();
      expect(workflow.name).toBe('vibe-codex');
      expect(workflow.on).toEqual(['push', 'pull_request']);
    });

    it('should include vibe-codex validation job', () => {
      const workflow = githubActions.createWorkflow({});
      
      expect(workflow.jobs).toBeDefined();
      expect(workflow.jobs.validate).toBeDefined();
      expect(workflow.jobs.validate.steps).toContainEqual(
        expect.objectContaining({
          name: expect.stringContaining('vibe-codex')
        })
      );
    });
  });

  describe('updateExistingWorkflow', () => {
    it('should update existing workflow with vibe-codex job', async () => {
      const existingWorkflow = {
        name: 'CI',
        on: 'push',
        jobs: {
          test: { 'runs-on': 'ubuntu-latest' }
        }
      };
      
      yaml.parse.mockReturnValueOnce(existingWorkflow);
      
      await githubActions.updateExistingWorkflow('.github/workflows/ci.yml');
      
      expect(fs.writeFile).toHaveBeenCalled();
      const writeCall = fs.writeFile.mock.calls[0];
      expect(writeCall[0]).toBe('.github/workflows/ci.yml');
    });

    it('should not duplicate vibe-codex job if already exists', async () => {
      const existingWorkflow = {
        name: 'CI',
        jobs: {
          'vibe-codex': { 'runs-on': 'ubuntu-latest' }
        }
      };
      
      yaml.parse.mockReturnValueOnce(existingWorkflow);
      
      await githubActions.updateExistingWorkflow('.github/workflows/ci.yml');
      
      expect(fs.writeFile).not.toHaveBeenCalled();
    });
  });
});