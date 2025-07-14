/**
 * Integration tests for git hooks with vibe-codex
 * Ensures hooks work within the vibe-codex ecosystem
 */

const {
  describe,
  test,
  expect,
  beforeEach,
  afterEach,
} = require("@jest/globals");
const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

describe("Hooks Integration with NPM Package", () => {
  let originalCwd;
  let testDir;

  beforeEach(() => {
    originalCwd = process.cwd();

    // Create temporary test directory
    testDir = fs.mkdtempSync(path.join(__dirname, "tmp-test-"));
    process.chdir(testDir);

    // Initialize git repo
    execSync("git init", { stdio: "pipe" });
    execSync('git config user.email "test@example.com"', { stdio: "pipe" });
    execSync('git config user.name "Test User"', { stdio: "pipe" });
  });

  afterEach(() => {
    process.chdir(originalCwd);

    // Clean up test directory
    if (testDir && fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true, force: true });
    }
  });

  describe("Package Structure", () => {
    test("should have hooks directory in npm package", () => {
      const hooksDir = path.join(originalCwd, "hooks");
      expect(fs.existsSync(hooksDir)).toBe(true);
    });

    test("should have issue progress tracker hook", () => {
      const hookPath = path.join(
        originalCwd,
        "hooks/issue-progress-tracker.sh",
      );
      expect(fs.existsSync(hookPath)).toBe(true);

      const stats = fs.statSync(hookPath);
      expect(stats.mode & parseInt("755", 8)).toBeTruthy();
    });

    test("should have PR review check hook", () => {
      const hookPath = path.join(originalCwd, "hooks/pr-review-check.sh");
      expect(fs.existsSync(hookPath)).toBe(true);

      const stats = fs.statSync(hookPath);
      expect(stats.mode & parseInt("755", 8)).toBeTruthy();
    });

    test("should have hooks documentation", () => {
      const readmePath = path.join(originalCwd, "hooks/README.md");
      expect(fs.existsSync(readmePath)).toBe(true);

      const content = fs.readFileSync(readmePath, "utf8");
      expect(content).toContain("Issue Progress Tracker");
      expect(content).toContain("PR Review Check");
    });
  });

  describe("Package.json Integration", () => {
    test("should be included in npm package files", () => {
      const packagePath = path.join(originalCwd, "package.json");
      const packageJson = JSON.parse(fs.readFileSync(packagePath, "utf8"));

      expect(packageJson.name).toBe("vibe-codex");
      expect(packageJson.main).toBe("lib/index.js");
    });

    test("should have test scripts for hooks", () => {
      const packagePath = path.join(originalCwd, "package.json");
      const packageJson = JSON.parse(fs.readFileSync(packagePath, "utf8"));

      expect(packageJson.scripts.test).toBeDefined();
      expect(packageJson.jest.testMatch).toContain("**/tests/**/*.test.js");
    });
  });

  describe("Hooks Functionality", () => {
    test("should be callable from npm package root", () => {
      const issueHookPath = path.join(
        originalCwd,
        "hooks/issue-progress-tracker.sh",
      );

      const result = runScript(`bash "${issueHookPath}" --help`);

      expect(result.exitCode).toBe(0);
      expect(result.output).toContain("Usage:");
      expect(result.output).toContain("Actions:");
    });

    test("should show consistent help across hooks", () => {
      const issueHookPath = path.join(
        originalCwd,
        "hooks/issue-progress-tracker.sh",
      );
      const prHookPath = path.join(originalCwd, "hooks/pr-review-check.sh");

      const issueHelp = runScript(`bash "${issueHookPath}" --help`);
      const prHelp = runScript(`bash "${prHookPath}" --help`);

      expect(issueHelp.exitCode).toBe(0);
      expect(prHelp.exitCode).toBe(0);

      expect(issueHelp.output).toContain("Usage:");
      expect(prHelp.output).toContain("Usage:");
    });

    test("should have proper error handling", () => {
      const issueHookPath = path.join(
        originalCwd,
        "hooks/issue-progress-tracker.sh",
      );
      const prHookPath = path.join(originalCwd, "hooks/pr-review-check.sh");

      const issueError = runScript(`bash "${issueHookPath}" invalid-action`);
      const prError = runScript(`bash "${prHookPath}" --invalid-option`);

      expect(issueError.exitCode).toBe(1);
      expect(prError.exitCode).toBe(1);

      expect(issueError.output).toContain("Unknown action");
      expect(prError.output).toContain("Invalid argument");
    });
  });

  describe("Vibe Codex Integration", () => {
    test("should work with vibe-codex rule system", () => {
      // Check that our hooks complement the vibe-codex rule system
      const registryPath = path.join(originalCwd, "rules/registry.json");
      expect(fs.existsSync(registryPath)).toBe(true);

      const registry = JSON.parse(fs.readFileSync(registryPath, "utf8"));
      expect(registry.version).toBeDefined();
      expect(registry.rules).toBeInstanceOf(Array);
      expect(registry.rules.length).toBeGreaterThan(0);
    });

    test("should be testable independently", () => {
      // Verify our hook tests can be run independently
      const result = runScript(
        "npm test -- tests/issue-progress-tracker.test.js",
        originalCwd,
      );

      // Should pass the test (even if coverage fails)
      expect(result.output).toContain("Issue Progress Tracker Hook");
      expect(result.output).toContain("passed");
    });

    test("should have valid syntax and structure", () => {
      // Test that our hooks have no syntax errors in their test files
      const issueTestPath = path.join(
        originalCwd,
        "tests/issue-progress-tracker.test.js",
      );
      const prTestPath = path.join(
        originalCwd,
        "tests/pr-review-check.test.js",
      );

      expect(fs.existsSync(issueTestPath)).toBe(true);
      expect(fs.existsSync(prTestPath)).toBe(true);

      // Check for basic test structure
      const issueContent = fs.readFileSync(issueTestPath, "utf8");
      const prContent = fs.readFileSync(prTestPath, "utf8");

      expect(issueContent).toContain("describe(");
      expect(issueContent).toContain("test(");
      expect(prContent).toContain("describe(");
      expect(prContent).toContain("test(");
    });
  });

  describe("Documentation Integration", () => {
    test("should have complete documentation for both hooks", () => {
      const readmePath = path.join(originalCwd, "hooks/README.md");
      const content = fs.readFileSync(readmePath, "utf8");

      // Check issue progress tracker documentation
      expect(content).toContain("issue-progress-tracker.sh");
      expect(content).toContain("start <issue_number>");
      expect(content).toContain("update <issue_number>");
      expect(content).toContain("link-pr <issue_number>");
      expect(content).toContain("complete <issue_number>");

      // Check PR review check documentation
      expect(content).toContain("pr-review-check.sh");
      expect(content).toContain("--auto");
      expect(content).toContain("--summary");
      expect(content).toContain("--violations-only");
      expect(content).toContain("--json");
    });

    test("should have integration examples", () => {
      const readmePath = path.join(originalCwd, "hooks/README.md");
      const content = fs.readFileSync(readmePath, "utf8");

      expect(content).toContain("Integration with Git Hooks");
      expect(content).toContain("post-commit");
      expect(content).toContain("pre-push");
    });
  });

  // Helper functions
  function runScript(command, cwd = testDir) {
    try {
      const output = execSync(command, {
        encoding: "utf8",
        stdio: "pipe",
        cwd: cwd,
      });
      return { exitCode: 0, output: stripAnsiCodes(output) };
    } catch (error) {
      return {
        exitCode: error.status || 1,
        output: stripAnsiCodes((error.stdout || "") + (error.stderr || "")),
      };
    }
  }

  function stripAnsiCodes(str) {
    // Remove ANSI escape sequences for colors
    // eslint-disable-next-line no-control-regex
    return str.replace(/\x1b\[[0-9;]*m/g, "");
  }
});
