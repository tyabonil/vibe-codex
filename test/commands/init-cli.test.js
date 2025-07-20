/**
 * Tests for init command with CLI arguments
 */

const fs = require("fs-extra");
const path = require("path");
const init = require("../../lib/commands/init");
const { detectProjectType } = require("../../lib/utils/detector");
const { processInitArgs } = require("../../lib/utils/cli-args");

// Mock dependencies
jest.mock("fs-extra");
jest.mock("ora");
jest.mock("simple-git");
jest.mock("../../lib/utils/detector");
jest.mock("../../lib/utils/preflight");
jest.mock("../../lib/installer/git-hooks");
jest.mock("../../lib/installer/github-actions");
jest.mock("../../lib/installer/local-rules");
jest.mock("../../lib/utils/config-creator");
jest.mock("../../lib/modules/loader-wrapper");
jest.mock("../../lib/utils/package-manager");
jest.mock("../../lib/utils/logger");
jest.mock("../../lib/utils/rollback");
jest.mock("../../lib/commands/validate");

// Mock ora spinner
const mockSpinner = {
  start: jest.fn().mockReturnThis(),
  succeed: jest.fn().mockReturnThis(),
  fail: jest.fn().mockReturnThis(),
  warn: jest.fn().mockReturnThis(),
  stop: jest.fn().mockReturnThis(),
  text: ''
};

const ora = require("ora");
ora.mockReturnValue(mockSpinner);

// Import mocked modules
const { preflightChecks } = require("../../lib/utils/preflight");
const { installGitHooks } = require("../../lib/installer/git-hooks");
const { installGitHubActions } = require("../../lib/installer/github-actions");
const { installLocalRules } = require("../../lib/installer/local-rules");
const { applyProjectDefaults, createIgnoreFile, createProjectContext } = require("../../lib/utils/config-creator");
const moduleLoader = require("../../lib/modules/loader-wrapper");
const { validateSetup } = require("../../lib/utils/package-manager");
const logger = require("../../lib/utils/logger");
const { createRollbackPoint, rollback } = require("../../lib/utils/rollback");
const validate = require("../../lib/commands/validate");

