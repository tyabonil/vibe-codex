/**
 * Tests for installation workflow
 */

const fs = require('fs-extra');
const path = require('path');
const os = require('os');

// Mock dependencies
jest.mock('fs-extra');
jest.mock('ora', () => {
  const spinner = {
    start: jest.fn().mockReturnThis(),
    succeed: jest.fn().mockReturnThis(),
    fail: jest.fn().mockReturnThis(),
    warn: jest.fn().mockReturnThis(),
    info: jest.fn().mockReturnThis(),
    stop: jest.fn().mockReturnThis(),
    text: ''
  };
  return jest.fn(() => spinner);
});
jest.mock('inquirer');
jest.mock('node-fetch');
jest.mock('child_process');

const init = require('../../../lib/commands/init');
const { preflightChecks } = require('../../../lib/utils/preflight');
const { createRollbackPoint, rollback } = require('../../../lib/utils/rollback');

describe('Installation Workflow', () => {
  let tempDir;
  let originalCwd;

  beforeEach(async () => {
    // Create temp directory
    tempDir = path.join(os.tmpdir(), `vibe-codex-test-${Date.now()}`);
    originalCwd = process.cwd();
    
    // Mock fs operations
    fs.pathExists.mockResolvedValue(false);
    fs.ensureDir.mockResolvedValue();
    fs.writeFile.mockResolvedValue();
    fs.writeJSON.mockResolvedValue();
    fs.readJSON.mockResolvedValue({});
    fs.readdir.mockResolvedValue([]);
    fs.stat.mockResolvedValue({ isFile: () => true });
    fs.chmod.mockResolvedValue();
    
    // Mock git check
    const childProcess = require('child_process');
    childProcess.exec = jest.fn((cmd, opts, cb) => {
      if (cmd.includes('git rev-parse')) {
        cb(null, '.git', '');
      } else {
        cb(null, '', '');
      }
    });
    
    // Mock inquirer
    const inquirer = require('inquirer');
    inquirer.prompt = jest.fn().mockResolvedValue({
      projectType: 'web',
      useModular: false
    });
  });

  afterEach(() => {
    process.chdir(originalCwd);
    jest.clearAllMocks();
  });

  test('installs in empty git repo', async () => {
    // Mock successful installation
    fs.pathExists.mockImplementation((path) => {
      if (path.includes('.git')) return true;
      if (path.includes('.vibe-codex.json')) return false;
      return false;
    });

    await init({ type: 'web', modules: 'all' });

    // Verify configuration created
    expect(fs.writeFile).toHaveBeenCalledWith(
      expect.stringContaining('.vibe-codex.json'),
      expect.stringContaining('"version": "2.0.0"'),
      expect.any(Object)
    );

    // Verify hooks installed
    expect(fs.ensureDir).toHaveBeenCalledWith(
      expect.stringContaining('.git/hooks')
    );
  });

  test('detects existing installation', async () => {
    // Mock existing vibe-codex
    fs.pathExists.mockImplementation((path) => {
      if (path.includes('.vibe-codex.json')) return true;
      return false;
    });

    const inquirer = require('inquirer');
    inquirer.prompt.mockResolvedValueOnce({ overwrite: false });

    const mockExit = jest.spyOn(process, 'exit').mockImplementation(() => {});
    
    await init({});

    expect(mockExit).toHaveBeenCalledWith(0);
    mockExit.mockRestore();
  });

  test('creates rollback on error', async () => {
    // Force an error during installation
    fs.writeFile.mockRejectedValueOnce(new Error('Write failed'));

    try {
      await init({ type: 'web' });
    } catch (error) {
      expect(error.message).toBe('Write failed');
    }

    // Verify rollback was attempted
    expect(fs.pathExists).toHaveBeenCalledWith('.vibe-codex-backup');
  });

  test('detects project type automatically', async () => {
    // Mock package.json with React
    fs.pathExists.mockImplementation((path) => {
      if (path === 'package.json') return true;
      if (path.includes('.git')) return true;
      return false;
    });
    
    fs.readJSON.mockImplementation((path) => {
      if (path === 'package.json') {
        return {
          dependencies: {
            react: '^18.0.0',
            'react-dom': '^18.0.0'
          }
        };
      }
      return {};
    });

    await init({ type: 'auto' });

    expect(fs.writeFile).toHaveBeenCalledWith(
      expect.stringContaining('.vibe-codex.json'),
      expect.stringContaining('"projectType":"web"'),
      expect.any(Object)
    );
  });

  test('validates Node.js version', async () => {
    // Mock old Node version
    const originalVersion = process.version;
    Object.defineProperty(process, 'version', {
      value: 'v12.0.0',
      configurable: true
    });

    try {
      await init({});
    } catch (error) {
      expect(error.message).toContain('Node.js 14');
    }

    Object.defineProperty(process, 'version', {
      value: originalVersion,
      configurable: true
    });
  });

  test('handles missing git repository', async () => {
    // Mock no git repo
    const childProcess = require('child_process');
    childProcess.exec = jest.fn((cmd, opts, cb) => {
      cb(new Error('Not a git repository'));
    });

    const inquirer = require('inquirer');
    inquirer.prompt.mockResolvedValueOnce({ initGit: true });

    await init({});

    // Verify git init was called
    expect(childProcess.exec).toHaveBeenCalledWith(
      expect.stringContaining('git init'),
      expect.any(Object),
      expect.any(Function)
    );
  });

  test('installs with custom configuration', async () => {
    const inquirer = require('inquirer');
    inquirer.prompt
      .mockResolvedValueOnce({ projectType: 'fullstack' })
      .mockResolvedValueOnce({ useModular: true })
      .mockResolvedValueOnce({
        modules: ['core', 'testing', 'github-workflow']
      });

    await init({});

    expect(fs.writeFile).toHaveBeenCalledWith(
      expect.stringContaining('.vibe-codex.json'),
      expect.stringContaining('"testing": { "enabled": true }'),
      expect.any(Object)
    );
  });

  test('updates package.json scripts', async () => {
    fs.pathExists.mockImplementation((path) => {
      if (path === 'package.json') return true;
      if (path.includes('.git')) return true;
      return false;
    });

    const mockPkg = {
      name: 'test-project',
      scripts: {
        test: 'jest'
      }
    };

    fs.readJSON.mockImplementation((path) => {
      if (path === 'package.json') return mockPkg;
      return {};
    });

    await init({ type: 'web' });

    expect(fs.writeJSON).toHaveBeenCalledWith(
      'package.json',
      expect.objectContaining({
        scripts: expect.objectContaining({
          'vibe:validate': 'vibe-codex validate',
          'vibe:update': 'vibe-codex update'
        })
      }),
      { spaces: 2 }
    );
  });

  test('runs initial validation', async () => {
    // Mock validate command
    jest.mock('../../../lib/commands/validate', () => 
      jest.fn().mockResolvedValue({ valid: true, violations: [] })
    );

    await init({ type: 'web' });

    const validate = require('../../../lib/commands/validate');
    expect(validate).toHaveBeenCalledWith({
      json: true,
      silent: true
    });
  });

  test('handles network errors gracefully', async () => {
    // Mock network error
    jest.mock('node-fetch', () => 
      jest.fn().mockRejectedValue(new Error('Network error'))
    );

    // Should still complete installation without external downloads
    await init({ type: 'web' });

    expect(fs.writeFile).toHaveBeenCalledWith(
      expect.stringContaining('.vibe-codex.json'),
      expect.any(String),
      expect.any(Object)
    );
  });
});