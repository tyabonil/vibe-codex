/**
 * Main validator module for checking MANDATORY rules compliance
 */

const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');
const simpleGit = require('simple-git');

class RuleValidator {
  constructor(config) {
    this.config = config;
    this.git = simpleGit();
    this.violations = [];
    this.warnings = [];
    this.passed = [];
  }

  /**
   * Run all validations
   * @param {Object} options - Validation options
   * @returns {Promise<Object>} Validation results
   */
  async validate(options = {}) {
    this.violations = [];
    this.warnings = [];
    this.passed = [];

    // Check core rules that apply to all projects
    await this.validateCoreRules();

    // Check module-specific rules
    const enabledModules = this.getEnabledModules();
    for (const moduleName of enabledModules) {
      await this.validateModule(moduleName);
    }

    return {
      violations: this.violations,
      warnings: this.warnings,
      passed: this.passed,
      summary: {
        total: this.violations.length + this.warnings.length + this.passed.length,
        violations: this.violations.length,
        warnings: this.warnings.length,
        passed: this.passed.length
      }
    };
  }

  /**
   * Validate core rules that apply to all projects
   */
  async validateCoreRules() {
    // Check for MANDATORY-RULES.md
    if (!await fs.pathExists('MANDATORY-RULES.md')) {
      this.violations.push({
        rule: 'CORE-1',
        message: 'MANDATORY-RULES.md is missing',
        severity: 'error',
        fix: 'Run "npx vibe-codex init" to install MANDATORY rules'
      });
    } else {
      this.passed.push({
        rule: 'CORE-1',
        message: 'MANDATORY-RULES.md exists'
      });
    }

    // Check for PROJECT_CONTEXT.md
    if (!await fs.pathExists('PROJECT_CONTEXT.md')) {
      this.warnings.push({
        rule: 'CORE-2',
        message: 'PROJECT_CONTEXT.md is missing',
        severity: 'warning',
        fix: 'Create PROJECT_CONTEXT.md to document your project'
      });
    } else {
      this.passed.push({
        rule: 'CORE-2',
        message: 'PROJECT_CONTEXT.md exists'
      });
    }

    // Check for .env.example if .env exists
    if (await fs.pathExists('.env')) {
      if (!await fs.pathExists('.env.example')) {
        this.violations.push({
          rule: 'SEC-1',
          message: '.env exists but .env.example is missing',
          severity: 'error',
          fix: 'Create .env.example with documented variables'
        });
      } else {
        this.passed.push({
          rule: 'SEC-1',
          message: '.env.example exists for environment variables'
        });
      }
    }

    // Check git configuration
    await this.validateGitConfiguration();

    // Check branch naming
    await this.validateBranchNaming();

    // Check for sensitive files
    await this.validateNoSecrets();
  }

  /**
   * Validate git configuration
   */
  async validateGitConfiguration() {
    try {
      const isRepo = await this.git.checkIsRepo();
      if (!isRepo) {
        this.violations.push({
          rule: 'GIT-1',
          message: 'Not a git repository',
          severity: 'error',
          fix: 'Run "git init" to initialize repository'
        });
        return;
      }

      // Check for remote
      const remotes = await this.git.getRemotes();
      if (remotes.length === 0) {
        this.warnings.push({
          rule: 'GIT-2',
          message: 'No git remote configured',
          severity: 'warning',
          fix: 'Add a remote with "git remote add origin <url>"'
        });
      } else {
        this.passed.push({
          rule: 'GIT-2',
          message: 'Git remote configured'
        });
      }

    } catch (error) {
      this.warnings.push({
        rule: 'GIT-1',
        message: `Git check failed: ${error.message}`,
        severity: 'warning'
      });
    }
  }

