/**
 * GitHub API Client for MANDATORY Rules Compliance Checker
 * Provides comprehensive GitHub API integration for rule validation
 */

class GitHubClient {
  constructor(github, context) {
    this.github = github;
    this.context = context;
    this.owner = context.repo.owner;
    this.repo = context.repo.repo;
    this.prNumber = context.issue.number;
  }

  /**
   * Get PR data with comprehensive information
   */
  async getPRData() {
    console.log(`📋 Fetching PR #${this.prNumber} data...`);
    
    const { data: pr } = await this.github.rest.pulls.get({
      owner: this.owner,
      repo: this.repo,
      pull_number: this.prNumber
    });
    
    console.log(`✅ PR Data: ${pr.title} (${pr.head.ref} → ${pr.base.ref})`);
    return pr;
  }

  /**
   * Get all files changed in the PR
   */
  async getPRFiles() {
    console.log(`📁 Fetching changed files for PR #${this.prNumber}...`);
    
    const { data: files } = await this.github.rest.pulls.listFiles({
      owner: this.owner,
      repo: this.repo,
      pull_number: this.prNumber
    });
    
    console.log(`✅ Found ${files.length} changed files`);
    return files;
  }

  /**
   * Get all commits in the PR
   */
  async getPRCommits() {
    console.log(`📝 Fetching commits for PR #${this.prNumber}...`);
    
    const { data: commits } = await this.github.rest.pulls.listCommits({
      owner: this.owner,
      repo: this.repo,
      pull_number: this.prNumber
    });
    
    console.log(`✅ Found ${commits.length} commits`);
    return commits;
  }

  /**
   * Get PR reviews and comments
   */
  async getPRReviews() {
    console.log(`👀 Fetching reviews for PR #${this.prNumber}...`);
    
    const { data: reviews } = await this.github.rest.pulls.listReviews({
      owner: this.owner,
      repo: this.repo,
      pull_number: this.prNumber
    });
    
    console.log(`✅ Found ${reviews.length} reviews`);
    return reviews;
  }

  /**
   * Get PR comments (issue comments and review comments)
   */
  async getPRComments() {
    console.log(`💬 Fetching comments for PR #${this.prNumber}...`);
    
    // Get issue comments
    const { data: issueComments } = await this.github.rest.issues.listComments({
      owner: this.owner,
      repo: this.repo,
      issue_number: this.prNumber
    });
    
    // Get review comments
    const { data: reviewComments } = await this.github.rest.pulls.listReviewComments({
      owner: this.owner,
      repo: this.repo,
      pull_number: this.prNumber
    });
    
    console.log(`✅ Found ${issueComments.length} issue comments and ${reviewComments.length} review comments`);
    return {
      issueComments,
      reviewComments
    };
  }

  /**
   * Check if Copilot review has been requested
   */
  async checkCopilotReviewRequest() {
    console.log(`🤖 Checking for Copilot review requests...`);
    
    try {
      // Check for Copilot in requested reviewers
      const { data: reviewRequests } = await this.github.rest.pulls.listRequestedReviewers({
        owner: this.owner,
        repo: this.repo,
        pull_number: this.prNumber
      });
      
      const hasCopilotRequest = reviewRequests.users.some(user => 
        user.login.toLowerCase().includes('copilot') || 
        user.login.toLowerCase().includes('github-copilot')
      );
      
      // Check reviews for Copilot participation
      const reviews = await this.getPRReviews();
      const hasCopilotReview = reviews.some(review => 
        review.user.login.toLowerCase().includes('copilot') ||
        review.user.login.toLowerCase().includes('github-copilot')
      );
      
      console.log(`✅ Copilot review: requested=${hasCopilotRequest}, reviewed=${hasCopilotReview}`);
      return hasCopilotRequest || hasCopilotReview;
      
    } catch (error) {
      console.log(`⚠️ Could not check Copilot review status: ${error.message}`);
      return false;
    }
  }

  /**
   * Get linked issue information
   */
  async getLinkedIssues(prData) {
    console.log(`🔗 Finding linked issues for PR #${this.prNumber}...`);
    
    const issueNumbers = this.extractIssueNumbers(prData.title, prData.body);
    const linkedIssues = [];
    
    for (const issueNumber of issueNumbers) {
      try {
        const { data: issue } = await this.github.rest.issues.get({
          owner: this.owner,
          repo: this.repo,
          issue_number: issueNumber
        });
        linkedIssues.push(issue);
      } catch (error) {
        console.log(`⚠️ Could not fetch issue #${issueNumber}: ${error.message}`);
      }
    }
    
    console.log(`✅ Found ${linkedIssues.length} linked issues`);
    return linkedIssues;
  }

