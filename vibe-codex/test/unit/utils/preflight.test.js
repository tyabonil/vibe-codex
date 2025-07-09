/**
 * Tests for preflight checks utility
 */

const fs = require('fs-extra');
const { execSync } = require('child_process');
const semver = require('semver');

// Mock dependencies
jest.mock('fs-extra');
jest.mock('child_process');
jest.mock('semver');

describe('Preflight Checks', () => {
  let preflight;
  
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
    
    // Setup default mocks
    fs.pathExists.mockResolvedValue(true);
    execSync.mockReturnValue('v16.14.0\n');
    semver.gte.mockReturnValue(true);
    
    preflight = require('../../../lib/utils/preflight');
  });

  describe('checkNodeVersion', () => {
    it('should pass with valid Node.js version', async () => {
      const result = await preflight.checkNodeVersion('14.0.0');
      
      expect(result.passed).toBe(true);
      expect(result.version).toBe('16.14.0');
      expect(semver.gte).toHaveBeenCalledWith('16.14.0', '14.0.0');
    });

    it('should fail with old Node.js version', async () => {
      semver.gte.mockReturnValueOnce(false);
      execSync.mockReturnValueOnce('v12.0.0\n');
      
      const result = await preflight.checkNodeVersion('14.0.0');
      
      expect(result.passed).toBe(false);
      expect(result.message).toContain('Node.js 14.0.0 or higher required');
    });

    it('should handle version check errors', async () => {
      execSync.mockImplementationOnce(() => {
        throw new Error('Command failed');
      });
      
      const result = await preflight.checkNodeVersion('14.0.0');
      
      expect(result.passed).toBe(false);
      expect(result.error).toBe('Command failed');
    });
  });

  describe('checkGitRepository', () => {
    it('should detect valid git repository', async () => {
      fs.pathExists.mockResolvedValueOnce(true);
      
      const result = await preflight.checkGitRepository();
      
      expect(result.isGitRepo).toBe(true);
      expect(fs.pathExists).toHaveBeenCalledWith('.git');
    });

    it('should detect non-git directory', async () => {
      fs.pathExists.mockResolvedValueOnce(false);
      
      const result = await preflight.checkGitRepository();
      
      expect(result.isGitRepo).toBe(false);
      expect(result.message).toContain('Not a git repository');
    });

    it('should check for clean working directory', async () => {
      execSync.mockImplementation((cmd) => {
        if (cmd.includes('git status --porcelain')) {
          return ''; // Clean
        }
        return '';
      });
      
      const result = await preflight.checkGitStatus();
      
      expect(result.isClean).toBe(true);
    });

    it('should detect uncommitted changes', async () => {
      execSync.mockImplementation((cmd) => {
        if (cmd.includes('git status --porcelain')) {
          return 'M file.js\nA new-file.js';
        }
        return '';
      });
      
      const result = await preflight.checkGitStatus();
      
      expect(result.isClean).toBe(false);
      expect(result.changes).toHaveLength(2);
    });
  });

  describe('checkDependencies', () => {
    it('should verify npm dependencies are installed', async () => {
      fs.pathExists.mockImplementation(async (path) => {
        return path === 'node_modules' || path === 'package.json';
      });
      
      const result = await preflight.checkDependencies();
      
      expect(result.installed).toBe(true);
      expect(fs.pathExists).toHaveBeenCalledWith('node_modules');
    });

    it('should detect missing dependencies', async () => {
      fs.pathExists.mockImplementation(async (path) => {
        if (path === 'package.json') return true;
        if (path === 'node_modules') return false;
        return false;
      });
      
      const result = await preflight.checkDependencies();
      
      expect(result.installed).toBe(false);
      expect(result.message).toContain('Run npm install');
    });

    it('should check for package-lock.json sync', async () => {
      fs.pathExists.mockResolvedValue(true);
      fs.stat.mockImplementation(async (path) => ({
        mtime: path.includes('package.json') 
          ? new Date('2023-01-02')
          : new Date('2023-01-01')
      }));
      
      const result = await preflight.checkLockfileSync();
      
      expect(result.synced).toBe(false);
      expect(result.message).toContain('package-lock.json is outdated');
    });
  });

  describe('checkWritePermissions', () => {
    it('should verify write permissions', async () => {
      fs.access.mockResolvedValue(undefined);
      
      const result = await preflight.checkWritePermissions();
      
      expect(result.canWrite).toBe(true);
      expect(fs.access).toHaveBeenCalledWith(
        process.cwd(),
        expect.any(Number) // fs.constants.W_OK
      );
    });

    it('should detect permission issues', async () => {
      fs.access.mockRejectedValueOnce(new Error('EACCES'));
      
      const result = await preflight.checkWritePermissions();
      
      expect(result.canWrite).toBe(false);
      expect(result.message).toContain('No write permission');
    });
  });

  describe('runAllChecks', () => {
    it('should run all preflight checks', async () => {
      const checks = await preflight.runAllChecks();
      
      expect(checks).toHaveProperty('node');
      expect(checks).toHaveProperty('git');
      expect(checks).toHaveProperty('dependencies');
      expect(checks).toHaveProperty('permissions');
      expect(checks.allPassed).toBe(true);
    });

    it('should fail if any check fails', async () => {
      semver.gte.mockReturnValueOnce(false);
      
      const checks = await preflight.runAllChecks();
      
      expect(checks.allPassed).toBe(false);
      expect(checks.failures).toContain('node');
    });

    it('should provide detailed failure information', async () => {
      fs.pathExists.mockImplementation(async (path) => {
        if (path === '.git') return false;
        return true;
      });
      
      const checks = await preflight.runAllChecks();
      
      expect(checks.allPassed).toBe(false);
      expect(checks.git.isGitRepo).toBe(false);
      expect(checks.failures).toContain('git');
      expect(checks.summary).toContain('Initialize git repository');
    });
  });
});