  /**
   * Validate branch naming convention
   */
  async validateBranchNaming() {
    try {
      const branch = await this.git.revparse(['--abbrev-ref', 'HEAD']);
      const validPattern = /^(feature|fix|docs|chore|refactor)\/issue-\d+-[\w-]+$/;
      
      if (branch === 'main' || branch === 'master' || branch === 'preview') {
        // Skip validation for main branches
        return;
      }

      if (!validPattern.test(branch)) {
        this.warnings.push({
          rule: 'WORKFLOW-1',
          message: `Branch name "${branch}" doesn't follow convention`,
          severity: 'warning',
          fix: 'Use format: feature/issue-{number}-{description}'
        });
      } else {
        this.passed.push({
          rule: 'WORKFLOW-1',
          message: 'Branch naming follows convention'
        });
      }
    } catch (error) {
      // Ignore branch naming check errors
    }
  }

  /**
   * Check for potential secrets in tracked files
   */
  async validateNoSecrets() {
    const secretPatterns = [
      { pattern: /api[_-]?key\s*=\s*['"][^'"]+['"]/gi, name: 'API key' },
      { pattern: /secret[_-]?key\s*=\s*['"][^'"]+['"]/gi, name: 'Secret key' },
      { pattern: /password\s*=\s*['"][^'"]+['"]/gi, name: 'Password' },
      { pattern: /token\s*=\s*['"][^'"]+['"]/gi, name: 'Token' },
      { pattern: /-----BEGIN\s+(RSA\s+)?PRIVATE\s+KEY-----/g, name: 'Private key' }
    ];

    const filesToCheck = [
      '**/*.js',
      '**/*.ts',
      '**/*.jsx',
      '**/*.tsx',
      '**/*.py',
      '**/*.rb',
      '**/*.go',
      '**/*.java',
      '**/*.php',
      '**/*.sh',
      '**/*.yml',
      '**/*.yaml',
      '**/*.json'
    ];

    // This is a simplified check - in production, use git-secrets or similar
    // For now, just check if .gitignore includes common secret files
    if (await fs.pathExists('.gitignore')) {
      const gitignore = await fs.readFile('.gitignore', 'utf-8');
      const hasEnvIgnored = gitignore.includes('.env');
      
      if (!hasEnvIgnored && await fs.pathExists('.env')) {
        this.violations.push({
          rule: 'SEC-2',
          message: '.env file is not in .gitignore',
          severity: 'error',
          fix: 'Add .env to .gitignore'
        });
      } else {
        this.passed.push({
          rule: 'SEC-2',
          message: 'Environment files properly ignored'
        });
      }
    }
  }

  /**
   * Validate a specific module
   * @param {string} moduleName - Module name
   */
  async validateModule(moduleName) {
    const validators = {
      testing: () => this.validateTestingModule(),
      github: () => this.validateGitHubModule(),
      deployment: () => this.validateDeploymentModule(),
      documentation: () => this.validateDocumentationModule(),
      quality: () => this.validateQualityModule()
    };

    const validator = validators[moduleName];
    if (validator) {
      await validator();
    }
  }

  /**
   * Validate testing module requirements
   */
  async validateTestingModule() {
    const config = this.config.modules.testing;
    
    // Check for test files
    const testDirs = ['test', 'tests', '__tests__', 'spec'];
    const hasTests = await Promise.any(
      testDirs.map(dir => fs.pathExists(dir))
    ).catch(() => false);

    if (!hasTests) {
      this.warnings.push({
        rule: 'TEST-1',
        message: 'No test directory found',
        severity: 'warning',
        fix: 'Create a test directory and add tests'
      });
    } else {
      this.passed.push({
        rule: 'TEST-1',
        message: 'Test directory exists'
      });
    }

    // Check package.json for test script
    if (await fs.pathExists('package.json')) {
      const pkg = await fs.readJSON('package.json');
      if (!pkg.scripts?.test) {
        this.violations.push({
          rule: 'TEST-2',
          message: 'No test script in package.json',
          severity: 'error',
          fix: 'Add a "test" script to package.json'
        });
      } else {
        this.passed.push({
          rule: 'TEST-2',
          message: 'Test script configured'
        });
      }
    }
  }

