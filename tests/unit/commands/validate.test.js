/**
 * Tests for validate command
 */

const fs = require("fs-extra");
const chalk = require("chalk");
const ora = require("ora");

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
jest.mock("ora", () => {
  const spinner = {
    start: jest.fn().mockReturnThis(),
    succeed: jest.fn().mockReturnThis(),
    fail: jest.fn().mockReturnThis(),
    warn: jest.fn().mockReturnThis(),
    info: jest.fn().mockReturnThis(),
    stop: jest.fn().mockReturnThis(),
    text: "",
  };
  return jest.fn(() => spinner);
});

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

const validate = require("../../../lib/commands/validate");

describe("Validate Command", () => {
  let mockSpinner;

  beforeEach(() => {
    jest.clearAllMocks();
    console.log = jest.fn();
    console.error = jest.fn();
    mockSpinner = ora();

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

    expect(mockSpinner.start).toHaveBeenCalledWith(
      "Loading vibe-codex configuration...",
    );
    expect(mockSpinner.succeed).toHaveBeenCalled();
  });

  test("should handle missing configuration", async () => {
    fs.pathExists.mockResolvedValue(false);

    await expect(validate({})).rejects.toThrow(
      "No vibe-codex configuration found",
    );
  });

  test("should filter by level", async () => {
    await validate({ level: "2" });

    const moduleLoader = require("../../../lib/modules/loader");
    expect(moduleLoader.loadModules).toHaveBeenCalled();
  });

  test("should filter by specific modules", async () => {
    await validate({ module: ["core", "testing"] });

    expect(mockSpinner.info).toHaveBeenCalledWith(
      "Validating modules: core, testing",
    );
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

    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining("Validation Details"),
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

    expect(mockSpinner.info).toHaveBeenCalledWith(
      "Attempting to auto-fix violations...",
    );
  });

  test("should handle validation errors", async () => {
    const validator = require("../../../lib/validator");
    validator.validateProject.mockRejectedValueOnce(
      new Error("Validation failed"),
    );

    await expect(validate({})).rejects.toThrow("Validation failed");
    expect(mockSpinner.fail).toHaveBeenCalled();
  });

  test("should run hook-specific validation", async () => {
    await validate({ hook: "pre-commit" });

    expect(mockSpinner.info).toHaveBeenCalledWith(
      "Running pre-commit hook validation",
    );
  });

  test("should exit with appropriate code", async () => {
    const mockExit = jest.spyOn(process, "exit").mockImplementation(() => {});

    const validator = require("../../../lib/validator");
    validator.validateProject.mockResolvedValueOnce({
      valid: false,
      violations: [{ level: 1 }],
      summary: { total: 1, byLevel: { 1: 1 } },
    });

    try {
      await validate({});
    } catch (e) {
      // Expected to throw
    }

    expect(mockExit).toHaveBeenCalledWith(1);
    mockExit.mockRestore();
  });
});
