/**
 * GitHub Actions workflow installer
 */

const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');

async function installGitHubActions(config) {
  const workflowsDir = path.join('.github', 'workflows');
  
  // Create directory if needed
  await fs.ensureDir(workflowsDir);
  
  // Install workflows based on configuration
  const workflows = getRequiredWorkflows(config);
  
  for (const workflow of workflows) {
    await installWorkflow(workflow, workflowsDir, config);
  }
}

function getRequiredWorkflows(config) {
  const workflows = [];
  
  // Always install the main vibe-codex workflow
  workflows.push('main');
  
  if (config.modules.testing?.enabled) {
    workflows.push('tests');
  }
  
  if (config.modules.deployment?.enabled) {
    workflows.push('deploy-check');
  }
  
  return workflows;
}

async function installWorkflow(workflowName, workflowsDir, config) {
  const workflowContent = generateWorkflow(workflowName, config);
  const filename = `vibe-codex-${workflowName}.yml`;
  const workflowPath = path.join(workflowsDir, filename);
  
  await fs.writeFile(workflowPath, workflowContent);
  console.log(`  ${chalk.green('✓')} Created workflow: ${filename}`);
}

function generateWorkflow(name, config) {
  const workflows = {
    main: `name: vibe-codex Validation

on:
  pull_request:
    types: [opened, synchronize, reopened]
  push:
    branches: [main, develop]

jobs:
  validate:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Check vibe-codex installation
      run: |
        if ! npx --no-install vibe-codex --version 2>/dev/null; then
          echo "vibe-codex not found, installing..."
          npm install --save-dev vibe-codex
        fi
    
    - name: Run vibe-codex validation
      run: npx --no-install vibe-codex validate --ci
    
    - name: Comment PR
      if: failure() && github.event_name == 'pull_request'
      uses: actions/github-script@v7
      with:
        script: |
          github.rest.issues.createComment({
            issue_number: context.issue.number,
            owner: context.repo.owner,
            repo: context.repo.repo,
            body: '❌ vibe-codex validation failed. Please check the workflow logs.'
          })
`,

    tests: `name: vibe-codex Tests

on:
  pull_request:
  push:
    branches: [main, develop]

jobs:
  test:
    runs-on: ubuntu-latest
    
    strategy:
      matrix:
        node-version: [16, 18, 20]
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Use Node.js \${{ matrix.node-version }}
      uses: actions/setup-node@v4
      with:
        node-version: \${{ matrix.node-version }}
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run tests
      run: npm test
    
    - name: Check coverage
      run: npm run test:coverage
      
    - name: Upload coverage
      uses: codecov/codecov-action@v3
      if: matrix.node-version == '18'
`,

    'deploy-check': `name: vibe-codex Deployment Check

on:
  pull_request:
    types: [opened, synchronize]

jobs:
  deployment-check:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Build project
      run: npm run build
    
    - name: Check vibe-codex installation
      run: |
        if ! npx --no-install vibe-codex --version 2>/dev/null; then
          echo "vibe-codex not found, installing..."
          npm install --save-dev vibe-codex
        fi
    
    - name: Validate deployment configuration
      run: npx --no-install vibe-codex validate --module deployment
`
  };

  return workflows[name] || '';
}

module.exports = {
  installGitHubActions
};