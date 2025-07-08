/**
 * Git hooks installer
 */

const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');

async function installGitHooks(config) {
  const hooksDir = path.join('.git', 'hooks');
  
  // Ensure hooks directory exists
  await fs.ensureDir(hooksDir);
  
  // Backup existing hooks
  await backupExistingHooks(hooksDir);
  
  // Determine which hooks to install based on enabled modules
  const hooksToInstall = getRequiredHooks(config);
  
  // Install each hook
  for (const hookName of hooksToInstall) {
    await installHook(hookName, hooksDir, config);
  }
}

async function backupExistingHooks(hooksDir) {
  const backupDir = path.join(hooksDir, '.backup');
  await fs.ensureDir(backupDir);
  
  const hooks = await fs.readdir(hooksDir);
  for (const hook of hooks) {
    if (!hook.includes('.sample') && !hook.startsWith('.')) {
      const src = path.join(hooksDir, hook);
      const dest = path.join(backupDir, `${hook}.${Date.now()}`);
      
      const stats = await fs.stat(src);
      if (stats.isFile()) {
        await fs.copy(src, dest);
      }
    }
  }
}

function getRequiredHooks(config) {
  const hooks = new Set(['pre-commit']); // Always install pre-commit
  
  if (config.modules.core?.commitMessageValidation) {
    hooks.add('commit-msg');
  }
  
  if (config.modules.testing?.enabled) {
    hooks.add('pre-push');
  }
  
  if (config.modules.github?.enabled) {
    hooks.add('post-commit');
  }
  
  return Array.from(hooks);
}

async function installHook(hookName, hooksDir, config) {
  const hookContent = generateHookScript(hookName, config);
  const hookPath = path.join(hooksDir, hookName);
  
  await fs.writeFile(hookPath, hookContent);
  await fs.chmod(hookPath, '755');
  
  console.log(`  ${chalk.green('✓')} Installed ${hookName} hook`);
}

function generateHookScript(hookName, config) {
  const scripts = {
    'pre-commit': `#!/bin/sh
# vibe-codex pre-commit hook

# Run vibe-codex validation
npx vibe-codex validate --module core

# Check for secrets
if command -v git-secrets >/dev/null 2>&1; then
  git secrets --pre_commit_hook -- "$@"
fi

# Run additional checks based on configuration
${config.modules.quality?.enabled ? 'npm run lint' : ''}

exit $?
`,

    'commit-msg': `#!/bin/sh
# vibe-codex commit-msg hook

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
  exit 1
fi

exit 0
`,

    'pre-push': `#!/bin/sh
# vibe-codex pre-push hook

# Run tests if testing module is enabled
${config.modules.testing?.enabled ? `
echo "Running tests before push..."
npm test
if [ $? -ne 0 ]; then
  echo "❌ Tests failed. Push aborted."
  exit 1
fi
` : ''}

# Run full validation
npx vibe-codex validate

exit $?
`,

    'post-commit': `#!/bin/sh
# vibe-codex post-commit hook

# Update issue status if GitHub module is enabled
${config.modules.github?.enabled ? `
if [ -f "./hooks/issue-progress-tracker.sh" ]; then
  ./hooks/issue-progress-tracker.sh auto commit
fi
` : ''}

exit 0
`
  };

  return scripts[hookName] || `#!/bin/sh
# vibe-codex ${hookName} hook
# Custom hook - add your logic here

exit 0
`;
}

module.exports = {
  installGitHooks
};