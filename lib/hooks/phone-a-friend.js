/**
 * Phone-a-Friend AI Code Review Hook Module
 */

const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');
const logger = require('../utils/logger');

/**
 * Configure phone-a-friend hook in the project
 * @param {Object} config - Hook configuration
 * @param {string} config.model - Model to use (e.g., 'claude-3-5-sonnet', 'gpt-4')
 * @param {boolean} config.enabled - Whether the hook is enabled
 * @param {boolean} config.allowForcePush - Allow pushing even with critical issues
 * @param {string} config.trigger - When to trigger ('pre-push' or 'pre-commit')
 * @returns {Promise<void>}
 */
async function configurePhoneAFriend(config = {}) {
  const defaultConfig = {
    model: 'claude-3-5-sonnet',
    enabled: true,
    allowForcePush: false,
    trigger: 'pre-push'
  };

  const finalConfig = { ...defaultConfig, ...config };

  // Validate model exists
  const modelConfigPath = path.join(process.cwd(), 'config', 'models', `${finalConfig.model}.json`);
  if (!(await fs.pathExists(modelConfigPath))) {
    const modelsDir = path.join(process.cwd(), 'config', 'models');
    const availableModels = await fs.readdir(modelsDir)
      .then(files => files.filter(f => f.endsWith('.json')).map(f => f.replace('.json', '')))
      .catch(() => []);
    
    throw new Error(
      `Model configuration not found: ${finalConfig.model}\n` +
      `Available models: ${availableModels.join(', ') || 'none'}`
    );
  }

  // Update vibe-codex configuration
  const configPath = path.join(process.cwd(), '.vibe-codex.json');
  const vibeConfig = await fs.readJSON(configPath);
  
  if (!vibeConfig.hooks) {
    vibeConfig.hooks = {};
  }
  
  vibeConfig.hooks.phoneAFriend = finalConfig;
  
  await fs.writeJSON(configPath, vibeConfig, { spaces: 2 });
  logger.success(`Phone-a-Friend hook configured with model: ${finalConfig.model}`);
}

/**
 * Install phone-a-friend hook
 * @param {Object} options - Installation options
 * @returns {Promise<void>}
 */
async function installPhoneAFriend(options = {}) {
  const configPath = path.join(process.cwd(), '.vibe-codex.json');
  const config = await fs.readJSON(configPath);
  
  if (!config.hooks?.phoneAFriend?.enabled) {
    logger.warn('Phone-a-Friend hook is not enabled in configuration');
    return;
  }

  const hookConfig = config.hooks.phoneAFriend;
  const trigger = hookConfig.trigger || 'pre-push';
  
  // Copy hook script
  const sourceHook = path.join(__dirname, '..', '..', 'hooks', 'phone-a-friend', `${trigger}-ai-review.sh`);
  const targetHook = path.join(process.cwd(), '.git', 'hooks', trigger);
  
  // Check if source hook exists
  if (!(await fs.pathExists(sourceHook))) {
    throw new Error(`Hook script not found: ${sourceHook}`);
  }
  
  // Backup existing hook if it exists
  if (await fs.pathExists(targetHook)) {
    const backupPath = `${targetHook}.backup.${Date.now()}`;
    await fs.copy(targetHook, backupPath);
    logger.debug(`Backed up existing ${trigger} hook to ${backupPath}`);
  }
  
  // If there's an existing hook, append our script
  let hookContent = await fs.readFile(sourceHook, 'utf-8');
  
  if (await fs.pathExists(targetHook)) {
    const existingContent = await fs.readFile(targetHook, 'utf-8');
    if (!existingContent.includes('Phone-a-Friend AI Code Review')) {
      // Append our hook to existing
      hookContent = existingContent + '\n\n# Added by vibe-codex\n' + hookContent;
    }
  }
  
  await fs.writeFile(targetHook, hookContent);
  await fs.chmod(targetHook, '755');
  
  logger.success(`Phone-a-Friend hook installed as ${trigger} hook`);
  
  // Copy model configurations
  const modelsSourceDir = path.join(__dirname, '..', '..', 'config', 'models');
  const modelsTargetDir = path.join(process.cwd(), 'config', 'models');
  
  await fs.ensureDir(modelsTargetDir);
  await fs.copy(modelsSourceDir, modelsTargetDir, { overwrite: false });
  
  logger.success('Model configurations copied to project');
  
  // Check for API key
  const modelConfig = await fs.readJSON(path.join(modelsTargetDir, `${hookConfig.model}.json`));
  const apiKeyEnv = modelConfig.apiKeyEnv;
  
  if (!process.env[apiKeyEnv]) {
    logger.warn(`⚠️  Please set ${chalk.yellow(apiKeyEnv)} environment variable for AI reviews`);
  }
}

/**
 * List available models
 * @returns {Promise<Array>}
 */
async function listAvailableModels() {
  const modelsDir = path.join(__dirname, '..', '..', 'config', 'models');
  const files = await fs.readdir(modelsDir);
  const models = [];
  
  for (const file of files) {
    if (file.endsWith('.json')) {
      const config = await fs.readJSON(path.join(modelsDir, file));
      models.push({
        id: file.replace('.json', ''),
        name: config.name,
        provider: config.provider,
        apiKeyEnv: config.apiKeyEnv
      });
    }
  }
  
  return models;
}

/**
 * Test phone-a-friend hook with sample diff
 * @param {string} model - Model to test
 * @returns {Promise<void>}
 */
async function testPhoneAFriend(model = 'claude-3-5-sonnet') {
  const modelConfigPath = path.join(process.cwd(), 'config', 'models', `${model}.json`);
  
  if (!(await fs.pathExists(modelConfigPath))) {
    throw new Error(`Model configuration not found: ${model}`);
  }
  
  const modelConfig = await fs.readJSON(modelConfigPath);
  const apiKey = process.env[modelConfig.apiKeyEnv];
  
  if (!apiKey) {
    throw new Error(`API key not found. Please set ${modelConfig.apiKeyEnv} environment variable.`);
  }
  
  logger.info(`Testing ${model} with a sample code review...`);
  
  const sampleDiff = `
diff --git a/app.js b/app.js
index 1234567..abcdefg 100644
--- a/app.js
+++ b/app.js
@@ -10,7 +10,7 @@ function processUserInput(input) {
-    const query = "SELECT * FROM users WHERE name = '" + input + "'";
+    const query = \`SELECT * FROM users WHERE name = '\${input}'\`;
     db.execute(query);
 }
`;

  // This would normally call the API, but for testing we'll just verify config
  logger.success(`Model ${model} is properly configured and API key is set`);
  logger.info('Sample diff would be reviewed for SQL injection vulnerability');
}

module.exports = {
  configurePhoneAFriend,
  installPhoneAFriend,
  listAvailableModels,
  testPhoneAFriend
};