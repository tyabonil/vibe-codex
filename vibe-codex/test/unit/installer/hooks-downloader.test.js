/**
 * Tests for hooks downloader
 */

const fs = require('fs-extra');
const path = require('path');
const https = require('https');
const { Readable } = require('stream');

// Mock dependencies
jest.mock('fs-extra');
jest.mock('https');

describe('Hooks Downloader', () => {
  let hooksDownloader;
  
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
    
    // Setup default mocks
    fs.ensureDir.mockResolvedValue();
    fs.writeFile.mockResolvedValue();
    fs.chmod.mockResolvedValue();
    fs.readJSON.mockResolvedValue({
      hooks: {
        'pre-commit': 'https://example.com/pre-commit.sh',
        'pre-push': 'https://example.com/pre-push.sh'
      }
    });
    
    // Mock https.get
    const mockResponse = new Readable({
      read() {
        this.push('#!/bin/sh\necho "hook content"');
        this.push(null);
      }
    });
    mockResponse.statusCode = 200;
    
    https.get.mockImplementation((url, callback) => {
      callback(mockResponse);
      return { on: jest.fn() };
    });
    
    hooksDownloader = require('../../../lib/installer/hooks-downloader.js');
  });

  describe('downloadHooks', () => {
    it('should download hooks from remote URLs', async () => {
      const config = {
        hooks: {
          remote: {
            'pre-commit': 'https://example.com/hooks/pre-commit',
            'pre-push': 'https://example.com/hooks/pre-push'
          }
        }
      };
      
      const result = await hooksDownloader.downloadHooks(config);
      
      expect(result.success).toBe(true);
      expect(result.downloaded).toEqual(['pre-commit', 'pre-push']);
      expect(fs.writeFile).toHaveBeenCalledTimes(2);
      expect(fs.chmod).toHaveBeenCalledTimes(2);
    });

    it('should handle download failures gracefully', async () => {
      // Mock failed response
      const failedResponse = new Readable({
        read() {}
      });
      failedResponse.statusCode = 404;
      
      https.get.mockImplementationOnce((url, callback) => {
        callback(failedResponse);
        return { on: jest.fn() };
      });
      
      const config = {
        hooks: {
          remote: {
            'pre-commit': 'https://example.com/not-found'
          }
        }
      };
      
      const result = await hooksDownloader.downloadHooks(config);
      
      expect(result.success).toBe(false);
      expect(result.errors).toHaveLength(1);
    });

    it('should skip if no remote hooks configured', async () => {
      const config = {
        hooks: {
          'pre-commit': true // Local hook
        }
      };
      
      const result = await hooksDownloader.downloadHooks(config);
      
      expect(result.success).toBe(true);
      expect(result.downloaded).toEqual([]);
      expect(https.get).not.toHaveBeenCalled();
    });
  });

  describe('downloadFromRegistry', () => {
    it('should download hooks from vibe-codex registry', async () => {
      fs.readJSON.mockResolvedValueOnce({
        hooks: {
          'pre-commit': {
            url: 'https://registry.vibe-codex.dev/hooks/pre-commit/v1',
            sha256: 'abc123'
          }
        }
      });
      
      const result = await hooksDownloader.downloadFromRegistry('pre-commit', 'v1');
      
      expect(result.success).toBe(true);
      expect(https.get).toHaveBeenCalledWith(
        expect.stringContaining('registry.vibe-codex.dev'),
        expect.any(Function)
      );
    });

    it('should verify hook integrity', async () => {
      const crypto = require('crypto');
      const mockHash = {
        update: jest.fn().mockReturnThis(),
        digest: jest.fn().mockReturnValue('abc123')
      };
      
      jest.spyOn(crypto, 'createHash').mockReturnValue(mockHash);
      
      const content = '#!/bin/sh\necho "verified hook"';
      const expectedHash = 'abc123';
      
      const verifyIntegrity = (data, hash) => {
        const calculated = crypto.createHash('sha256')
          .update(data)
          .digest('hex');
        return calculated === hash;
      };
      
      expect(verifyIntegrity(content, expectedHash)).toBe(true);
      expect(verifyIntegrity(content, 'wrong-hash')).toBe(false);
    });
  });

  describe('updateHooks', () => {
    it('should check for hook updates', async () => {
      fs.readFile.mockResolvedValue('#!/bin/sh\n# version: 1.0.0\necho "old hook"');
      
      // Mock registry response with newer version
      fs.readJSON.mockResolvedValueOnce({
        'pre-commit': {
          latest: '2.0.0',
          current: '1.0.0'
        }
      });
      
      const updates = await hooksDownloader.checkForUpdates();
      
      expect(updates).toHaveLength(1);
      expect(updates[0]).toMatchObject({
        hook: 'pre-commit',
        current: '1.0.0',
        latest: '2.0.0'
      });
    });

    it('should update hooks to latest version', async () => {
      const updates = [
        { hook: 'pre-commit', current: '1.0.0', latest: '2.0.0' }
      ];
      
      const result = await hooksDownloader.updateHooks(updates);
      
      expect(result.updated).toEqual(['pre-commit']);
      expect(fs.writeFile).toHaveBeenCalled();
      expect(fs.chmod).toHaveBeenCalledWith(
        expect.stringContaining('pre-commit'),
        '755'
      );
    });
  });

  describe('template processing', () => {
    it('should process hook templates with variables', async () => {
      const template = `#!/bin/sh
# Project: {{PROJECT_NAME}}
# Version: {{VERSION}}

echo "Running {{HOOK_TYPE}} for {{PROJECT_NAME}}"
vibe-codex validate --level {{MIN_LEVEL}}
`;
      
      const variables = {
        PROJECT_NAME: 'my-project',
        VERSION: '1.0.0',
        HOOK_TYPE: 'pre-commit',
        MIN_LEVEL: '3'
      };
      
      const processTemplate = (tmpl, vars) => {
        return tmpl.replace(/\{\{(\w+)\}\}/g, (match, key) => {
          return vars[key] || match;
        });
      };
      
      const processed = processTemplate(template, variables);
      
      expect(processed).toContain('# Project: my-project');
      expect(processed).toContain('echo "Running pre-commit for my-project"');
      expect(processed).toContain('vibe-codex validate --level 3');
    });

    it('should support conditional sections in templates', () => {
      const template = `#!/bin/sh
{{#if ENABLE_LINTING}}
npm run lint
{{/if}}

{{#if ENABLE_TESTS}}
npm test
{{/if}}
`;
      
      const processConditionals = (tmpl, vars) => {
        return tmpl.replace(/\{\{#if (\w+)\}\}([\s\S]*?)\{\{\/if\}\}/g, 
          (match, condition, content) => {
            return vars[condition] ? content : '';
          }
        );
      };
      
      const withLinting = processConditionals(template, { 
        ENABLE_LINTING: true,
        ENABLE_TESTS: false 
      });
      
      expect(withLinting).toContain('npm run lint');
      expect(withLinting).not.toContain('npm test');
    });
  });
});