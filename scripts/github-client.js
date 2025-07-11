/**
 * GitHub API client wrapper for vibe-codex
 */

class GitHubClient {
  constructor(github, context) {
    this.github = github;
    this.context = context;
  }

  async getPRData() {
    try {
      const { data: pr } = await this.github.rest.pulls.get({
        owner: this.context.repo.owner,
        repo: this.context.repo.repo,
        pull_number: this.context.issue.number
      });
      
      return {
        number: pr.number,
        title: pr.title,
        body: pr.body,
        base: pr.base.ref,
        head: pr.head.ref,
        author: pr.user.login,
        state: pr.state,
        draft: pr.draft
      };
    } catch (error) {
      console.error('Failed to get PR data:', error.message);
      return {
        number: this.context.issue.number,
        title: '',
        body: ''
      };
    }
  }

  async getPRFiles() {
    try {
      const { data: files } = await this.github.rest.pulls.listFiles({
        owner: this.context.repo.owner,
        repo: this.context.repo.repo,
        pull_number: this.context.issue.number
      });
      
      return files.map(f => ({
        filename: f.filename,
        status: f.status,
        additions: f.additions,
        deletions: f.deletions,
        changes: f.changes
      }));
    } catch (error) {
      console.error('Failed to get PR files:', error.message);
      return [];
    }
  }

  async getPRCommits() {
    try {
      const { data: commits } = await this.github.rest.pulls.listCommits({
        owner: this.context.repo.owner,
        repo: this.context.repo.repo,
        pull_number: this.context.issue.number
      });
      
      return commits.map(c => ({
        sha: c.sha,
        message: c.commit.message,
        author: c.commit.author.name
      }));
    } catch (error) {
      console.error('Failed to get PR commits:', error.message);
      return [];
    }
  }

  async createComment(body) {
    try {
      await this.github.rest.issues.createComment({
        owner: this.context.repo.owner,
        repo: this.context.repo.repo,
        issue_number: this.context.issue.number,
        body
      });
    } catch (error) {
      console.error('Failed to create comment:', error.message);
    }
  }
}

module.exports = GitHubClient;