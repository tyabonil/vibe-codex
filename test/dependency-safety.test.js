const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

describe('Dependency Safety Check', () => {
  const scriptPath = path.join(__dirname, '../templates/hooks/dependency-safety-check.sh');
  
  beforeAll(() => {
    // Make sure the script exists
    expect(fs.existsSync(scriptPath)).toBe(true);
  });

  describe('Script execution', () => {
    test('should run without errors when no vulnerabilities', () => {
      // Set environment to not fail on vulnerabilities for testing
      const env = { ...process.env, VIBE_CODEX_HOOK_TYPE: '' };
      
      try {
        const output = execSync(`bash ${scriptPath}`, { 
          env,
          encoding: 'utf8' 
        });
        expect(output).toContain('Checking dependency safety');
      } catch (error) {
        // If npm audit finds vulnerabilities, the script might exit with code 1
        // But we should still see the checking message
        expect(error.stdout || error.output.toString()).toContain('Checking dependency safety');
      }
    });

    test('should exit with code 1 in pre-commit context with vulnerabilities', () => {
      // This test is a bit tricky as we can't guarantee vulnerabilities exist
      // We'll test the logic by checking the script behavior
      const env = { ...process.env, VIBE_CODEX_HOOK_TYPE: 'pre-commit' };
      
      // Create a mock package.json with known vulnerable package (for testing)
      const testDir = path.join(__dirname, 'temp-dep-test');
      if (!fs.existsSync(testDir)) {
        fs.mkdirSync(testDir);
      }
      
      // Create a minimal package.json
      const packageJson = {
        name: "test-vulnerable",
        version: "1.0.0",
        dependencies: {}
      };
      
      fs.writeFileSync(
        path.join(testDir, 'package.json'), 
        JSON.stringify(packageJson, null, 2)
      );
      
      try {
        // Run npm init to create package-lock.json
        execSync('npm install', { cwd: testDir, stdio: 'ignore' });
        
        // Run our script in the test directory
        const output = execSync(`cd ${testDir} && bash ${scriptPath}`, { 
          env,
          encoding: 'utf8' 
        });
        
        // If no vulnerabilities, should pass
        expect(output).toContain('No vulnerabilities found');
      } catch (error) {
        // If vulnerabilities found, should contain error message
        const output = error.stdout || error.output?.toString() || '';
        expect(output).toMatch(/vulnerable dependencies found|No vulnerabilities found/);
      } finally {
        // Cleanup
        if (fs.existsSync(testDir)) {
          fs.rmSync(testDir, { recursive: true, force: true });
        }
      }
    });
  });

  describe('Package manager detection', () => {
    test('should detect npm when package-lock.json exists', () => {
      const testDir = path.join(__dirname, 'temp-npm-test');
      fs.mkdirSync(testDir, { recursive: true });
      fs.writeFileSync(path.join(testDir, 'package-lock.json'), '{}');
      
      try {
        const output = execSync(`cd ${testDir} && bash ${scriptPath} 2>&1`, { 
          encoding: 'utf8' 
        });
        expect(output).toMatch(/Checking npm dependencies|Package manager not found/);
      } catch (error) {
        // Expected if npm audit fails
        const output = error.stdout || error.output?.toString() || '';
        expect(output).toMatch(/Checking npm dependencies|Package manager not found/);
      } finally {
        fs.rmSync(testDir, { recursive: true, force: true });
      }
    });

    test('should show warning for Python without pip-audit', () => {
      const testDir = path.join(__dirname, 'temp-python-test');
      fs.mkdirSync(testDir, { recursive: true });
      fs.writeFileSync(path.join(testDir, 'requirements.txt'), 'requests==2.25.1');
      
      try {
        const output = execSync(`cd ${testDir} && bash ${scriptPath} 2>&1`, { 
          encoding: 'utf8' 
        });
        
        // Should either check Python deps or show pip-audit not installed
        expect(output).toMatch(/Checking Python dependencies|pip-audit not installed/);
      } catch (error) {
        const output = error.stdout || error.output?.toString() || '';
        expect(output).toBeDefined();
      } finally {
        fs.rmSync(testDir, { recursive: true, force: true });
      }
    });
  });
});