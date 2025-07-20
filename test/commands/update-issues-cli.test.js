/**
 * Tests for CLI-only update-issues command
 */

const chalk = require('chalk');
const fs = require('fs-extra');

// Mock dependencies
jest.mock('fs-extra');
jest.mock('child_process');
jest.mock('../../lib/utils/logger');
jest.mock('ora', () => {
  return jest.fn(() => ({
    start: jest.fn().mockReturnThis(),
    succeed: jest.fn().mockReturnThis(),
    fail: jest.fn().mockReturnThis(),
    stop: jest.fn().mockReturnThis(),
    text: ''
  }));
});

// Mock util.promisify to return our mock
const mockExecAsync = jest.fn();
jest.mock('util', () => ({
  promisify: jest.fn(() => mockExecAsync)
}));

const logger = require('../../lib/utils/logger');
const updateIssuesCommand = require('../../lib/commands/update-issues-cli');

describe('Update Issues CLI Command', () => {
  let consoleLogSpy;
  let processExitSpy;
  
  beforeEach(() => {
    jest.clearAllMocks();
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
    processExitSpy = jest.spyOn(process, 'exit').mockImplementation(() => {
      throw new Error('process.exit called');
    });
    
    // Default mock implementations
    mockExecAsync.mockResolvedValue({ stdout: '', stderr: '' });
  });
  
  afterEach(() => {
    consoleLogSpy.mockRestore();
    processExitSpy.mockRestore();
  });
  
  describe('help display', () => {
    it('should show help when no options provided', async () => {
      await updateIssuesCommand({});
      
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('vibe-codex Issue Updates'));
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('Usage:'));
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('--list'));
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('--update'));
    });
    
    it('should throw error in non-interactive mode with no options', async () => {
      process.env.CI = 'true';
      
      await expect(updateIssuesCommand({})).rejects.toThrow(
        'No update action specified. Use --list, --update, or --check'
      );
      
      delete process.env.CI;
    });
  });
  
  describe('list related issues', () => {
    it('should list issues from recent commits', async () => {
      mockExecAsync
        .mockResolvedValueOnce({ 
          stdout: 'abc123 Fix issue #123\ndef456 Implement feature for #456\nghi789 Update docs' 
        })
        .mockResolvedValueOnce({ stdout: 'gh version 2.0.0' }) // gh available
        .mockResolvedValueOnce({ 
          stdout: JSON.stringify({
            number: 123,
            title: 'Test issue',
            state: 'OPEN',
            updatedAt: new Date().toISOString()
          })
        })
        .mockResolvedValueOnce({ 
          stdout: JSON.stringify({
            number: 456,
            title: 'Another issue',
            state: 'CLOSED',
            updatedAt: new Date().toISOString()
          })
        });
      
      await updateIssuesCommand({ list: true });
      
      expect(mockExecAsync).toHaveBeenCalledWith('git log --oneline -50');
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('Related Issues:'));
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('#123: Test issue'));
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('#456: Another issue'));
    });
    
    it('should handle no issues found', async () => {
      mockExecAsync.mockResolvedValueOnce({ stdout: 'abc123 Initial commit\ndef456 Update README' });
      
      await updateIssuesCommand({ list: true });
      
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('No issue references found in recent commits')
      );
    });
    
    it('should handle missing gh CLI', async () => {
      mockExecAsync
        .mockResolvedValueOnce({ stdout: 'abc123 Fix #123' })
        .mockRejectedValueOnce(new Error('gh not found')); // gh not available
      
      await updateIssuesCommand({ list: true });
      
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('• #123'));
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('Install GitHub CLI for more detailed information')
      );
    });
  });
  
  describe('check issue status', () => {
    it('should check issue status with gh CLI', async () => {
      const issueData = {
        number: 123,
        title: 'Test issue',
        state: 'OPEN',
        body: 'Issue description',
        comments: [
          { createdAt: new Date().toISOString(), body: 'First comment' },
          { createdAt: new Date().toISOString(), body: 'Second comment' }
        ],
        updatedAt: new Date().toISOString()
      };
      
      mockExecAsync
        .mockResolvedValueOnce({ stdout: 'gh version 2.0.0' })
        .mockResolvedValueOnce({ stdout: JSON.stringify(issueData) });
      
      await updateIssuesCommand({ check: '123' });
      
      expect(mockExecAsync).toHaveBeenCalledWith(
        'gh issue view 123 --json number,title,state,body,comments,updatedAt'
      );
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('Issue #123: Test issue')
      );
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('State: OPEN'));
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('Comments: 2'));
    });
    
    it('should handle missing gh CLI', async () => {
      mockExecAsync.mockRejectedValueOnce(new Error('gh not found'));
      
      await updateIssuesCommand({ check: '123' });
      
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('Install GitHub CLI to check issue status')
      );
    });
  });
  
  describe('update issue', () => {
    it('should update issue with message', async () => {
      mockExecAsync
        .mockResolvedValueOnce({ stdout: 'gh version 2.0.0' })
        .mockResolvedValueOnce({ stdout: '' }); // comment posted
      
      await updateIssuesCommand({ update: '123', message: 'Test update' });
      
      expect(mockExecAsync).toHaveBeenCalledWith(
        expect.stringContaining('gh issue comment 123 --body')
      );
      expect(logger.success).toHaveBeenCalledWith(
        'Successfully posted update to issue #123'
      );
    });
    
    it('should require message for update', async () => {
      await expect(updateIssuesCommand({ update: '123' })).rejects.toThrow(
        'Message is required for issue update'
      );
    });
    
    it('should handle dry run', async () => {
      mockExecAsync.mockResolvedValueOnce({ stdout: 'gh version 2.0.0' });
      
      await updateIssuesCommand({ update: '123', message: 'Test update', dryRun: true });
      
      expect(mockExecAsync).not.toHaveBeenCalledWith(
        expect.stringContaining('gh issue comment')
      );
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('Update preview:'));
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('Issue: #123'));
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('Message: Test update'));
    });
    
    it('should handle missing gh CLI', async () => {
      mockExecAsync
        .mockRejectedValueOnce(new Error('gh not found'))
        .mockResolvedValueOnce({ stdout: 'https://github.com/owner/repo.git' });
      
      await updateIssuesCommand({ update: '123', message: 'Test update' });
      
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('Cannot update without GitHub CLI')
      );
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('https://github.com/owner/repo/issues/123')
      );
    });
  });
  
  describe('bulk update', () => {
    const bulkUpdates = [
      { issue: 123, message: 'Update for 123' },
      { issue: 456, message: 'Update for 456' }
    ];
    
    beforeEach(() => {
      fs.pathExists.mockResolvedValue(true);
      fs.readJSON.mockResolvedValue(bulkUpdates);
    });
    
    it('should perform bulk updates from file', async () => {
      mockExecAsync
        .mockResolvedValueOnce({ stdout: 'gh version 2.0.0' })
        .mockResolvedValueOnce({ stdout: '' })
        .mockResolvedValueOnce({ stdout: 'gh version 2.0.0' })
        .mockResolvedValueOnce({ stdout: '' });
      
      await updateIssuesCommand({ bulk: 'updates.json' });
      
      expect(fs.readJSON).toHaveBeenCalledWith('updates.json');
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('Processing 2 updates')
      );
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('Successful: 2'));
    });
    
    it('should handle missing file', async () => {
      fs.pathExists.mockResolvedValue(false);
      
      await expect(updateIssuesCommand({ bulk: 'missing.json' })).rejects.toThrow(
        'Update file not found: missing.json'
      );
    });
    
    it('should validate file format', async () => {
      fs.readJSON.mockResolvedValue({ not: 'an array' });
      
      await expect(updateIssuesCommand({ bulk: 'invalid.json' })).rejects.toThrow(
        'Update file must contain an array of updates'
      );
    });
    
    it('should handle invalid updates', async () => {
      fs.readJSON.mockResolvedValue([
        { issue: 123, message: 'Valid' },
        { issue: 456 }, // missing message
        { message: 'Missing issue' } // missing issue
      ]);
      
      mockExecAsync
        .mockResolvedValueOnce({ stdout: 'gh version 2.0.0' })
        .mockResolvedValueOnce({ stdout: '' });
      
      await updateIssuesCommand({ bulk: 'updates.json' });
      
      expect(logger.warn).toHaveBeenCalledTimes(2);
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('Successful: 1'));
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('Failed: 2'));
    });
  });
  
  describe('error handling', () => {
    it('should handle errors in list command', async () => {
      mockExecAsync.mockRejectedValue(new Error('Git error'));
      
      await expect(updateIssuesCommand({ list: true })).rejects.toThrow('Git error');
      expect(logger.error).toHaveBeenCalledWith('Error:', 'Git error');
    });
    
    it('should handle errors in check command', async () => {
      mockExecAsync
        .mockResolvedValueOnce({ stdout: 'gh version 2.0.0' })
        .mockRejectedValueOnce(new Error('API error'));
      
      await expect(updateIssuesCommand({ check: '123' })).rejects.toThrow('API error');
      expect(logger.error).toHaveBeenCalledWith('Error:', 'API error');
    });
    
    it('should handle errors in update command', async () => {
      mockExecAsync
        .mockResolvedValueOnce({ stdout: 'gh version 2.0.0' })
        .mockRejectedValueOnce(new Error('Update failed'));
      
      await expect(
        updateIssuesCommand({ update: '123', message: 'Test' })
      ).rejects.toThrow('Update failed');
      expect(logger.error).toHaveBeenCalledWith('Error:', 'Update failed');
    });
  });
});