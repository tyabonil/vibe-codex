/**
 * Simple installer for git hooks
 */

const fs = require('fs').promises;
const path = require('path');
const chalk = require('chalk');

const HOOK_NAMES = ['pre-commit', 'commit-msg', 'pre-push'];

/**
 * Install git hooks based on configuration
 */
async function installHooks(config) {
  const gitDir = path.join(process.cwd(), '.git');
  const hooksDir = path.join(gitDir, 'hooks');
  
  // Check if .git directory exists
  try {
    await fs.access(gitDir);
  } catch (error) {
    console.log(chalk.yellow('⚠️  Not a git repository. Skipping hooks installation.'));
    return;
  }
  
  // Create hooks directory if it doesn't exist
  await fs.mkdir(hooksDir, { recursive: true });
  
  // Install each hook
  for (const hookName of HOOK_NAMES) {
    const hookContent = generateHookContent(hookName, config);
    const hookPath = path.join(hooksDir, hookName);
    
    // Check if hook already exists
    const exists = await fs.access(hookPath).then(() => true).catch(() => false);
    if (exists) {
      // Backup existing hook
      const backupPath = `${hookPath}.vibe-codex-backup`;
      await fs.copyFile(hookPath, backupPath);
      console.log(chalk.gray(`  Backed up existing ${hookName} to ${hookName}.vibe-codex-backup`));
    }
    
    // Write hook content
    await fs.writeFile(hookPath, hookContent, { mode: 0o755 });
    console.log(chalk.green(`  ✓ Installed ${hookName} hook`));
  }
}

/**
 * Uninstall git hooks
 */
async function uninstallHooks() {
  const hooksDir = path.join(process.cwd(), '.git', 'hooks');
  
  try {
    for (const hookName of HOOK_NAMES) {
      const hookPath = path.join(hooksDir, hookName);
      const backupPath = `${hookPath}.vibe-codex-backup`;
      
      // Check if our hook exists
      const hookExists = await fs.access(hookPath).then(() => true).catch(() => false);
      if (hookExists) {
        const content = await fs.readFile(hookPath, 'utf8');
        if (content.includes('vibe-codex')) {
          // Restore backup if it exists
          const backupExists = await fs.access(backupPath).then(() => true).catch(() => false);
          if (backupExists) {
            await fs.copyFile(backupPath, hookPath);
            await fs.unlink(backupPath);
            console.log(chalk.green(`  ✓ Restored original ${hookName} hook`));
          } else {
            await fs.unlink(hookPath);
            console.log(chalk.green(`  ✓ Removed ${hookName} hook`));
          }
        }
      }
    }
  } catch (error) {
    // Hooks directory might not exist
  }
}

/**
 * Generate hook content based on hook type and configuration
 */
function generateHookContent(hookName, config) {
  const rules = config.rules || [];
  
  if (hookName === 'pre-commit') {
    return generatePreCommitHook(rules);
  } else if (hookName === 'commit-msg') {
    return generateCommitMsgHook(rules);
  } else if (hookName === 'pre-push') {
    return generatePrePushHook(rules);
  }
  
  return '';
}

/**
 * Generate pre-commit hook content
 */
