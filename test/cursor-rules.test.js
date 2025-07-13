const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

describe('Cursor Rules Check', () => {
  const scriptPath = path.join(__dirname, '../templates/hooks/cursor-rules-check.sh');
  const testDir = path.join(__dirname, 'temp-cursor-test');
  
  beforeAll(() => {
    // Make sure the script exists
    expect(fs.existsSync(scriptPath)).toBe(true);
  });

  beforeEach(() => {
    // Create test directory
    if (!fs.existsSync(testDir)) {
      fs.mkdirSync(testDir, { recursive: true });
    }
  });

  afterEach(() => {
    // Clean up
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true, force: true });
    }
  });

  describe('File existence checks', () => {
    test('should warn when .cursorrules is missing', () => {
      const output = execSync(`cd ${testDir} && bash ${scriptPath}`, { 
        encoding: 'utf8' 
      });
      
      expect(output).toContain('No .cursorrules file found');
      expect(output).toContain('Consider adding cursor rules');
    });

    test('should warn when .cursorrules is empty', () => {
      // Create empty file
      fs.writeFileSync(path.join(testDir, '.cursorrules'), '');
      
      const output = execSync(`cd ${testDir} && bash ${scriptPath}`, { 
        encoding: 'utf8' 
      });
      
      expect(output).toContain('seems empty or too small');
    });

    test('should warn when .cursorrules is too small', () => {
      // Create very small file
      fs.writeFileSync(path.join(testDir, '.cursorrules'), 'Too short');
      
      const output = execSync(`cd ${testDir} && bash ${scriptPath}`, { 
        encoding: 'utf8' 
      });
      
      expect(output).toContain('seems empty or too small');
    });
  });

  describe('Content validation', () => {
    test('should pass with comprehensive rules', () => {
      const goodRules = `
# Cursor Rules for Our Project

## Code Style
- Use TypeScript for all new files
- Follow ESLint configuration
- Prefer functional components in React

## Testing Guidelines  
- Write tests for all new features
- Use Jest for unit tests
- Aim for 80% coverage

## Language Specifics
- TypeScript strict mode enabled
- No any types without justification
      `;
      
      fs.writeFileSync(path.join(testDir, '.cursorrules'), goodRules);
      
      const output = execSync(`cd ${testDir} && bash ${scriptPath}`, { 
        encoding: 'utf8' 
      });
      
      expect(output).toContain('looks good');
    });

    test('should warn about missing sections', () => {
      const incompleteRules = `
# Cursor Rules

Just some basic text without proper sections.
      `;
      
      fs.writeFileSync(path.join(testDir, '.cursorrules'), incompleteRules);
      
      const output = execSync(`cd ${testDir} && bash ${scriptPath}`, { 
        encoding: 'utf8' 
      });
      
      expect(output).toContain('might be incomplete');
      expect(output).toContain('No language-specific rules');
    });
  });

  describe('Script behavior', () => {
    test('should always exit with code 0', () => {
      // This is a non-blocking check
      let exitCode = 0;
      
      try {
        execSync(`cd ${testDir} && bash ${scriptPath}`, { encoding: 'utf8' });
      } catch (error) {
        exitCode = error.status;
      }
      
      expect(exitCode).toBe(0);
    });
  });
});