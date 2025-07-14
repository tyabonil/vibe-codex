/**
 * Git hooks installer
 */

const fs = require("fs-extra");
const path = require("path");
const chalk = require("chalk");
const logger = require("../utils/logger");

async function installGitHooks(config, advancedHooksConfig = null) {
  try {
    const hooksDir = path.join(".git", "hooks");

    // Ensure hooks directory exists
    await fs.ensureDir(hooksDir);

    // Backup existing hooks
    await backupExistingHooks(hooksDir);

    // Generate hook scripts locally
    logger.info("Generating hook scripts...");

    // Determine which hooks to install based on enabled modules
    const hooksToInstall = getRequiredHooks(config);

    // Install each hook
    for (const hookName of hooksToInstall) {
      await installHook(hookName, hooksDir, config);
    }

    // Install advanced hooks if requested
    if (advancedHooksConfig && advancedHooksConfig.enabled) {
      await installAdvancedHooks(hooksDir, advancedHooksConfig);
    }
  } catch (error) {
    logger.error("Failed to install git hooks:", error.message);
    throw error;
  }
}

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
        }
      }
    }
  } catch (error) {
    logger.debug("Failed to backup hooks:", error.message);
    // Continue installation even if backup fails
  }
}

function getRequiredHooks(config) {
  const hooks = new Set(["pre-commit"]); // Always install pre-commit

  if (config.modules.core?.commitMessageValidation) {
    hooks.add("commit-msg");
  }

  if (config.modules.testing?.enabled) {
    hooks.add("pre-push");
  }

  if (
    config.modules.github?.enabled ||
    config.modules["github-workflow"]?.enabled
  ) {
    hooks.add("post-commit");
  }

  // Add hooks for issue update reminders
  if (config.issueTracking?.enableReminders !== false) {
    hooks.add("post-commit");
    if (config.issueTracking?.updateOnPush) {
      hooks.add("pre-push");
    }
  }

  return Array.from(hooks);
}

async function installHook(hookName, hooksDir, config) {
  try {
    const hookContent = generateHookScript(hookName, config);
    const hookPath = path.join(hooksDir, hookName);

    await fs.writeFile(hookPath, hookContent);
    await fs.chmod(hookPath, "755");

    logger.info(`✓ Installed ${hookName} hook`);
  } catch (error) {
    logger.error(`Failed to install ${hookName} hook:`, error.message);
    throw error;
  }
}