describe("init command with CLI arguments", () => {
  let consoleLogSpy;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock console
    consoleLogSpy = jest.spyOn(console, "log").mockImplementation();
    
    // Default mocks
    fs.pathExists.mockResolvedValue(false);
    fs.writeJSON.mockResolvedValue();
    fs.outputFile.mockResolvedValue();
    
    validateSetup.mockResolvedValue({
      errors: [],
      warnings: [],
      npxAvailable: true,
      packageManager: "npm"
    });
    
    preflightChecks.mockResolvedValue({
      packageManager: "npm"
    });
    
    detectProjectType.mockResolvedValue("web");
    
    createRollbackPoint.mockResolvedValue("/tmp/rollback");
    
    moduleLoader.initialize.mockResolvedValue();
    installGitHooks.mockResolvedValue();
    installGitHubActions.mockResolvedValue();
    installLocalRules.mockResolvedValue();
    applyProjectDefaults.mockResolvedValue({
      version: "2.0.0",
      projectType: "web",
      modules: {
        core: { enabled: true }
      }
    });
    createIgnoreFile.mockResolvedValue();
    createProjectContext.mockResolvedValue();
    validate.mockResolvedValue();
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
  });

  describe("module configuration", () => {
    it("should require module configuration", async () => {
      await expect(init({})).rejects.toThrow("Module configuration required");
    });

    it("should accept --minimal flag", async () => {
      await init({ minimal: true });
      
      expect(applyProjectDefaults).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          modules: ["core"]
        })
      );
    });

    it("should accept --modules flag with list", async () => {
      await init({ modules: "core,testing,github-workflow" });
      
      expect(applyProjectDefaults).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          modules: ["core", "testing", "github-workflow"]
        })
      );
    });

    it("should accept --modules=all flag", async () => {
      await init({ modules: "all" });
      
      expect(applyProjectDefaults).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          modules: ["all"]
        })
      );
    });

    it("should accept --preset flag", async () => {
      await init({ preset: true, type: "web" });
      
      expect(applyProjectDefaults).toHaveBeenCalledWith(
        "web",
        expect.objectContaining({
          usePreset: true
        })
      );
    });
  });

  describe("project type detection", () => {
    it("should use --type flag when provided", async () => {
      await init({ type: "api", minimal: true });
      
      expect(detectProjectType).not.toHaveBeenCalled();
      expect(applyProjectDefaults).toHaveBeenCalledWith(
        "api",
        expect.any(Object)
      );
    });

    it("should detect project type when not provided", async () => {
      detectProjectType.mockResolvedValue("fullstack");
      
      await init({ minimal: true });
      
      expect(detectProjectType).toHaveBeenCalled();
      expect(applyProjectDefaults).toHaveBeenCalledWith(
        "fullstack",
        expect.any(Object)
      );
    });

    it("should default to custom when detection fails", async () => {
      detectProjectType.mockResolvedValue(null);
      
      await init({ minimal: true });
      
      expect(logger.output).toHaveBeenCalledWith(
        expect.stringContaining("Could not detect project type")
      );
      expect(applyProjectDefaults).toHaveBeenCalledWith(
        "custom",
        expect.any(Object)
      );
    });
  });

  describe("advanced hooks", () => {
    it("should install advanced hooks when specified", async () => {
      await init({ 
        minimal: true, 
        withAdvancedHooks: "pr-health,issue-tracking" 
      });
      
      expect(installGitHooks).toHaveBeenCalledWith(
        expect.objectContaining({
          advancedHooks: ["pr-health", "issue-tracking"]
        })
      );
    });

    it("should not install advanced hooks by default", async () => {
      await init({ minimal: true });
      
      expect(installGitHooks).toHaveBeenCalledWith(
        expect.objectContaining({
          advancedHooks: []
        })
      );
    });
  });

  describe("force flag", () => {
    it("should overwrite existing config with --force", async () => {
      fs.pathExists.mockResolvedValue(true);
      
      await init({ minimal: true, force: true });
      
      expect(fs.writeJSON).toHaveBeenCalled();
      expect(logger.output).toHaveBeenCalledWith(
        expect.stringContaining("Overwriting existing configuration")
      );
    });

    it("should fail without --force when config exists", async () => {
      fs.pathExists.mockResolvedValue(true);
      
      await expect(init({ minimal: true })).rejects.toThrow(
        "Configuration already exists"
      );
    });
  });

  describe("git hooks", () => {
    it("should skip git hooks with --no-git-hooks", async () => {
      await init({ minimal: true, noGitHooks: true });
      
      expect(installGitHooks).not.toHaveBeenCalled();
    });

    it("should install git hooks by default", async () => {
      await init({ minimal: true });
      
      expect(installGitHooks).toHaveBeenCalled();
    });
  });

  describe("validation", () => {
    it("should run validation after initialization", async () => {
      await init({ minimal: true });
      
      expect(validate).toHaveBeenCalled();
    });

    it("should show validation results", async () => {
      validate.mockResolvedValue({
        violations: [{ rule: "TEST-1", message: "No tests" }],
        warnings: [],
        passed: []
      });
      
      await init({ minimal: true });
      
      expect(logger.output).toHaveBeenCalledWith(
        expect.stringContaining("Validation found issues")
      );
    });
  });

  describe("error handling", () => {
    it("should handle setup validation errors", async () => {
      validateSetup.mockResolvedValue({
        errors: ["Node.js version too old"],
        warnings: [],
        npxAvailable: false
      });
      
      await expect(init({ minimal: true })).rejects.toThrow();
      
      expect(logger.output).toHaveBeenCalledWith(
        expect.stringContaining("Setup errors")
      );
    });

    it("should rollback on error", async () => {
      const error = new Error("Installation failed");
      installGitHooks.mockRejectedValue(error);
      
      await expect(init({ minimal: true })).rejects.toThrow(error);
      
      expect(rollback).toHaveBeenCalledWith("/tmp/rollback");
    });

    it("should skip rollback with --skip-rollback", async () => {
      const error = new Error("Installation failed");
      installGitHooks.mockRejectedValue(error);
      
      await expect(init({ minimal: true, skipRollback: true })).rejects.toThrow(error);
      
      expect(createRollbackPoint).not.toHaveBeenCalled();
      expect(rollback).not.toHaveBeenCalled();
    });
  });

  describe("success messages", () => {
    it("should show success message with next steps", async () => {
      await init({ minimal: true });
      
      expect(logger.output).toHaveBeenCalledWith(
        expect.stringContaining("vibe-codex initialized successfully")
      );
      expect(logger.output).toHaveBeenCalledWith(
        expect.stringContaining("Next steps")
      );
    });

    it("should show module-specific tips", async () => {
      await init({ modules: "core,testing" });
      
      expect(logger.output).toHaveBeenCalledWith(
        expect.stringContaining("npm test")
      );
    });
  });
});