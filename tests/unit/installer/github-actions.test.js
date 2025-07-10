/**
 * Tests for github-actions installer
 */

const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');
const fetch = require('node-fetch');

// Mock dependencies
jest.mock('fs-extra');
jest.mock('chalk', () => ({
  blue: jest.fn(text => text),
  green: jest.fn(text => text),
  yellow: jest.fn(text => text),
  red: jest.fn(text => text),
  gray: jest.fn(text => text)
}));
jest.mock('node-fetch');

const { installGitHubActions } = require('../../../lib/installer/github-actions');

describe('GitHub Actions Installer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    console.log = jest.fn();
    
    fs.ensureDir.mockResolvedValue();
    fs.pathExists.mockResolvedValue(false);
    fs.writeFile.mockResolvedValue();
    fs.readFile.mockResolvedValue('existing workflow');
    
    fetch.mockResolvedValue({
      ok: true,
      text: jest.fn().mockResolvedValue('workflow content')
    });
  });

  test('should create workflows directory', async () => {
    await installGitHubActions({});
    
    expect(fs.ensureDir).toHaveBeenCalledWith('.github/workflows');
  });

  test('should download and install default workflows', async () => {
    const config = {
      modules: {
        github: {
          enabled: true,
          workflows: ['ci', 'pr-check']
        }
      }
    };

    await installGitHubActions(config);

    expect(fetch).toHaveBeenCalledTimes(2);
    expect(fs.writeFile).toHaveBeenCalledTimes(2);
  });

  test('should skip existing workflows', async () => {
    fs.pathExists.mockResolvedValue(true);

    await installGitHubActions({});

    expect(console.log).toHaveBeenCalledWith(expect.stringContaining('already exists'));
  });

  test('should force overwrite when specified', async () => {
    fs.pathExists.mockResolvedValue(true);

    await installGitHubActions({ force: true });

    expect(fs.writeFile).toHaveBeenCalled();
  });

  test('should handle download failures', async () => {
    fetch.mockResolvedValue({
      ok: false,
      status: 404,
      statusText: 'Not Found'
    });

    await expect(installGitHubActions({})).rejects.toThrow('Failed to download');
  });

  test('should use custom workflow URLs', async () => {
    const config = {
      modules: {
        github: {
          enabled: true,
          workflows: ['custom'],
          workflowUrls: {
            custom: 'https://example.com/custom.yml'
          }
        }
      }
    };

    await installGitHubActions(config);

    expect(fetch).toHaveBeenCalledWith('https://example.com/custom.yml');
  });

  test('should merge with existing workflows', async () => {
    fs.pathExists.mockResolvedValue(true);
    
    const config = {
      merge: true,
      modules: {
        github: {
          enabled: true,
          workflows: ['ci']
        }
      }
    };

    await installGitHubActions(config);

    expect(fs.readFile).toHaveBeenCalled();
    expect(console.log).toHaveBeenCalledWith(expect.stringContaining('Merging'));
  });

  test('should install PR template', async () => {
    const config = {
      modules: {
        github: {
          enabled: true,
          prTemplate: true
        }
      }
    };

    await installGitHubActions(config);

    expect(fs.writeFile).toHaveBeenCalledWith(
      expect.stringContaining('pull_request_template.md'),
      expect.any(String)
    );
  });

  test('should install issue templates', async () => {
    const config = {
      modules: {
        github: {
          enabled: true,
          issueTemplates: true
        }
      }
    };

    await installGitHubActions(config);

    expect(fs.ensureDir).toHaveBeenCalledWith('.github/ISSUE_TEMPLATE');
  });

  test('should validate workflow syntax', async () => {
    fetch.mockResolvedValue({
      ok: true,
      text: jest.fn().mockResolvedValue('invalid: [yaml')
    });

    await expect(installGitHubActions({})).rejects.toThrow();
  });
});