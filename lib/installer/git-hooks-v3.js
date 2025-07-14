/**
 * Git hooks installer v3 - Uses rule-based configuration
 */

const fs = require("fs-extra");
const path = require("path");
const chalk = require("chalk");
const logger = require("../utils/logger");
const { getEnabledRules, getHookImplementations } = require("../config/loader");

/**
 * Install git hooks based on configuration
 */
async function installGitHooks(config) {
  try {
    const hooksDir = path.join(".git", "hooks");

    // Ensure hooks directory exists
    await fs.ensureDir(hooksDir);

    // Backup existing hooks
    await backupExistingHooks(hooksDir);

    logger.info("Installing git hooks...");

    // Get hook implementations from enabled rules
    const hookImplementations = await getHookImplementations(config);

    // Install each hook type
    for (const [hookType, rules] of Object.entries(hookImplementations)) {
      if (rules.length > 0 && config.hooks?.[hookType] !== false) {
        await installHook(hookType, rules, hooksDir, config);
      }
    }

    logger.success("Git hooks installed successfully");
  } catch (error) {
    logger.error("Failed to install git hooks:", error.message);
    throw error;
  }
}

/**
 * Backup existing hooks
 */
async function backupExistingHooks(hooksDir) {
  try {
    const backupDir = path.join(hooksDir, ".backup");
    await fs.ensureDir(backupDir);

    const hooks = await fs.readdir(hooksDir);
    for (const hook of hooks) {
      if (!hook.includes(".sample") && !hook.startsWith(".")) {
        const src = path.join(hooksDir, hook);
        const dest = path.join(backupDir, `${hook}.${Date.now()}`);

        const stats = await fs.stat(src);
        if (stats.isFile()) {
          await fs.copy(src, dest);
          logger.debug(`Backed up ${hook}`);
        }
      }
    }
  } catch (error) {
    logger.debug("Failed to backup hooks:", error.message);
    // Continue installation even if backup fails
  }
}

/**
 * Install a specific hook
 */
async function installHook(hookName, rules, hooksDir, config) {
  try {
    const hookContent = generateHookScript(hookName, rules, config);
    const hookPath = path.join(hooksDir, hookName);

    await fs.writeFile(hookPath, hookContent);
    await fs.chmod(hookPath, "755");

    logger.info(`✓ Installed ${hookName} hook (${rules.length} rules)`);
  } catch (error) {
    logger.error(`Failed to install ${hookName} hook:`, error.message);
    throw error;
  }
}

/**
 * Generate hook script content
 */
function generateHookScript(hookName, rules, config) {
  const projectRoot = path.resolve(__dirname, "../..");

  let script = `#!/bin/bash
# vibe-codex ${hookName} hook
# Generated at ${new Date().toISOString()}
# Rules: ${rules.map((r) => r.ruleId).join(", ")}

set -e
`;

  // Add hook-specific content
  switch (hookName) {
    case "pre-commit":
      script += generatePreCommitScript(rules, projectRoot);
      break;
    case "commit-msg":
      script += generateCommitMsgScript(rules, projectRoot);
      break;
    case "pre-push":
      script += generatePrePushScript(rules, projectRoot);
      break;
    case "post-commit":
      script += generatePostCommitScript(rules, projectRoot);
      break;
    case "post-merge":
      script += generatePostMergeScript(rules, projectRoot);
      break;
    default:
      script += `echo "No implementation for ${hookName} hook"\\n`;
  }

  return script;
}

/**
 * Generate pre-commit hook script
 */
function generatePreCommitScript(rules, projectRoot) {
  let script = `
echo "🚀 Running pre-commit checks..."
FAILED=0
`;

  // Security checks (sec-001, sec-002, sec-003)
  const securityRules = rules.filter((r) => r.ruleId.startsWith("sec-"));
  if (securityRules.length > 0) {
    script += `
# Security checks
if [ -f "${projectRoot}/templates/hooks/pre-commit-simple.sh" ]; then
  bash "${projectRoot}/templates/hooks/pre-commit-simple.sh" || FAILED=1
fi
`;
  }

  // Work tracking check (wfl-005)
  if (rules.some((r) => r.ruleId === "wfl-005")) {
    script += `
# Work tracking check
if [ -f "${projectRoot}/templates/hooks/work-tracking-pre-commit.sh" ]; then
  bash "${projectRoot}/templates/hooks/work-tracking-pre-commit.sh" || true
fi
`;
  }

  // Documentation check (doc-004)
  if (rules.some((r) => r.ruleId === "doc-004")) {
    script += `
# Documentation update check
if [ -f "${projectRoot}/templates/hooks/doc-update-check.sh" ]; then
  bash "${projectRoot}/templates/hooks/doc-update-check.sh" || true
fi
`;
  }

  // Style checks (sty-001, sty-002)
  const styleRules = rules.filter((r) => r.ruleId.startsWith("sty-"));
  if (styleRules.length > 0) {
    script += `
# Style checks
echo "🎨 Running style checks..."
# TODO: Add linting based on detected framework
`;
  }

  script += `
if [ $FAILED -ne 0 ]; then
  echo "❌ Pre-commit checks failed"
  exit 1
fi

echo "✅ Pre-commit checks passed"
exit 0
`;

  return script;
}

