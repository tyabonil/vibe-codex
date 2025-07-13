const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

describe('Branch Name Validation', () => {
  const validatorPath = path.join(__dirname, '../templates/hooks/branch-name-validator.sh');
  
  beforeAll(() => {
    // Make sure the validator exists
    expect(fs.existsSync(validatorPath)).toBe(true);
  });

  describe('Valid branch names', () => {
    const validNames = [
      'feature/add-login',
      'fix/header-bug',
      'bugfix/memory-leak',
      'hotfix/security-patch',
      'docs/update-readme',
      'refactor/clean-utils',
      'test/add-coverage',
      'chore/update-deps',
      'feature/issue-123-user-auth',
      'fix/issue-456-typo'
    ];

    validNames.forEach(branchName => {
      test(`should accept: ${branchName}`, () => {
        // Mock git command
        const mockGitCommand = `echo "${branchName}"`;
        const command = `BRANCH_NAME="${branchName}" bash -c 'BRANCH_NAME="${branchName}" && export BRANCH_NAME && ${mockGitCommand} > /dev/null && bash ${validatorPath}'`;
        
        try {
          execSync(command, { 
            env: { ...process.env, BRANCH_NAME: branchName },
            stdio: 'pipe' 
          });
        } catch (error) {
          // If validation fails, the script exits with code 1
          throw new Error(`Branch name "${branchName}" should be valid but was rejected`);
        }
      });
    });
  });

  describe('Invalid branch names', () => {
    const invalidNames = [
      'Feature/add-login', // Capital letter
      'feature_add_login', // Underscores in wrong place
      'add-login', // No type prefix
      'feature/', // No description
      'feature/Add-Login', // Capital in description
      'feat/add-login', // Invalid type
      'feature/this-is-a-very-long-branch-name-that-exceeds-fifty-chars', // Too long
      'feature/add login', // Space in name
      'feature/add@login' // Invalid character
    ];

    invalidNames.forEach(branchName => {
      test(`should reject: ${branchName}`, () => {
        const mockGitCommand = `echo "${branchName}"`;
        const command = `BRANCH_NAME="${branchName}" VIBE_CODEX_HOOK_TYPE="pre-push" bash -c 'BRANCH_NAME="${branchName}" && export BRANCH_NAME && export VIBE_CODEX_HOOK_TYPE && ${mockGitCommand} > /dev/null && bash ${validatorPath}'`;
        
        expect(() => {
          execSync(command, { 
            env: { ...process.env, BRANCH_NAME: branchName, VIBE_CODEX_HOOK_TYPE: 'pre-push' },
            stdio: 'pipe' 
          });
        }).toThrow();
      });
    });
  });

  describe('Main branches', () => {
    const mainBranches = ['main', 'master', 'develop', 'staging', 'production', 'preview'];

    mainBranches.forEach(branchName => {
      test(`should skip validation for: ${branchName}`, () => {
        const mockGitCommand = `echo "${branchName}"`;
        const command = `BRANCH_NAME="${branchName}" bash -c 'BRANCH_NAME="${branchName}" && export BRANCH_NAME && ${mockGitCommand} > /dev/null && bash ${validatorPath}'`;
        
        try {
          const output = execSync(command, { 
            env: { ...process.env, BRANCH_NAME: branchName },
            encoding: 'utf8' 
          });
          expect(output).toContain('Main branch - skipping validation');
        } catch (error) {
          throw new Error(`Main branch "${branchName}" should skip validation`);
        }
      });
    });
  });

  describe('Configuration', () => {
    test('should respect disabled validation in config', () => {
      // Create temporary config
      const configPath = path.join(__dirname, '.vibe-codex.json');
      const config = {
        advanced: {
          branchValidation: false
        }
      };
      fs.writeFileSync(configPath, JSON.stringify(config));

      try {
        const command = `cd ${__dirname} && BRANCH_NAME="invalid_branch" bash ${validatorPath}`;
        const output = execSync(command, { encoding: 'utf8' });
        expect(output).toContain('Branch validation disabled in config');
      } finally {
        // Clean up
        if (fs.existsSync(configPath)) {
          fs.unlinkSync(configPath);
        }
      }
    });
  });
});