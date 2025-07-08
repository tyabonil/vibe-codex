/**
 * GitHub actions using the platform-agnostic system
 */

const { PlatformManager } = require('../../platforms');
const chalk = require('chalk');

class GitHubActions {
  constructor(config = {}) {
    this.config = config;
    this.platformManager = new PlatformManager(config.platforms || {});
    this.platform = null;
  }

  /**
   * Initialize the GitHub platform
   * @returns {Promise<void>}
   */
  async initialize() {
    try {
      this.platform = await this.platformManager.detect();
      
      if (this.platform.name !== 'GitHub') {
        console.warn(chalk.yellow('Warning: Not in a GitHub repository'));
      }
    } catch (error) {
      console.error(chalk.red('Failed to initialize git platform:'), error.message);
      throw error;
    }
  }

  /**
   * Create a pull request with platform abstraction
   * @param {Object} options - PR options
   * @returns {Promise<Object>} PR details
   */
  async createPR(options) {
    if (!this.platform) {
      await this.initialize();
    }

    try {
      const pr = await this.platform.createPullRequest({
        title: options.title,
        body: options.body || '',
        base: options.base || 'main',
        head: options.head || await this.platform.getCurrentBranch(),
        draft: options.draft || false,
        labels: options.labels || [],
        assignees: options.assignees || []
      });

      console.log(chalk.green(`Pull request created: ${pr.url || pr.number}`));
      return pr;
    } catch (error) {
      console.error(chalk.red('Failed to create pull request:'), error.message);
      throw error;
    }
  }

  /**
   * Create an issue with platform abstraction
   * @param {Object} options - Issue options
   * @returns {Promise<Object>} Issue details
   */
  async createIssue(options) {
    if (!this.platform) {
      await this.initialize();
    }

    try {
      const issue = await this.platform.createIssue({
        title: options.title,
        body: options.body || '',
        labels: options.labels || [],
        assignees: options.assignees || []
      });

      console.log(chalk.green(`Issue created: ${issue.url || issue.number}`));
      return issue;
    } catch (error) {
      console.error(chalk.red('Failed to create issue:'), error.message);
      throw error;
    }
  }

  /**
   * List pull requests
   * @param {Object} filters - Filter options
   * @returns {Promise<Array>} List of PRs
   */
  async listPRs(filters = {}) {
    if (!this.platform) {
      await this.initialize();
    }

    try {
      return await this.platform.listPullRequests(filters);
    } catch (error) {
      console.error(chalk.red('Failed to list pull requests:'), error.message);
      throw error;
    }
  }

  /**
   * List issues
   * @param {Object} filters - Filter options
   * @returns {Promise<Array>} List of issues
   */
  async listIssues(filters = {}) {
    if (!this.platform) {
      await this.initialize();
    }

    try {
      return await this.platform.listIssues(filters);
    } catch (error) {
      console.error(chalk.red('Failed to list issues:'), error.message);
      throw error;
    }
  }

  /**
   * Update a pull request
   * @param {number} prNumber - PR number
   * @param {Object} updates - Updates to apply
   * @returns {Promise<Object>} Updated PR details
   */
  async updatePR(prNumber, updates) {
    if (!this.platform) {
      await this.initialize();
    }

    try {
      const pr = await this.platform.updatePullRequest(prNumber, updates);
      console.log(chalk.green(`Pull request #${prNumber} updated`));
      return pr;
    } catch (error) {
      console.error(chalk.red('Failed to update pull request:'), error.message);
      throw error;
    }
  }

  /**
   * Update an issue
   * @param {number} issueNumber - Issue number
   * @param {Object} updates - Updates to apply
   * @returns {Promise<Object>} Updated issue details
   */
  async updateIssue(issueNumber, updates) {
    if (!this.platform) {
      await this.initialize();
    }

    try {
      const issue = await this.platform.updateIssue(issueNumber, updates);
      console.log(chalk.green(`Issue #${issueNumber} updated`));
      return issue;
    } catch (error) {
      console.error(chalk.red('Failed to update issue:'), error.message);
      throw error;
    }
  }

  /**
   * Create a label
   * @param {Object} options - Label options
   * @returns {Promise<Object>} Label details
   */
  async createLabel(options) {
    if (!this.platform) {
      await this.initialize();
    }

    try {
      const label = await this.platform.createLabel(options);
      console.log(chalk.green(`Label "${options.name}" created`));
      return label;
    } catch (error) {
      console.error(chalk.red('Failed to create label:'), error.message);
      throw error;
    }
  }

  /**
   * Get repository information
   * @returns {Promise<Object>} Repository details
   */
  async getRepoInfo() {
    if (!this.platform) {
      await this.initialize();
    }

    try {
      return await this.platform.getRepository();
    } catch (error) {
      console.error(chalk.red('Failed to get repository info:'), error.message);
      throw error;
    }
  }

  /**
   * Get current branch
   * @returns {Promise<string>} Current branch name
   */
  async getCurrentBranch() {
    if (!this.platform) {
      await this.initialize();
    }

    try {
      return await this.platform.getCurrentBranch();
    } catch (error) {
      console.error(chalk.red('Failed to get current branch:'), error.message);
      throw error;
    }
  }

  /**
   * Get branches
   * @returns {Promise<Array>} List of branches
   */
  async getBranches() {
    if (!this.platform) {
      await this.initialize();
    }

    try {
      return await this.platform.getBranches();
    } catch (error) {
      console.error(chalk.red('Failed to get branches:'), error.message);
      throw error;
    }
  }
}

module.exports = GitHubActions;