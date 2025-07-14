/**
 * Tests for git-hooks installer
 */

const fs = require("fs-extra");
const path = require("path");
const chalk = require("chalk");

// Mock dependencies
jest.mock("fs-extra");
jest.mock("chalk", () => ({
  blue: jest.fn((text) => text),
  green: jest.fn((text) => text),
  yellow: jest.fn((text) => text),
  red: jest.fn((text) => text),
}));

jest.mock("../../../lib/installer/hooks-downloader", () => ({
  downloadHookScripts: jest.fn().mockResolvedValue(true),
}));

const { installGitHooks } = require("../../../lib/installer/git-hooks");

describe("Git Hooks Installer", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    console.log = jest.fn();

    fs.ensureDir.mockResolvedValue();
    fs.readdir.mockResolvedValue([]);
    fs.stat.mockResolvedValue({ isFile: () => true });
    fs.copy.mockResolvedValue();
    fs.writeFile.mockResolvedValue();
    fs.chmod.mockResolvedValue();
  });

  test("should install git hooks with default config", async () => {
    const config = {
      modules: {
        core: { enabled: true },
      },
    };

    await installGitHooks(config);

    expect(fs.ensureDir).toHaveBeenCalledWith(path.join(".git", "hooks"));
    expect(fs.writeFile).toHaveBeenCalled();
    expect(fs.chmod).toHaveBeenCalledWith(expect.any(String), "755");
  });

  test("should backup existing hooks", async () => {
    fs.readdir.mockResolvedValue(["pre-commit", "pre-push"]);

    await installGitHooks({});

    expect(fs.ensureDir).toHaveBeenCalledWith(
      expect.stringContaining(".backup"),
    );
    expect(fs.copy).toHaveBeenCalledTimes(2);
  });

  test("should install commit-msg hook when validation enabled", async () => {
    const config = {
      modules: {
        core: {
          enabled: true,
          commitMessageValidation: true,
        },
      },
    };

    await installGitHooks(config);

    const writeFileCalls = fs.writeFile.mock.calls;
    const commitMsgHook = writeFileCalls.find((call) =>
      call[0].includes("commit-msg"),
    );
    expect(commitMsgHook).toBeDefined();
  });

  test("should install pre-push hook when testing enabled", async () => {
    const config = {
      modules: {
        core: { enabled: true },
        testing: { enabled: true },
      },
    };

    await installGitHooks(config);

    const writeFileCalls = fs.writeFile.mock.calls;
    const prePushHook = writeFileCalls.find((call) =>
      call[0].includes("pre-push"),
    );
    expect(prePushHook).toBeDefined();
  });

  test("should install post-commit hook when github enabled", async () => {
    const config = {
      modules: {
        core: { enabled: true },
        github: { enabled: true },
      },
    };

    await installGitHooks(config);

    const writeFileCalls = fs.writeFile.mock.calls;
    const postCommitHook = writeFileCalls.find((call) =>
      call[0].includes("post-commit"),
    );
    expect(postCommitHook).toBeDefined();
  });

  test("should handle download failures gracefully", async () => {
    const downloader = require("../../../lib/installer/hooks-downloader");
    downloader.downloadHookScripts.mockRejectedValueOnce(
      new Error("Network error"),
    );

    await expect(installGitHooks({})).rejects.toThrow("Network error");
  });

  test("should skip sample files during backup", async () => {
    fs.readdir.mockResolvedValue([
      "pre-commit.sample",
      ".DS_Store",
      "pre-push",
    ]);

    await installGitHooks({});

    expect(fs.copy).toHaveBeenCalledTimes(1); // Only pre-push
  });

  test("should create executable hooks", async () => {
    await installGitHooks({});

    const chmodCalls = fs.chmod.mock.calls;
    chmodCalls.forEach((call) => {
      expect(call[1]).toBe("755");
    });
  });

  test("should include vibe-codex runner in hooks", async () => {
    await installGitHooks({});

    const writeFileCalls = fs.writeFile.mock.calls;
    const hookContent = writeFileCalls[0][1];

    expect(hookContent).toContain("run_vibe_codex");
    expect(hookContent).toContain("npx --no-install vibe-codex");
    expect(hookContent).toContain("SKIP_VIBE_CODEX");
  });

  test("should handle PR comment check in pre-push", async () => {
    const config = {
      modules: {
        core: { enabled: true },
        testing: { enabled: true },
      },
    };

    await installGitHooks(config);

    const writeFileCalls = fs.writeFile.mock.calls;
    const prePushHook = writeFileCalls.find((call) =>
      call[0].includes("pre-push"),
    );

    expect(prePushHook[1]).toContain("Check for open PRs");
    expect(prePushHook[1]).toContain("gh pr list");
  });
});
