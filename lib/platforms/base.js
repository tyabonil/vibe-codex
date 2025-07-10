/**
 * Base interface for git platform implementations
 */

class GitPlatform {
  constructor(config = {}) {
    this.config = config;
    this.methods = [];
  }

  /**
   * Initialize the platform with available methods
   * @returns {Promise<void>}
   */
  async initialize() {
    throw new Error('Platform must implement initialize()');
  }

  /**
   * Get available interaction methods for this platform
   * @returns {Array<string>} Available methods (e.g., ['cli', 'api', 'mcp'])
   */
  getAvailableMethods() {
    return this.methods;
  }

  /**
   * Create a pull request
   * @param {Object} options - PR options
   * @param {string} options.title - PR title
   * @param {string} options.body - PR body
   * @param {string} options.base - Base branch
   * @param {string} options.head - Head branch
   * @param {string} options.draft - Draft PR flag
   * @returns {Promise<Object>} PR details
   */
  async createPullRequest(options) {
    throw new Error('Platform must implement createPullRequest()');
  }

  /**
   * List pull requests
   * @param {Object} filters - Filter options
   * @returns {Promise<Array>} List of PRs
   */
  async listPullRequests(filters = {}) {
    throw new Error('Platform must implement listPullRequests()');
  }

  /**
   * Get pull request details
   * @param {number} prNumber - PR number
   * @returns {Promise<Object>} PR details
   */
  async getPullRequest(prNumber) {
    throw new Error('Platform must implement getPullRequest()');
  }

  /**
   * Update pull request
   * @param {number} prNumber - PR number
   * @param {Object} updates - Updates to apply
   * @returns {Promise<Object>} Updated PR details
   */
  async updatePullRequest(prNumber, updates) {
    throw new Error('Platform must implement updatePullRequest()');
  }

  /**
   * Create an issue
   * @param {Object} options - Issue options
   * @param {string} options.title - Issue title
   * @param {string} options.body - Issue body
   * @param {Array<string>} options.labels - Issue labels
   * @returns {Promise<Object>} Issue details
   */
  async createIssue(options) {
    throw new Error('Platform must implement createIssue()');
  }

  /**
   * List issues
   * @param {Object} filters - Filter options
   * @returns {Promise<Array>} List of issues
   */
  async listIssues(filters = {}) {
    throw new Error('Platform must implement listIssues()');
  }

  /**
   * Get issue details
   * @param {number} issueNumber - Issue number
   * @returns {Promise<Object>} Issue details
   */
  async getIssue(issueNumber) {
    throw new Error('Platform must implement getIssue()');
  }

  /**
   * Update issue
   * @param {number} issueNumber - Issue number
   * @param {Object} updates - Updates to apply
   * @returns {Promise<Object>} Updated issue details
   */
  async updateIssue(issueNumber, updates) {
    throw new Error('Platform must implement updateIssue()');
  }

  /**
   * Create a label
   * @param {Object} options - Label options
   * @param {string} options.name - Label name
   * @param {string} options.color - Label color
   * @param {string} options.description - Label description
   * @returns {Promise<Object>} Label details
   */
  async createLabel(options) {
    throw new Error('Platform must implement createLabel()');
  }

  /**
   * List labels
   * @returns {Promise<Array>} List of labels
   */
  async listLabels() {
    throw new Error('Platform must implement listLabels()');
  }

  /**
   * Get repository information
   * @returns {Promise<Object>} Repository details
   */
  async getRepository() {
    throw new Error('Platform must implement getRepository()');
  }

  /**
   * Get branches
   * @returns {Promise<Array>} List of branches
   */
  async getBranches() {
    throw new Error('Platform must implement getBranches()');
  }

  /**
   * Get current branch
   * @returns {Promise<string>} Current branch name
   */
  async getCurrentBranch() {
    throw new Error('Platform must implement getCurrentBranch()');
  }

  /**
   * Check if platform is available
   * @returns {Promise<boolean>} True if platform is available
   */
  async isAvailable() {
    throw new Error('Platform must implement isAvailable()');
  }
}

module.exports = GitPlatform;