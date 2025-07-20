/**
 * Check issue updates command - Used by git hooks (CLI-only version)
 */

const fs = require("fs-extra");
const logger = require("../utils/logger");
const { exec } = require("child_process");
const { promisify } = require("util");
const execAsync = promisify(exec);

module.exports = async function checkIssueUpdates(options = {}) {
  try {
    // Load configuration
    const configPath = ".vibe-codex.json";
    let config = {};
    
    if (await fs.pathExists(configPath)) {
      const vibeConfig = await fs.readJSON(configPath);
      config = vibeConfig.issueTracking || {};
    }
    
    // Skip if disabled
    if (config.enableReminders === false) {
      return;
    }
    
    // Run appropriate check based on context
    if (options.hook === "post-commit") {
      await checkPostCommit();
    } else if (options.hook === "pre-push") {
      await checkPrePush();
    } else {
      // Manual check - same as post-commit
      await checkPostCommit();
    }
  } catch (error) {
    // Don't fail the hook on errors
    logger.debug("Issue update check error:", error.message);
  }
};

/**
 * Check for issues in the last commit
 */
async function checkPostCommit() {
  try {
    // Get the last commit message
    const { stdout: commitMsg } = await execAsync("git log -1 --pretty=%B");
    
    // Extract issue numbers
    const issuePattern = /#(\d+)/g;
    const issues = [];
    let match;
    
    while ((match = issuePattern.exec(commitMsg)) !== null) {
      issues.push(match[1]);
    }
    
    if (issues.length > 0) {
      logger.output("\n🔍 Issues referenced in commit:");
      logger.output(`   ${issues.map(i => `#${i}`).join(", ")}`);
      logger.output("\n💡 Remember to update issues if needed:");
      logger.output("   npx vibe-codex update-issues --list");
    }
  } catch (error) {
    logger.debug("Post-commit check error:", error.message);
  }
}

/**
 * Check for updates before push
 */
async function checkPrePush() {
  try {
    // Get commits that will be pushed
    const { stdout: remoteBranch } = await execAsync(
      "git rev-parse --abbrev-ref --symbolic-full-name @{u} 2>/dev/null || echo ''"
    );
    
    let commits;
    if (remoteBranch.trim()) {
      // Get commits between remote and local
      const { stdout } = await execAsync(
        `git log ${remoteBranch.trim()}..HEAD --pretty=%B 2>/dev/null || echo ''`
      );
      commits = stdout;
    } else {
      // No upstream branch, get last 10 commits
      const { stdout } = await execAsync("git log -10 --pretty=%B");
      commits = stdout;
    }
    
    // Extract issue numbers
    const issuePattern = /#(\d+)/g;
    const issues = new Set();
    let match;
    
    while ((match = issuePattern.exec(commits)) !== null) {
      issues.add(match[1]);
    }
    
    if (issues.size > 0) {
      logger.output("\n🔍 Checking for pending issue updates...");
      logger.output(
        `⚠️  Issues referenced in commits: ${Array.from(issues).map(i => `#${i}`).join(", ")}`
      );
      logger.output("\nConsider running: npx vibe-codex update-issues --list\n");
    }
  } catch (error) {
    logger.debug("Pre-push check error:", error.message);
  }
}