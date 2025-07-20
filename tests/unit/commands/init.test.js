/**
 * Tests for init command
 */

const fs = require("fs-extra");
const path = require("path");
const init = require("../../../lib/commands/init");

// Mock dependencies
jest.mock("fs-extra");
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
    
    // Mock process.exit to prevent test runner from exiting
    jest.spyOn(process, 'exit').mockImplementation(() => {
      throw new Error('process.exit called');
    });
    
    // Setup common mocks
    const simpleGit = require("simple-git");
    simpleGit.mockReturnValue({
      checkIsRepo: jest.fn().mockResolvedValue(true),
    });

    fs.pathExists.mockResolvedValue(false);
    fs.writeFile.mockResolvedValue();
    fs.writeJSON.mockResolvedValue();
    fs.readJSON.mockResolvedValue({});
    fs.chmod.mockResolvedValue();
    fs.ensureDir.mockResolvedValue();
  });

  afterEach(() => {
    process.exit.mockRestore();
  });

  describe("command-line argument handling", () => {
    test("should use type from command line", async () => {
      await init({ type: "fullstack", modules: "all" });

      expect(fs.writeFile).toHaveBeenCalled();
      const configCall = fs.writeFile.mock.calls.find(
        (call) => call[0].endsWith(".vibe-codex.json"),
      );
      expect(configCall).toBeDefined();
      const config = JSON.parse(configCall[1]);
      expect(config.projectType).toBe("fullstack");
    });

    test("should use modules from command line", async () => {
      await init({ type: "web", modules: "testing,deployment" });

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
      await init({ type: "api", modules: "all" });

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
      await init({ type: "library", minimal: true });

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
      await init({ type: "web", modules: "all", withAdvancedHooks: "pr-health,issue-tracking" });

      const configCall = fs.writeFile.mock.calls.find(
        (call) => call[0].endsWith(".vibe-codex.json"),
      );
      const config = JSON.parse(configCall[1]);
      expect(config.advancedHooks).toMatchObject({
        enabled: true,
        categories: ["pr-health", "issue-tracking"],
      });
    });

    test("should use project defaults with preset flag", async () => {
      await init({ type: "library", preset: true });

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

    test("should fail when no modules specified", async () => {
      let exitCalled = false;
      process.exit.mockImplementation(() => {
        exitCalled = true;
        throw new Error('process.exit called');
      });

      try {
        await init({ type: "web" });
      } catch (e) {
        // Expected to throw
      }

      expect(exitCalled).toBe(true);
      expect(process.exit).toHaveBeenCalledWith(1);
    });

    test("should use default project type when detection fails", async () => {
      await init({ modules: "all" });

      const configCall = fs.writeFile.mock.calls.find(
        (call) => call[0].endsWith(".vibe-codex.json"),
      );
      const config = JSON.parse(configCall[1]);
      // Should default to "custom" when detection fails
      expect(config.projectType).toBe("custom");
    });
  });

  describe("configuration creation", () => {
    test("should create valid configuration file", async () => {
      await init({ 
        type: "fullstack",
        modules: "testing,github-workflow,deployment"
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
});