function generatePreCommitHook(rules) {
  let checks = [];
  
  if (rules.includes('security')) {
    checks.push(`
# Security check - look for potential secrets
echo "🔒 Running security checks..."

# Check for .env files (excluding .env.example, .env.sample, etc.)
if git diff --cached --name-only | grep -E '^\\.env$|^\\.env\\.[^.]+$' | grep -v -E '\\.(example|sample|template)$' > /dev/null; then
  echo "❌ Error: .env file detected! Use .env.example for templates."
  exit 1
fi

# Check for hardcoded secrets in all files
secrets_found=false
for file in $(git diff --cached --name-only); do
  # Skip .env.example and similar files for secret scanning
  if echo "$file" | grep -E '\\.(example|sample|template)(\\..*)?$' > /dev/null; then
    continue
  fi
  
  if grep -iE "(api_key|apikey|secret|password|token).*=.*['\\""][^'\\""]+['\\""]" "$file" 2>/dev/null; then
    echo "❌ Error: Potential secrets detected in $file"
    secrets_found=true
  fi
done

if [ "$secrets_found" = true ]; then
  echo "Please remove sensitive information before committing."
  exit 1
fi`);
  }
  
  if (rules.includes('testing')) {
    checks.push(`
# Test check - run tests if available
echo "🧪 Running tests..."
if [ -f "package.json" ] && grep -q '"test"' package.json; then
  npm test || (echo "❌ Tests failed! Fix tests before committing." && exit 1)
fi`);
  }
  
  if (rules.includes('documentation')) {
    checks.push(`
# Documentation check
echo "📚 Checking documentation..."
if [ ! -f "README.md" ]; then
  echo "⚠️  Warning: No README.md file found"
fi`);
  }
  
  if (rules.includes('code-style')) {
    checks.push(`
# Code style check
echo "🎨 Checking code style..."
if [ -f "package.json" ] && grep -q '"lint"' package.json; then
  npm run lint || (echo "⚠️  Warning: Linting issues found" && exit 0)
fi`);
  }
  
  if (rules.includes('dependency-safety')) {
    checks.push(`
# Dependency safety check
VIBE_CODEX_HOOK_TYPE="pre-commit"
export VIBE_CODEX_HOOK_TYPE

# Check if the dependency safety script exists
SAFETY_SCRIPT="$(git rev-parse --show-toplevel)/templates/hooks/dependency-safety-check.sh"
if [ ! -f "$SAFETY_SCRIPT" ]; then
  # Try node_modules location
  SAFETY_SCRIPT="$(git rev-parse --show-toplevel)/node_modules/vibe-codex/templates/hooks/dependency-safety-check.sh"
fi

if [ -f "$SAFETY_SCRIPT" ]; then
  bash "$SAFETY_SCRIPT"
  if [ $? -ne 0 ]; then
    exit 1
  fi
else
  echo "⚠️  Warning: Dependency safety script not found"
fi`);
  }
  
  if (rules.includes('test-quality')) {
    checks.push(`
# Test quality check
VIBE_CODEX_HOOK_TYPE="pre-commit"
export VIBE_CODEX_HOOK_TYPE

# Check if the test quality script exists
QUALITY_SCRIPT="$(git rev-parse --show-toplevel)/templates/hooks/test-quality-check.sh"
if [ ! -f "$QUALITY_SCRIPT" ]; then
  # Try node_modules location
  QUALITY_SCRIPT="$(git rev-parse --show-toplevel)/node_modules/vibe-codex/templates/hooks/test-quality-check.sh"
fi

if [ -f "$QUALITY_SCRIPT" ]; then
  bash "$QUALITY_SCRIPT"
  if [ $? -ne 0 ]; then
    exit 1
  fi
else
  echo "⚠️  Warning: Test quality script not found"
fi`);
  }
  
  if (rules.includes('context-size')) {
    checks.push(`
# Context size check
VIBE_CODEX_HOOK_TYPE="pre-commit"
export VIBE_CODEX_HOOK_TYPE

# Check if the context size script exists
CONTEXT_SCRIPT="$(git rev-parse --show-toplevel)/templates/hooks/context-size-check.sh"
if [ ! -f "$CONTEXT_SCRIPT" ]; then
  # Try node_modules location
  CONTEXT_SCRIPT="$(git rev-parse --show-toplevel)/node_modules/vibe-codex/templates/hooks/context-size-check.sh"
fi

if [ -f "$CONTEXT_SCRIPT" ]; then
  bash "$CONTEXT_SCRIPT"
else
  echo "⚠️  Warning: Context size script not found"
fi`);
  }
  
  return `#!/bin/sh
# vibe-codex pre-commit hook
# Generated by vibe-codex - do not edit manually

echo "🚀 Running vibe-codex pre-commit checks..."
${checks.join('\n')}

echo "✅ All pre-commit checks passed!"
exit 0`;
}

/**
 * Generate commit-msg hook content
 */
function generateCommitMsgHook(rules) {
  if (!rules.includes('commit-format')) {
    return `#!/bin/sh
# vibe-codex commit-msg hook
# No commit message validation configured
exit 0`;
  }
  
  return `#!/bin/sh
# vibe-codex commit-msg hook
# Validates commit message format

commit_regex='^(feat|fix|docs|style|refactor|test|chore|perf|ci|build|revert)(\\(.+\\))?: .{1,100}$'
commit_msg=$(cat "$1")

echo "📝 Validating commit message format..."

if ! echo "$commit_msg" | grep -qE "$commit_regex"; then
  echo "❌ Invalid commit message format!"
  echo ""
  echo "Expected format: type(scope): description"
  echo "Example: feat(auth): add login functionality"
  echo ""
  echo "Valid types:"
  echo "  feat     - New feature"
  echo "  fix      - Bug fix"
  echo "  docs     - Documentation changes"
  echo "  style    - Code style changes"
  echo "  refactor - Code refactoring"
  echo "  test     - Test changes"
  echo "  chore    - Build/tool changes"
  echo "  perf     - Performance improvements"
  echo "  ci       - CI/CD changes"
  echo "  build    - Build system changes"
  echo "  revert   - Revert previous commit"
  echo ""
  echo "Your message: $commit_msg"
  exit 1
fi

echo "✅ Commit message format is valid!"
exit 0`;
}

/**
 * Generate pre-push hook content
 */
function generatePrePushHook(rules) {
  let checks = [];
  
  if (rules.includes('branch-validation')) {
    checks.push(`
# Branch name validation
VIBE_CODEX_HOOK_TYPE="pre-push"
export VIBE_CODEX_HOOK_TYPE

# Check if the validator script exists
VALIDATOR_SCRIPT="$(git rev-parse --show-toplevel)/templates/hooks/branch-name-validator.sh"
if [ ! -f "$VALIDATOR_SCRIPT" ]; then
  # Try node_modules location
  VALIDATOR_SCRIPT="$(git rev-parse --show-toplevel)/node_modules/vibe-codex/templates/hooks/branch-name-validator.sh"
fi

if [ -f "$VALIDATOR_SCRIPT" ]; then
  bash "$VALIDATOR_SCRIPT"
  if [ $? -ne 0 ]; then
    exit 1
  fi
else
  echo "⚠️  Warning: Branch validator script not found"
fi`);
  }
  
  if (checks.length === 0) {
    return `#!/bin/sh
# vibe-codex pre-push hook
# No pre-push checks configured
exit 0`;
  }
  
  return `#!/bin/sh
# vibe-codex pre-push hook
# Generated by vibe-codex - do not edit manually

echo "🚀 Running vibe-codex pre-push checks..."
${checks.join('\n')}

echo "✅ All pre-push checks passed!"
exit 0`;
}

module.exports = {
  installHooks,
  uninstallHooks
};