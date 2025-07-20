/**
 * Update issues command - CLI-only issue update interface
 */

const chalk = require("chalk");
const ora = require("ora");
const logger = require("../utils/logger");
const fs = require("fs-extra");
const { exec } = require("child_process");
const { promisify } = require("util");
const execAsync = promisify(exec);

module.exports = async function updateIssues(options = {}) {
  // Check for non-interactive mode
  const isNonInteractive = process.env.CI || process.env.NONINTERACTIVE || options.nonInteractive;
  
  // If no options provided and not in non-interactive mode, show help
  if (!options || Object.keys(options).length === 0) {
    if (isNonInteractive) {
      throw new Error("No update action specified. Use --list, --update, or --check");
    }
    showHelp();
    return;
  }
  
  // Route to appropriate action
  if (options.list) {
    return listRelatedIssues();
  } else if (options.check) {
    return checkIssueStatus(options.check);
  } else if (options.update) {
    return updateIssue(options.update, options.message, options.dryRun);
  } else if (options.bulk) {
    return bulkUpdate(options.bulk, options.dryRun);
  } else {
    showHelp();
  }
};

/**
 * Show help message
 */
function showHelp() {
  console.log(chalk.blue("🔧 vibe-codex Issue Updates\n"));
  console.log("Usage:");
  console.log("  vibe-codex update-issues --list                    # List related issues");
  console.log("  vibe-codex update-issues --check <issue>           # Check issue status");
  console.log("  vibe-codex update-issues --update <issue> --message <text>  # Update issue");
  console.log("  vibe-codex update-issues --bulk <file>             # Bulk update from file");
  console.log("  vibe-codex update-issues --dry-run                 # Preview without updating");
  console.log();
  console.log("Examples:");
  console.log("  vibe-codex update-issues --update 123 --message \"Completed feature implementation\"");
  console.log("  vibe-codex update-issues --bulk updates.json --dry-run");
  console.log();
  console.log("Bulk update file format (JSON):");
  console.log('  [{"issue": 123, "message": "Update text"}, ...]');
}

/**
 * List related issues from recent commits
 */
async function listRelatedIssues() {
  const spinner = ora("Scanning commits for related issues...").start();
  
  try {
    // Get recent commits
    const { stdout } = await execAsync("git log --oneline -50");
    const commits = stdout.trim().split('\n');
    
    // Extract issue numbers
    const issuePattern = /#(\d+)/g;
    const issues = new Set();
    
    commits.forEach(commit => {
      const matches = commit.matchAll(issuePattern);
      for (const match of matches) {
        issues.add(match[1]);
      }
    });
    
    spinner.succeed(`Found ${issues.size} related issues`);
    
    if (issues.size === 0) {
      console.log(chalk.gray("\nNo issue references found in recent commits"));
      return;
    }
    
    console.log(chalk.blue("\n📋 Related Issues:\n"));
    
    // Check if gh CLI is available
    const ghAvailable = await checkGhCli();
    
    for (const issue of issues) {
      if (ghAvailable) {
        try {
          const { stdout: issueInfo } = await execAsync(
            `gh issue view ${issue} --json number,title,state,updatedAt`
          );
          const info = JSON.parse(issueInfo);
          const state = info.state === 'OPEN' ? chalk.green('●') : chalk.red('●');
          console.log(`  ${state} #${info.number}: ${info.title}`);
          console.log(chalk.gray(`     Last updated: ${new Date(info.updatedAt).toLocaleDateString()}`));
        } catch (error) {
          console.log(`  • #${issue} (unable to fetch details)`);
        }
      } else {
        console.log(`  • #${issue}`);
      }
    }
    
    if (!ghAvailable) {
      console.log(chalk.yellow("\n⚠️  Install GitHub CLI for more detailed information"));
    }
    
  } catch (error) {
    spinner.fail("Failed to scan commits");
    logger.error("Error:", error.message);
    throw error;
  }
}

/**
 * Check issue status
 */
