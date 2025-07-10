/**
 * GitHub Workflow module - GitHub Actions and CI/CD workflow rules
 */
import { RuleModule } from '../base.js';
import fs from 'fs/promises';
import path from 'path';
import yaml from 'js-yaml';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export class GitHubWorkflowModule extends RuleModule {
  constructor() {
    super({
      name: 'github-workflow',
      version: '1.0.0',
      description: 'GitHub Actions workflow validation and best practices',
      dependencies: ['github'],
      options: {
        requireCI: true,
        requireSecurityScanning: true,
        requireDependencyUpdates: true,
        workflowTimeout: 60 // minutes
      }
    });
  }

  async loadRules() {
    // Level 4: GitHub Workflow Rules
    this.registerRule({
      id: 'GHW-1',
      name: 'CI Workflow Exists',
      description: 'Repository must have continuous integration workflow',
      level: 4,
      category: 'github-workflow',
      severity: 'error',
      check: async (context) => {
        if (!context.config?.['github-workflow']?.requireCI) return [];
        
        const workflowDir = path.join(context.projectPath, '.github', 'workflows');
        
        try {
          const files = await fs.readdir(workflowDir);
          const workflows = files.filter(f => f.endsWith('.yml') || f.endsWith('.yaml'));
          
          if (workflows.length === 0) {
            return [{
              message: 'No GitHub Actions workflows found'
            }];
          }
          
          // Check for CI-related workflows
          const ciWorkflows = [];
          for (const workflow of workflows) {
            const content = await fs.readFile(path.join(workflowDir, workflow), 'utf8');
            const workflowData = yaml.load(content);
            
            // Check if workflow runs on push/PR
            const triggers = workflowData.on || workflowData.true;
            if (triggers && (triggers.push || triggers.pull_request)) {
              ciWorkflows.push(workflow);
            }
          }
          
          if (ciWorkflows.length === 0) {
            return [{
              message: 'No CI workflow triggered on push/pull_request found'
            }];
          }
          
          return [];
        } catch (error) {
          return [{
            message: 'No .github/workflows directory found'
          }];
        }
      },
      fix: async (context) => {
        const workflowDir = path.join(context.projectPath, '.github', 'workflows');
        await fs.mkdir(workflowDir, { recursive: true });
        
        const ciWorkflow = `name: CI

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    strategy:
      matrix:
        node-version: [18.x, 20.x]
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Use Node.js \${{ matrix.node-version }}
      uses: actions/setup-node@v4
      with:
        node-version: \${{ matrix.node-version }}
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run linter
      run: npm run lint --if-present
    
    - name: Run tests
      run: npm test
    
    - name: Build
      run: npm run build --if-present
`;
        
        await fs.writeFile(path.join(workflowDir, 'ci.yml'), ciWorkflow);
        return true;
      }
    });

    this.registerRule({
      id: 'GHW-2',
      name: 'Workflow Security',
      description: 'Workflows must follow security best practices',
      level: 4,
      category: 'github-workflow',
      severity: 'error',
      check: async (context) => {
        const violations = [];
        const workflowDir = path.join(context.projectPath, '.github', 'workflows');
        
        try {
          const files = await fs.readdir(workflowDir);
          const workflows = files.filter(f => f.endsWith('.yml') || f.endsWith('.yaml'));
          
          for (const workflow of workflows) {
            const content = await fs.readFile(path.join(workflowDir, workflow), 'utf8');
            const lines = content.split('\n');
            
            // Check for hardcoded secrets
            const secretPatterns = [
              /[A-Za-z0-9]{40}/, // GitHub tokens
              /[A-Za-z0-9]{32}/, // API keys
              /password\s*[:=]\s*["'][^"']+["']/i
            ];
            
            lines.forEach((line, index) => {
              for (const pattern of secretPatterns) {
                if (pattern.test(line) && !line.includes('${{') && !line.includes('secrets.')) {
                  violations.push({
                    file: workflow,
                    line: index + 1,
                    message: 'Potential hardcoded secret detected'
                  });
                }
              }
            });
            
            // Check for workflow permissions
            const workflowData = yaml.load(content);
            if (!workflowData.permissions) {
              violations.push({
                file: workflow,
                message: 'Workflow should specify permissions explicitly'
              });
            }
            
            // Check for third-party actions without hash
            const actionUses = content.match(/uses:\s*([^\s]+)/g) || [];
            for (const action of actionUses) {
              const actionName = action.replace('uses:', '').trim();
              if (!actionName.includes('@') || actionName.includes('@master') || actionName.includes('@main')) {
                violations.push({
                  file: workflow,
                  action: actionName,
                  message: 'Third-party actions should be pinned to a specific version/commit SHA'
                });
              }
            }
          }
        } catch (error) {
          // Workflows directory doesn't exist
        }
        
        return violations;
      }
    });

    this.registerRule({
      id: 'GHW-3',
      name: 'Workflow Timeout',
      description: 'Workflows must have appropriate timeouts',
      level: 4,
      category: 'github-workflow',
      severity: 'warning',
      check: async (context) => {
        const violations = [];
        const workflowDir = path.join(context.projectPath, '.github', 'workflows');
        const maxTimeout = context.config?.['github-workflow']?.workflowTimeout || this.options.workflowTimeout;
        
        try {
          const files = await fs.readdir(workflowDir);
          const workflows = files.filter(f => f.endsWith('.yml') || f.endsWith('.yaml'));
          
          for (const workflow of workflows) {
            const content = await fs.readFile(path.join(workflowDir, workflow), 'utf8');
            const workflowData = yaml.load(content);
            
            // Check job timeouts
            if (workflowData.jobs) {
              for (const [jobName, jobConfig] of Object.entries(workflowData.jobs)) {
                if (!jobConfig['timeout-minutes']) {
                  violations.push({
                    file: workflow,
                    job: jobName,
                    message: `Job '${jobName}' should have timeout-minutes specified`
                  });
                } else if (jobConfig['timeout-minutes'] > maxTimeout) {
                  violations.push({
                    file: workflow,
                    job: jobName,
                    message: `Job '${jobName}' timeout (${jobConfig['timeout-minutes']}min) exceeds maximum (${maxTimeout}min)`
                  });
                }
              }
            }
          }
        } catch (error) {
          // Workflows directory doesn't exist
        }
        
        return violations;
      }
    });

    this.registerRule({
      id: 'GHW-4',
      name: 'Security Scanning',
      description: 'Repository should have security scanning workflows',
      level: 4,
      category: 'github-workflow',
      severity: 'warning',
      check: async (context) => {
        if (!context.config?.['github-workflow']?.requireSecurityScanning) return [];
        
        const workflowDir = path.join(context.projectPath, '.github', 'workflows');
        
        try {
          const files = await fs.readdir(workflowDir);
          const workflows = files.filter(f => f.endsWith('.yml') || f.endsWith('.yaml'));
          
          // Check for security-related workflows
          const securityKeywords = ['security', 'codeql', 'dependabot', 'snyk', 'trivy', 'scan'];
          const hasSecurityWorkflow = workflows.some(workflow => 
            securityKeywords.some(keyword => workflow.toLowerCase().includes(keyword))
          );
          
          if (!hasSecurityWorkflow) {
            // Check workflow contents
            let foundSecurity = false;
            for (const workflow of workflows) {
              const content = await fs.readFile(path.join(workflowDir, workflow), 'utf8');
              if (securityKeywords.some(keyword => content.toLowerCase().includes(keyword))) {
                foundSecurity = true;
                break;
              }
            }
            
            if (!foundSecurity) {
              return [{
                message: 'No security scanning workflow found (CodeQL, Dependabot, etc.)'
              }];
            }
          }
          
          return [];
        } catch (error) {
          return [{
            message: 'No security scanning workflows found'
          }];
        }
      },
      fix: async (context) => {
        const workflowDir = path.join(context.projectPath, '.github', 'workflows');
        await fs.mkdir(workflowDir, { recursive: true });
        
        const codeqlWorkflow = `name: "CodeQL"

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]
  schedule:
    - cron: '0 0 * * 1'

jobs:
  analyze:
    name: Analyze
    runs-on: ubuntu-latest
    permissions:
      actions: read
      contents: read
      security-events: write

    strategy:
      fail-fast: false
      matrix:
        language: [ 'javascript' ]

    steps:
    - name: Checkout repository
      uses: actions/checkout@v4

    - name: Initialize CodeQL
      uses: github/codeql-action/init@v3
      with:
        languages: \${{ matrix.language }}

    - name: Autobuild
      uses: github/codeql-action/autobuild@v3

    - name: Perform CodeQL Analysis
      uses: github/codeql-action/analyze@v3
`;
        
        await fs.writeFile(path.join(workflowDir, 'codeql.yml'), codeqlWorkflow);
        return true;
      }
    });

    this.registerRule({
      id: 'GHW-5',
      name: 'Dependency Updates',
      description: 'Repository should have automated dependency updates',
      level: 4,
      category: 'github-workflow',
      severity: 'info',
      check: async (context) => {
        if (!context.config?.['github-workflow']?.requireDependencyUpdates) return [];
        
        // Check for Dependabot config
        const dependabotPath = path.join(context.projectPath, '.github', 'dependabot.yml');
        const renovatePaths = [
          'renovate.json',
          '.renovaterc',
          '.renovaterc.json',
          '.github/renovate.json'
        ];
        
        try {
          await fs.access(dependabotPath);
          return []; // Dependabot configured
        } catch {
          // Check for Renovate
          const hasRenovate = await Promise.all(
            renovatePaths.map(p => 
              fs.access(path.join(context.projectPath, p))
                .then(() => true)
                .catch(() => false)
            )
          );
          
          if (!hasRenovate.some(exists => exists)) {
            return [{
              message: 'No automated dependency updates configured (Dependabot/Renovate)'
            }];
          }
        }
        
        return [];
      },
      fix: async (context) => {
        const dependabotPath = path.join(context.projectPath, '.github', 'dependabot.yml');
        await fs.mkdir(path.dirname(dependabotPath), { recursive: true });
        
        const dependabotConfig = `version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "weekly"
    open-pull-requests-limit: 10
    reviewers:
      - "your-github-username"
    labels:
      - "dependencies"
      - "automated"
`;
        
        await fs.writeFile(dependabotPath, dependabotConfig);
        return true;
      }
    });

    this.registerRule({
      id: 'GHW-6',
      name: 'Workflow Efficiency',
      description: 'Workflows should be efficient and use caching',
      level: 4,
      category: 'github-workflow',
      severity: 'info',
      check: async (context) => {
        const violations = [];
        const workflowDir = path.join(context.projectPath, '.github', 'workflows');
        
        try {
          const files = await fs.readdir(workflowDir);
          const workflows = files.filter(f => f.endsWith('.yml') || f.endsWith('.yaml'));
          
          for (const workflow of workflows) {
            const content = await fs.readFile(path.join(workflowDir, workflow), 'utf8');
            
            // Check for Node.js workflows without caching
            if (content.includes('actions/setup-node') && !content.includes('cache:')) {
              violations.push({
                file: workflow,
                message: 'Node.js workflow should use dependency caching'
              });
            }
            
            // Check for redundant checkouts
            const checkoutCount = (content.match(/actions\/checkout/g) || []).length;
            if (checkoutCount > 1) {
              violations.push({
                file: workflow,
                message: 'Multiple checkout actions detected - consider reusing code'
              });
            }
            
            // Check for artifact usage in multi-job workflows
            const workflowData = yaml.load(content);
            if (workflowData.jobs && Object.keys(workflowData.jobs).length > 1) {
              const hasArtifacts = content.includes('actions/upload-artifact') || 
                                  content.includes('actions/download-artifact');
              if (!hasArtifacts) {
                violations.push({
                  file: workflow,
                  message: 'Multi-job workflow could benefit from artifact sharing'
                });
              }
            }
          }
        } catch (error) {
          // Workflows directory doesn't exist
        }
        
        return violations;
      }
    });
  }

  async loadHooks() {
    // Pre-commit hook to validate workflow files
    this.registerHook('pre-commit', async (context) => {
      const modifiedFiles = context.stagedFiles || [];
      const workflowFiles = modifiedFiles.filter(f => 
        f.includes('.github/workflows/') && (f.endsWith('.yml') || f.endsWith('.yaml'))
      );
      
      if (workflowFiles.length > 0) {
        console.log('🔄 Validating GitHub Actions workflows...');
        
        for (const file of workflowFiles) {
          try {
            const content = await fs.readFile(file, 'utf8');
            yaml.load(content); // Validate YAML syntax
          } catch (error) {
            console.error(`❌ Invalid YAML in ${file}: ${error.message}`);
            return false;
          }
        }
        
        console.log('✅ Workflow files are valid');
      }
      
      return true;
    });
  }

  async loadValidators() {
    // Workflow syntax validator
    this.registerValidator('workflow-syntax', async (projectPath) => {
      const workflowDir = path.join(projectPath, '.github', 'workflows');
      const errors = [];
      
      try {
        const files = await fs.readdir(workflowDir);
        const workflows = files.filter(f => f.endsWith('.yml') || f.endsWith('.yaml'));
        
        for (const workflow of workflows) {
          try {
            const content = await fs.readFile(path.join(workflowDir, workflow), 'utf8');
            const data = yaml.load(content);
            
            // Basic structure validation
            if (!data.name) {
              errors.push(`${workflow}: Missing workflow name`);
            }
            if (!data.on) {
              errors.push(`${workflow}: Missing trigger events`);
            }
            if (!data.jobs || Object.keys(data.jobs).length === 0) {
              errors.push(`${workflow}: No jobs defined`);
            }
          } catch (error) {
            errors.push(`${workflow}: ${error.message}`);
          }
        }
      } catch {
        // No workflows directory
      }
      
      return {
        valid: errors.length === 0,
        errors
      };
    });

    // GitHub Actions availability validator
    this.registerValidator('github-actions', async (projectPath) => {
      try {
        // Check if it's a GitHub repository
        const { stdout } = await execAsync('git remote -v', { cwd: projectPath });
        if (!stdout.includes('github.com')) {
          return {
            valid: false,
            message: 'GitHub Actions only available for GitHub repositories'
          };
        }
        
        return { valid: true };
      } catch (error) {
        return {
          valid: false,
          message: 'Unable to verify GitHub repository'
        };
      }
    });
  }
}

// Export singleton instance
export default new GitHubWorkflowModule();