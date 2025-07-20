/**
 * Tests for init command
 */

const fs = require("fs-extra");
const path = require("path");
const init = require("../../../lib/commands/init");
const { processInitArgs } = require("../../../lib/utils/cli-args");

// Mock dependencies
jest.mock("fs-extra");
jest.mock("inquirer");
jest.mock("ora");
jest.mock("simple-git");

// Mock ora spinner
const mockSpinner = {
  start: jest.fn().mockReturnThis(),
  succeed: jest.fn().mockReturnThis(),
  fail: jest.fn().mockReturnThis(),
  warn: jest.fn().mockReturnThis(),
  stop: jest.fn().mockReturnThis(),
  text: ''
};

jest.mock("ora", () => jest.fn(() => mockSpinner));

// Mock validate command
jest.mock("../../../lib/commands/validate", () => jest.fn().mockResolvedValue(undefined));

// Mock module loader
jest.mock("../../../lib/modules/loader-wrapper", () => ({
  initialize: jest.fn().mockResolvedValue(undefined)
}));

// Mock installers
jest.mock("../../../lib/installer/git-hooks", () => ({
  installGitHooks: jest.fn().mockResolvedValue(undefined)
}));

jest.mock("../../../lib/installer/github-actions", () => ({
  installGitHubActions: jest.fn().mockResolvedValue(undefined)
}));

jest.mock("../../../lib/installer/local-rules", () => ({
  installLocalRules: jest.fn().mockResolvedValue(undefined)
}));

// Mock logger
jest.mock("../../../lib/utils/logger", () => ({
  output: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn()
}));

// Mock config creator utilities
jest.mock("../../../lib/utils/config-creator", () => ({
  createConfiguration: jest.fn().mockResolvedValue({}),
  applyProjectDefaults: jest.fn(),
  createIgnoreFile: jest.fn().mockResolvedValue(undefined),
  createProjectContext: jest.fn().mockResolvedValue(undefined)
}));

// Mock preflight checks
jest.mock("../../../lib/utils/preflight", () => ({
  preflightChecks: jest.fn().mockResolvedValue({ packageManager: 'npm' })
}));

// Mock package manager utilities
jest.mock("../../../lib/utils/package-manager", () => ({
  validateSetup: jest.fn().mockResolvedValue({ 
    errors: [], 
    warnings: [], 
    npxAvailable: true,
    packageManager: 'npm' 
  }),
  getInstallInstructions: jest.fn().mockReturnValue({ local: 'npm install vibe-codex' }),
  getRunCommand: jest.fn().mockReturnValue('npm run')
}));

