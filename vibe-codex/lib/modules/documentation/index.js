/**
 * Documentation module - Documentation requirements
 */
import { RuleModule } from '../base.js';
import fs from 'fs/promises';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export class DocumentationModule extends RuleModule {
  constructor() {
    super({
      name: 'documentation',
      version: '1.0.0',
      description: 'Documentation standards and completeness rules',
      dependencies: [],
      options: {
        requiredReadmeSections: [
          'installation',
          'usage',
          'contributing',
          'license'
        ],
        requireApiDocs: true,
        requireChangelog: true,
        requireJsdoc: true,
        minReadmeLength: 100
      }
    });
  }

  async loadRules() {
    // Level 5: Documentation Rules
    this.registerRule({
      id: 'DOC-1',
      name: 'README Completeness',
      description: 'README.md must have all required sections',
      level: 5,
      category: 'documentation',
      severity: 'warning',
      check: async (context) => {
        const readmePath = path.join(context.projectPath, 'README.md');
        
        try {
          const content = await fs.readFile(readmePath, 'utf8');
          const lowerContent = content.toLowerCase();
          
          const violations = [];
          
          // Check minimum length
          if (content.length < this.options.minReadmeLength) {
            violations.push({
              message: `README.md is too short (${content.length} chars, minimum ${this.options.minReadmeLength})`
            });
          }
          
          // Check required sections
          const requiredSections = context.config?.documentation?.requiredReadmeSections || this.options.requiredReadmeSections;
          const missingSections = [];
          
          for (const section of requiredSections) {
            const sectionRegex = new RegExp(`#+\\s*${section}`, 'i');
            if (!sectionRegex.test(content)) {
              missingSections.push(section);
            }
          }
          
          if (missingSections.length > 0) {
            violations.push({
              message: `README.md missing required sections: ${missingSections.join(', ')}`
            });
          }
          
          // Check for basic content quality
          if (!content.includes('#')) {
            violations.push({
              message: 'README.md should use markdown headers'
            });
          }
          
          // Check for code examples
          if (!content.includes('```') && lowerContent.includes('usage')) {
            violations.push({
              message: 'README.md should include code examples in usage section'
            });
          }
          
          // Check for badges
          if (!content.includes('![') && !content.includes('[![')) {
            violations.push({
              message: 'Consider adding status badges to README.md'
            });
          }
          
          return violations;
        } catch (error) {
          return [{
            message: 'README.md file not found'
          }];
        }
      },
      fix: async (context) => {
        const readmePath = path.join(context.projectPath, 'README.md');
        const projectName = path.basename(context.projectPath);
        
        const template = `# ${projectName}

![Build Status](https://img.shields.io/badge/build-passing-brightgreen)
![License](https://img.shields.io/badge/license-MIT-blue)

Brief description of your project goes here.

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [API Documentation](#api-documentation)
- [Contributing](#contributing)
- [License](#license)

## Installation

\`\`\`bash
npm install ${projectName}
\`\`\`

## Usage

\`\`\`javascript
const ${projectName} = require('${projectName}');

// Example usage
${projectName}.doSomething();
\`\`\`

## API Documentation

See [API.md](./API.md) for detailed API documentation.

## Contributing

Please read [CONTRIBUTING.md](./CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.
`;
        
        await fs.writeFile(readmePath, template);
        return true;
      }
    });

    this.registerRule({
      id: 'DOC-2',
      name: 'API Documentation',
      description: 'API documentation must exist for public modules',
      level: 5,
      category: 'documentation',
      severity: 'warning',
      check: async (context) => {
        if (!context.config?.documentation?.requireApiDocs) return [];
        
        const apiDocFiles = [
          'API.md',
          'docs/API.md',
          'docs/api.md',
          'documentation/API.md'
        ];
        
        // Check if any source files export public APIs
        const sourceFiles = context.files.filter(f => 
          (f.path.endsWith('.js') || f.path.endsWith('.ts')) &&
          !f.path.includes('node_modules') &&
          !f.path.includes('test') &&
          f.content.includes('export')
        );
        
        if (sourceFiles.length === 0) {
          return []; // No public APIs
        }
        
        const hasApiDocs = await Promise.all(
          apiDocFiles.map(file => 
            fs.access(path.join(context.projectPath, file))
              .then(() => true)
              .catch(() => false)
          )
        );
        
        if (!hasApiDocs.some(exists => exists)) {
          // Check for JSDoc/TSDoc in source files
          const filesWithoutDocs = sourceFiles.filter(file => {
            const hasJsDoc = file.content.includes('/**') && file.content.includes('*/');
            return !hasJsDoc;
          });
          
          if (filesWithoutDocs.length > 0) {
            return [{
              message: 'No API documentation found. Create API.md or add JSDoc comments',
              files: filesWithoutDocs.map(f => f.path)
            }];
          }
        }
        
        return [];
      }
    });

    this.registerRule({
      id: 'DOC-3',
      name: 'Changelog Maintenance',
      description: 'CHANGELOG.md must be maintained',
      level: 5,
      category: 'documentation',
      severity: 'info',
      check: async (context) => {
        if (!context.config?.documentation?.requireChangelog) return [];
        
        const changelogPath = path.join(context.projectPath, 'CHANGELOG.md');
        
        try {
          const content = await fs.readFile(changelogPath, 'utf8');
          
          // Check if changelog follows Keep a Changelog format
          const hasUnreleased = content.includes('## [Unreleased]') || content.includes('## Unreleased');
          const hasVersions = /## \[?\d+\.\d+\.\d+\]?/.test(content);
          const hasCategories = ['Added', 'Changed', 'Deprecated', 'Removed', 'Fixed', 'Security']
            .some(cat => content.includes(`### ${cat}`));
          
          const violations = [];
          
          if (!hasUnreleased) {
            violations.push({
              message: 'CHANGELOG.md should have an [Unreleased] section'
            });
          }
          
          if (!hasVersions) {
            violations.push({
              message: 'CHANGELOG.md should contain version entries'
            });
          }
          
          if (!hasCategories) {
            violations.push({
              message: 'CHANGELOG.md should use standard categories (Added, Changed, etc.)'
            });
          }
          
          // Check if changelog is up to date
          const lastCommitDate = new Date(context.lastCommitDate);
          const stats = await fs.stat(changelogPath);
          const changelogDate = new Date(stats.mtime);
          const daysSinceUpdate = (lastCommitDate - changelogDate) / (1000 * 60 * 60 * 24);
          
          if (daysSinceUpdate > 30) {
            violations.push({
              message: `CHANGELOG.md hasn't been updated in ${Math.floor(daysSinceUpdate)} days`
            });
          }
          
          return violations;
        } catch (error) {
          return [{
            message: 'CHANGELOG.md not found'
          }];
        }
      },
      fix: async (context) => {
        const changelogPath = path.join(context.projectPath, 'CHANGELOG.md');
        const template = `# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- New features that have been added

### Changed
- Changes to existing functionality

### Deprecated
- Features that will be removed in upcoming releases

### Removed
- Features that have been removed

### Fixed
- Bug fixes

### Security
- Security improvements and vulnerability fixes

## [1.0.0] - ${new Date().toISOString().split('T')[0]}

### Added
- Initial release
`;
        
        await fs.writeFile(changelogPath, template);
        return true;
      }
    });

    this.registerRule({
      id: 'DOC-4',
      name: 'Code Comments',
      description: 'Code must be properly documented with comments',
      level: 5,
      category: 'documentation',
      severity: 'warning',
      check: async (context) => {
        if (!context.config?.documentation?.requireJsdoc) return [];
        
        const violations = [];
        const sourceFiles = context.files.filter(f => 
          (f.path.endsWith('.js') || f.path.endsWith('.ts')) &&
          !f.path.includes('node_modules') &&
          !f.path.includes('.test.') &&
          !f.path.includes('.spec.')
        );
        
        for (const file of sourceFiles) {
          const content = file.content;
          const lines = content.split('\n');
          
          // Check for file-level documentation
          if (!content.startsWith('/**') && !content.startsWith('//')) {
            violations.push({
              file: file.path,
              line: 1,
              message: 'File should start with a documentation comment'
            });
          }
          
          // Check for function documentation
          const functionRegex = /^\s*(export\s+)?(async\s+)?function\s+(\w+)\s*\(/gm;
          const classRegex = /^\s*(export\s+)?class\s+(\w+)/gm;
          const arrowFunctionRegex = /^\s*(export\s+)?const\s+(\w+)\s*=\s*(async\s*)?\(/gm;
          
          let match;
          
          // Check functions
          while ((match = functionRegex.exec(content)) !== null) {
            const lineNum = content.substring(0, match.index).split('\n').length;
            const prevLine = lines[lineNum - 2];
            
            if (!prevLine || (!prevLine.includes('*/') && !prevLine.includes('//'))) {
              violations.push({
                file: file.path,
                line: lineNum,
                function: match[3],
                message: `Function '${match[3]}' lacks documentation`
              });
            }
          }
          
          // Check classes
          while ((match = classRegex.exec(content)) !== null) {
            const lineNum = content.substring(0, match.index).split('\n').length;
            const prevLine = lines[lineNum - 2];
            
            if (!prevLine || !prevLine.includes('*/')) {
              violations.push({
                file: file.path,
                line: lineNum,
                class: match[2],
                message: `Class '${match[2]}' lacks documentation`
              });
            }
          }
          
          // Check arrow functions
          while ((match = arrowFunctionRegex.exec(content)) !== null) {
            const lineNum = content.substring(0, match.index).split('\n').length;
            const prevLine = lines[lineNum - 2];
            
            if (!prevLine || (!prevLine.includes('*/') && !prevLine.includes('//'))) {
              violations.push({
                file: file.path,
                line: lineNum,
                function: match[2],
                message: `Arrow function '${match[2]}' lacks documentation`
              });
            }
          }
        }
        
        return violations;
      }
    });

    this.registerRule({
      id: 'DOC-5',
      name: 'License File',
      description: 'Project must have a LICENSE file',
      level: 5,
      category: 'documentation',
      severity: 'error',
      check: async (context) => {
        const licenseFiles = ['LICENSE', 'LICENSE.md', 'LICENSE.txt', 'LICENCE'];
        
        const hasLicense = await Promise.all(
          licenseFiles.map(file => 
            fs.access(path.join(context.projectPath, file))
              .then(() => true)
              .catch(() => false)
          )
        );
        
        if (!hasLicense.some(exists => exists)) {
          return [{
            message: 'No LICENSE file found'
          }];
        }
        
        return [];
      }
    });
  }

  async loadHooks() {
    // Pre-commit hook to check documentation
    this.registerHook('pre-commit', async (context) => {
      logger.info('📚 Checking documentation...');
      
      // Check if README was modified
      const modifiedFiles = context.stagedFiles || [];
      const readmeModified = modifiedFiles.some(f => f.toLowerCase().includes('readme'));
      
      if (readmeModified) {
        logger.success('✅ README.md updated');
      }
      
      // Check if CHANGELOG needs update
      const hasCodeChanges = modifiedFiles.some(f => 
        f.endsWith('.js') || f.endsWith('.ts') || f.endsWith('.jsx') || f.endsWith('.tsx')
      );
      const changelogModified = modifiedFiles.some(f => f.toLowerCase().includes('changelog'));
      
      if (hasCodeChanges && !changelogModified) {
        logger.warn('⚠️  Consider updating CHANGELOG.md for these changes');
      }
      
      return true;
    });
  }

  async loadValidators() {
    // Documentation structure validator
    this.registerValidator('docs-structure', async (projectPath) => {
      const docsDir = path.join(projectPath, 'docs');
      
      try {
        const stats = await fs.stat(docsDir);
        if (!stats.isDirectory()) {
          return {
            valid: false,
            message: 'docs exists but is not a directory'
          };
        }
        
        const files = await fs.readdir(docsDir);
        if (files.length === 0) {
          return {
            valid: false,
            message: 'docs directory is empty'
          };
        }
        
        return { valid: true };
      } catch (error) {
        // docs directory doesn't exist, which might be okay
        return { valid: true };
      }
    });

    // Documentation tools validator
    this.registerValidator('doc-tools', async (projectPath) => {
      try {
        const packageJsonPath = path.join(projectPath, 'package.json');
        const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf8'));
        
        const docTools = ['jsdoc', 'typedoc', 'documentation', 'docusaurus'];
        const hasDocTool = docTools.some(tool => 
          packageJson.devDependencies?.[tool] || 
          packageJson.dependencies?.[tool] ||
          packageJson.scripts?.[`docs`] ||
          packageJson.scripts?.[`doc`]
        );
        
        if (!hasDocTool) {
          return {
            valid: false,
            message: 'No documentation generation tools configured'
          };
        }
        
        return { valid: true };
      } catch (error) {
        return {
          valid: false,
          message: 'Unable to check for documentation tools'
        };
      }
    });
  }
}

// Export singleton instance
export default new DocumentationModule();