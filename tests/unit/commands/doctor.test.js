/**
 * Tests for doctor command
 */

const doctor = require("../../../lib/commands/doctor");
const { exec } = require("child_process");
const fs = require("fs-extra");
const chalk = require("chalk");

jest.mock("child_process");
jest.mock("fs-extra");
jest.mock("../../../lib/utils/package-manager", () => ({
  detectPackageManager: jest.fn().mockResolvedValue("npm"),
  checkNpxAvailability: jest
    .fn()
    .mockResolvedValue({ available: true, npmVersion: "7.0.0" }),
  getInstallInstructions: jest.fn().mockReturnValue({
    local: "npm install --save-dev vibe-codex",
    global: "npm install -g vibe-codex",
  }),
}));

describe("Doctor Command", () => {
  let consoleLogSpy;
  let consoleErrorSpy;

  beforeEach(() => {
    jest.clearAllMocks();
    consoleLogSpy = jest.spyOn(console, "log").mockImplementation();
    consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("checkNodeVersion", () => {
    it("should pass with valid Node.js version", async () => {
      exec.mockImplementation((cmd, callback) => {
        callback(null, { stdout: "v16.0.0\n" });
      });

      await doctor({});

      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining("Node.js version: PASSED"),
      );
    });

    it("should fail with old Node.js version", async () => {
      exec.mockImplementation((cmd, callback) => {
        if (cmd === "node --version") {
          callback(null, { stdout: "v12.0.0\n" });
        } else {
          callback(null, { stdout: "7.0.0\n" });
        }
      });

      await doctor({});

      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining("Node.js version: FAILED"),
      );
    });
  });

  describe("checkGit", () => {
    it("should pass when in git repository", async () => {
      exec.mockImplementation((cmd, callback) => {
        if (cmd === "git --version") {
          callback(null, { stdout: "git version 2.30.0\n" });
        } else if (cmd === "git rev-parse --is-inside-work-tree") {
          callback(null, { stdout: "true\n" });
        } else {
          callback(null, { stdout: "mock output\n" });
        }
      });

      await doctor({});

      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining("Git: PASSED"),
      );
    });

    it("should fail when not in git repository", async () => {
      exec.mockImplementation((cmd, callback) => {
        if (cmd === "git --version") {
          callback(null, { stdout: "git version 2.30.0\n" });
        } else if (cmd === "git rev-parse --is-inside-work-tree") {
          callback(new Error("not a git repository"));
        } else {
          callback(null, { stdout: "mock output\n" });
        }
      });

      await doctor({});

      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining("Git: FAILED"),
      );
    });
  });

  describe("checkConfiguration", () => {
    it("should pass with valid configuration", async () => {
      fs.readJSON.mockResolvedValue({
        version: "1.0.0",
        modules: {
          core: { enabled: true },
          testing: { enabled: true },
        },
      });

      exec.mockImplementation((cmd, callback) => {
        if (cmd === "node --version") {
          callback(null, { stdout: "v16.0.0\n" });
        } else {
          callback(null, { stdout: "mock\n" });
        }
      });

      await doctor({});

      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining("Configuration file: PASSED"),
      );
    });

    it("should fail with missing configuration", async () => {
      fs.readJSON.mockRejectedValue(new Error("File not found"));

      exec.mockImplementation((cmd, callback) => {
        if (cmd === "node --version") {
          callback(null, { stdout: "v16.0.0\n" });
        } else {
          callback(null, { stdout: "mock\n" });
        }
      });

      await doctor({});

      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining("Configuration file: FAILED"),
      );
    });
  });

  describe("checkGitHooks", () => {
    it("should pass when hooks are installed", async () => {
      fs.readFile.mockImplementation((path) => {
        if (path.includes("pre-commit") || path.includes("commit-msg")) {
          return Promise.resolve(
            "#!/bin/sh\n# vibe-codex hook\nnpx vibe-codex validate",
          );
        }
        return Promise.reject(new Error("Not found"));
      });

      exec.mockImplementation((cmd, callback) => {
        if (cmd === "node --version") {
          callback(null, { stdout: "v16.0.0\n" });
        } else {
          callback(null, { stdout: "mock\n" });
        }
      });

      await doctor({});

      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining("Git hooks: PASSED"),
      );
    });

    it("should fail when hooks are missing", async () => {
      fs.readFile.mockRejectedValue(new Error("File not found"));

      exec.mockImplementation((cmd, callback) => {
        if (cmd === "node --version") {
          callback(null, { stdout: "v16.0.0\n" });
        } else {
          callback(null, { stdout: "mock\n" });
        }
      });

      await doctor({});

      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining("Git hooks: FAILED"),
      );
    });
  });

  describe("auto-fix", () => {
    it("should attempt fixes when --fix flag is provided", async () => {
      fs.readJSON.mockRejectedValue(new Error("File not found"));

      exec.mockImplementation((cmd, callback) => {
        if (cmd === "node --version") {
          callback(null, { stdout: "v16.0.0\n" });
        } else if (cmd === "npx vibe-codex init") {
          callback(null, { stdout: "Initialized\n" });
        } else {
          callback(null, { stdout: "mock\n" });
        }
      });

      await doctor({ fix: true });

      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining("Attempting automatic fixes"),
      );
    });

    it("should handle fix failures gracefully", async () => {
      fs.readJSON.mockRejectedValue(new Error("File not found"));

      exec.mockImplementation((cmd, callback) => {
        if (cmd === "node --version") {
          callback(null, { stdout: "v16.0.0\n" });
        } else if (cmd === "npx vibe-codex init") {
          callback(new Error("Fix failed"));
        } else {
          callback(null, { stdout: "mock\n" });
        }
      });

      await doctor({ fix: true });

      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining("Failed to fix"),
      );
    });
  });

  describe("summary output", () => {
    it("should show success when all checks pass", async () => {
      exec.mockImplementation((cmd, callback) => {
        if (cmd === "node --version") {
          callback(null, { stdout: "v16.0.0\n" });
        } else if (cmd === "npm --version") {
          callback(null, { stdout: "7.0.0\n" });
        } else if (cmd.includes("git")) {
          callback(null, { stdout: "git version 2.30.0\n" });
        } else {
          callback(null, { stdout: "mock\n" });
        }
      });

      fs.readJSON.mockResolvedValue({
        version: "1.0.0",
        modules: { core: { enabled: true } },
      });

      fs.readFile.mockResolvedValue("#!/bin/sh\nnpx vibe-codex validate");

      await doctor({});

      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining("All checks passed!"),
      );
    });

    it("should show issues summary when checks fail", async () => {
      exec.mockImplementation((cmd, callback) => {
        if (cmd === "node --version") {
          callback(null, { stdout: "v12.0.0\n" });
        } else {
          callback(new Error("Command failed"));
        }
      });

      await doctor({});

      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining("Found"),
      );
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining("issue(s)"),
      );
    });
  });
});
