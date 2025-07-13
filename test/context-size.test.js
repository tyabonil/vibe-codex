const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

describe('Context Size Check', () => {
  let tempDir;
  let originalCwd;

  beforeEach(() => {
    // Create temp directory
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'vibe-codex-test-'));
    originalCwd = process.cwd();
    process.chdir(tempDir);
    
    // Initialize git repo
    execSync('git init');
    execSync('git config user.email "test@example.com"');
    execSync('git config user.name "Test User"');
    
    // Copy the context-size-check.sh script
    const scriptPath = path.join(__dirname, '..', 'templates', 'hooks', 'context-size-check.sh');
    const destPath = path.join(tempDir, 'context-size-check.sh');
    fs.copyFileSync(scriptPath, destPath);
    fs.chmodSync(destPath, '755');
  });

  afterEach(() => {
    process.chdir(originalCwd);
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  test('should pass with no staged files', () => {
    const result = execSync('./context-size-check.sh', { encoding: 'utf8' });
    expect(result).toContain('No staged changes to check');
  });

  test('should warn about large file', () => {
    // Create a large file (>1000 lines)
    const largeFile = 'large.js';
    const content = Array(1100).fill('console.log("line");').join('\n');
    fs.writeFileSync(largeFile, content);
    
    execSync('git add .');
    
    const result = execSync('./context-size-check.sh', { encoding: 'utf8' });
    expect(result).toContain('Large files that may exceed context limits');
    expect(result).toContain('large.js (1099 lines)');
  });

  test('should warn about many files', () => {
    // Create 25 files (>20 threshold)
    for (let i = 1; i <= 25; i++) {
      fs.writeFileSync(`file${i}.js`, `console.log("file ${i}");`);
    }
    
    execSync('git add .');
    
    const result = execSync('./context-size-check.sh', { encoding: 'utf8' });
    // The script itself is also staged, so we expect 26 files
    expect(result).toMatch(/Too many files changed: \d+ \(max: 20\)/);
  });

  test('should pass with reasonable changes', () => {
    // Create a few small files
    fs.writeFileSync('file1.js', 'console.log("hello");');
    fs.writeFileSync('file2.js', 'console.log("world");');
    
    execSync('git add .');
    
    const result = execSync('./context-size-check.sh', { encoding: 'utf8' });
    expect(result).toContain('Context size is reasonable');
  });

  test('should read custom thresholds from config', () => {
    // Create config with custom thresholds
    const config = {
      contextThresholds: {
        maxLinesPerFile: 50,
        maxTotalLines: 100,
        maxFiles: 5
      }
    };
    fs.writeFileSync('.vibe-codex.json', JSON.stringify(config, null, 2));
    
    // Create 6 files (exceeds custom threshold of 5)
    for (let i = 1; i <= 6; i++) {
      fs.writeFileSync(`file${i}.js`, `console.log("file ${i}");`);
    }
    
    execSync('git add .');
    
    const result = execSync('./context-size-check.sh', { encoding: 'utf8' });
    // The script itself and config are also staged
    expect(result).toMatch(/Too many files changed: \d+ \(max: 5\)/);
  });

  test('should handle deleted files gracefully', () => {
    // Create and commit a file
    fs.writeFileSync('delete-me.js', 'console.log("delete me");');
    execSync('git add .');
    execSync('git commit -m "add file"');
    
    // Delete the file and stage the deletion
    fs.unlinkSync('delete-me.js');
    execSync('git add .');
    
    const result = execSync('./context-size-check.sh', { encoding: 'utf8' });
    expect(result).toContain('Context size is reasonable');
  });

  test('should always exit with code 0 (non-blocking)', () => {
    // Create a very large file
    const largeFile = 'huge.js';
    const content = Array(2000).fill('console.log("line");').join('\n');
    fs.writeFileSync(largeFile, content);
    
    execSync('git add .');
    
    // Should not throw even with warnings
    expect(() => {
      execSync('./context-size-check.sh', { encoding: 'utf8' });
    }).not.toThrow();
  });
});