describe("init command", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("pre-flight checks", () => {
    test.skip("should fail if Node.js version is too old", async () => {
      // Node version check was removed from init command
      // Skip this test for now
    });

    test.skip("should initialize git repo if not present", async () => {
      // Git initialization logic was removed from init command
      // Skip this test for now
    });
  });

  describe("project type detection", () => {
    test("should detect web project from React dependency", async () => {
      fs.pathExists.mockImplementation(async (file) => {
        if (file === "package.json") return true;
        if (file === ".vibe-codex.json") return false;
        return false;
      });

      fs.readJSON.mockImplementation(async (file) => {
        if (file === "package.json") {
          return {
            dependencies: { react: "^18.0.0" },
          };
        }
        return {};
      });

      const simpleGit = require("simple-git");
      simpleGit.mockReturnValue({
        checkIsRepo: jest.fn().mockResolvedValue(true),
      });

      const inquirer = require("inquirer");
      inquirer.prompt = jest
        .fn()
        .mockResolvedValueOnce({ selectedModules: [] });

      fs.writeJSON.mockResolvedValue();

      await init({ type: "auto" });

      // Should detect as web project
      const configCall = fs.writeFile.mock.calls.find(
        (call) => call[0].endsWith(".vibe-codex.json"),
      );
      const config = JSON.parse(configCall[1]);
      expect(config.projectType).toBe("web");
    });
  });

  describe("configuration creation", () => {
    test("should create valid configuration file", async () => {
      const simpleGit = require("simple-git");
      simpleGit.mockReturnValue({
        checkIsRepo: jest.fn().mockResolvedValue(true),
      });

      // Use command line args instead of prompts for clarity
      await init({ 
        type: "fullstack",
        modules: "testing,github-workflow,deployment",
        interactive: false
      });

      // Check configuration was created
      const configCall = fs.writeFile.mock.calls.find(
        (call) => call[0].endsWith(".vibe-codex.json"),
      );

      expect(configCall).toBeDefined();
      const config = JSON.parse(configCall[1]);
      expect(config).toMatchObject({
        projectType: "fullstack",
        modules: {
          core: { enabled: true },
          testing: { enabled: true },
          "github-workflow": { enabled: true },
          deployment: { enabled: true },
        },
      });
    });
  });

  describe("command-line argument handling", () => {
    beforeEach(() => {
      const simpleGit = require("simple-git");
      simpleGit.mockReturnValue({
        checkIsRepo: jest.fn().mockResolvedValue(true),
      });

      fs.pathExists.mockResolvedValue(false);
      fs.writeJSON.mockResolvedValue();
      fs.writeFile.mockResolvedValue();
      fs.chmod.mockResolvedValue();
      fs.ensureDir.mockResolvedValue();
    });

    test("should use type from command line", async () => {
      await init({ type: "fullstack" });

      expect(fs.writeFile).toHaveBeenCalled();
      const configCall = fs.writeFile.mock.calls.find(
        (call) => call[0].endsWith(".vibe-codex.json"),
      );
      expect(configCall).toBeDefined();
      const config = JSON.parse(configCall[1]);
      expect(config.projectType).toBe("fullstack");
    });

    test("should use modules from command line", async () => {
      await init({ modules: "testing,deployment" });

      const configCall = fs.writeFile.mock.calls.find(
        (call) => call[0].endsWith(".vibe-codex.json"),
      );
      const config = JSON.parse(configCall[1]);
      expect(config.modules).toMatchObject({
        core: { enabled: true },
        testing: { enabled: true },
        deployment: { enabled: true },
      });
    });

    test("should install all modules when modules=all", async () => {
      await init({ modules: "all" });

      const configCall = fs.writeFile.mock.calls.find(
        (call) => call[0].endsWith(".vibe-codex.json"),
      );
      const config = JSON.parse(configCall[1]);
      expect(config.modules).toMatchObject({
        core: { enabled: true },
        "github-workflow": { enabled: true },
        testing: { enabled: true },
        deployment: { enabled: true },
        documentation: { enabled: true },
        patterns: { enabled: true },
      });
    });

    test("should respect minimal flag", async () => {
      await init({ minimal: true });

      const configCall = fs.writeFile.mock.calls.find(
        (call) => call[0].endsWith(".vibe-codex.json"),
      );
      const config = JSON.parse(configCall[1]);
      expect(Object.keys(config.modules).filter(
        m => config.modules[m].enabled
      ).length).toBe(1);
      expect(config.modules.core.enabled).toBe(true);
    });

    test("should use advanced hooks from command line", async () => {
      await init({ withAdvancedHooks: "pr-health,issue-tracking" });

      const configCall = fs.writeFile.mock.calls.find(
        (call) => call[0].endsWith(".vibe-codex.json"),
      );
      const config = JSON.parse(configCall[1]);
      expect(config.advancedHooks).toMatchObject({
        enabled: true,
        categories: ["pr-health", "issue-tracking"],
      });
    });

    test("should not prompt when non-interactive with sufficient args", async () => {
      const inquirer = require("inquirer");
      inquirer.prompt = jest.fn();

      await init({ 
        type: "web", 
        modules: "testing,github-workflow",
        interactive: false 
      });

      expect(inquirer.prompt).not.toHaveBeenCalled();
    });

    test("should use project defaults when type specified without modules", async () => {
      await init({ type: "library" });

      const configCall = fs.writeFile.mock.calls.find(
        (call) => call[0].endsWith(".vibe-codex.json"),
      );
      const config = JSON.parse(configCall[1]);
      
      // Library defaults should include core, github-workflow, and documentation
      expect(config.modules).toMatchObject({
        core: { enabled: true },
        "github-workflow": { enabled: true },
        documentation: { enabled: true },
      });
      expect(config.modules.testing).toBeUndefined();
    });
  });
});
