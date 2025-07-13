const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

describe('Test Quality Check', () => {
  const scriptPath = path.join(__dirname, '../templates/hooks/test-quality-check.sh');
  const testDir = path.join(__dirname, 'temp-test-quality');
  
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

  describe('Anti-pattern detection', () => {
    test('should detect .only() in test files', () => {
      // Create test file with .only()
      const testFile = path.join(testDir, 'example.test.js');
      fs.writeFileSync(testFile, `
        describe('My tests', () => {
          it.only('should do something', () => {
            expect(true).toBe(true);
          });
        });
      `);

      expect(() => {
        execSync(`cd ${testDir} && VIBE_CODEX_HOOK_TYPE="pre-commit" bash ${scriptPath}`, { 
          encoding: 'utf8' 
        });
      }).toThrow();
    });

    test('should detect .skip() in test files', () => {
      // Create test file with .skip()
      const testFile = path.join(testDir, 'example.spec.ts');
      fs.writeFileSync(testFile, `
        describe('My tests', () => {
          it.skip('should do something', () => {
            expect(true).toBe(true);
          });
        });
      `);

      expect(() => {
        execSync(`cd ${testDir} && VIBE_CODEX_HOOK_TYPE="pre-commit" bash ${scriptPath}`, { 
          encoding: 'utf8' 
        });
      }).toThrow();
    });

    test('should detect empty test descriptions', () => {
      // Create test file with empty description
      const testFile = path.join(testDir, 'empty.test.js');
      fs.writeFileSync(testFile, `
        describe('', () => {
          it('', () => {
            expect(true).toBe(true);
          });
        });
      `);

      expect(() => {
        execSync(`cd ${testDir} && VIBE_CODEX_HOOK_TYPE="pre-commit" bash ${scriptPath}`, { 
          encoding: 'utf8' 
        });
      }).toThrow();
    });

    test('should warn about console.log in tests', () => {
      // Create test file with console.log
      const testFile = path.join(testDir, 'console.test.js');
      fs.writeFileSync(testFile, `
        describe('My tests', () => {
          it('should log something', () => {
            console.log('debug info');
            expect(true).toBe(true);
          });
        });
      `);

      const output = execSync(`cd ${testDir} && bash ${scriptPath} 2>&1`, { 
        encoding: 'utf8' 
      });
      
      expect(output).toContain('Contains console statements');
      expect(output).toContain('Minor test quality issues found');
    });

    test('should pass clean test files', () => {
      // Create clean test file
      const testFile = path.join(testDir, 'clean.test.js');
      fs.writeFileSync(testFile, `
        describe('Clean tests', () => {
          it('should work correctly', () => {
            expect(1 + 1).toBe(2);
          });
          
          it('should handle errors', () => {
            expect(() => {
              throw new Error('test');
            }).toThrow();
          });
        });
      `);

      const output = execSync(`cd ${testDir} && bash ${scriptPath}`, { 
        encoding: 'utf8' 
      });
      
      expect(output).toContain('All test quality checks passed');
    });
  });

  describe('File pattern matching', () => {
    test('should find various test file patterns', () => {
      // Create different test file types
      fs.writeFileSync(path.join(testDir, 'unit.test.js'), 'it("test", () => {});');
      fs.writeFileSync(path.join(testDir, 'integration.spec.ts'), 'it("test", () => {});');
      fs.writeFileSync(path.join(testDir, 'test_example.py'), 'def test_something(): pass');
      fs.writeFileSync(path.join(testDir, 'example_spec.rb'), 'it "should work" do end');

      const output = execSync(`cd ${testDir} && bash ${scriptPath}`, { 
        encoding: 'utf8' 
      });
      
      expect(output).toContain('Found 4 test files to check');
    });

    test('should ignore node_modules', () => {
      // Create node_modules with test file
      const nodeModulesDir = path.join(testDir, 'node_modules');
      fs.mkdirSync(nodeModulesDir, { recursive: true });
      fs.writeFileSync(path.join(nodeModulesDir, 'bad.test.js'), 'it.only("bad", () => {});');
      
      // Create good test file
      fs.writeFileSync(path.join(testDir, 'good.test.js'), 'it("good", () => {});');

      const output = execSync(`cd ${testDir} && bash ${scriptPath}`, { 
        encoding: 'utf8' 
      });
      
      expect(output).toContain('Found 1 test files to check');
      expect(output).toContain('All test quality checks passed');
    });
  });

  describe('Python test support', () => {
    test('should detect pytest markers', () => {
      const testFile = path.join(testDir, 'test_example.py');
      fs.writeFileSync(testFile, `
import pytest

@pytest.mark.skip
def test_something():
    assert True
      `);

      expect(() => {
        execSync(`cd ${testDir} && VIBE_CODEX_HOOK_TYPE="pre-commit" bash ${scriptPath}`, { 
          encoding: 'utf8' 
        });
      }).toThrow();
    });
  });
});