  /**
   * Check issue comments for thought process documentation
   */
  async checkIssueDocumentation(issueNumber) {
    console.log(`📝 Checking documentation for issue #${issueNumber}...`);
    
    try {
      const { data: comments } = await this.github.rest.issues.listComments({
        owner: this.owner,
        repo: this.repo,
        issue_number: issueNumber
      });
      
      const hasThoughtProcess = comments.some(comment => 
        comment.body.includes('**Thought Process**') ||
        comment.body.includes('**Analysis:**') ||
        comment.body.includes('**Decision:**') ||
        comment.body.includes('**External LLM') ||
        comment.body.includes('thought process')
      );
      
      console.log(`✅ Issue #${issueNumber} thought process documented: ${hasThoughtProcess}`);
      return hasThoughtProcess;
      
    } catch (error) {
      console.log(`⚠️ Could not check issue #${issueNumber} documentation: ${error.message}`);
      return false;
    }
  }

  /**
   * Post compliance comment to PR
   */
  async postComplianceComment(report) {
    console.log(`💬 Posting compliance report to PR #${this.prNumber}...`);
    
    try {
      await this.github.rest.issues.createComment({
        owner: this.owner,
        repo: this.repo,
        issue_number: this.prNumber,
        body: report
      });
      console.log(`✅ Compliance report posted successfully`);
    } catch (error) {
      console.error(`❌ Failed to post compliance comment: ${error.message}`);
      throw error;
    }
  }

