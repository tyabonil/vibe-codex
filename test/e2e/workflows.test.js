/**
 * End-to-end tests for common vibe-codex workflows
 */

const fs = require("fs-extra");
const path = require("path");
const { execSync } = require("child_process");
const os = require("os");

// These are actual E2E tests - they create temporary directories and run real commands
describe("E2E: Common Workflows", () => {
  let testDir;
  let originalCwd;

  beforeEach(async () => {
    // Create temporary test directory
    testDir = path.join(os.tmpdir(), `vibe-codex-e2e-${Date.now()}`);
    await fs.ensureDir(testDir);
    
    // Initialize git repo
    execSync("git init", { cwd: testDir });
    execSync('git config user.email "test@example.com"', { cwd: testDir });
    execSync('git config user.name "Test User"', { cwd: testDir });
    
    // Save current directory and switch to test directory
    originalCwd = process.cwd();
    process.chdir(testDir);
  });

  afterEach(async () => {
    // Switch back to original directory
    process.chdir(originalCwd);
    
    // Clean up test directory
    await fs.remove(testDir);
  });

  describe("New Project Setup", () => {
    it("should initialize a web project with preset", async () => {
      // Create package.json
      await fs.writeJSON("package.json", {
        name: "test-project",
        version: "1.0.0"
      });
      
      // Run init command
      const output = execSync(
        "npx vibe-codex init --type=web --preset",
        { encoding: "utf8" }
      );
      
      // Check configuration created
      expect(await fs.pathExists(".vibe-codex.json")).toBe(true);
      
      const config = await fs.readJSON(".vibe-codex.json");
      expect(config.projectType).toBe("web");
      expect(config.modules.core.enabled).toBe(true);
      expect(config.modules.testing.enabled).toBe(true);
      
      // Check git hooks installed
      expect(await fs.pathExists(".git/hooks/pre-commit")).toBe(true);
      expect(await fs.pathExists(".git/hooks/commit-msg")).toBe(true);
    });

    it("should initialize with specific modules", async () => {
      await fs.writeJSON("package.json", {
        name: "test-api",
        version: "1.0.0"
      });
      
      execSync(
        "npx vibe-codex init --type=api --modules=core,testing,documentation",
        { encoding: "utf8" }
      );
      
      const config = await fs.readJSON(".vibe-codex.json");
      expect(Object.keys(config.modules)).toEqual(
        expect.arrayContaining(["core", "testing", "documentation"])
      );
      expect(config.modules.deployment).toBeUndefined();
    });
  });

  describe("Validation Workflow", () => {
    beforeEach(async () => {
      // Initialize vibe-codex
      await fs.writeJSON("package.json", {
        name: "test-project",
        version: "1.0.0",
        scripts: { test: "echo 'test'" }
      });
      
      execSync("npx vibe-codex init --type=web --minimal", {
        encoding: "utf8"
      });
    });

    it("should detect security violations", async () => {
      // Create file with API key
      await fs.writeFile("config.js", `
        const config = {
          api_key = "sk-1234567890abcdef",
          endpoint: "https://api.example.com"
        };
      `);
      
      let validationFailed = false;
      try {
        execSync("npx vibe-codex validate", { encoding: "utf8" });
      } catch (error) {
        validationFailed = true;
        expect(error.stdout).toContain("SEC-001");
        expect(error.stdout).toContain("API key found");
      }
      
      expect(validationFailed).toBe(true);
    });

    it("should pass validation for clean project", async () => {
      // Create proper project structure
      await fs.writeFile("README.md", "# Test Project");
      await fs.writeFile(".env.example", "API_KEY=your_key_here");
      await fs.writeFile(".gitignore", ".env\nnode_modules/");
      
      const output = execSync("npx vibe-codex validate", {
        encoding: "utf8"
      });
      
      expect(output).toContain("All validation rules passed");
    });
  });

  describe("Git Hook Integration", () => {
    beforeEach(async () => {
      await fs.writeJSON("package.json", {
        name: "test-project",
        version: "1.0.0"
      });
      
      execSync("npx vibe-codex init --type=web --minimal", {
        encoding: "utf8"
      });
    });

    it("should block commits with secrets", async () => {
      // Create file with secret
      await fs.writeFile("secret.js", 'const password = "super_secret_123";');
      execSync("git add secret.js");
      
      let commitFailed = false;
      try {
        execSync('git commit -m "Add secret"');
      } catch (error) {
        commitFailed = true;
        expect(error.message).toContain("commit");
      }
      
      expect(commitFailed).toBe(true);
    });

    it("should allow commits without violations", async () => {
      // Create clean file
      await fs.writeFile("index.js", 'console.log("Hello World");');
      execSync("git add index.js");
      
      // This should succeed
      execSync('git commit -m "feat: add index file"');
      
      // Check commit was created
      const log = execSync("git log --oneline", { encoding: "utf8" });
      expect(log).toContain("feat: add index file");
    });

    it("should validate commit message format", async () => {
      await fs.writeFile("test.js", "// test");
      execSync("git add test.js");
      
      let commitFailed = false;
      try {
        execSync('git commit -m "bad commit message"');
      } catch (error) {
        commitFailed = true;
      }
      
      expect(commitFailed).toBe(true);
    });
  });

  describe("Configuration Management", () => {
    beforeEach(async () => {
      await fs.writeJSON("package.json", {
        name: "test-project",
        version: "1.0.0"
      });
      
      execSync("npx vibe-codex init --type=web --preset", {
        encoding: "utf8"
      });
    });

    it("should list configuration", async () => {
      const output = execSync("npx vibe-codex config --list", {
        encoding: "utf8"
      });
      
      expect(output).toContain("projectType");
      expect(output).toContain("modules");
    });

    it("should get specific configuration value", async () => {
      const output = execSync(
        "npx vibe-codex config --get testing.coverage.threshold",
        { encoding: "utf8" }
      );
      
      expect(output).toContain("80");
    });

    it("should set configuration value", async () => {
      execSync("npx vibe-codex config --set testing.coverage.threshold 90");
      
      const config = await fs.readJSON(".vibe-codex.json");
      expect(config.modules.testing.coverage.threshold).toBe(90);
    });
  });

  describe("CI/CD Integration", () => {
    beforeEach(async () => {
      await fs.writeJSON("package.json", {
        name: "test-project",
        version: "1.0.0"
      });
      
      execSync("npx vibe-codex init --type=web --preset", {
        encoding: "utf8"
      });
    });

    it("should output JSON format for CI", async () => {
      const output = execSync(
        "npx vibe-codex validate --format json",
        { encoding: "utf8" }
      );
      
      const result = JSON.parse(output);
      expect(result).toHaveProperty("violations");
      expect(result).toHaveProperty("warnings");
      expect(result).toHaveProperty("summary");
    });

    it("should fail in CI mode with warnings", async () => {
      // Remove test directory to trigger warning
      await fs.remove("test");
      
      let failed = false;
      try {
        execSync("npx vibe-codex validate --ci");
      } catch (error) {
        failed = true;
        expect(error.status).toBe(1);
      }
      
      expect(failed).toBe(true);
    });
  });
});