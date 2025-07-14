/**
 * Tests for init command
 */

const fs = require("fs-extra");
const path = require("path");
const init = require("../../../lib/commands/init");

// Mock dependencies
jest.mock("fs-extra");
jest.mock("inquirer");
jest.mock("ora");
jest.mock("simple-git");

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
      const configCall = fs.writeJSON.mock.calls.find(
        (call) => call[0] === ".vibe-codex.json",
      );
      expect(configCall[1].projectType).toBe("web");
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
      const configCall = fs.writeJSON.mock.calls.find(
        (call) => call[0] === ".vibe-codex.json",
      );

      expect(configCall).toBeDefined();
      expect(configCall[1]).toMatchObject({
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