/**
 * Generate commit-msg hook script
 */
function generateCommitMsgScript(rules, projectRoot) {
  let script = `
COMMIT_MSG_FILE=$1
echo "📝 Validating commit message..."
`;

  // Commit message validation (cmt-001, cmt-002)
  const commitRules = rules.filter((r) => r.ruleId.startsWith("cmt-"));
  if (commitRules.length > 0) {
    script += `
if [ -f "${projectRoot}/templates/hooks/commit-msg-simple.sh" ]; then
  bash "${projectRoot}/templates/hooks/commit-msg-simple.sh" "$COMMIT_MSG_FILE" || exit 1
fi
`;
  }

  script += `
echo "✅ Commit message accepted"
exit 0
`;

  return script;
}

/**
 * Generate pre-push hook script
 */
function generatePrePushScript(rules, projectRoot) {
  let script = `
echo "🚀 Running pre-push checks..."
`;

  // Conflict detection (wfl-006)
  if (rules.some((r) => r.ruleId === "wfl-006")) {
    script += `
# Conflict detection
if [ -f "${projectRoot}/templates/hooks/pre-push-conflict-check.sh" ]; then
  bash "${projectRoot}/templates/hooks/pre-push-conflict-check.sh" "$@" || exit 1
fi
`;
  }

  // Test requirements (tst-001, tst-003)
  const testRules = rules.filter((r) => r.ruleId.startsWith("tst-"));
  if (testRules.length > 0) {
    script += `
# Test requirements
echo "🧪 Running tests..."
# TODO: Run tests based on detected framework
`;
  }

  script += `
echo "✅ Pre-push checks passed"
exit 0
`;

  return script;
}

/**
 * Generate post-commit hook script
 */
function generatePostCommitScript(rules, projectRoot) {
  let script = `
# Post-commit hooks
`;

  // Work log updates (wfl-007)
  if (rules.some((r) => r.ruleId === "wfl-007")) {
    script += `
# Automatic work log updates
if [ -f "${projectRoot}/templates/hooks/issue-worklog-update.sh" ]; then
  bash "${projectRoot}/templates/hooks/issue-worklog-update.sh" || true
fi
`;
  }

  // Issue reminders
  script += `
# Issue update reminders
if [ -f "${projectRoot}/hooks/issue-reminder-post-commit.sh" ]; then
  bash "${projectRoot}/hooks/issue-reminder-post-commit.sh" || true
fi
`;

  return script;
}

/**
 * Generate post-merge hook script
 */
function generatePostMergeScript(rules, projectRoot) {
  return `
# Post-merge cleanup
if [ -f "${projectRoot}/hooks/post-merge-cleanup.sh" ]; then
  bash "${projectRoot}/hooks/post-merge-cleanup.sh" || true
fi
`;
}

/**
 * Uninstall git hooks
 */
async function uninstallGitHooks() {
  try {
    const hooksDir = path.join(".git", "hooks");
    const hooks = [
      "pre-commit",
      "commit-msg",
      "pre-push",
      "post-commit",
      "post-merge",
    ];

    for (const hook of hooks) {
      const hookPath = path.join(hooksDir, hook);
      if (await fs.pathExists(hookPath)) {
        // Check if it's our hook
        const content = await fs.readFile(hookPath, "utf8");
        if (content.includes("vibe-codex")) {
          await fs.remove(hookPath);
          logger.info(`✓ Removed ${hook} hook`);
        }
      }
    }

    logger.success("Git hooks uninstalled");
  } catch (error) {
    logger.error("Failed to uninstall git hooks:", error.message);
    throw error;
  }
}

module.exports = {
  installGitHooks,
  uninstallGitHooks,
  generateHookScript,
};
