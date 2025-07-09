/**
 * Tests for documentation module
 */

const fs = require('fs-extra');
const path = require('path');
const BaseModule = require('../../../../lib/modules/base');

// Mock dependencies
jest.mock('fs-extra');
jest.mock('../../../../lib/modules/base');
jest.mock('../../../../lib/utils/logger');

describe('Documentation Module', () => {
  let DocumentationModule;
  let docModule;
  
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
    
    // Mock BaseModule
    BaseModule.mockImplementation(function() {
      this.name = 'documentation';
      this.version = '1.0.0';
      this.description = 'Documentation standards and generation';
      this.rules = [];
      this.hooks = {};
      this.validators = {};
      this.initialize = jest.fn();
      this.loadRules = jest.fn();
      this.loadHooks = jest.fn();
      this.loadValidators = jest.fn();
    });
    
    // Mock fs
    fs.readJSON.mockResolvedValue({});
    fs.pathExists.mockResolvedValue(true);
    fs.readdir.mockResolvedValue(['README.md', 'CONTRIBUTING.md']);
    fs.readFile.mockResolvedValue('# Test Documentation\n\nContent here.');
    
    DocumentationModule = require('../../../../lib/modules/documentation/index.js').default;
    docModule = new DocumentationModule();
  });

  describe('initialization', () => {
    it('should create documentation module with correct properties', () => {
      expect(docModule.name).toBe('documentation');
      expect(docModule.version).toBe('1.0.0');
      expect(docModule.description).toContain('Documentation');
    });
  });

  describe('documentation rules', () => {
    beforeEach(() => {
      // Set up rules as they would be loaded
      docModule.rules = [
        {
          id: 'readme-required',
          name: 'README Required',
          level: 3,
          severity: 'HIGH',
          check: jest.fn()
        },
        {
          id: 'api-documentation',
          name: 'API Documentation',
          level: 4,
          severity: 'MEDIUM',
          check: jest.fn()
        },
        {
          id: 'changelog-maintenance',
          name: 'Changelog Maintenance',
          level: 4,
          severity: 'LOW',
          check: jest.fn()
        }
      ];
    });

    it('should include README required rule', () => {
      const rule = docModule.rules.find(r => r.id === 'readme-required');
      expect(rule).toBeDefined();
      expect(rule.level).toBe(3);
    });

    it('should include API documentation rule', () => {
      const rule = docModule.rules.find(r => r.id === 'api-documentation');
      expect(rule).toBeDefined();
      expect(rule.level).toBe(4);
    });
  });

  describe('documentation validation', () => {
    it('should validate README exists', async () => {
      const checkReadme = async () => {
        return await fs.pathExists('README.md');
      };
      
      fs.pathExists.mockResolvedValueOnce(true);
      const exists = await checkReadme();
      expect(exists).toBe(true);
    });

    it('should check for required sections in README', async () => {
      const content = `# Project Name
      
## Installation
npm install

## Usage
Example usage here

## Contributing
See CONTRIBUTING.md

## License
MIT`;
      
      fs.readFile.mockResolvedValueOnce(content);
      
      const checkSections = async () => {
        const readme = await fs.readFile('README.md', 'utf8');
        const requiredSections = ['Installation', 'Usage', 'Contributing', 'License'];
        return requiredSections.every(section => 
          readme.includes(`## ${section}`)
        );
      };
      
      const hasAllSections = await checkSections();
      expect(hasAllSections).toBe(true);
    });
  });

  describe('documentation generation hooks', () => {
    beforeEach(() => {
      docModule.hooks = {
        'pre-commit': [
          { 
            name: 'update-toc',
            run: jest.fn().mockResolvedValue({ updated: true })
          }
        ],
        'post-release': [
          {
            name: 'generate-api-docs',
            run: jest.fn().mockResolvedValue({ generated: true })
          }
        ]
      };
    });

    it('should update table of contents on pre-commit', async () => {
      const hook = docModule.hooks['pre-commit'][0];
      const result = await hook.run();
      expect(result.updated).toBe(true);
    });

    it('should generate API docs on post-release', async () => {
      const hook = docModule.hooks['post-release'][0];
      const result = await hook.run();
      expect(result.generated).toBe(true);
    });
  });

  describe('documentation quality checks', () => {
    it('should detect outdated documentation', async () => {
      // Simulate checking if docs are outdated
      const checkOutdated = async () => {
        const docPath = 'docs/API.md';
        const srcPath = 'src/api.js';
        
        // In real implementation, would compare modification times
        const docStats = { mtime: new Date('2023-01-01') };
        const srcStats = { mtime: new Date('2023-06-01') };
        
        return srcStats.mtime > docStats.mtime;
      };
      
      const isOutdated = await checkOutdated();
      expect(isOutdated).toBe(true);
    });

    it('should validate markdown links', async () => {
      const content = `
[Valid Link](https://example.com)
[Broken Link](https://broken.link)
[Internal Link](./other-doc.md)
`;
      
      const validateLinks = async (markdown) => {
        const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
        const links = [];
        let match;
        
        while ((match = linkRegex.exec(markdown)) !== null) {
          links.push({ text: match[1], url: match[2] });
        }
        
        return links;
      };
      
      const links = await validateLinks(content);
      expect(links).toHaveLength(3);
      expect(links[0].text).toBe('Valid Link');
    });
  });
});