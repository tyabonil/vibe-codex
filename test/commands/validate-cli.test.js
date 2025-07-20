/**
 * Tests for validate command
 */

const fs = require("fs-extra");
const validate = require("../../lib/commands/validate");
const RuleValidator = require("../../lib/validator");
const logger = require("../../lib/utils/logger");

// Mock dependencies
jest.mock("fs-extra");
jest.mock("../../lib/validator");
jest.mock("../../lib/utils/logger");
jest.mock("../../lib/modules/loader-wrapper");

const moduleLoader = require("../../lib/modules/loader-wrapper");

describe("validate command", () => {
  let mockValidator;
  let consoleLogSpy;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock console
    consoleLogSpy = jest.spyOn(console, "log").mockImplementation();
    
    // Mock validator
    mockValidator = {
      validate: jest.fn().mockResolvedValue({
        violations: [],
        warnings: [],
        passed: [],
        summary: {
          total: 0,
          violations: 0,
          warnings: 0,
          passed: 0
        }
      })
    };
    
    RuleValidator.mockImplementation(() => mockValidator);
    
    // Default mocks
    fs.pathExists.mockResolvedValue(true);
    fs.readJSON.mockResolvedValue({
      version: "2.0.0",
      projectType: "web",
      modules: {
        core: { enabled: true },
        testing: { enabled: true }
      }
    });
    
    moduleLoader.initialize.mockResolvedValue();
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
  });

  describe("configuration loading", () => {
    it("should load configuration from .vibe-codex.json", async () => {
      await validate({});
      
      expect(fs.readJSON).toHaveBeenCalledWith(".vibe-codex.json");
    });

    it("should throw error if no configuration found", async () => {
      fs.pathExists.mockResolvedValue(false);
      
      await expect(validate({})).rejects.toThrow(
        "No vibe-codex configuration found"
      );
    });
  });

  describe("module filtering", () => {
    it("should validate all modules by default", async () => {
      await validate({});
      
      expect(mockValidator.validate).toHaveBeenCalledWith({});
    });

    it("should validate specific module with --module flag", async () => {
      await validate({ module: ["testing"] });
      
      expect(mockValidator.validate).toHaveBeenCalledWith({
        modules: ["testing"]
      });
    });

    it("should validate multiple modules", async () => {
      await validate({ module: ["testing", "core"] });
      
      expect(mockValidator.validate).toHaveBeenCalledWith({
        modules: ["testing", "core"]
      });
    });
  });

  describe("output formatting", () => {
    it("should display violations in pretty format by default", async () => {
      mockValidator.validate.mockResolvedValue({
        violations: [
          {
            rule: "SEC-001",
            message: "API key found in code",
            severity: "error",
            file: "src/config.js",
            line: 10
          }
        ],
        warnings: [],
        passed: [],
        summary: { total: 1, violations: 1, warnings: 0, passed: 0 }
      });
      
      await validate({});
      
      expect(logger.output).toHaveBeenCalledWith(
        expect.stringContaining("SEC-001")
      );
      expect(logger.output).toHaveBeenCalledWith(
        expect.stringContaining("API key found")
      );
      expect(logger.output).toHaveBeenCalledWith(
        expect.stringContaining("src/config.js:10")
      );
    });

    it("should display warnings", async () => {
      mockValidator.validate.mockResolvedValue({
        violations: [],
        warnings: [
          {
            rule: "TEST-001",
            message: "No test directory found",
            severity: "warning"
          }
        ],
        passed: [],
        summary: { total: 1, violations: 0, warnings: 1, passed: 0 }
      });
      
      await validate({});
      
      expect(logger.output).toHaveBeenCalledWith(
        expect.stringContaining("Warnings")
      );
      expect(logger.output).toHaveBeenCalledWith(
        expect.stringContaining("TEST-001")
      );
    });

    it("should display success when all rules pass", async () => {
      mockValidator.validate.mockResolvedValue({
        violations: [],
        warnings: [],
        passed: [
          { rule: "SEC-001", message: "No secrets found" }
        ],
        summary: { total: 1, violations: 0, warnings: 0, passed: 1 }
      });
      
      await validate({});
      
      expect(logger.output).toHaveBeenCalledWith(
        expect.stringContaining("All validation rules passed")
      );
    });
  });

  describe("JSON output", () => {
    it("should output JSON with --format json", async () => {
      const result = {
        violations: [{ rule: "TEST-1", message: "Test" }],
        warnings: [],
        passed: [],
        summary: { total: 1, violations: 1, warnings: 0, passed: 0 }
      };
      
      mockValidator.validate.mockResolvedValue(result);
      
      await validate({ format: "json" });
      
      expect(consoleLogSpy).toHaveBeenCalledWith(
        JSON.stringify(result, null, 2)
      );
    });

    it("should write JSON to file with --output", async () => {
      const result = {
        violations: [],
        warnings: [],
        passed: [],
        summary: { total: 0, violations: 0, warnings: 0, passed: 0 }
      };
      
      mockValidator.validate.mockResolvedValue(result);
      
      await validate({ format: "json", output: "results.json" });
      
      expect(fs.writeJSON).toHaveBeenCalledWith(
        "results.json",
        result,
        { spaces: 2 }
      );
    });
  });

  describe("fix mode", () => {
    it("should apply fixes with --fix flag", async () => {
      mockValidator.validate.mockResolvedValue({
        violations: [
          {
            rule: "FORMAT-001",
            message: "Formatting issues",
            fix: "npm run format"
          }
        ],
        warnings: [],
        passed: [],
        summary: { total: 1, violations: 1, warnings: 0, passed: 0 }
      });
      
      const { execSync } = require("child_process");
      jest.mock("child_process");
      
      await validate({ fix: true });
      
      expect(logger.output).toHaveBeenCalledWith(
        expect.stringContaining("Attempting to fix")
      );
    });
  });

  describe("CI mode", () => {
    it("should exit with error code in CI mode on violations", async () => {
      const processExitSpy = jest.spyOn(process, "exit").mockImplementation();
      
      mockValidator.validate.mockResolvedValue({
        violations: [{ rule: "TEST-1", message: "Test" }],
        warnings: [],
        passed: [],
        summary: { total: 1, violations: 1, warnings: 0, passed: 0 }
      });
      
      await validate({ ci: true });
      
      expect(processExitSpy).toHaveBeenCalledWith(1);
      
      processExitSpy.mockRestore();
    });

    it("should exit with error code in CI mode on warnings", async () => {
      const processExitSpy = jest.spyOn(process, "exit").mockImplementation();
      
      mockValidator.validate.mockResolvedValue({
        violations: [],
        warnings: [{ rule: "TEST-1", message: "Test" }],
        passed: [],
        summary: { total: 1, violations: 0, warnings: 1, passed: 0 }
      });
      
      await validate({ ci: true });
      
      expect(processExitSpy).toHaveBeenCalledWith(1);
      
      processExitSpy.mockRestore();
    });

    it("should exit with success in CI mode when all pass", async () => {
      const processExitSpy = jest.spyOn(process, "exit").mockImplementation();
      
      mockValidator.validate.mockResolvedValue({
        violations: [],
        warnings: [],
        passed: [{ rule: "TEST-1", message: "Test" }],
        summary: { total: 1, violations: 0, warnings: 0, passed: 1 }
      });
      
      await validate({ ci: true });
      
      expect(processExitSpy).not.toHaveBeenCalled();
      
      processExitSpy.mockRestore();
    });
  });

  describe("verbose mode", () => {
    it("should show passed rules with --verbose", async () => {
      mockValidator.validate.mockResolvedValue({
        violations: [],
        warnings: [],
        passed: [
          { rule: "SEC-001", message: "No secrets found" },
          { rule: "TEST-001", message: "Tests exist" }
        ],
        summary: { total: 2, violations: 0, warnings: 0, passed: 2 }
      });
      
      await validate({ verbose: true });
      
      expect(logger.output).toHaveBeenCalledWith(
        expect.stringContaining("Passed Rules")
      );
      expect(logger.output).toHaveBeenCalledWith(
        expect.stringContaining("SEC-001")
      );
      expect(logger.output).toHaveBeenCalledWith(
        expect.stringContaining("TEST-001")
      );
    });
  });

  describe("error handling", () => {
    it("should handle validation errors gracefully", async () => {
      mockValidator.validate.mockRejectedValue(new Error("Validation failed"));
      
      await expect(validate({})).rejects.toThrow("Validation failed");
    });

    it("should handle missing modules", async () => {
      await validate({ module: ["non-existent"] });
      
      expect(logger.warn).toHaveBeenCalledWith(
        expect.stringContaining("Module 'non-existent' not found")
      );
    });
  });
});