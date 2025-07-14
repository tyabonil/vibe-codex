/**
 * Tests for GitHub CLI method
 */

// Mock child_process before any imports
jest.mock("child_process", () => ({
  exec: jest.fn(),
}));

jest.mock("util", () => ({
  promisify: jest.fn(),
}));

describe("GitHubCLI", () => {
  let GitHubCLI;
  let cli;
  let mockExecAsync;

  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();
    jest.resetModules();

    // Setup the mock for execAsync
    mockExecAsync = jest.fn();
    require("util").promisify.mockReturnValue(mockExecAsync);

    // Now require the module so it gets the mocked execAsync
    GitHubCLI = require("../../../lib/platforms/github/cli");
    cli = new GitHubCLI();
  });

  describe("isAvailable", () => {
    test("should return true when gh CLI is available", async () => {
      mockExecAsync.mockResolvedValue({
        stdout: "gh version 2.0.0",
        stderr: "",
      });

      const result = await cli.isAvailable();
      expect(result).toBe(true);
      expect(mockExecAsync).toHaveBeenCalledWith("gh --version");
    });

    test("should return false when gh CLI is not available", async () => {
      mockExecAsync.mockRejectedValue(new Error("command not found"));

      const result = await cli.isAvailable();
      expect(result).toBe(false);
    });
  });

  describe("execute", () => {
    test("should execute command and parse JSON output", async () => {
      const jsonOutput = { number: 123, title: "Test PR" };
      mockExecAsync.mockResolvedValue({
        stdout: JSON.stringify(jsonOutput),
        stderr: "",
      });

      const result = await cli.execute("pr", ["view", "123"]);
      expect(result).toEqual(jsonOutput);
      expect(mockExecAsync).toHaveBeenCalledWith(
        "gh pr view 123",
        expect.any(Object),
      );
    });

    test("should return raw output when not JSON", async () => {
      mockExecAsync.mockResolvedValue({
        stdout: "https://github.com/user/repo/pull/123\n",
        stderr: "",
      });

      const result = await cli.execute("pr", ["create"]);
      expect(result).toBe("https://github.com/user/repo/pull/123");
    });

    test("should throw error on command failure", async () => {
      mockExecAsync.mockRejectedValue(new Error("Command failed"));

      await expect(cli.execute("pr", ["create"])).rejects.toThrow(
        "GitHub CLI error: Command failed",
      );
    });
  });

  describe("createPullRequest", () => {
    test("should create PR with all options", async () => {
      mockExecAsync.mockResolvedValueOnce({
        stdout: "https://github.com/user/repo/pull/123",
        stderr: "",
      });

      mockExecAsync.mockResolvedValueOnce({
        stdout: JSON.stringify({ number: 123, title: "Test PR" }),
        stderr: "",
      });

      const options = {
        title: "Test PR",
        body: "Test description",
        base: "main",
        head: "feature",
        draft: true,
        labels: ["bug", "enhancement"],
        assignees: ["user1", "user2"],
      };

      const result = await cli.createPullRequest(options);

      expect(mockExecAsync).toHaveBeenCalledWith(
        "gh pr create --title Test PR --body Test description --base main --head feature --draft --label bug,enhancement --assignee user1,user2",
        expect.any(Object),
      );
      expect(result).toEqual({ number: 123, title: "Test PR" });
    });

    test("should handle PR creation without optional fields", async () => {
      mockExecAsync.mockResolvedValue({
        stdout: "https://github.com/user/repo/pull/456",
        stderr: "",
      });

      const options = {
        title: "Simple PR",
        body: "Simple description",
        base: "main",
        head: "feature",
      };

      const result = await cli.createPullRequest(options);
      expect(result).toBe("https://github.com/user/repo/pull/456");
    });
  });

  describe("listPullRequests", () => {
    test("should list PRs with filters", async () => {
      const prs = [{ number: 1 }, { number: 2 }];
      mockExecAsync.mockResolvedValue({
        stdout: JSON.stringify(prs),
        stderr: "",
      });

      const filters = {
        state: "open",
        base: "main",
        label: "bug",
        limit: 10,
      };

      const result = await cli.listPullRequests(filters);

      expect(mockExecAsync).toHaveBeenCalledWith(
        "gh pr list --json number,title,state,author,base,head,labels,url --state open --base main --label bug --limit 10",
        expect.any(Object),
      );
      expect(result).toEqual(prs);
    });
  });

  describe("createIssue", () => {
    test("should create issue and get details", async () => {
      mockExecAsync.mockResolvedValueOnce({
        stdout: "https://github.com/user/repo/issues/456",
        stderr: "",
      });

      mockExecAsync.mockResolvedValueOnce({
        stdout: JSON.stringify({ number: 456, title: "Test Issue" }),
        stderr: "",
      });

      const options = {
        title: "Test Issue",
        body: "Issue description",
        labels: ["bug"],
        assignees: ["user1"],
      };

      const result = await cli.createIssue(options);

      expect(result).toEqual({ number: 456, title: "Test Issue" });
    });
  });

  describe("getRepository", () => {
    test("should get repository information", async () => {
      const repoInfo = {
        name: "repo",
        owner: "user",
        defaultBranch: "main",
      };

      mockExecAsync.mockResolvedValue({
        stdout: JSON.stringify(repoInfo),
        stderr: "",
      });

      const result = await cli.getRepository();

      expect(mockExecAsync).toHaveBeenCalledWith(
        "gh repo view --json name,owner,description,defaultBranch,url,isPrivate",
        expect.any(Object),
      );
      expect(result).toEqual(repoInfo);
    });
  });

  describe("getCurrentBranch", () => {
    test("should get current git branch", async () => {
      mockExecAsync.mockResolvedValue({
        stdout: "feature-branch\n",
        stderr: "",
      });

      const result = await cli.getCurrentBranch();
      expect(result).toBe("feature-branch");
      expect(mockExecAsync).toHaveBeenCalledWith("git branch --show-current");
    });
  });

  describe("getBranches", () => {
    test("should get list of branches", async () => {
      mockExecAsync.mockResolvedValue({
        stdout: "main\nfeature-1\nfeature-2\n",
        stderr: "",
      });

      const result = await cli.getBranches();
      expect(result).toEqual(["main", "feature-1", "feature-2"]);
      expect(mockExecAsync).toHaveBeenCalledWith(
        "gh api repos/:owner/:repo/branches --jq .[].name",
        expect.any(Object),
      );
    });
  });

  describe("createLabel", () => {
    test("should create label with description", async () => {
      mockExecAsync.mockResolvedValue({ stdout: "", stderr: "" });

      const options = {
        name: "bug",
        color: "d73a4a",
        description: "Something isn't working",
      };

      const result = await cli.createLabel(options);

      expect(mockExecAsync).toHaveBeenCalledWith(
        "gh label create bug --color d73a4a --description Something isn't working",
        expect.any(Object),
      );
      expect(result).toEqual(options);
    });
  });
});
