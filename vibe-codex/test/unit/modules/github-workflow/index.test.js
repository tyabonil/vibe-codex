/**
 * Tests for github-workflow module
 */

const fs = require('fs-extra');
const yaml = require('yaml');
const BaseModule = require('../../../../lib/modules/base');

// Mock dependencies
jest.mock('fs-extra');
jest.mock('yaml');
jest.mock('../../../../lib/modules/base');
jest.mock('../../../../lib/utils/logger');

describe('GitHub Workflow Module', () => {
  let GitHubWorkflowModule;
  let workflowModule;
  
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
    
    // Mock BaseModule
    BaseModule.mockImplementation(function() {
      this.name = 'github-workflow';
      this.version = '1.0.0';
      this.description = 'GitHub Actions workflow management';
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
    fs.readFile.mockResolvedValue('name: CI\non: push');
    fs.readdir.mockResolvedValue(['ci.yml', 'deploy.yml']);
    
    // Mock yaml
    yaml.parse.mockReturnValue({
      name: 'CI',
      on: 'push',
      jobs: { test: { 'runs-on': 'ubuntu-latest' } }
    });
    
    GitHubWorkflowModule = require('../../../../lib/modules/github-workflow/index.js').default;
    workflowModule = new GitHubWorkflowModule();
  });

  describe('initialization', () => {
    it('should create github-workflow module with correct properties', () => {
      expect(workflowModule.name).toBe('github-workflow');
      expect(workflowModule.version).toBe('1.0.0');
      expect(workflowModule.description).toContain('GitHub Actions');
    });
  });

  describe('workflow rules', () => {
    beforeEach(() => {
      workflowModule.rules = [
        {
          id: 'workflow-permissions',
          name: 'Workflow Permissions',
          level: 2,
          severity: 'HIGH',
          check: jest.fn()
        },
        {
          id: 'workflow-pinning',
          name: 'Action Version Pinning',
          level: 2,
          severity: 'HIGH',
          check: jest.fn()
        },
        {
          id: 'workflow-efficiency',
          name: 'Workflow Efficiency',
          level: 4,
          severity: 'LOW',
          check: jest.fn()
        }
      ];
    });

    it('should include workflow permissions as level 2 rule', () => {
      const rule = workflowModule.rules.find(r => r.id === 'workflow-permissions');
      expect(rule).toBeDefined();
      expect(rule.level).toBe(2);
      expect(rule.severity).toBe('HIGH');
    });

    it('should include action version pinning rule', () => {
      const rule = workflowModule.rules.find(r => r.id === 'workflow-pinning');
      expect(rule).toBeDefined();
      expect(rule.level).toBe(2);
    });
  });

  describe('workflow validation', () => {
    it('should validate workflow has explicit permissions', () => {
      const validatePermissions = (workflow) => {
        // Check if workflow has permissions defined
        if (!workflow.permissions) return false;
        
        // Check if permissions are restrictive
        if (workflow.permissions === 'write-all') return false;
        
        // Check if job-level permissions exist when needed
        const hasJobPermissions = Object.values(workflow.jobs || {})
          .every(job => !job.permissions || job.permissions !== 'write-all');
        
        return hasJobPermissions;
      };
      
      const goodWorkflow = {
        permissions: {
          contents: 'read',
          'pull-requests': 'write'
        },
        jobs: {
          test: { 'runs-on': 'ubuntu-latest' }
        }
      };
      
      expect(validatePermissions(goodWorkflow)).toBe(true);
      
      const badWorkflow = {
        permissions: 'write-all',
        jobs: { test: {} }
      };
      
      expect(validatePermissions(badWorkflow)).toBe(false);
    });

    it('should check for pinned action versions', () => {
      const checkActionVersions = (workflow) => {
        const unpinnedActions = [];
        
        Object.values(workflow.jobs || {}).forEach(job => {
          (job.steps || []).forEach(step => {
            if (step.uses) {
              // Check if action is pinned to SHA or tag
              if (!step.uses.includes('@') || 
                  step.uses.endsWith('@main') || 
                  step.uses.endsWith('@master')) {
                unpinnedActions.push(step.uses);
              }
            }
          });
        });
        
        return unpinnedActions;
      };
      
      const workflow = {
        jobs: {
          test: {
            steps: [
              { uses: 'actions/checkout@v4' }, // Good
              { uses: 'actions/setup-node@main' }, // Bad
              { uses: 'custom/action' } // Bad
            ]
          }
        }
      };
      
      const unpinned = checkActionVersions(workflow);
      expect(unpinned).toContain('actions/setup-node@main');
      expect(unpinned).toContain('custom/action');
      expect(unpinned).not.toContain('actions/checkout@v4');
    });
  });

  describe('workflow optimization', () => {
    it('should detect inefficient job dependencies', () => {
      const analyzeJobDependencies = (workflow) => {
        const jobs = workflow.jobs || {};
        const issues = [];
        
        // Check for unnecessary sequential jobs
        Object.entries(jobs).forEach(([name, job]) => {
          if (job.needs && Array.isArray(job.needs)) {
            // Check if dependencies could be parallelized
            const couldParallelize = job.needs.some(dep => {
              const depJob = jobs[dep];
              return depJob && !job.if && !depJob.outputs;
            });
            
            if (couldParallelize) {
              issues.push(`Job '${name}' might run in parallel with some dependencies`);
            }
          }
        });
        
        return issues;
      };
      
      const workflow = {
        jobs: {
          lint: { 'runs-on': 'ubuntu-latest' },
          test: { 
            'runs-on': 'ubuntu-latest',
            needs: ['lint'] // Could potentially run in parallel
          },
          build: {
            'runs-on': 'ubuntu-latest',
            needs: ['test']
          }
        }
      };
      
      const issues = analyzeJobDependencies(workflow);
      expect(issues.length).toBeGreaterThan(0);
    });

    it('should validate caching strategy', () => {
      const checkCaching = (workflow) => {
        let usesCaching = false;
        
        Object.values(workflow.jobs || {}).forEach(job => {
          (job.steps || []).forEach(step => {
            // Check for cache actions
            if (step.uses && step.uses.includes('actions/cache')) {
              usesCaching = true;
            }
            // Check for setup actions with cache
            if (step.with && step.with.cache) {
              usesCaching = true;
            }
          });
        });
        
        return usesCaching;
      };
      
      const workflowWithCache = {
        jobs: {
          build: {
            steps: [
              { uses: 'actions/setup-node@v4', with: { cache: 'npm' } }
            ]
          }
        }
      };
      
      expect(checkCaching(workflowWithCache)).toBe(true);
    });
  });

  describe('workflow security checks', () => {
    it('should detect hardcoded secrets', () => {
      const checkForSecrets = (workflow) => {
        const secretPatterns = [
          /[A-Za-z0-9]{40}/, // GitHub token
          /sk_[A-Za-z0-9]{32}/, // Stripe
          /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i // UUID
        ];
        
        const workflowStr = JSON.stringify(workflow);
        return secretPatterns.some(pattern => pattern.test(workflowStr));
      };
      
      const cleanWorkflow = {
        env: {
          TOKEN: '${{ secrets.GITHUB_TOKEN }}'
        }
      };
      
      expect(checkForSecrets(cleanWorkflow)).toBe(false);
      
      const leakyWorkflow = {
        env: {
          TOKEN: 'ghp_1234567890abcdef1234567890abcdef12345678'
        }
      };
      
      expect(checkForSecrets(leakyWorkflow)).toBe(true);
    });
  });
});