  /**
   * Validate GitHub module requirements
   */
  async validateGitHubModule() {
    // Check for PR templates
    const prTemplatePaths = [
      '.github/pull_request_template.md',
      '.github/PULL_REQUEST_TEMPLATE.md',
      'docs/pull_request_template.md'
    ];

    const hasPRTemplate = await Promise.any(
      prTemplatePaths.map(p => fs.pathExists(p))
    ).catch(() => false);

    if (!hasPRTemplate) {
      this.warnings.push({
        rule: 'GH-1',
        message: 'No pull request template found',
        severity: 'warning',
        fix: 'Create .github/pull_request_template.md'
      });
    } else {
      this.passed.push({
        rule: 'GH-1',
        message: 'Pull request template exists'
      });
    }

    // Check for issue templates
    const issueTemplateDir = '.github/ISSUE_TEMPLATE';
    if (!await fs.pathExists(issueTemplateDir)) {
      this.warnings.push({
        rule: 'GH-2',
        message: 'No issue templates found',
        severity: 'warning',
        fix: 'Create issue templates in .github/ISSUE_TEMPLATE/'
      });
    } else {
      this.passed.push({
        rule: 'GH-2',
        message: 'Issue templates exist'
      });
    }
  }

  /**
   * Validate deployment module requirements
   */
  async validateDeploymentModule() {
    const platform = this.config.modules.deployment?.platform;
    
    if (platform === 'vercel') {
      if (!await fs.pathExists('vercel.json')) {
        this.warnings.push({
          rule: 'DEPLOY-1',
          message: 'No vercel.json configuration found',
          severity: 'warning',
          fix: 'Create vercel.json for deployment configuration'
        });
      } else {
        this.passed.push({
          rule: 'DEPLOY-1',
          message: 'Vercel configuration exists'
        });
      }
    }
  }

  /**
   * Validate documentation module requirements
   */
  async validateDocumentationModule() {
    // Check for README
    if (!await fs.pathExists('README.md')) {
      this.violations.push({
        rule: 'DOC-1',
        message: 'No README.md found',
        severity: 'error',
        fix: 'Create a README.md file'
      });
    } else {
      this.passed.push({
        rule: 'DOC-1',
        message: 'README.md exists'
      });
    }

    // Check for docs directory
    if (!await fs.pathExists('docs')) {
      this.warnings.push({
        rule: 'DOC-2',
        message: 'No docs directory found',
        severity: 'warning',
        fix: 'Create a docs/ directory for documentation'
      });
    } else {
      this.passed.push({
        rule: 'DOC-2',
        message: 'Documentation directory exists'
      });
    }
  }

  /**
   * Validate code quality module requirements
   */
  async validateQualityModule() {
    // Check for ESLint configuration
    const eslintConfigs = ['.eslintrc', '.eslintrc.js', '.eslintrc.json', '.eslintrc.yml'];
    const hasEslint = await Promise.any(
      eslintConfigs.map(f => fs.pathExists(f))
    ).catch(() => false);

    if (!hasEslint && await fs.pathExists('package.json')) {
      const pkg = await fs.readJSON('package.json');
      if (!pkg.eslintConfig) {
        this.warnings.push({
          rule: 'QUALITY-1',
          message: 'No ESLint configuration found',
          severity: 'warning',
          fix: 'Add ESLint configuration'
        });
      }
    } else {
      this.passed.push({
        rule: 'QUALITY-1',
        message: 'ESLint configured'
      });
    }
  }

  /**
   * Get list of enabled modules
   * @returns {Array<string>} Enabled module names
   */
  getEnabledModules() {
    if (!this.config.modules) return [];
    
    return Object.keys(this.config.modules)
      .filter(name => this.config.modules[name].enabled !== false);
  }
}

module.exports = RuleValidator;