function generateHookScript(hookName, config) {
  // Common helper function for finding vibe-codex
  const vibeCodexRunner = `
# Function to run vibe-codex with proper fallbacks
run_vibe_codex() {
  # Try npx first (most common)
  if command -v npx >/dev/null 2>&1; then
    npx --no-install vibe-codex "$@"
  # Try local installation
  elif [ -x "./node_modules/.bin/vibe-codex" ]; then
    ./node_modules/.bin/vibe-codex "$@"
  # Try yarn
  elif command -v yarn >/dev/null 2>&1 && [ -f "yarn.lock" ]; then
    yarn run vibe-codex "$@"
  # Try pnpm
  elif command -v pnpm >/dev/null 2>&1 && [ -f "pnpm-lock.yaml" ]; then
    pnpm exec vibe-codex "$@"
  # Try global installation
  elif command -v vibe-codex >/dev/null 2>&1; then
    vibe-codex "$@"
  else
    echo "❌ Error: vibe-codex not found!"
    echo ""
    echo "Please install vibe-codex using one of:"
    echo "  npm install --save-dev vibe-codex"
    echo "  npm install -g vibe-codex"
    echo "  yarn add --dev vibe-codex"
    echo ""
    return 1
  fi
}
`;

  const scripts = {
    "pre-commit": `#!/bin/sh
# vibe-codex pre-commit hook
${vibeCodexRunner}

# Skip if SKIP_VIBE_CODEX is set
if [ "$SKIP_VIBE_CODEX" = "1" ] || [ "$SKIP_VIBE_CODEX" = "true" ]; then
  echo "⚠️  Skipping vibe-codex checks (SKIP_VIBE_CODEX is set)"
  exit 0
fi

# Run vibe-codex validation
echo "🔍 Running vibe-codex pre-commit checks..."
run_vibe_codex validate --hook pre-commit --modules core,patterns

if [ $? -ne 0 ]; then
  echo ""
  echo "💡 To skip these checks temporarily, use:"
  echo "   SKIP_VIBE_CODEX=1 git commit ..."
  echo "   or: git commit --no-verify"
  exit 1
fi

# Check for secrets if git-secrets is installed
if command -v git-secrets >/dev/null 2>&1; then
  git secrets --pre_commit_hook -- "$@"
fi

# Run additional checks based on configuration
${config.modules.quality?.enabled ? "npm run lint --if-present" : ""}

exit $?
`,

    "commit-msg": `#!/bin/sh
# vibe-codex commit-msg hook
${vibeCodexRunner}

# Skip if SKIP_VIBE_CODEX is set
if [ "$SKIP_VIBE_CODEX" = "1" ] || [ "$SKIP_VIBE_CODEX" = "true" ]; then
  echo "⚠️  Skipping vibe-codex checks (SKIP_VIBE_CODEX is set)"
  exit 0
fi

# Validate commit message format
commit_regex='^(feat|fix|docs|style|refactor|test|chore|perf|ci|build|revert)(\(.+\))?: .{1,72}$'
commit_msg=$(cat "$1")

if ! echo "$commit_msg" | grep -qE "$commit_regex"; then
  echo "❌ Invalid commit message format!"
  echo ""
  echo "Format: <type>(<scope>): <subject>"
  echo ""
  echo "Types: feat, fix, docs, style, refactor, test, chore, perf, ci, build, revert"
  echo ""
  echo "Example: feat(auth): add login functionality"
  echo ""
  echo "💡 To skip this check temporarily, use:"
  echo "   SKIP_VIBE_CODEX=1 git commit ..."
  exit 1
fi

# Run vibe-codex commit-msg validation if available
run_vibe_codex validate --hook commit-msg --message "$1" 2>/dev/null || true

exit 0
`,

    "pre-push": `#!/bin/sh
# vibe-codex pre-push hook
${vibeCodexRunner}

# Skip if SKIP_VIBE_CODEX is set
if [ "$SKIP_VIBE_CODEX" = "1" ] || [ "$SKIP_VIBE_CODEX" = "true" ]; then
  echo "⚠️  Skipping vibe-codex checks (SKIP_VIBE_CODEX is set)"
  exit 0
fi

# Check if pushing to protected branch
protected_branches="main master"
current_branch=$(git symbolic-ref HEAD | sed -e 's,.*/\\(.*\\),\\1,')

for branch in $protected_branches; do
  if [ "$current_branch" = "$branch" ]; then
    echo "❌ Direct push to $branch branch is not allowed!"
    echo "Please create a feature branch and submit a pull request."
    exit 1
  fi
done

# Check for open PRs and ensure comments are reviewed
if command -v gh >/dev/null 2>&1; then
  echo "📋 Checking for open PRs that need review..."
  pr_number=$(gh pr list --head "$current_branch" --json number --jq '.[0].number' 2>/dev/null)
  
  if [ -n "$pr_number" ]; then
    # Check if PR has unresolved review comments
    unresolved_count=$(gh api "repos/{owner}/{repo}/pulls/$pr_number/comments" --jq '[.[] | select(.in_reply_to_id == null)] | length' 2>/dev/null || echo 0)
    
    if [ "$unresolved_count" -gt "0" ]; then
      echo "⚠️  Warning: PR #$pr_number has $unresolved_count unresolved review comments"
      echo ""
      echo "Please review and address all PR comments before pushing."
      echo "Run: gh pr view $pr_number --comments"
      echo ""
      read -p "Continue anyway? (y/N) " -n 1 -r
      echo
      if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
      fi
    fi
  fi
fi

# Check for issue update reminders on push
${
  config.issueTracking?.updateOnPush
    ? `
# Check if issues need updates before pushing
run_vibe_codex check-issue-updates --hook pre-push 2>/dev/null || true
`
    : ""
}

# Run tests if testing module is enabled
${
  config.modules.testing?.enabled
    ? `
echo "🧪 Running tests before push..."
if command -v npm >/dev/null 2>&1 && [ -f "package.json" ]; then
  npm test --if-present
  if [ $? -ne 0 ]; then
    echo "❌ Tests failed. Push aborted."
    exit 1
  fi
fi
`
    : ""
}

# Run full validation
echo "🔍 Running vibe-codex validation..."
run_vibe_codex validate --hook pre-push

if [ $? -ne 0 ]; then
  echo ""
  echo "💡 To skip these checks temporarily, use:"
  echo "   SKIP_VIBE_CODEX=1 git push ..."
  exit 1
fi

exit 0
`,

    "post-commit": `#!/bin/sh
# vibe-codex post-commit hook
${vibeCodexRunner}

# Skip if SKIP_VIBE_CODEX is set
if [ "$SKIP_VIBE_CODEX" = "1" ] || [ "$SKIP_VIBE_CODEX" = "true" ]; then
  exit 0
fi

# Update issue status if GitHub module is enabled
${
  config.modules.github?.enabled || config.modules["github-workflow"]?.enabled
    ? `
# Try to run issue progress tracking
run_vibe_codex track-progress --hook post-commit 2>/dev/null || true
`
    : ""
}

# Check for issue update reminders
${
  config.issueTracking?.enableReminders !== false
    ? `
# Run issue update reminder check
run_vibe_codex check-issue-updates --hook post-commit 2>/dev/null || true
`
    : ""
}

exit 0
`,
  };

  return (
    scripts[hookName] ||
    `#!/bin/sh
# vibe-codex ${hookName} hook
# Custom hook - add your logic here

exit 0
`
  );
}

