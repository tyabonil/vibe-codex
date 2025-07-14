/**
 * Tests for hooks-downloader
 */

const fs = require("fs-extra");
const path = require("path");
const fetch = require("node-fetch");
const chalk = require("chalk");

// Mock dependencies
jest.mock("fs-extra");
jest.mock("node-fetch");
jest.mock("chalk", () => ({
  blue: jest.fn((text) => text),
  green: jest.fn((text) => text),
  yellow: jest.fn((text) => text),
  red: jest.fn((text) => text),
  gray: jest.fn((text) => text),
}));

const {
  downloadHookScripts,
} = require("../../../lib/installer/hooks-downloader");

describe("Hooks Downloader", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    console.log = jest.fn();
    console.error = jest.fn();

    fs.ensureDir.mockResolvedValue();
    fs.writeFile.mockResolvedValue();
    fs.pathExists.mockResolvedValue(false);

    fetch.mockResolvedValue({
      ok: true,
      text: jest.fn().mockResolvedValue("hook script content"),
    });
  });

  test("should download hook scripts from repository", async () => {
    await downloadHookScripts({});

    expect(fetch).toHaveBeenCalled();
    expect(fetch.mock.calls[0][0]).toContain("github.com");
  });

  test("should save downloaded scripts locally", async () => {
    await downloadHookScripts({});

    expect(fs.ensureDir).toHaveBeenCalled();
    expect(fs.writeFile).toHaveBeenCalled();
  });

  test("should handle network errors", async () => {
    fetch.mockRejectedValueOnce(new Error("Network error"));

    await expect(downloadHookScripts({})).rejects.toThrow("Network error");
  });

  test("should handle 404 responses", async () => {
    fetch.mockResolvedValue({
      ok: false,
      status: 404,
      statusText: "Not Found",
    });

    await expect(downloadHookScripts({})).rejects.toThrow("Failed to download");
  });

  test("should use cache when available", async () => {
    fs.pathExists.mockResolvedValue(true);
    fs.stat = jest.fn().mockResolvedValue({
      mtime: new Date(),
    });

    await downloadHookScripts({ useCache: true });

    expect(fetch).not.toHaveBeenCalled();
    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining("Using cached"),
    );
  });

  test("should force download when specified", async () => {
    fs.pathExists.mockResolvedValue(true);

    await downloadHookScripts({ force: true });

    expect(fetch).toHaveBeenCalled();
  });

  test("should download multiple hook types", async () => {
    const config = {
      hooks: ["pre-commit", "pre-push", "commit-msg"],
    };

    await downloadHookScripts(config);

    expect(fetch).toHaveBeenCalledTimes(3);
  });

  test("should validate downloaded content", async () => {
    fetch.mockResolvedValue({
      ok: true,
      text: jest.fn().mockResolvedValue(""),
    });

    await expect(downloadHookScripts({})).rejects.toThrow("Empty hook script");
  });

  test("should use custom repository URL", async () => {
    const config = {
      repository: "https://github.com/custom/repo",
    };

    await downloadHookScripts(config);

    expect(fetch.mock.calls[0][0]).toContain("custom/repo");
  });

  test("should retry on failure", async () => {
    fetch
      .mockRejectedValueOnce(new Error("Temporary failure"))
      .mockResolvedValueOnce({
        ok: true,
        text: jest.fn().mockResolvedValue("content"),
      });

    await downloadHookScripts({ retries: 1 });

    expect(fetch).toHaveBeenCalledTimes(2);
  });
});