async function checkIssueStatus(issue) {
  const spinner = ora(`Checking issue #${issue}...`).start();
  
  try {
    const ghAvailable = await checkGhCli();
    
    if (!ghAvailable) {
      spinner.fail("GitHub CLI not available");
      console.log(chalk.yellow("\nInstall GitHub CLI to check issue status"));
      console.log(chalk.gray("Run: brew install gh (macOS) or visit https://cli.github.com"));
      return;
    }
    
    const { stdout } = await execAsync(
      `gh issue view ${issue} --json number,title,state,body,comments,updatedAt`
    );
    const issueData = JSON.parse(stdout);
    
    spinner.succeed(`Found issue #${issue}`);
    
    console.log(chalk.blue(`\n📋 Issue #${issueData.number}: ${issueData.title}\n`));
    console.log(chalk.gray(`State: ${issueData.state}`));
    console.log(chalk.gray(`Last updated: ${new Date(issueData.updatedAt).toLocaleString()}`));
    console.log(chalk.gray(`Comments: ${issueData.comments.length}`));
    
    if (issueData.comments.length > 0) {
      console.log(chalk.yellow("\nRecent comments:"));
      issueData.comments.slice(-3).forEach(comment => {
        const date = new Date(comment.createdAt).toLocaleDateString();
        console.log(chalk.gray(`  • ${date}: ${comment.body.substring(0, 100)}...`));
      });
    }
    
  } catch (error) {
    spinner.fail(`Failed to check issue #${issue}`);
    logger.error("Error:", error.message);
    throw error;
  }
}

/**
 * Update a single issue
 */
async function updateIssue(issue, message, dryRun = false) {
  if (!message) {
    throw new Error("Message is required for issue update");
  }
  
  const spinner = ora(`Updating issue #${issue}...`).start();
  
  try {
    const ghAvailable = await checkGhCli();
    
    if (!ghAvailable) {
      spinner.fail("GitHub CLI not available");
      console.log(chalk.yellow("\n⚠️  Cannot update without GitHub CLI"));
      console.log(chalk.gray(`Manual update needed for issue #${issue}:`));
      console.log(chalk.gray(`Message: ${message}`));
      const repoInfo = await getRepoInfo();
      console.log(chalk.gray(`URL: https://github.com/${repoInfo}/issues/${issue}`));
      return;
    }
    
    if (dryRun) {
      spinner.succeed(`[DRY RUN] Would update issue #${issue}`);
      console.log(chalk.blue("\nUpdate preview:"));
      console.log(chalk.gray(`Issue: #${issue}`));
      console.log(chalk.gray(`Message: ${message}`));
      return;
    }
    
    const commentBody = `## 📝 Progress Update\n\n${message}\n\n---\n*Updated via vibe-codex*`;
    
    await execAsync(
      `gh issue comment ${issue} --body "${commentBody.replace(/"/g, '\\"')}"`
    );
    
    spinner.succeed(`Updated issue #${issue}`);
    logger.success(`Successfully posted update to issue #${issue}`);
    
  } catch (error) {
    spinner.fail(`Failed to update issue #${issue}`);
    logger.error("Error:", error.message);
    throw error;
  }
}

/**
 * Bulk update issues from file
 */
async function bulkUpdate(file, dryRun = false) {
  try {
    if (!await fs.pathExists(file)) {
      throw new Error(`Update file not found: ${file}`);
    }
    
    const updates = await fs.readJSON(file);
    
    if (!Array.isArray(updates)) {
      throw new Error("Update file must contain an array of updates");
    }
    
    console.log(chalk.blue(`\n📋 Processing ${updates.length} updates...\n`));
    
    let successCount = 0;
    let failCount = 0;
    
    for (const update of updates) {
      if (!update.issue || !update.message) {
        logger.warn(`Skipping invalid update: ${JSON.stringify(update)}`);
        failCount++;
        continue;
      }
      
      try {
        await updateIssue(update.issue, update.message, dryRun);
        successCount++;
      } catch (error) {
        logger.error(`Failed to update issue #${update.issue}: ${error.message}`);
        failCount++;
      }
    }
    
    console.log(chalk.blue("\n📊 Update Summary:"));
    console.log(chalk.green(`  ✓ Successful: ${successCount}`));
    if (failCount > 0) {
      console.log(chalk.red(`  ✗ Failed: ${failCount}`));
    }
    
  } catch (error) {
    logger.error("Bulk update error:", error.message);
    throw error;
  }
}

/**
 * Check if GitHub CLI is available
 */
async function checkGhCli() {
  try {
    await execAsync("gh --version");
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Get repository info from git remote
 */
async function getRepoInfo() {
  try {
    const { stdout } = await execAsync("git remote get-url origin");
    const url = stdout.trim();
    
    // Extract owner/repo from various URL formats
    const patterns = [
      /github\.com[:/]([^/]+)\/([^/.]+)/,
      /git@github\.com:([^/]+)\/([^/.]+)/,
      /https?:\/\/github\.com\/([^/]+)\/([^/.]+)/,
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) {
        return `${match[1]}/${match[2]}`;
      }
    }
  } catch (error) {
    logger.debug("Failed to get repo info:", error.message);
  }
  
  return "owner/repo";
}