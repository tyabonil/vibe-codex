/**
 * Tests for issue update reminder functionality
 */

const IssueUpdateReminder = require('../../../lib/hooks/issue-update-reminder');
const fs = require('fs-extra');
const { exec } = require('child_process');
const { promisify } = require('util');

// Mock dependencies
jest.mock('fs-extra');
jest.mock('child_process');
jest.mock('inquirer');

describe('IssueUpdateReminder', () => {
  let reminder;
  let mockExec;
  
  beforeEach(() => {
    reminder = new IssueUpdateReminder();
    
    // Mock exec
    mockExec = jest.fn();
    exec.mockImplementation((cmd, callback) => {
      if (callback) {
        const result = mockExec(cmd);
        if (result.error) {
          callback(result.error);
        } else {
          callback(null, result.stdout || '', result.stderr || '');
        }
      }
    });
    
    // Mock promisify to return our mock
    promisify.mockReturnValue((cmd) => {
      const result = mockExec(cmd);
      if (result.error) {
        return Promise.reject(result.error);
      }
      return Promise.resolve({ stdout: result.stdout || '', stderr: result.stderr || '' });
    });
    
    // Mock fs
    fs.pathExists.mockResolvedValue(false);
    fs.ensureDir.mockResolvedValue();
    fs.writeFile.mockResolvedValue();
    fs.readFile.mockResolvedValue('');
  });
  
  afterEach(() => {
    jest.clearAllMocks();
  });
  
  describe('getCurrentBranch', () => {
    test('should return current branch name', async () => {
      try {
        mockExec.mockReturnValue({ stdout: 'feature/issue-123-test\n' });
        
        const branch = await reminder.getCurrentBranch();
        expect(branch).toBe('feature/issue-123-test');
        expect(mockExec).toHaveBeenCalledWith('git branch --show-current');
      } catch (error) {
        fail(`Test failed: ${error.message}`);
      }
    });
    
    test('should return null on error', async () => {
      try {
        mockExec.mockReturnValue({ error: new Error('Not a git repo') });
        
        const branch = await reminder.getCurrentBranch();
        expect(branch).toBeNull();
      } catch (error) {
        fail(`Test failed: ${error.message}`);
      }
    });
  });
  
  describe('extractIssueFromBranch', () => {
    test('should extract issue number from branch name', () => {
      expect(reminder.extractIssueFromBranch('feature/issue-123-test')).toBe('123');
      expect(reminder.extractIssueFromBranch('fix/issue-456-bug')).toBe('456');
      expect(reminder.extractIssueFromBranch('issue-789')).toBe('789');
    });
    
    test('should return null for branches without issue numbers', () => {
      expect(reminder.extractIssueFromBranch('main')).toBeNull();
      expect(reminder.extractIssueFromBranch('develop')).toBeNull();
      expect(reminder.extractIssueFromBranch('feature/new-feature')).toBeNull();
    });
  });
  
  describe('extractIssuesFromCommit', () => {
    test('should extract issue numbers from various formats', () => {
      const commitMsg = `
        Fix: Resolve bug in authentication #123
        
        This commit fixes issue #456 and closes #789.
        Part of #111, related to #222.
        Also refs #333
      `;
      
      const issues = reminder.extractIssuesFromCommit(commitMsg);
      expect(issues).toEqual(['123', '456', '789', '111', '222', '333']);
    });
    
    test('should handle case variations', () => {
      const commitMsg = 'Fixes #123, CLOSES #456, Resolves #789';
      const issues = reminder.extractIssuesFromCommit(commitMsg);
      expect(issues).toEqual(['123', '456', '789']);
    });
    
    test('should return empty array for no issues', () => {
      const commitMsg = 'Update documentation';
      const issues = reminder.extractIssuesFromCommit(commitMsg);
      expect(issues).toEqual([]);
    });
  });
  
  describe('findRelatedIssues', () => {
    test('should find issues from branch and commit', async () => {
      try {
        mockExec
          .mockReturnValueOnce({ stdout: 'feature/issue-123-test\n' })
          .mockReturnValueOnce({ stdout: 'Fix bug #456\n' });
        
        const issues = await reminder.findRelatedIssues();
        expect(issues).toEqual(['123', '456']);
      } catch (error) {
        fail(`Test failed: ${error.message}`);
      }
    });
    
    test('should deduplicate issues', async () => {
      try {
        mockExec
          .mockReturnValueOnce({ stdout: 'feature/issue-123-test\n' })
          .mockReturnValueOnce({ stdout: 'Fix #123 and update #123\n' });
        
        const issues = await reminder.findRelatedIssues();
        expect(issues).toEqual(['123']);
      } catch (error) {
        fail(`Test failed: ${error.message}`);
      }
    });
  });
  
  describe('needsReminder', () => {
    test('should return true if never updated', async () => {
      try {
        fs.pathExists.mockResolvedValue(false);
        
        const needs = await reminder.needsReminder('123');
        expect(needs).toBe(true);
      } catch (error) {
        fail(`Test failed: ${error.message}`);
      }
    });
    
    test('should return true if update is old', async () => {
      try {
        fs.pathExists.mockResolvedValue(true);
        fs.readFile.mockResolvedValue((Date.now() - 3 * 60 * 60 * 1000).toString()); // 3 hours ago
        
        const needs = await reminder.needsReminder('123');
        expect(needs).toBe(true);
      } catch (error) {
        fail(`Test failed: ${error.message}`);
      }
    });
    
    test('should return false if recently updated', async () => {
      try {
        fs.pathExists.mockResolvedValue(true);
        fs.readFile.mockResolvedValue((Date.now() - 30 * 60 * 1000).toString()); // 30 minutes ago
        
        const needs = await reminder.needsReminder('123');
        expect(needs).toBe(false);
      } catch (error) {
        fail(`Test failed: ${error.message}`);
      }
    });
  });
  
  describe('getSuggestedMessage', () => {
    test('should parse git diff stats', async () => {
      try {
        mockExec.mockReturnValue({
          stdout: ' file1.js | 10 ++\n file2.js | 5 +-\n 2 files changed, 12 insertions(+), 3 deletions(-)\n'
        });
        
        const result = await reminder.getSuggestedMessage();
        expect(result).toEqual({
          files: 2,
          additions: 12,
          deletions: 3,
          suggestion: 'Made changes to 2 files (+12/-3 lines)'
        });
      } catch (error) {
        fail(`Test failed: ${error.message}`);
      }
    });
    
    test('should handle single file', async () => {
      try {
        mockExec.mockReturnValue({
          stdout: ' file1.js | 5 +\n 1 file changed, 5 insertions(+)\n'
        });
        
        const result = await reminder.getSuggestedMessage();
        expect(result.suggestion).toBe('Made changes to 1 file (+5/-0 lines)');
      } catch (error) {
        fail(`Test failed: ${error.message}`);
      }
    });
  });
  
  describe('recordUpdate', () => {
    test('should write timestamp to update file', async () => {
      try {
        const now = Date.now();
        jest.spyOn(Date, 'now').mockReturnValue(now);
        
        await reminder.recordUpdate('123');
        
        expect(fs.ensureDir).toHaveBeenCalledWith('.git/issue-updates');
        expect(fs.writeFile).toHaveBeenCalledWith(
          '.git/issue-updates/123',
          now.toString()
        );
      } catch (error) {
        fail(`Test failed: ${error.message}`);
      }
    });
  });
  
  describe('formatTimeAgo', () => {
    const { formatTimeAgo } = require('../../../lib/hooks/issue-update-reminder');
    
    test('should format time correctly', () => {
      expect(formatTimeAgo(30 * 1000)).toBe('just now');
      expect(formatTimeAgo(5 * 60 * 1000)).toBe('5 minutes ago');
      expect(formatTimeAgo(60 * 60 * 1000)).toBe('1 hour ago');
      expect(formatTimeAgo(2 * 60 * 60 * 1000)).toBe('2 hours ago');
      expect(formatTimeAgo(24 * 60 * 60 * 1000)).toBe('1 day ago');
      expect(formatTimeAgo(3 * 24 * 60 * 60 * 1000)).toBe('3 days ago');
    });
  });
});