/**
 * Tests for core module validation rules
 */

const fs = require("fs-extra");
const path = require("path");
const simpleGit = require("simple-git");
const CoreModule = require("../../lib/modules/core");
const FileScanner = require("../../lib/validator/file-scanner");

// Mock dependencies
jest.mock("fs-extra");
jest.mock("simple-git");
jest.mock("../../lib/validator/file-scanner");

describe("Core Module Validation", () => {
  let coreModule;
  let mockGit;
  let mockScanner;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock git
    mockGit = {
      checkIsRepo: jest.fn().mockResolvedValue(true),
      getRemotes: jest.fn().mockResolvedValue([{ name: "origin" }]),
      revparse: jest.fn().mockResolvedValue("feature/issue-123-test")
    };
    simpleGit.mockReturnValue(mockGit);
    
    // Mock file scanner
    mockScanner = {
      scanForSecrets: jest.fn().mockResolvedValue([]),
      scanForQualityIssues: jest.fn().mockResolvedValue([]),
      checkRequiredFiles: jest.fn().mockResolvedValue([]),
      checkTestCoverage: jest.fn().mockResolvedValue({
        sourceFiles: 10,
        testFiles: 8,
        coverage: 80,
        missingTests: []
      })
    };
    FileScanner.mockImplementation(() => mockScanner);
    
    // Initialize module
    coreModule = new CoreModule({
      enabled: true
    });
  });

  describe("Security Rules", () => {
    describe("SEC-001: No Secrets in Code", () => {
      it("should pass when no secrets found", async () => {
        mockScanner.scanForSecrets.mockResolvedValue([]);
        
        const result = await coreModule.validateNoSecrets();
        
        expect(result.violations).toHaveLength(0);
        expect(result.passed).toContainEqual(
          expect.objectContaining({
            rule: "SEC-001",
            message: "No secrets found in code"
          })
        );
      });

      it("should fail when API keys found", async () => {
        mockScanner.scanForSecrets.mockResolvedValue([
          {
            file: "src/config.js",
            line: 10,
            type: "API key",
            match: 'api_key = "sk-1234567890"',
            rule: "SEC-001"
          }
        ]);
        
        const result = await coreModule.validateNoSecrets();
        
        expect(result.violations).toHaveLength(1);
        expect(result.violations[0]).toMatchObject({
          rule: "SEC-001",
          message: expect.stringContaining("API key found"),
          file: "src/config.js",
          line: 10,
          severity: "error"
        });
      });

      it("should scan multiple file patterns", async () => {
        await coreModule.validateNoSecrets();
        
        expect(mockScanner.scanForSecrets).toHaveBeenCalledWith(
          expect.any(Array),
          expect.arrayContaining([
            "**/*.js",
            "**/*.ts",
            "**/*.py",
            "**/*.env*"
          ]),
          expect.any(Array)
        );
      });
    });

    describe("SEC-002: Environment File Security", () => {
      it("should pass when .env is in .gitignore", async () => {
        fs.pathExists.mockImplementation((file) => {
          return file === ".env" || file === ".gitignore";
        });
        fs.readFile.mockResolvedValue(".env\nnode_modules/\n");
        
        const result = await coreModule.validateEnvSecurity();
        
        expect(result.violations).toHaveLength(0);
      });

      it("should fail when .env exists but not in .gitignore", async () => {
        fs.pathExists.mockImplementation((file) => {
          return file === ".env" || file === ".gitignore";
        });
        fs.readFile.mockResolvedValue("node_modules/\n");
        
        const result = await coreModule.validateEnvSecurity();
        
        expect(result.violations).toContainEqual(
          expect.objectContaining({
            rule: "SEC-002",
            message: ".env file is not in .gitignore",
            severity: "error"
          })
        );
      });

      it("should check for .env.example when .env exists", async () => {
        fs.pathExists.mockImplementation((file) => {
          return file === ".env" || file === ".gitignore";
        });
        fs.readFile.mockResolvedValue(".env\n");
        
        const result = await coreModule.validateEnvSecurity();
        
        expect(result.violations).toContainEqual(
          expect.objectContaining({
            rule: "SEC-001",
            message: ".env exists but .env.example is missing"
          })
        );
      });
    });
  });

  describe("Workflow Rules", () => {
    describe("WORKFLOW-001: Branch Naming Convention", () => {
      it("should pass for valid branch names", async () => {
        mockGit.revparse.mockResolvedValue("feature/issue-123-add-feature");
        
        const result = await coreModule.validateBranchNaming();
        
        expect(result.passed).toContainEqual(
          expect.objectContaining({
            rule: "WORKFLOW-001",
            message: "Branch naming follows convention"
          })
        );
      });

      it("should fail for invalid branch names", async () => {
        mockGit.revparse.mockResolvedValue("my-feature");
        
        const result = await coreModule.validateBranchNaming();
        
        expect(result.warnings).toContainEqual(
          expect.objectContaining({
            rule: "WORKFLOW-001",
            message: expect.stringContaining("doesn't follow convention")
          })
        );
      });

      it("should skip validation for main branches", async () => {
        mockGit.revparse.mockResolvedValue("main");
        
        const result = await coreModule.validateBranchNaming();
        
        expect(result.violations).toHaveLength(0);
        expect(result.warnings).toHaveLength(0);
      });
    });
  });

  describe("Git Configuration Rules", () => {
    describe("GIT-001: Git Repository", () => {
      it("should pass when git repo exists", async () => {
        mockGit.checkIsRepo.mockResolvedValue(true);
        
        const result = await coreModule.validateGitRepo();
        
        expect(result.passed).toContainEqual(
          expect.objectContaining({
            rule: "GIT-001",
            message: "Git repository initialized"
          })
        );
      });

      it("should fail when not a git repo", async () => {
        mockGit.checkIsRepo.mockResolvedValue(false);
        
        const result = await coreModule.validateGitRepo();
        
        expect(result.violations).toContainEqual(
          expect.objectContaining({
            rule: "GIT-001",
            message: "Not a git repository",
            fix: 'Run "git init"'
          })
        );
      });
    });

    describe("GIT-002: Remote Configuration", () => {
      it("should pass when remote configured", async () => {
        mockGit.getRemotes.mockResolvedValue([{ name: "origin" }]);
        
        const result = await coreModule.validateGitRemote();
        
        expect(result.passed).toContainEqual(
          expect.objectContaining({
            rule: "GIT-002",
            message: "Git remote configured"
          })
        );
      });

      it("should warn when no remote configured", async () => {
        mockGit.getRemotes.mockResolvedValue([]);
        
        const result = await coreModule.validateGitRemote();
        
        expect(result.warnings).toContainEqual(
          expect.objectContaining({
            rule: "GIT-002",
            message: "No git remote configured"
          })
        );
      });
    });
  });

  describe("Required Files", () => {
    it("should check for MANDATORY-RULES.md", async () => {
      fs.pathExists.mockImplementation((file) => {
        return file !== "MANDATORY-RULES.md";
      });
      
      const result = await coreModule.validateRequiredFiles();
      
      expect(result.violations).toContainEqual(
        expect.objectContaining({
          rule: "CORE-001",
          message: "MANDATORY-RULES.md is missing"
        })
      );
    });

    it("should warn about missing PROJECT_CONTEXT.md", async () => {
      fs.pathExists.mockImplementation((file) => {
        return file === "MANDATORY-RULES.md";
      });
      
      const result = await coreModule.validateRequiredFiles();
      
      expect(result.warnings).toContainEqual(
        expect.objectContaining({
          rule: "CORE-002",
          message: "PROJECT_CONTEXT.md is missing"
        })
      );
    });
  });

  describe("Integration", () => {
    it("should run all core validations", async () => {
      const validator = {
        violations: [],
        warnings: [],
        passed: []
      };
      
      await coreModule.validate(validator);
      
      // Verify all validation methods were called
      expect(mockGit.checkIsRepo).toHaveBeenCalled();
      expect(mockGit.getRemotes).toHaveBeenCalled();
      expect(mockScanner.scanForSecrets).toHaveBeenCalled();
      expect(fs.pathExists).toHaveBeenCalled();
    });

    it("should aggregate all results", async () => {
      // Setup some violations
      mockGit.checkIsRepo.mockResolvedValue(false);
      mockScanner.scanForSecrets.mockResolvedValue([
        { file: "test.js", line: 1, type: "API key", rule: "SEC-001" }
      ]);
      
      const validator = {
        violations: [],
        warnings: [],
        passed: []
      };
      
      await coreModule.validate(validator);
      
      expect(validator.violations.length).toBeGreaterThan(0);
      expect(validator.violations).toContainEqual(
        expect.objectContaining({ rule: "GIT-001" })
      );
      expect(validator.violations).toContainEqual(
        expect.objectContaining({ rule: "SEC-001" })
      );
    });
  });
});