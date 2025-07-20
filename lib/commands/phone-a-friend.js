/**
 * Phone-a-Friend command for AI code reviews
 */

const chalk = require('chalk');
const {
  configurePhoneAFriend,
  installPhoneAFriend,
  listAvailableModels,
  testPhoneAFriend
} = require('../hooks/phone-a-friend');
const logger = require('../utils/logger');

/**
 * Configure phone-a-friend AI review
 * @param {Object} options - Command options
 * @param {string} options.model - Model to use
 * @param {boolean} options.enable - Enable the hook
 * @param {boolean} options.disable - Disable the hook
 * @param {boolean} options.test - Test the configuration
 * @param {boolean} options.list - List available models
 * @param {string} options.trigger - Hook trigger (pre-push or pre-commit)
 * @param {boolean} options.allowForce - Allow force push with issues
 */
async function phoneAFriend(options = {}) {
  try {
    // List available models
    if (options.list) {
      const models = await listAvailableModels();
      
      console.log(chalk.blue('\n📱 Available AI Models:\n'));
      
      models.forEach(model => {
        console.log(chalk.cyan(`  ${model.id}`));
        console.log(`    Name: ${model.name}`);
        console.log(`    Provider: ${model.provider}`);
        console.log(`    API Key: ${model.apiKeyEnv}`);
        console.log();
      });
      
      return;
    }
    
    // Test configuration
    if (options.test) {
      const model = options.model || 'claude-3-5-sonnet';
      await testPhoneAFriend(model);
      return;
    }
    
    // Configure the hook
    const config = {
      enabled: !options.disable,
      model: options.model || 'claude-3-5-sonnet',
      trigger: options.trigger || 'pre-push',
      allowForcePush: options.allowForce || false
    };
    
    if (options.disable) {
      config.enabled = false;
      await configurePhoneAFriend(config);
      logger.info('Phone-a-Friend hook disabled');
      return;
    }
    
    // Configure and install
    await configurePhoneAFriend(config);
    await installPhoneAFriend();
    
    console.log(chalk.green('\n✅ Phone-a-Friend AI review configured!'));
    console.log(chalk.yellow('\n📝 Configuration:'));
    console.log(`  Model: ${config.model}`);
    console.log(`  Trigger: ${config.trigger}`);
    console.log(`  Allow force push: ${config.allowForcePush}`);
    
    // Check for API key
    const models = await listAvailableModels();
    const selectedModel = models.find(m => m.id === config.model);
    
    if (selectedModel && !process.env[selectedModel.apiKeyEnv]) {
      console.log(chalk.red(`\n⚠️  Warning: ${selectedModel.apiKeyEnv} environment variable not set`));
      console.log(chalk.yellow(`  Set it with: export ${selectedModel.apiKeyEnv}="your-api-key"`));
    }
    
    console.log(chalk.blue('\n💡 Usage:'));
    console.log('  The AI will review your code changes before each push.');
    console.log('  To skip the review: SKIP_AI_REVIEW=true git push');
    console.log('  To test: npx vibe-codex phone-a-friend --test');
    
  } catch (error) {
    logger.error('Failed to configure phone-a-friend:', error.message);
    process.exit(1);
  }
}

module.exports = phoneAFriend;