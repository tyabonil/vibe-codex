// Minimal github client stub for CI
class GitHubClient {
  constructor(github, context) {
    this.github = github;
    this.context = context;
  }
  async getPRData() { 
    return { number: 1, title: 'Test PR', body: 'Test' }; 
  }
  async getPRFiles() { return []; }
  async getPRCommits() { return []; }
  async createComment() {}
  async setStatusCheck() {}
  async postComplianceComment() {}
}
module.exports = GitHubClient;