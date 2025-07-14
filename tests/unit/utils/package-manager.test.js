/**
 * Tests for package manager utilities
 */

const fs = require("fs-extra");
const { exec } = require("child_process");
const {
  detectPackageManager,
  commandExists,
  checkNpxAvailability,
  getRunCommand,
  getInstallInstructions,
  validateSetup,
} = require("../../../lib/utils/package-manager");

jest.mock("fs-extra");
jest.mock("child_process");

describe("Package Manager Utils", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("detectPackageManager", () => {
    it("should detect yarn when yarn.lock exists", async () => {
      fs.pathExists.mockImplementation((path) =>
        Promise.resolve(path.includes("yarn.lock")),
      );

      const result = await detectPackageManager();
      expect(result).toBe("yarn");
    });

    it("should detect pnpm when pnpm-lock.yaml exists", async () => {
      fs.pathExists.mockImplementation((path) =>
        Promise.resolve(path.includes("pnpm-lock.yaml")),
      );

      const result = await detectPackageManager();
      expect(result).toBe("pnpm");
    });

    it("should detect npm when package-lock.json exists", async () => {
      fs.pathExists.mockImplementation((path) =>
        Promise.resolve(path.includes("package-lock.json")),
      );

      const result = await detectPackageManager();
      expect(result).toBe("npm");
    });

    it("should default to npm when no lock file found", async () => {
      fs.pathExists.mockResolvedValue(false);

      const result = await detectPackageManager();
      expect(result).toBe("npm");
    });
  });

  describe("commandExists", () => {
    it("should return true when command exists", async () => {
      exec.mockImplementation((cmd, callback) => {
        callback(null, { stdout: "/usr/bin/npm" });
      });

      const result = await commandExists("npm");
      expect(result).toBe(true);
    });

    it("should return false when command does not exist", async () => {
      exec.mockImplementation((cmd, callback) => {
        callback(new Error("command not found"));
      });

      const result = await commandExists("nonexistent");
      expect(result).toBe(false);
    });
  });

  describe("checkNpxAvailability", () => {
    it("should detect npx with npm 5.2.0+", async () => {
      exec.mockImplementation((cmd, callback) => {
        callback(null, { stdout: "6.14.0\n" });
      });

      const result = await checkNpxAvailability();
      expect(result).toEqual({
        available: true,
        npmVersion: "6.14.0",
      });
    });

    it("should detect npx not available with old npm", async () => {
      exec.mockImplementation((cmd, callback) => {
        if (cmd === "npm --version") {
          callback(null, { stdout: "5.1.0\n" });
        } else {
          callback(new Error("command not found"));
        }
      });

      const result = await checkNpxAvailability();
      expect(result.available).toBe(false);
      expect(result.npmVersion).toBe("5.1.0");
    });

    it("should handle npm not found", async () => {
      exec.mockImplementation((cmd, callback) => {
        callback(new Error("npm not found"));
      });

      const result = await checkNpxAvailability();
      expect(result).toEqual({
        available: false,
        error: "npm not found",
      });
    });
  });

  describe("getRunCommand", () => {
    it("should return correct commands for npm", () => {
      expect(getRunCommand("npm", false)).toBe("npx --no-install");
      expect(getRunCommand("npm", true)).toBe("npx");
    });

    it("should return correct commands for yarn", () => {
      expect(getRunCommand("yarn", false)).toBe("yarn");
      expect(getRunCommand("yarn", true)).toBe("yarn dlx");
    });

    it("should return correct commands for pnpm", () => {
      expect(getRunCommand("pnpm", false)).toBe("pnpm exec");
      expect(getRunCommand("pnpm", true)).toBe("pnpm dlx");
    });

    it("should default to npm for unknown package manager", () => {
      expect(getRunCommand("unknown", false)).toBe("npx --no-install");
    });
  });

  describe("getInstallInstructions", () => {
    it("should return npm instructions", () => {
      const instructions = getInstallInstructions("npm");
      expect(instructions.local).toBe("npm install --save-dev vibe-codex");
      expect(instructions.global).toBe("npm install -g vibe-codex");
    });

    it("should return yarn instructions", () => {
      const instructions = getInstallInstructions("yarn");
      expect(instructions.local).toBe("yarn add --dev vibe-codex");
      expect(instructions.global).toBe("yarn global add vibe-codex");
    });

    it("should return pnpm instructions", () => {
      const instructions = getInstallInstructions("pnpm");
      expect(instructions.local).toBe("pnpm add -D vibe-codex");
      expect(instructions.global).toBe("pnpm add -g vibe-codex");
    });
  });

  describe("validateSetup", () => {
    it("should pass with valid setup", async () => {
      exec.mockImplementation((cmd, callback) => {
        if (cmd === "node --version") {
          callback(null, { stdout: "v16.0.0\n" });
        } else if (cmd === "npm --version") {
          callback(null, { stdout: "7.0.0\n" });
        } else if (cmd === "npm") {
          callback(null, { stdout: "/usr/bin/npm" });
        }
      });

      fs.pathExists.mockResolvedValue(false);

      const result = await validateSetup();
      expect(result.errors).toHaveLength(0);
      expect(result.warnings).toHaveLength(0);
      expect(result.npxAvailable).toBe(true);
    });

    it("should error on old Node.js version", async () => {
      exec.mockImplementation((cmd, callback) => {
        if (cmd === "node --version") {
          callback(null, { stdout: "v12.0.0\n" });
        } else {
          callback(null, { stdout: "7.0.0\n" });
        }
      });

      const result = await validateSetup();
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toContain("too old");
    });

    it("should warn when npx is not available", async () => {
      exec.mockImplementation((cmd, callback) => {
        if (cmd === "node --version") {
          callback(null, { stdout: "v16.0.0\n" });
        } else if (cmd === "npm --version") {
          callback(null, { stdout: "5.0.0\n" });
        }
      });

      const result = await validateSetup();
      expect(result.warnings.length).toBeGreaterThan(0);
      expect(result.npxAvailable).toBe(false);
    });

    it("should warn when package manager is missing", async () => {
      exec.mockImplementation((cmd, callback) => {
        if (cmd === "node --version") {
          callback(null, { stdout: "v16.0.0\n" });
        } else if (cmd === "npm --version") {
          callback(null, { stdout: "7.0.0\n" });
        } else if (cmd === "yarn") {
          callback(new Error("command not found"));
        }
      });

      fs.pathExists.mockImplementation((path) =>
        Promise.resolve(path.includes("yarn.lock")),
      );

      const result = await validateSetup();
      expect(result.warnings).toContainEqual(
        expect.stringContaining("Lock file suggests yarn"),
      );
    });
  });
});
