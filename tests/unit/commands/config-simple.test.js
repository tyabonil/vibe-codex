/**
 * Simple tests for config command
 */

const fs = require("fs-extra");
const inquirer = require("inquirer");
const chalk = require("chalk");

// Mock dependencies
jest.mock("fs-extra");
jest.mock("inquirer");
jest.mock("chalk", () => ({
  blue: jest.fn((text) => text),
  green: jest.fn((text) => text),
  yellow: jest.fn((text) => text),
  red: jest.fn((text) => text),
  gray: jest.fn((text) => text),
  bold: jest.fn((text) => text),
}));

// Mock config-creator
jest.mock("../../../lib/utils/config-creator", () => ({
  getSuggestions: jest.fn().mockReturnValue(["Enable testing module"]),
}));

// Mock logger
jest.mock("../../../lib/utils/logger", () => ({
  log: jest.fn(),
  debug: jest.fn(),
  error: jest.fn(),
}));

const config = require("../../../lib/commands/config");

describe("Config Command", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    console.log = jest.fn();
  });

  test("should show no config message when config does not exist", async () => {
    fs.pathExists.mockResolvedValue(false);

    await config({});

    expect(console.log).toHaveBeenCalledWith("🔧 vibe-codex Configuration\n");
    expect(console.log).toHaveBeenCalledWith("No configuration file found.");
    expect(console.log).toHaveBeenCalledWith(
      'Run "npx vibe-codex init" to create one.',
    );
  });

  test("should list configuration when --list flag is used", async () => {
    const mockConfig = {
      version: "2.0.0",
      modules: { core: { enabled: true } },
    };

    fs.pathExists.mockResolvedValue(true);
    fs.readJSON.mockResolvedValue(mockConfig);

    await config({ list: true });

    expect(console.log).toHaveBeenCalledWith(
      "Current vibe-codex configuration:\n",
    );
    expect(console.log).toHaveBeenCalledWith(
      JSON.stringify(mockConfig, null, 2),
    );
  });

  test("should show preview when --preview flag is used", async () => {
    const mockConfig = {
      version: "2.0.0",
      modules: {
        core: { enabled: true, gitHooks: true },
        testing: { enabled: true, coverage: { threshold: 85 } },
      },
    };

    fs.pathExists.mockResolvedValue(true);
    fs.readJSON.mockResolvedValue(mockConfig);

    await config({ preview: true });

    expect(console.log).toHaveBeenCalledWith("\n📋 Configuration Preview:\n");
    expect(console.log).toHaveBeenCalledWith("Enabled Modules:");
    expect(console.log).toHaveBeenCalledWith("  ✓ core");
    expect(console.log).toHaveBeenCalledWith("  ✓ testing");
  });

  test("should handle interactive mode with exit", async () => {
    fs.pathExists.mockResolvedValue(true);
    fs.readJSON.mockResolvedValue({
      version: "2.0.0",
      modules: { core: { enabled: true } },
    });

    inquirer.prompt.mockResolvedValueOnce({ action: "exit" });

    await config({});

    expect(inquirer.prompt).toHaveBeenCalled();
  });

  test("should handle errors gracefully", async () => {
    fs.pathExists.mockRejectedValue(new Error("File system error"));

    await expect(config({ list: true })).rejects.toThrow("File system error");
  });
});
