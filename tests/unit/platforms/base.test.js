/**
 * Tests for base GitPlatform interface
 */

const GitPlatform = require("../../../lib/platforms/base");

describe("GitPlatform base class", () => {
  let platform;

  beforeEach(() => {
    platform = new GitPlatform({ test: true });
  });

  test("should initialize with config", () => {
    expect(platform.config).toEqual({ test: true });
    expect(platform.methods).toEqual([]);
  });

  test("should throw error for unimplemented initialize", async () => {
    await expect(platform.initialize()).rejects.toThrow(
      "Platform must implement initialize()",
    );
  });

  test("should throw error for unimplemented createPullRequest", async () => {
    await expect(platform.createPullRequest({})).rejects.toThrow(
      "Platform must implement createPullRequest()",
    );
  });

  test("should throw error for unimplemented listPullRequests", async () => {
    await expect(platform.listPullRequests()).rejects.toThrow(
      "Platform must implement listPullRequests()",
    );
  });

  test("should throw error for unimplemented getPullRequest", async () => {
    await expect(platform.getPullRequest(1)).rejects.toThrow(
      "Platform must implement getPullRequest()",
    );
  });

  test("should throw error for unimplemented updatePullRequest", async () => {
    await expect(platform.updatePullRequest(1, {})).rejects.toThrow(
      "Platform must implement updatePullRequest()",
    );
  });

  test("should throw error for unimplemented createIssue", async () => {
    await expect(platform.createIssue({})).rejects.toThrow(
      "Platform must implement createIssue()",
    );
  });

  test("should throw error for unimplemented listIssues", async () => {
    await expect(platform.listIssues()).rejects.toThrow(
      "Platform must implement listIssues()",
    );
  });

  test("should throw error for unimplemented getIssue", async () => {
    await expect(platform.getIssue(1)).rejects.toThrow(
      "Platform must implement getIssue()",
    );
  });

  test("should throw error for unimplemented updateIssue", async () => {
    await expect(platform.updateIssue(1, {})).rejects.toThrow(
      "Platform must implement updateIssue()",
    );
  });

  test("should throw error for unimplemented createLabel", async () => {
    await expect(platform.createLabel({})).rejects.toThrow(
      "Platform must implement createLabel()",
    );
  });

  test("should throw error for unimplemented listLabels", async () => {
    await expect(platform.listLabels()).rejects.toThrow(
      "Platform must implement listLabels()",
    );
  });

  test("should throw error for unimplemented getRepository", async () => {
    await expect(platform.getRepository()).rejects.toThrow(
      "Platform must implement getRepository()",
    );
  });

  test("should throw error for unimplemented getBranches", async () => {
    await expect(platform.getBranches()).rejects.toThrow(
      "Platform must implement getBranches()",
    );
  });

  test("should throw error for unimplemented getCurrentBranch", async () => {
    await expect(platform.getCurrentBranch()).rejects.toThrow(
      "Platform must implement getCurrentBranch()",
    );
  });

  test("should throw error for unimplemented isAvailable", async () => {
    await expect(platform.isAvailable()).rejects.toThrow(
      "Platform must implement isAvailable()",
    );
  });

  test("should return empty methods array", () => {
    expect(platform.getAvailableMethods()).toEqual([]);
  });
});
