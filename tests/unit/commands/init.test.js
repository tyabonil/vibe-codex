/**
 * Tests for init command
 */

const fs = require("fs-extra");
const path = require("path");
const init = require("../../../lib/commands/init");

// Mock dependencies
jest.mock("fs-extra");
jest.mock("inquirer");
jest.mock("simple-git");

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

// Mock other dependencies
jest.mock("../../../lib/utils/detector", () => ({
  detectProjectType: jest.fn().mockResolvedValue("web"),
  detectTestFramework: jest.fn(),
}));

jest.mock("../../../lib/utils/preflight", () => ({
  preflightChecks: jest.fn().mockResolvedValue({ packageManager: "npm" }),
}));

jest.mock("../../../lib/installer/git-hooks", () => ({
  installGitHooks: jest.fn().mockResolvedValue(),
}));

jest.mock("../../../lib/installer/github-actions", () => ({
  installGitHubActions: jest.fn().mockResolvedValue(),
}));

jest.mock("../../../lib/installer/local-rules", () => ({
  installLocalRules: jest.fn().mockResolvedValue(),
}));

jest.mock("../../../lib/utils/config-creator", () => ({
  createConfiguration: jest.fn(),
  createIgnoreFile: jest.fn().mockResolvedValue(),
  createProjectContext: jest.fn().mockResolvedValue(),
  applyProjectDefaults: jest.fn(),
}));

jest.mock("../../../lib/modules/loader-wrapper", () => ({
  initialize: jest.fn().mockResolvedValue(),
}));

jest.mock("../../../lib/modules/config-schema-commonjs", () => ({
  configExamples: {
    minimal: { modules: {} },
    fullStack: { modules: {} },
    frontend: { modules: {} },
  },
}));

jest.mock("../../../lib/utils/package-manager", () => ({
  validateSetup: jest.fn().mockResolvedValue({
    errors: [],
    warnings: [],
    npxAvailable: true,
    packageManager: "npm",
  }),
  getInstallInstructions: jest.fn(),
  getRunCommand: jest.fn().mockReturnValue("npm run"),
}));

jest.mock("../../../lib/utils/logger", () => ({
  output: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
}));

jest.mock("../../../lib/utils/rollback", () => ({
  createRollbackPoint: jest.fn().mockResolvedValue("/tmp/rollback"),
  rollback: jest.fn().mockResolvedValue(),
}));

jest.mock("../../../lib/commands/validate", () =>
  jest.fn().mockResolvedValue(),
);

describe("init command", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("pre-flight checks", () => {
    test("should fail if Node.js version is too old", async () => {
      // Mock old Node version
      const originalVersion = process.version;
      Object.defineProperty(process, "version", {
        value: "v12.0.0",
        configurable: true,
      });

      await expect(init({})).rejects.toThrow("Node.js 14 or higher required");

      Object.defineProperty(process, "version", {
        value: originalVersion,
        configurable: true,
      });
    });

    test("should initialize git repo if not present", async () => {
      const simpleGit = require("simple-git");
      const git = {
        checkIsRepo: jest.fn().mockResolvedValue(false),
        init: jest.fn().mockResolvedValue(),
        add: jest.fn().mockResolvedValue(),
        commit: jest.fn().mockResolvedValue(),
      };
      simpleGit.mockReturnValue(git);

      const inquirer = require("inquirer");
      inquirer.prompt = jest
        .fn()
        .mockResolvedValueOnce({ initGit: true })
        .mockResolvedValueOnce({ projectType: "web" })
        .mockResolvedValueOnce({ selectedModules: ["testing"] })
        .mockResolvedValueOnce({ coverage: 80 });

      fs.pathExists.mockResolvedValue(false);
      fs.writeJSON.mockResolvedValue();

      await init({});

      expect(git.init).toHaveBeenCalled();
      expect(git.add).toHaveBeenCalledWith(".");
      expect(git.commit).toHaveBeenCalledWith("Initial commit");
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
      expect(configCall).toBeDefined();
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

      const inquirer = require("inquirer");
      inquirer.prompt = jest
        .fn()
        .mockResolvedValueOnce({ projectType: "fullstack" })
        .mockResolvedValueOnce({
          selectedModules: ["testing", "github", "deployment"],
        })
        .mockResolvedValueOnce({ coverage: 85 })
        .mockResolvedValueOnce({ platform: "vercel" });

      fs.pathExists.mockResolvedValue(false);
      fs.writeJSON.mockResolvedValue();
      fs.writeFile.mockResolvedValue();
      fs.chmod.mockResolvedValue();
      fs.ensureDir.mockResolvedValue();

      await init({});

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
          testing: {
            enabled: true,
            coverage: { threshold: 85 },
          },
          github: { enabled: true },
          deployment: {
            enabled: true,
            platform: "vercel",
          },
        },
      });
    });
  });
});
