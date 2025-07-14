#!/usr/bin/env node

/**
 * Issue Update Tracker
 * Analyzes issue update patterns and compliance
 */

const { execSync } = require('child_process');

class IssueUpdateTracker {
  constructor() {
    this.stats = {
      totalIssues: 0,
      updatedIssues: 0,
      issuesWithPRLinks: 0,
      issuesWithProgressUpdates: 0,
      averageUpdatesPerIssue: 0,
      staleIssues: []
    };
  }

  /**
   * Analyze issue update patterns
   */
  async analyzeIssues() {
    try {
      // Get all open issues
      const issues = JSON.parse(
        execSync('gh issue list --state all --limit 100 --json number,title,body,comments,createdAt,updatedAt,author', 
        { encoding: 'utf8' })
      );

      this.stats.totalIssues = issues.length;

      for (const issue of issues) {
        await this.analyzeIssue(issue);
      }

      this.calculateStats();
      this.generateReport();
    } catch (error) {
      console.error('Error analyzing issues:', error.message);
    }
  }

  /**
   * Analyze individual issue
   */
  async analyzeIssue(issue) {
    // Get issue comments
    const comments = JSON.parse(
      execSync(`gh issue view ${issue.number} --json comments`, { encoding: 'utf8' })
    ).comments || [];

    const hasUpdates = comments.length > 0;
    const hasPRLink = this.checkForPRLink(issue, comments);
    const hasProgressUpdates = this.checkForProgressUpdates(comments);
    const daysSinceUpdate = this.getDaysSinceUpdate(issue.updatedAt);

    if (hasUpdates) this.stats.updatedIssues++;
    if (hasPRLink) this.stats.issuesWithPRLinks++;
    if (hasProgressUpdates) this.stats.issuesWithProgressUpdates++;
    
    if (daysSinceUpdate > 7 && !this.isClosed(issue)) {
      this.stats.staleIssues.push({
        number: issue.number,
        title: issue.title,
        daysSinceUpdate
      });
    }
  }

  /**
   * Check if issue has PR link
   */
  checkForPRLink(issue, comments) {
    const prPattern = /PR #\d+|pull\/\d+|https:\/\/github\.com\/.*\/pull\/\d+/i;
    
    // Check issue body
    if (prPattern.test(issue.body || '')) return true;
    
    // Check comments
    return comments.some(comment => prPattern.test(comment.body));
  }

  /**
   * Check for progress updates
   */
  checkForProgressUpdates(comments) {
    const progressKeywords = [
      'progress', 'update', 'completed', 'working on', 
      'implemented', 'fixed', 'added', 'created'
    ];
    
    return comments.some(comment => 
      progressKeywords.some(keyword => 
        comment.body.toLowerCase().includes(keyword)
      )
    );
  }

  /**
   * Calculate days since last update
   */
  getDaysSinceUpdate(updatedAt) {
    const now = new Date();
    const updated = new Date(updatedAt);
    const diffTime = Math.abs(now - updated);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  /**
   * Check if issue is closed
   */
  isClosed(issue) {
    return issue.state === 'closed';
  }

  /**
   * Calculate statistics
   */
  calculateStats() {
    const updatePercentage = (this.stats.updatedIssues / this.stats.totalIssues * 100).toFixed(1);
    const prLinkPercentage = (this.stats.issuesWithPRLinks / this.stats.totalIssues * 100).toFixed(1);
    const progressUpdatePercentage = (this.stats.issuesWithProgressUpdates / this.stats.totalIssues * 100).toFixed(1);

    this.stats.updatePercentage = updatePercentage;
    this.stats.prLinkPercentage = prLinkPercentage;
    this.stats.progressUpdatePercentage = progressUpdatePercentage;
  }

  /**
   * Generate compliance report
   */
  generateReport() {
    console.log('\n📊 Issue Update Compliance Report\n');
    console.log('='.repeat(50));
    
    console.log(`\n📈 Overall Statistics:`);
    console.log(`   Total Issues: ${this.stats.totalIssues}`);
    console.log(`   Issues with Updates: ${this.stats.updatedIssues} (${this.stats.updatePercentage}%)`);
    console.log(`   Issues with PR Links: ${this.stats.issuesWithPRLinks} (${this.stats.prLinkPercentage}%)`);
    console.log(`   Issues with Progress Updates: ${this.stats.issuesWithProgressUpdates} (${this.stats.progressUpdatePercentage}%)`);
    
    if (this.stats.staleIssues.length > 0) {
      console.log(`\n⚠️  Stale Issues (>7 days without update):`);
      this.stats.staleIssues.forEach(issue => {
        console.log(`   #${issue.number}: ${issue.title} (${issue.daysSinceUpdate} days)`);
      });
    }
    
    console.log('\n📋 Recommendations:');
    
    if (this.stats.updatePercentage < 80) {
      console.log('   ❗ Improve issue update frequency - aim for 80%+ compliance');
    }
    
    if (this.stats.prLinkPercentage < 90) {
      console.log('   ❗ Ensure all implementation issues have PR links');
    }
    
    if (this.stats.staleIssues.length > 0) {
      console.log('   ❗ Review and update stale issues or close if no longer relevant');
    }
    
    console.log('\n✅ Best Practices:');
    console.log('   • Update issues when starting work');
    console.log('   • Link PRs to issues immediately');
    console.log('   • Document decisions and blockers');
    console.log('   • Close issues promptly when resolved');
    
    console.log('\n' + '='.repeat(50) + '\n');
  }
}

// CLI usage
if (require.main === module) {
  console.log('🔍 Analyzing issue update patterns...\n');
  
  const tracker = new IssueUpdateTracker();
  tracker.analyzeIssues();
}

module.exports = IssueUpdateTracker;