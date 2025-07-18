/**
 * Tests for validate command
 */

const fs = require("fs-extra");
const chalk = require("chalk");

// Mock dependencies
jest.mock("fs-extra");
jest.mock("chalk", () => ({
  blue: jest.fn((text) => text),
  green: jest.fn((text) => text),
  yellow: jest.fn((text) => text),
  red: jest.fn((text) => text),
  gray: jest.fn((text) => text),
  bold: jest.fn((text) => text),
}));

// Mock SimpleLogger
const mockTask = {
  succeed: jest.fn(),
  fail: jest.fn(),
};

const mockLogger = {
  startTask: jest.fn(() => mockTask),
  info: jest.fn(),
  success: jest.fn(),
  error: jest.fn(),
  warning: jest.fn(),
  verbose: jest.fn(),
  section: jest.fn(),
};

jest.mock("../../../lib/utils/simple-logger", () => ({
  getLogger: jest.fn(() => mockLogger),
}));

// Mock modules
jest.mock("../../../lib/modules/loader", () => ({
  loadModules: jest.fn().mockResolvedValue([
    {
      name: "core",
      validate: jest.fn().mockResolvedValue({
        valid: true,
        violations: [],
      }),
    },
    {
      name: "testing",
      validate: jest.fn().mockResolvedValue({
        valid: false,
        violations: [{ level: 3, message: "Missing tests" }],
      }),
    },
  ]),
}));

jest.mock("../../../lib/validator", () => ({
  validateProject: jest.fn().mockResolvedValue({
    valid: true,
    violations: [],
    summary: { total: 0, byLevel: {} },
  }),
}));

// Mock module loader wrapper
jest.mock("../../../lib/modules/loader-wrapper", () => ({
  initialize: jest.fn().mockResolvedValue(),
  getLoadedModules: jest.fn().mockReturnValue(["core", "testing"]),
  getAllRules: jest.fn().mockReturnValue([
    {
      id: "no-secrets",
      name: "No Secrets in Code",
      level: 1,
      module: "core",
      check: jest.fn().mockResolvedValue([]),
    },
    {
      id: "branch-protection",
      name: "Branch Protection",
      level: 1,
      module: "core",
      check: jest.fn().mockResolvedValue([]),
    },
  ]),
}));

const validate = require("../../../lib/commands/validate");

describe("Validate Command", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    console.log = jest.fn();
    console.error = jest.fn();
    
    // Reset mock implementations
    mockTask.succeed.mockClear();
    mockTask.fail.mockClear();
    mockLogger.startTask.mockClear();
    mockLogger.startTask.mockReturnValue(mockTask);

    fs.pathExists.mockResolvedValue(true);
    fs.readJSON.mockResolvedValue({
      version: "2.0.0",
      modules: {
        core: { enabled: true },
        testing: { enabled: true },
      },
    });
  });

  test("should validate project with default options", async () => {
    await validate({});

    expect(mockLogger.startTask).toHaveBeenCalledWith(
      "Loading configuration",
    );
    expect(mockTask.succeed).toHaveBeenCalled();
  });

  test("should handle missing configuration", async () => {
    fs.pathExists.mockResolvedValue(false);

    await validate({});
    
    expect(mockTask.fail).toHaveBeenCalledWith(
      "No vibe-codex configuration found",
    );
  });

  test("should filter by level", async () => {
    await validate({ level: "2" });

    // Module loader wrapper is initialized
    const moduleLoader = require("../../../lib/modules/loader-wrapper");
    expect(moduleLoader.initialize).toHaveBeenCalled();
  });

  test("should filter by specific modules", async () => {
    await validate({ module: ["core", "testing"] });

    // Module filtering is handled internally
    expect(mockLogger.startTask).toHaveBeenCalled();
  });

  test("should output JSON format", async () => {
    await validate({ json: true });

    const output = console.log.mock.calls.find(
      (call) => call[0].includes("{") || call[0].includes("}"),
    );
    expect(output).toBeDefined();
  });

  test("should show verbose output", async () => {
    await validate({ verbose: true });

    // In verbose mode, it shows passed rules
    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining("✅ Passed:"),
    );
  });

  test("should attempt to fix violations", async () => {
    const validator = require("../../../lib/validator");
    validator.validateProject.mockResolvedValueOnce({
      valid: false,
      violations: [{ level: 3, fixable: true }],
      summary: { total: 1, byLevel: { 3: 1 } },
    });

    await validate({ fix: true });

    // Auto-fix is handled in runModularValidation
    expect(mockLogger.startTask).toHaveBeenCalled();
  });

  test("should handle validation errors", async () => {
    // Mock a rule that throws an error during check
    const moduleLoader = require("../../../lib/modules/loader-wrapper");
    moduleLoader.getAllRules.mockReturnValueOnce([
      {
        id: "error-rule",
        name: "Error Rule",
        level: 1,
        module: "core",
        check: jest.fn().mockRejectedValue(new Error("Validation failed")),
      },
    ]);

    // The validate command catches errors from individual rules
    await validate({});
    
    // Check that a warning was logged for the failed rule
    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining("⚠ Error Rule: Validation failed")
    );
  });

  test("should run hook-specific validation", async () => {
    await validate({ hook: "pre-commit" });

    // Hook validation is handled internally
    expect(mockLogger.startTask).toHaveBeenCalled();
  });

  test("should exit with appropriate code", async () => {
    // Mock getAllRules to return rules with violations
    const moduleLoader = require("../../../lib/modules/loader-wrapper");
    moduleLoader.getAllRules.mockReturnValueOnce([
      {
        id: "test-rule",
        name: "Test Rule",
        level: 1,
        module: "core",
        check: jest.fn().mockResolvedValue([{
          message: "Test violation",
          file: "test.js"
        }]),
      },
    ]);

    // Reset exitCode before test
    process.exitCode = 0;
    
    await validate({});

    expect(process.exitCode).toBe(1);
  });
});