  /**
   * Set status check on the PR
   */
  async setStatusCheck(state, description, violationCount = 0) {
    console.log(`📊 Setting status check: ${state} - ${description}`);
    
    try {
      const prData = await this.getPRData();
      
      await this.github.rest.repos.createCommitStatus({
        owner: this.owner,
        repo: this.repo,
        sha: prData.head.sha,
        state: state, // 'success', 'failure', 'pending', 'error'
        context: 'MANDATORY Rules Compliance',
        description: description,
        target_url: `${this.context.payload.repository.html_url}/actions`
      });
      
      console.log(`✅ Status check set: ${state}`);
    } catch (error) {
      console.error(`❌ Failed to set status check: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get repository information
   */
  async getRepositoryInfo() {
    console.log(`📚 Fetching repository information...`);
    
    const { data: repo } = await this.github.rest.repos.get({
      owner: this.owner,
      repo: this.repo
    });
    
    console.log(`✅ Repository: ${repo.full_name} (${repo.private ? 'private' : 'public'})`);
    return repo;
  }

  /**
   * Check for PROJECT_CONTEXT.md file
   */
  async checkProjectContextExists() {
    console.log(`📋 Checking for PROJECT_CONTEXT.md...`);
    
    try {
      await this.github.rest.repos.getContent({
        owner: this.owner,
        repo: this.repo,
        path: 'PROJECT_CONTEXT.md'
      });
      console.log(`✅ PROJECT_CONTEXT.md exists`);
      return true;
    } catch (error) {
      if (error.status === 404) {
        console.log(`⚠️ PROJECT_CONTEXT.md not found`);
        return false;
      }
      throw error;
    }
  }

  /**
   * Analyze PR feedback response patterns
   */
  async analyzeFeedbackResponse() {
    console.log(`🔍 Analyzing PR feedback response patterns...`);
    
    const comments = await this.getPRComments();
    const reviews = await this.getPRReviews();
    
    // Count unresolved comments and reviews
    const totalReviews = reviews.length;
    const approvedReviews = reviews.filter(r => r.state === 'APPROVED').length;
    const changesRequestedReviews = reviews.filter(r => r.state === 'CHANGES_REQUESTED').length;
    
    // Check for automated tool feedback (bots, CI/CD)
    const botComments = comments.issueComments.filter(c => 
      c.user.type === 'Bot' || 
      c.user.login.includes('bot') ||
      c.user.login.includes('ci') ||
      c.user.login.includes('action')
    );
    
    const analysis = {
      totalReviews,
      approvedReviews,
      changesRequestedReviews,
      botComments: botComments.length,
      hasUnaddressedChanges: changesRequestedReviews > 0,
      totalComments: comments.issueComments.length + comments.reviewComments.length
    };
    
    console.log(`✅ Feedback analysis completed:`, analysis);
    return analysis;
  }

  // Helper methods

  extractIssueNumbers(title, body) {
    const text = `${title} ${body || ''}`;
    const matches = text.match(/#(\d+)/g) || [];
    return matches.map(match => parseInt(match.substring(1)));
  }

  /**
   * Check if PR targets main/master branch directly
   */
  isTargetingMainBranch(prData) {
    return prData.base.ref === 'main' || prData.base.ref === 'master';
  }

  /**
   * Get file content from repository
   */
  async getFileContent(path) {
    try {
      const { data } = await this.github.rest.repos.getContent({
        owner: this.owner,
        repo: this.repo,
        path: path
      });
      
      if (data.type === 'file') {
        return Buffer.from(data.content, 'base64').toString('utf8');
      }
      return null;
    } catch (error) {
      if (error.status === 404) {
        return null;
      }
      throw error;
    }
  }

  /**
   * Check if files indicate significant architectural changes
   */
  isSignificantChange(files) {
    const significantPatterns = [
      /package\.json$/,
      /\.github\/workflows\//,
      /\.cursorrules$/,
      /MANDATORY-RULES\.md$/,
      /PROJECT_CONTEXT\.md$/,
      /scripts\//,
      /src\//,
      /lib\//
    ];
    
    return files.some(file => 
      significantPatterns.some(pattern => pattern.test(file.filename)) ||
      (file.additions && file.additions > 100) ||
      (file.deletions && file.deletions > 50)
    );
  }

  /**
   * Get all status checks for the PR
   */
  async getStatusChecks() {
    console.log(`🔍 Fetching status checks for PR #${this.prNumber}...`);
    
    try {
      const prData = await this.getPRData();
      
      // Get combined status for the head commit
      const { data: combinedStatus } = await this.github.rest.repos.getCombinedStatusForRef({
        owner: this.owner,
        repo: this.repo,
        ref: prData.head.sha
      });
      
      // Get check runs (newer GitHub Checks API)
      const { data: checkRuns } = await this.github.rest.checks.listForRef({
        owner: this.owner,
        repo: this.repo,
        ref: prData.head.sha
      });
      
      const statusChecks = {
        combined: combinedStatus,
        statuses: combinedStatus.statuses || [],
        checkRuns: checkRuns.check_runs || [],
        totalCount: (combinedStatus.statuses?.length || 0) + (checkRuns.check_runs?.length || 0)
      };
      
      console.log(`✅ Found ${statusChecks.totalCount} status checks`);
      return statusChecks;
      
    } catch (error) {
      console.error(`❌ Failed to fetch status checks: ${error.message}`);
      return {
        combined: { statuses: [] },
        statuses: [],
        checkRuns: [],
        totalCount: 0
      };
    }
  }

  /**
   * Check Vercel deployment status
   */
  async checkVercelDeploymentStatus() {
    console.log(`🔍 Checking Vercel deployment status for PR #${this.prNumber}...`);
    
    try {
      const statusChecks = await this.getStatusChecks();
      const vercelChecks = [];
      
      // Check legacy status API for Vercel
      const vercelStatuses = statusChecks.statuses.filter(status =>
        status.context && (
          status.context.toLowerCase().includes('vercel') ||
          status.context.toLowerCase().includes('deployment')
        )
      );
      
      // Check GitHub Checks API for Vercel
      const vercelCheckRuns = statusChecks.checkRuns.filter(check =>
        check.name && (
          check.name.toLowerCase().includes('vercel') ||
          check.name.toLowerCase().includes('deployment') ||
          check.app?.name?.toLowerCase().includes('vercel')
        )
      );
      
      // Combine all Vercel-related checks
      vercelChecks.push(...vercelStatuses.map(status => ({
        type: 'status',
        name: status.context,
        state: status.state,
        description: status.description,
        target_url: status.target_url,
        created_at: status.created_at,
        updated_at: status.updated_at
      })));
      
      vercelChecks.push(...vercelCheckRuns.map(check => ({
        type: 'check',
        name: check.name,
        state: check.conclusion || check.status,
        description: check.output?.title || check.output?.summary,
        target_url: check.html_url,
        created_at: check.started_at,
        updated_at: check.completed_at
      })));
      
      const vercelFailures = vercelChecks.filter(check => 
        check.state === 'failure' || 
        check.state === 'error' ||
        check.state === 'cancelled'
      );
      
      const vercelPending = vercelChecks.filter(check =>
        check.state === 'pending' ||
        check.state === 'in_progress' ||
        check.state === 'queued'
      );
      
      const result = {
        hasVercelChecks: vercelChecks.length > 0,
        totalChecks: vercelChecks.length,
        failedChecks: vercelFailures.length,
        pendingChecks: vercelPending.length,
        checks: vercelChecks,
        failures: vercelFailures,
        pending: vercelPending,
        deploymentUrls: vercelChecks
          .filter(check => check.target_url)
          .map(check => check.target_url)
      };
      
      console.log(`✅ Vercel check analysis:`, {
        hasVercel: result.hasVercelChecks,
        total: result.totalChecks,
        failed: result.failedChecks,
        pending: result.pendingChecks
      });
      
      return result;
      
    } catch (error) {
      console.error(`❌ Failed to check Vercel deployment status: ${error.message}`);
      return {
        hasVercelChecks: false,
        totalChecks: 0,
        failedChecks: 0,
        pendingChecks: 0,
        checks: [],
        failures: [],
        pending: [],
        deploymentUrls: []
      };
    }
  }
}

module.exports = GitHubClient;