/**
 * Install advanced hooks based on selected categories
 */
async function installAdvancedHooks(hooksDir, advancedHooksConfig) {
  const { getHooksForCategories } = require('../config/advanced-hooks');
  const hooks = getHooksForCategories(advancedHooksConfig.categories);
  
  logger.info(`Installing ${hooks.length} advanced hooks...`);
  
  for (const hook of hooks) {
    const hookPath = path.join(hooksDir, hook.type);
    const sourcePath = path.join(__dirname, '../../hooks', hook.file);
    
    // Check if source file exists
    if (!await fs.pathExists(sourcePath)) {
      logger.warn(`Advanced hook file not found: ${hook.file}`);
      continue;
    }
    
    // If hook already exists, append to it
    if (await fs.pathExists(hookPath)) {
      logger.debug(`Appending to existing ${hook.type} hook...`);
      
      // Read existing content
      const existingContent = await fs.readFile(hookPath, 'utf-8');
      
      // Read new hook content
      const newContent = await fs.readFile(sourcePath, 'utf-8');
      
      // Create combined hook
      const combinedContent = `${existingContent}

# Advanced hook: ${hook.description}
# Source: ${hook.file}
${newContent.replace('#!/bin/sh', '').replace('#!/bin/bash', '')}`;
      
      await fs.writeFile(hookPath, combinedContent);
      await fs.chmod(hookPath, '755');
      
      logger.info(`✓ Updated ${hook.type} with ${hook.file}`);
    } else {
      // Copy new hook
      await fs.copy(sourcePath, hookPath);
      await fs.chmod(hookPath, '755');
      
      logger.info(`✓ Installed ${hook.type} hook: ${hook.file}`);
    }
  }
}

module.exports = {
  installGitHooks,
};
