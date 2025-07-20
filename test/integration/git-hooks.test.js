/**
 * Integration tests for git hooks
 */

const fs = require("fs-extra");
const path = require("path");
const { execSync } = require("child_process");
const { installGitHooks } = require("../../lib/installer/git-hooks");
const logger = require("../../lib/utils/logger");

// Mock dependencies
jest.mock("fs-extra");
jest.mock("child_process");
jest.mock("../../lib/utils/logger");

describe("Git Hooks Integration", () => {
  const gitHooksDir = ".git/hooks";
  let consoleLogSpy;

  beforeEach(() => {
    jest.clearAllMocks();
    consoleLogSpy = jest.spyOn(console, "log").mockImplementation();
    
    // Default mocks
    fs.pathExists.mockResolvedValue(true);
    fs.ensureDir.mockResolvedValue();
    fs.copy.mockResolvedValue();
    fs.chmod.mockResolvedValue();
    fs.readFile.mockResolvedValue("");
    fs.writeFile.mockResolvedValue();
    
    execSync.mockImplementation(() => "");
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
  });

  describe("installation", () => {
    it("should install basic hooks", async () => {
      await installGitHooks({
        config: {
          modules: {
            core: { enabled: true }
          }
        }
      });
      
      // Check pre-commit hook
      expect(fs.copy).toHaveBeenCalledWith(
        expect.stringContaining("pre-commit"),
        path.join(gitHooksDir, "pre-commit")
      );
      
      // Check commit-msg hook
      expect(fs.copy).toHaveBeenCalledWith(
        expect.stringContaining("commit-msg"),
        path.join(gitHooksDir, "commit-msg")
      );
      
      // Make hooks executable
      expect(fs.chmod).toHaveBeenCalledWith(
        path.join(gitHooksDir, "pre-commit"),
        "755"
      );
    });

    it("should install advanced hooks when specified", async () => {
      await installGitHooks({
        config: {
          modules: {
            core: { enabled: true }
          }
        },
        advancedHooks: ["pr-health", "issue-tracking"]
      });
      
      // Should install additional hooks
      expect(fs.copy).toHaveBeenCalledWith(
        expect.stringContaining("pr-health"),
        expect.any(String)
      );
    });

    it("should skip hooks for disabled modules", async () => {
      await installGitHooks({
        config: {
          modules: {
            core: { enabled: true },
            testing: { enabled: false }
          }
        }
      });
      
      // Should not install test-related hooks
      expect(fs.copy).not.toHaveBeenCalledWith(
        expect.stringContaining("pre-push-test"),
        expect.any(String)
      );
    });
  });

  describe("hook execution", () => {
    describe("pre-commit hook", () => {
      it("should validate files before commit", async () => {
        const hookContent = `#!/bin/bash
npx vibe-codex validate --hook pre-commit --staged`;
        
        fs.readFile.mockResolvedValue(hookContent);
        
        // Simulate hook execution
        execSync.mockImplementation((cmd) => {
          if (cmd.includes("validate --hook pre-commit")) {
            return JSON.stringify({
              violations: [],
              warnings: [],
              passed: [{ rule: "SEC-001" }]
            });
          }
          return "";
        });
        
        const result = execSync("bash .git/hooks/pre-commit");
        
        expect(execSync).toHaveBeenCalledWith(
          expect.stringContaining("validate --hook pre-commit")
        );
      });

      it("should block commit on violations", async () => {
        execSync.mockImplementation((cmd) => {
          if (cmd.includes("validate --hook pre-commit")) {
            throw new Error("Validation failed: Secrets found");
          }
          return "";
        });
        
        expect(() => {
          execSync("bash .git/hooks/pre-commit");
        }).toThrow("Validation failed");
      });
    });

    describe("commit-msg hook", () => {
      it("should validate commit message format", async () => {
        const commitMsgFile = ".git/COMMIT_EDITMSG";
        fs.readFile.mockImplementation((file) => {
          if (file === commitMsgFile) {
            return "feat: add new feature\n\nCloses #123";
          }
          return "";
        });
        
        const hookContent = `#!/bin/bash
npx vibe-codex validate --hook commit-msg --message $1`;
        
        execSync.mockImplementation((cmd) => {
          if (cmd.includes("validate --hook commit-msg")) {
            return ""; // Success
          }
          return "";
        });
        
        const result = execSync(`bash .git/hooks/commit-msg ${commitMsgFile}`);
        
        expect(execSync).toHaveBeenCalledWith(
          expect.stringContaining("commit-msg")
        );
      });

      it("should reject invalid commit messages", async () => {
        fs.readFile.mockResolvedValue("bad commit message");
        
        execSync.mockImplementation((cmd) => {
          if (cmd.includes("validate --hook commit-msg")) {
            throw new Error("Invalid commit message format");
          }
          return "";
        });
        
        expect(() => {
          execSync("bash .git/hooks/commit-msg .git/COMMIT_EDITMSG");
        }).toThrow("Invalid commit message");
      });
    });
  });

  describe("hook configuration", () => {
    it("should respect SKIP_VIBE_CODEX environment variable", async () => {
      process.env.SKIP_VIBE_CODEX = "1";
      
      const hookContent = `#!/bin/bash
if [ "$SKIP_VIBE_CODEX" = "1" ]; then
  exit 0
fi
npx vibe-codex validate --hook pre-commit`;
      
      fs.readFile.mockResolvedValue(hookContent);
      
      // Should skip validation
      const result = execSync("bash .git/hooks/pre-commit");
      
      expect(execSync).not.toHaveBeenCalledWith(
        expect.stringContaining("vibe-codex validate")
      );
      
      delete process.env.SKIP_VIBE_CODEX;
    });

    it("should handle hook failures gracefully", async () => {
      execSync.mockImplementation(() => {
        throw new Error("Command not found: vibe-codex");
      });
      
      await expect(installGitHooks({
        config: { modules: { core: { enabled: true } } }
      })).rejects.toThrow();
      
      expect(logger.error).toHaveBeenCalledWith(
        expect.stringContaining("Failed to install")
      );
    });
  });

  describe("hook updates", () => {
    it("should backup existing hooks before overwriting", async () => {
      fs.pathExists.mockImplementation((file) => {
        return file.endsWith("pre-commit");
      });
      
      await installGitHooks({
        config: { modules: { core: { enabled: true } } }
      });
      
      expect(fs.copy).toHaveBeenCalledWith(
        path.join(gitHooksDir, "pre-commit"),
        path.join(gitHooksDir, "pre-commit.backup"),
        { overwrite: true }
      );
    });

    it("should merge with existing hooks if possible", async () => {
      const existingHook = `#!/bin/bash
# Existing hook
npm run lint`;
      
      fs.readFile.mockResolvedValue(existingHook);
      
      await installGitHooks({
        config: { modules: { core: { enabled: true } } },
        merge: true
      });
      
      expect(fs.writeFile).toHaveBeenCalledWith(
        expect.any(String),
        expect.stringContaining("npm run lint")
      );
      expect(fs.writeFile).toHaveBeenCalledWith(
        expect.any(String),
        expect.stringContaining("vibe-codex validate")
      );
    });
  });
});