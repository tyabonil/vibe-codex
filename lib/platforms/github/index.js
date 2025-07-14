/**
 * GitHub platform implementation with multiple interaction methods
 */

const GitPlatform = require("../base");
const GitHubCLI = require("./cli");
const chalk = require("chalk");

class GitHubPlatform extends GitPlatform {
  constructor(config = {}) {
    super(config);
    this.name = "GitHub";
    this.availableMethods = {
      cli: new GitHubCLI(),
      // Future: api: new GitHubAPI(),
      // Future: mcp: new GitHubMCP()
    };
    this.activeMethod = null;
    this.preferredMethods = config.preferredMethods || ["cli", "api", "mcp"];
  }

  /**
   * Initialize the platform with available methods
   * @returns {Promise<void>}
   */
  async initialize() {
    this.methods = [];

    // Check which methods are available
    for (const [name, method] of Object.entries(this.availableMethods)) {
      if (await method.isAvailable()) {
        this.methods.push(name);
      }
    }

    if (this.methods.length === 0) {
      throw new Error("No GitHub interaction methods available");
    }

    // Select the first available preferred method
    for (const preferred of this.preferredMethods) {
      if (this.methods.includes(preferred)) {
        this.activeMethod = this.availableMethods[preferred];
        console.log(
          chalk.blue(`Using GitHub ${preferred.toUpperCase()} method`),
        );
        break;
      }
    }

    if (!this.activeMethod) {
      // Fallback to first available method
      const firstMethod = this.methods[0];
      this.activeMethod = this.availableMethods[firstMethod];
      console.log(
        chalk.yellow(
          `Using fallback GitHub ${firstMethod.toUpperCase()} method`,
        ),
      );
    }
  }

  /**
   * Execute with automatic fallback to other methods
   * @param {string} operation - Operation name
   * @param {Array} args - Operation arguments
   * @returns {Promise<any>} Operation result
   */
  async executeWithFallback(operation, ...args) {
    const errors = [];

    // Try current active method
    try {
      return await this.activeMethod[operation](...args);
    } catch (error) {
      errors.push({ method: this.activeMethod.name, error });
    }

    // Try other available methods
    for (const [name, method] of Object.entries(this.availableMethods)) {
      if (method === this.activeMethod || !this.methods.includes(name)) {
        continue;
      }

      try {
        console.log(
          chalk.yellow(`Falling back to GitHub ${name.toUpperCase()} method`),
        );
        const result = await method[operation](...args);
        // Update active method for future operations
        this.activeMethod = method;
        return result;
      } catch (error) {
        errors.push({ method: name, error });
      }
    }

    // All methods failed
    const errorMessages = errors
      .map((e) => `${e.method}: ${e.error.message}`)
      .join("\n");
    throw new Error(`All GitHub methods failed:\n${errorMessages}`);
  }

  /**
   * Check if platform is available
   * @returns {Promise<boolean>}
   */
  async isAvailable() {
    try {
      // Check if we're in a GitHub repository
      const { exec } = require("child_process");
      const { promisify } = require("util");
      const execAsync = promisify(exec);

      const { stdout } = await execAsync("git remote get-url origin");
      return stdout.includes("github.com");
    } catch {
      return false;
    }
  }

  // Implement all GitPlatform methods with automatic fallback

  async createPullRequest(options) {
    return await this.executeWithFallback("createPullRequest", options);
  }

  async listPullRequests(filters = {}) {
    return await this.executeWithFallback("listPullRequests", filters);
  }

  async getPullRequest(prNumber) {
    return await this.executeWithFallback("getPullRequest", prNumber);
  }

  async updatePullRequest(prNumber, updates) {
    return await this.executeWithFallback(
      "updatePullRequest",
      prNumber,
      updates,
    );
  }

  async createIssue(options) {
    return await this.executeWithFallback("createIssue", options);
  }

  async listIssues(filters = {}) {
    return await this.executeWithFallback("listIssues", filters);
  }

  async getIssue(issueNumber) {
    return await this.executeWithFallback("getIssue", issueNumber);
  }

  async updateIssue(issueNumber, updates) {
    return await this.executeWithFallback("updateIssue", issueNumber, updates);
  }

  async createLabel(options) {
    return await this.executeWithFallback("createLabel", options);
  }

  async listLabels() {
    return await this.executeWithFallback("listLabels");
  }

  async getRepository() {
    return await this.executeWithFallback("getRepository");
  }

  async getBranches() {
    return await this.executeWithFallback("getBranches");
  }

  async getCurrentBranch() {
    return await this.executeWithFallback("getCurrentBranch");
  }
}

module.exports = GitHubPlatform;
