/**
 * Tests for github actions module
 */

const chalk = require("chalk");

// Mock dependencies
jest.mock("chalk", () => ({
  green: jest.fn((text) => text),
  yellow: jest.fn((text) => text),
  red: jest.fn((text) => text),
}));

jest.mock("../../../../lib/platforms", () => ({
  PlatformManager: jest.fn().mockImplementation(() => ({
    detect: jest.fn().mockResolvedValue({
      name: "GitHub",
      createPullRequest: jest
        .fn()
        .mockResolvedValue({ number: 123, url: "https://github.com/pr/123" }),
      createIssue: jest
        .fn()
        .mockResolvedValue({
          number: 456,
          url: "https://github.com/issue/456",
        }),
      listPullRequests: jest.fn().mockResolvedValue([]),
      listIssues: jest.fn().mockResolvedValue([]),
      updatePullRequest: jest.fn().mockResolvedValue({}),
      updateIssue: jest.fn().mockResolvedValue({}),
      createLabel: jest.fn().mockResolvedValue({}),
      getRepository: jest.fn().mockResolvedValue({ name: "test-repo" }),
      getCurrentBranch: jest.fn().mockResolvedValue("main"),
      getBranches: jest.fn().mockResolvedValue(["main", "develop"]),
    }),
  })),
}));

const GitHubActions = require("../../../../lib/modules/github/actions");

describe("GitHub Actions", () => {
  let actions;
  let mockPlatform;

  beforeEach(() => {
    jest.clearAllMocks();
    console.log = jest.fn();
    console.warn = jest.fn();
    console.error = jest.fn();

    actions = new GitHubActions();
  });

  test("should initialize GitHub platform", async () => {
    await actions.initialize();

    expect(actions.platform).toBeDefined();
    expect(actions.platform.name).toBe("GitHub");
  });

  test("should warn when not in GitHub repository", async () => {
    const { PlatformManager } = require("../../../../lib/platforms");
    PlatformManager.mockImplementationOnce(() => ({
      detect: jest.fn().mockResolvedValue({ name: "GitLab" }),
    }));

    const nonGitHubActions = new GitHubActions();
    await nonGitHubActions.initialize();

    expect(console.warn).toHaveBeenCalledWith(
      expect.stringContaining("Not in a GitHub repository"),
    );
  });

  test("should create pull request", async () => {
    await actions.initialize();

    const pr = await actions.createPR({
      title: "Test PR",
      body: "Test description",
      base: "main",
      head: "feature/test",
    });

    expect(pr.number).toBe(123);
    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining("Pull request created"),
    );
  });

  test("should create issue", async () => {
    await actions.initialize();

    const issue = await actions.createIssue({
      title: "Test Issue",
      body: "Issue description",
      labels: ["bug"],
    });

    expect(issue.number).toBe(456);
    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining("Issue created"),
    );
  });

  test("should list pull requests", async () => {
    await actions.initialize();
    actions.platform.listPullRequests.mockResolvedValue([
      { number: 1, title: "PR 1" },
      { number: 2, title: "PR 2" },
    ]);

    const prs = await actions.listPRs({ state: "open" });

    expect(prs).toHaveLength(2);
  });

  test("should list issues", async () => {
    await actions.initialize();
    actions.platform.listIssues.mockResolvedValue([
      { number: 1, title: "Issue 1" },
      { number: 2, title: "Issue 2" },
    ]);

    const issues = await actions.listIssues({ state: "open" });

    expect(issues).toHaveLength(2);
  });

  test("should update pull request", async () => {
    await actions.initialize();

    const updated = await actions.updatePR(123, {
      title: "Updated Title",
    });

    expect(actions.platform.updatePullRequest).toHaveBeenCalledWith(123, {
      title: "Updated Title",
    });
    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining("Pull request #123 updated"),
    );
  });

  test("should update issue", async () => {
    await actions.initialize();

    const updated = await actions.updateIssue(456, {
      labels: ["enhancement"],
    });

    expect(actions.platform.updateIssue).toHaveBeenCalledWith(456, {
      labels: ["enhancement"],
    });
    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining("Issue #456 updated"),
    );
  });

  test("should create label", async () => {
    await actions.initialize();

    const label = await actions.createLabel({
      name: "documentation",
      color: "0075ca",
    });

    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining('Label "documentation" created'),
    );
  });

  test("should get repository info", async () => {
    await actions.initialize();

    const repo = await actions.getRepoInfo();

    expect(repo.name).toBe("test-repo");
  });

  test("should get current branch", async () => {
    await actions.initialize();

    const branch = await actions.getCurrentBranch();

    expect(branch).toBe("main");
  });

  test("should get branches", async () => {
    await actions.initialize();

    const branches = await actions.getBranches();

    expect(branches).toEqual(["main", "develop"]);
  });

  test("should handle errors gracefully", async () => {
    await actions.initialize();
    actions.platform.createPullRequest.mockRejectedValue(
      new Error("API error"),
    );

    await expect(actions.createPR({})).rejects.toThrow("API error");
    expect(console.error).toHaveBeenCalledWith(
      expect.stringContaining("Failed to create pull request"),
    );
  });
});
