/**
 * GitHub CLI method implementation
 */

const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);

class GitHubCLI {
  constructor() {
    this.name = 'cli';
  }

  /**
   * Check if GitHub CLI is available
   * @returns {Promise<boolean>}
   */
  async isAvailable() {
    try {
      await execAsync('gh --version');
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Execute a GitHub CLI command
   * @param {string} command - Command to execute
   * @param {Array<string>} args - Command arguments
   * @param {Object} options - Execution options
   * @returns {Promise<Object>} Command output
   */
  async execute(command, args = [], options = {}) {
    const fullCommand = ['gh', command, ...args].filter(Boolean).join(' ');
    
    try {
      const { stdout, stderr } = await execAsync(fullCommand, {
        maxBuffer: 10 * 1024 * 1024, // 10MB buffer
        ...options
      });
      
      // Try to parse JSON output
      try {
        return JSON.parse(stdout);
      } catch {
        // Return raw output if not JSON
        return stdout.trim();
      }
    } catch (error) {
      throw new Error(`GitHub CLI error: ${error.message}`);
    }
  }

  /**
   * Create a pull request
   * @param {Object} options - PR options
   * @returns {Promise<Object>} PR details
   */
  async createPullRequest(options) {
    const args = [
      'pr', 'create',
      '--title', options.title,
      '--body', options.body,
      '--base', options.base,
      '--head', options.head
    ];

    if (options.draft) {
      args.push('--draft');
    }

    if (options.labels && options.labels.length > 0) {
      args.push('--label', options.labels.join(','));
    }

    if (options.assignees && options.assignees.length > 0) {
      args.push('--assignee', options.assignees.join(','));
    }

    const result = await this.execute('', args);
    
    // Get PR details from the URL
    const prMatch = result.match(/\/pull\/(\d+)$/);
    if (prMatch) {
      return await this.getPullRequest(prMatch[1]);
    }
    
    return result;
  }

  /**
   * List pull requests
   * @param {Object} filters - Filter options
   * @returns {Promise<Array>} List of PRs
   */
  async listPullRequests(filters = {}) {
    const args = ['pr', 'list', '--json', 'number,title,state,author,base,head,labels,url'];

    if (filters.state) {
      args.push('--state', filters.state);
    }

    if (filters.base) {
      args.push('--base', filters.base);
    }

    if (filters.head) {
      args.push('--head', filters.head);
    }

    if (filters.author) {
      args.push('--author', filters.author);
    }

    if (filters.label) {
      args.push('--label', filters.label);
    }

    if (filters.limit) {
      args.push('--limit', filters.limit.toString());
    }

    return await this.execute('', args);
  }

  /**
   * Get pull request details
   * @param {number} prNumber - PR number
   * @returns {Promise<Object>} PR details
   */
  async getPullRequest(prNumber) {
    const args = [
      'pr', 'view', prNumber.toString(),
      '--json', 'number,title,body,state,author,base,head,labels,url,additions,deletions,files'
    ];

    return await this.execute('', args);
  }

  /**
   * Update pull request
   * @param {number} prNumber - PR number
   * @param {Object} updates - Updates to apply
   * @returns {Promise<Object>} Updated PR details
   */
  async updatePullRequest(prNumber, updates) {
    const args = ['pr', 'edit', prNumber.toString()];

    if (updates.title) {
      args.push('--title', updates.title);
    }

    if (updates.body) {
      args.push('--body', updates.body);
    }

    if (updates.base) {
      args.push('--base', updates.base);
    }

    if (updates.labels) {
      args.push('--add-label', updates.labels.join(','));
    }

    if (updates.removeLabels) {
      args.push('--remove-label', updates.removeLabels.join(','));
    }

    await this.execute('', args);
    return await this.getPullRequest(prNumber);
  }

  /**
   * Create an issue
   * @param {Object} options - Issue options
   * @returns {Promise<Object>} Issue details
   */
  async createIssue(options) {
    const args = [
      'issue', 'create',
      '--title', options.title,
      '--body', options.body
    ];

    if (options.labels && options.labels.length > 0) {
      args.push('--label', options.labels.join(','));
    }

    if (options.assignees && options.assignees.length > 0) {
      args.push('--assignee', options.assignees.join(','));
    }

    const result = await this.execute('', args);
    
    // Get issue details from the URL
    const issueMatch = result.match(/\/issues\/(\d+)$/);
    if (issueMatch) {
      return await this.getIssue(issueMatch[1]);
    }
    
    return result;
  }

  /**
   * List issues
   * @param {Object} filters - Filter options
   * @returns {Promise<Array>} List of issues
   */
  async listIssues(filters = {}) {
    const args = ['issue', 'list', '--json', 'number,title,state,author,labels,url'];

    if (filters.state) {
      args.push('--state', filters.state);
    }

    if (filters.author) {
      args.push('--author', filters.author);
    }

    if (filters.label) {
      args.push('--label', filters.label);
    }

    if (filters.assignee) {
      args.push('--assignee', filters.assignee);
    }

    if (filters.limit) {
      args.push('--limit', filters.limit.toString());
    }

    return await this.execute('', args);
  }

  /**
   * Get issue details
   * @param {number} issueNumber - Issue number
   * @returns {Promise<Object>} Issue details
   */
  async getIssue(issueNumber) {
    const args = [
      'issue', 'view', issueNumber.toString(),
      '--json', 'number,title,body,state,author,labels,url,assignees'
    ];

    return await this.execute('', args);
  }

  /**
   * Update issue
   * @param {number} issueNumber - Issue number
   * @param {Object} updates - Updates to apply
   * @returns {Promise<Object>} Updated issue details
   */
  async updateIssue(issueNumber, updates) {
    const args = ['issue', 'edit', issueNumber.toString()];

    if (updates.title) {
      args.push('--title', updates.title);
    }

    if (updates.body) {
      args.push('--body', updates.body);
    }

    if (updates.labels) {
      args.push('--add-label', updates.labels.join(','));
    }

    if (updates.removeLabels) {
      args.push('--remove-label', updates.removeLabels.join(','));
    }

    await this.execute('', args);
    return await this.getIssue(issueNumber);
  }

  /**
   * Create a label
   * @param {Object} options - Label options
   * @returns {Promise<Object>} Label details
   */
  async createLabel(options) {
    const args = [
      'label', 'create', options.name,
      '--color', options.color
    ];

    if (options.description) {
      args.push('--description', options.description);
    }

    await this.execute('', args);
    return {
      name: options.name,
      color: options.color,
      description: options.description
    };
  }

  /**
   * List labels
   * @returns {Promise<Array>} List of labels
   */
  async listLabels() {
    const args = ['label', 'list', '--json', 'name,color,description'];
    return await this.execute('', args);
  }

  /**
   * Get repository information
   * @returns {Promise<Object>} Repository details
   */
  async getRepository() {
    const args = [
      'repo', 'view',
      '--json', 'name,owner,description,defaultBranch,url,isPrivate'
    ];

    return await this.execute('', args);
  }

  /**
   * Get branches
   * @returns {Promise<Array>} List of branches
   */
  async getBranches() {
    const args = ['api', 'repos/:owner/:repo/branches', '--jq', '.[].name'];
    const result = await this.execute('', args);
    return result.split('\n').filter(Boolean);
  }

  /**
   * Get current branch
   * @returns {Promise<string>} Current branch name
   */
  async getCurrentBranch() {
    const result = await execAsync('git branch --show-current');
    return result.stdout.trim();
  }
}

module.exports = GitHubCLI;