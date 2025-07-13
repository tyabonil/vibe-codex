// Legacy stub for backward compatibility
// The mandatory rules system has been replaced by vibe-codex
// This file exists only to prevent breaking existing workflows

class GitHubClient {
  constructor(github, context) {
    this.github = github;
    this.context = context;
    console.log('⚠️  Legacy GitHub client - please migrate to vibe-codex');
  }
  
  async getPRData() { 
    return { 
      number: this.context?.issue?.number || 1, 
      title: 'Legacy System - Please migrate to vibe-codex', 
      body: 'This PR is using the deprecated mandatory rules system' 
    }; 
  }
  
  async getPRFiles() { return []; }
  async getPRCommits() { return []; }
  async createComment() {}
  async setStatusCheck() {}
  
  async postComplianceComment(comment) {
    // Post migration notice instead
    if (this.github && this.context?.issue?.number) {
      try {
        await this.github.rest.issues.createComment({
          owner: this.context.repo.owner,
          repo: this.context.repo.repo,
          issue_number: this.context.issue.number,
          body: '## ⚠️ Legacy Mandatory Rules System\n\nThis repository is using the deprecated mandatory rules system. Please migrate to vibe-codex:\n\n```bash\nnpx vibe-codex init\n```\n\nFor more information, see the [vibe-codex documentation](https://github.com/tyabonil/vibe-codex).'
        });
      } catch (e) {
        console.error('Failed to post migration notice:', e);
      }
    }
  }
}

module.exports = GitHubClient;