/**
 * Patterns module - Code organization and development pattern rules
 */
import { RuleModule } from '../base.js';
import fs from 'fs/promises';
import path from 'path';

export class PatternsModule extends RuleModule {
  constructor() {
    super({
      name: 'patterns',
      version: '1.0.0',
      description: 'Code organization, architecture patterns, and best practices',
      dependencies: [],
      options: {
        maxFileLength: 500,
        maxFunctionLength: 50,
        maxComplexity: 10,
        requireIndexFiles: true,
        enforceNamingConventions: true
      }
    });
  }

  async loadRules() {
    // Level 5: Code Pattern Rules
    this.registerRule({
      id: 'PATTERN-1',
      name: 'File Organization',
      description: 'Files should be organized in a logical structure',
      level: 5,
      category: 'patterns',
      severity: 'warning',
      check: async (context) => {
        const violations = [];
        
        // Check for common directory structure
        const expectedDirs = ['src', 'lib', 'components', 'utils', 'services', 'models'];
        const hasSrcDir = await fs.access(path.join(context.projectPath, 'src'))
          .then(() => true)
          .catch(() => false);
        
        if (hasSrcDir) {
          // Check for deeply nested files
          const sourceFiles = context.files.filter(f => f.path.includes('/src/'));
          
          for (const file of sourceFiles) {
            const depth = file.path.split('/').length - 2; // Subtract project root and filename
            if (depth > 5) {
              violations.push({
                file: file.path,
                depth,
                message: `File is too deeply nested (${depth} levels)`
              });
            }
          }
          
          // Check for files in wrong locations
          const testFilesInSrc = sourceFiles.filter(f => 
            (f.path.includes('.test.') || f.path.includes('.spec.')) &&
            !f.path.includes('__tests__') &&
            !f.path.includes('test/')
          );
          
          for (const file of testFilesInSrc) {
            violations.push({
              file: file.path,
              message: 'Test files should be in __tests__ directory or test/ folder'
            });
          }
        }
        
        // Check for mixed concerns in directories
        const directories = new Map();
        for (const file of context.files) {
          const dir = path.dirname(file.path);
          if (!directories.has(dir)) {
            directories.set(dir, []);
          }
          directories.get(dir).push(file);
        }
        
        for (const [dir, files] of directories) {
          const hasComponents = files.some(f => f.path.match(/\.(jsx|tsx)$/));
          const hasUtils = files.some(f => f.path.includes('util') || f.path.includes('helper'));
          const hasModels = files.some(f => f.path.includes('model') || f.path.includes('schema'));
          
          const concerns = [hasComponents, hasUtils, hasModels].filter(Boolean).length;
          if (concerns > 1) {
            violations.push({
              directory: dir,
              message: 'Directory contains mixed concerns (components, utils, models)'
            });
          }
        }
        
        return violations;
      }
    });

    this.registerRule({
      id: 'PATTERN-2',
      name: 'File Length',
      description: 'Files should not be too long',
      level: 5,
      category: 'patterns',
      severity: 'warning',
      check: async (context) => {
        const violations = [];
        const maxLength = context.config?.patterns?.maxFileLength || this.options.maxFileLength;
        
        const sourceFiles = context.files.filter(f => 
          (f.path.endsWith('.js') || f.path.endsWith('.ts') || 
           f.path.endsWith('.jsx') || f.path.endsWith('.tsx')) &&
          !f.path.includes('node_modules') &&
          !f.path.includes('.min.')
        );
        
        for (const file of sourceFiles) {
          const lines = file.content.split('\n').length;
          if (lines > maxLength) {
            violations.push({
              file: file.path,
              lines,
              maxLength,
              message: `File has ${lines} lines (max: ${maxLength})`
            });
          }
        }
        
        return violations;
      }
    });

    this.registerRule({
      id: 'PATTERN-3',
      name: 'Function Complexity',
      description: 'Functions should not be too complex',
      level: 5,
      category: 'patterns',
      severity: 'warning',
      check: async (context) => {
        const violations = [];
        const maxComplexity = context.config?.patterns?.maxComplexity || this.options.maxComplexity;
        const maxLength = context.config?.patterns?.maxFunctionLength || this.options.maxFunctionLength;
        
        const sourceFiles = context.files.filter(f => 
          (f.path.endsWith('.js') || f.path.endsWith('.ts')) &&
          !f.path.includes('node_modules')
        );
        
        for (const file of sourceFiles) {
          const content = file.content;
          
          // Simple complexity check based on control flow statements
          const functionRegex = /function\s+(\w+)|(\w+)\s*:\s*function|(\w+)\s*=\s*(?:async\s*)?\(/g;
          let match;
          
          while ((match = functionRegex.exec(content)) !== null) {
            const functionName = match[1] || match[2] || match[3];
            const startIndex = match.index;
            
            // Find the function body
            let braceCount = 0;
            let inFunction = false;
            let functionBody = '';
            
            for (let i = startIndex; i < content.length; i++) {
              if (content[i] === '{') {
                braceCount++;
                inFunction = true;
              } else if (content[i] === '}') {
                braceCount--;
                if (braceCount === 0 && inFunction) {
                  functionBody = content.substring(startIndex, i + 1);
                  break;
                }
              }
            }
            
            if (functionBody) {
              // Count complexity indicators
              const complexityIndicators = [
                /\bif\b/g,
                /\belse\b/g,
                /\bfor\b/g,
                /\bwhile\b/g,
                /\bdo\b/g,
                /\bswitch\b/g,
                /\bcase\b/g,
                /\bcatch\b/g,
                /\?\s*:/g // ternary operators
              ];
              
              let complexity = 1; // Base complexity
              for (const indicator of complexityIndicators) {
                const matches = functionBody.match(indicator);
                if (matches) {
                  complexity += matches.length;
                }
              }
              
              if (complexity > maxComplexity) {
                const line = content.substring(0, startIndex).split('\n').length;
                violations.push({
                  file: file.path,
                  line,
                  function: functionName,
                  complexity,
                  maxComplexity,
                  message: `Function '${functionName}' has complexity ${complexity} (max: ${maxComplexity})`
                });
              }
              
              // Check function length
              const functionLines = functionBody.split('\n').length;
              if (functionLines > maxLength) {
                const line = content.substring(0, startIndex).split('\n').length;
                violations.push({
                  file: file.path,
                  line,
                  function: functionName,
                  lines: functionLines,
                  maxLength,
                  message: `Function '${functionName}' has ${functionLines} lines (max: ${maxLength})`
                });
              }
            }
          }
        }
        
        return violations;
      }
    });

    this.registerRule({
      id: 'PATTERN-4',
      name: 'Naming Conventions',
      description: 'Code should follow consistent naming conventions',
      level: 5,
      category: 'patterns',
      severity: 'info',
      check: async (context) => {
        if (!context.config?.patterns?.enforceNamingConventions) return [];
        
        const violations = [];
        const sourceFiles = context.files.filter(f => 
          (f.path.endsWith('.js') || f.path.endsWith('.ts')) &&
          !f.path.includes('node_modules')
        );
        
        for (const file of sourceFiles) {
          const content = file.content;
          const lines = content.split('\n');
          
          // Check variable naming (camelCase)
          const varRegex = /(?:const|let|var)\s+([a-z_$][\w$]*)/g;
          let match;
          
          while ((match = varRegex.exec(content)) !== null) {
            const varName = match[1];
            if (varName.includes('_') && !varName.startsWith('_')) {
              const line = content.substring(0, match.index).split('\n').length;
              violations.push({
                file: file.path,
                line,
                variable: varName,
                message: `Variable '${varName}' should use camelCase`
              });
            }
          }
          
          // Check class naming (PascalCase)
          const classRegex = /class\s+([A-Za-z_$][\w$]*)/g;
          while ((match = classRegex.exec(content)) !== null) {
            const className = match[1];
            if (!/^[A-Z]/.test(className)) {
              const line = content.substring(0, match.index).split('\n').length;
              violations.push({
                file: file.path,
                line,
                class: className,
                message: `Class '${className}' should use PascalCase`
              });
            }
          }
          
          // Check constant naming (UPPER_SNAKE_CASE)
          const constRegex = /const\s+([A-Z_]+)\s*=/g;
          while ((match = constRegex.exec(content)) !== null) {
            const constName = match[1];
            if (constName === constName.toUpperCase() && constName.length > 1) {
              // This is likely a constant, check if it follows UPPER_SNAKE_CASE
              if (!/^[A-Z_]+$/.test(constName)) {
                const line = content.substring(0, match.index).split('\n').length;
                violations.push({
                  file: file.path,
                  line,
                  constant: constName,
                  message: `Constant '${constName}' should use UPPER_SNAKE_CASE`
                });
              }
            }
          }
        }
        
        // Check file naming conventions
        for (const file of context.files) {
          const basename = path.basename(file.path, path.extname(file.path));
          
          // React components should be PascalCase
          if ((file.path.endsWith('.jsx') || file.path.endsWith('.tsx')) && 
              file.path.includes('components/') &&
              !/^[A-Z]/.test(basename)) {
            violations.push({
              file: file.path,
              message: 'React component files should use PascalCase'
            });
          }
          
          // Test files should follow naming convention
          if (file.path.includes('.test.') || file.path.includes('.spec.')) {
            const testPattern = /\.(test|spec)\.(js|ts|jsx|tsx)$/;
            if (!testPattern.test(file.path)) {
              violations.push({
                file: file.path,
                message: 'Test files should follow pattern: *.test.js or *.spec.js'
              });
            }
          }
        }
        
        return violations;
      }
    });

    this.registerRule({
      id: 'PATTERN-5',
      name: 'Index Files',
      description: 'Directories should have index files for exports',
      level: 5,
      category: 'patterns',
      severity: 'info',
      check: async (context) => {
        if (!context.config?.patterns?.requireIndexFiles) return [];
        
        const violations = [];
        
        // Get all directories with source files
        const directories = new Set();
        const sourceFiles = context.files.filter(f => 
          (f.path.includes('/src/') || f.path.includes('/lib/')) &&
          (f.path.endsWith('.js') || f.path.endsWith('.ts')) &&
          !f.path.includes('node_modules')
        );
        
        for (const file of sourceFiles) {
          const dir = path.dirname(file.path);
          directories.add(dir);
        }
        
        // Check each directory for index file
        for (const dir of directories) {
          const filesInDir = sourceFiles.filter(f => path.dirname(f.path) === dir);
          
          // Skip if only test files
          const nonTestFiles = filesInDir.filter(f => 
            !f.path.includes('.test.') && !f.path.includes('.spec.')
          );
          
          if (nonTestFiles.length > 1) {
            const hasIndex = filesInDir.some(f => 
              path.basename(f.path) === 'index.js' || 
              path.basename(f.path) === 'index.ts'
            );
            
            if (!hasIndex) {
              violations.push({
                directory: dir,
                fileCount: nonTestFiles.length,
                message: `Directory with ${nonTestFiles.length} files should have an index file`
              });
            }
          }
        }
        
        return violations;
      }
    });

    this.registerRule({
      id: 'PATTERN-6',
      name: 'Import Organization',
      description: 'Imports should be organized and grouped',
      level: 5,
      category: 'patterns',
      severity: 'info',
      check: async (context) => {
        const violations = [];
        const sourceFiles = context.files.filter(f => 
          (f.path.endsWith('.js') || f.path.endsWith('.ts') ||
           f.path.endsWith('.jsx') || f.path.endsWith('.tsx')) &&
          !f.path.includes('node_modules')
        );
        
        for (const file of sourceFiles) {
          const lines = file.content.split('\n');
          const importLines = [];
          let lastImportIndex = -1;
          
          // Find all import statements
          lines.forEach((line, index) => {
            if (line.trim().startsWith('import ')) {
              importLines.push({ line, index });
              lastImportIndex = index;
            }
          });
          
          if (importLines.length > 3) {
            // Check for mixed import types
            let hasExternalImports = false;
            let hasInternalImports = false;
            let hasRelativeImports = false;
            
            for (const { line } of importLines) {
              if (line.includes('from \'./') || line.includes('from \"./')) {
                hasRelativeImports = true;
              } else if (line.includes('from \'@') || line.includes('from \"@') ||
                         line.includes('from \'~') || line.includes('from \"~')) {
                hasInternalImports = true;
              } else {
                hasExternalImports = true;
              }
            }
            
            // Check if imports are grouped
            if (hasExternalImports && hasInternalImports && hasRelativeImports) {
              let currentType = null;
              let switchCount = 0;
              
              for (const { line } of importLines) {
                let importType;
                if (line.includes('from \'./') || line.includes('from \"./')) {
                  importType = 'relative';
                } else if (line.includes('from \'@') || line.includes('from \"@')) {
                  importType = 'internal';
                } else {
                  importType = 'external';
                }
                
                if (currentType && currentType !== importType) {
                  switchCount++;
                }
                currentType = importType;
              }
              
              if (switchCount > 2) {
                violations.push({
                  file: file.path,
                  line: importLines[0].index + 1,
                  message: 'Imports should be grouped by type (external, internal, relative)'
                });
              }
            }
            
            // Check for blank lines between import groups
            for (let i = 1; i < importLines.length; i++) {
              const prevIndex = importLines[i - 1].index;
              const currIndex = importLines[i].index;
              
              if (currIndex - prevIndex > 2) {
                violations.push({
                  file: file.path,
                  line: currIndex + 1,
                  message: 'Unnecessary blank lines between imports'
                });
              }
            }
          }
        }
        
        return violations;
      }
    });
  }

  async loadHooks() {
    // Pre-commit hook for pattern checking
    this.registerHook('pre-commit', async (context) => {
      const modifiedFiles = context.stagedFiles || [];
      const sourceFiles = modifiedFiles.filter(f => 
        (f.endsWith('.js') || f.endsWith('.ts') || 
         f.endsWith('.jsx') || f.endsWith('.tsx')) &&
        !f.includes('node_modules')
      );
      
      if (sourceFiles.length > 0) {
        logger.info('🎯 Checking code patterns...');
        
        // Quick check for common issues
        let hasIssues = false;
        
        for (const file of sourceFiles) {
          try {
            const content = await fs.readFile(file, 'utf8');
            
            // Check for console.log statements
            if (content.includes('console.log') && !file.includes('test')) {
              logger.warn(`⚠️  ${file} contains console.log statements`);
              hasIssues = true;
            }
            
            // Check for TODO comments
            if (content.includes('TODO:') || content.includes('FIXME:')) {
              logger.warn(`⚠️  ${file} contains TODO/FIXME comments`);
              hasIssues = true;
            }
          } catch (error) {
            // File might have been deleted
          }
        }
        
        if (!hasIssues) {
          logger.success('✅ Code patterns look good');
        }
      }
      
      return true;
    });
  }

  async loadValidators() {
    // Architecture validator
    this.registerValidator('architecture', async (projectPath) => {
      const errors = [];
      
      // Check for common architecture patterns
      const architecturePatterns = [
        { dir: 'src/components', type: 'Component-based' },
        { dir: 'src/controllers', type: 'MVC' },
        { dir: 'src/services', type: 'Service-oriented' },
        { dir: 'src/domain', type: 'Domain-driven' }
      ];
      
      const detectedPatterns = [];
      for (const pattern of architecturePatterns) {
        try {
          await fs.access(path.join(projectPath, pattern.dir));
          detectedPatterns.push(pattern.type);
        } catch {
          // Directory doesn't exist
        }
      }
      
      if (detectedPatterns.length > 2) {
        errors.push('Mixed architecture patterns detected');
      }
      
      return {
        valid: errors.length === 0,
        patterns: detectedPatterns,
        errors
      };
    });

    // Code quality validator
    this.registerValidator('code-quality', async (projectPath) => {
      try {
        // Check for linting configuration
        const lintConfigs = [
          '.eslintrc',
          '.eslintrc.js',
          '.eslintrc.json',
          '.eslintrc.yml',
          'eslint.config.js'
        ];
        
        const hasLintConfig = await Promise.all(
          lintConfigs.map(config => 
            fs.access(path.join(projectPath, config))
              .then(() => true)
              .catch(() => false)
          )
        );
        
        if (!hasLintConfig.some(exists => exists)) {
          return {
            valid: false,
            message: 'No ESLint configuration found'
          };
        }
        
        return { valid: true };
      } catch (error) {
        return {
          valid: false,
          message: 'Unable to validate code quality configuration'
        };
      }
    });
  }
}

// Export singleton instance
export default new PatternsModule();