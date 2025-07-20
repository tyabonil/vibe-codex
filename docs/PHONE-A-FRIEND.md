# Phone-a-Friend AI Code Review

The Phone-a-Friend feature provides AI-powered code reviews before pushing changes to your repository. It integrates with various LLM providers to analyze your code diffs and provide feedback on potential issues, security vulnerabilities, and best practices.

## Quick Start

```bash
# Configure with default model (Claude 3.5 Sonnet)
npx vibe-codex phone-a-friend

# Use a specific model
npx vibe-codex phone-a-friend --model gpt-4

# List available models
npx vibe-codex phone-a-friend --list
```

## Configuration

The feature requires:
1. An API key for your chosen LLM provider
2. vibe-codex to be initialized in your project

### Setting API Keys

```bash
# For Claude (Anthropic)
export ANTHROPIC_API_KEY="your-api-key"

# For GPT-4 (OpenAI)
export OPENAI_API_KEY="your-api-key"
```

### Available Models

- `claude-3-5-sonnet` - Claude 3.5 Sonnet by Anthropic (default)
- `gpt-4` - GPT-4 Turbo by OpenAI

## How It Works

1. Before each push, the hook runs automatically
2. It generates a diff of your changes
3. Sends the diff to the configured AI model
4. Displays the review results in your terminal
5. Optionally blocks the push if critical issues are found

## Command Options

```bash
npx vibe-codex phone-a-friend [options]

Options:
  -m, --model <model>     AI model to use (default: claude-3-5-sonnet)
  --list                  List available models
  --test                  Test the configuration
  --disable               Disable AI reviews
  --trigger <trigger>     Hook trigger: pre-push or pre-commit (default: pre-push)
  --allow-force          Allow force push even with critical issues
```

## Configuration in .vibe-codex.json

The configuration is stored in your project's `.vibe-codex.json`:

```json
{
  "hooks": {
    "phoneAFriend": {
      "enabled": true,
      "model": "claude-3-5-sonnet",
      "trigger": "pre-push",
      "allowForcePush": false
    }
  }
}
```

## Skipping Reviews

To skip the AI review for a specific push:

```bash
SKIP_AI_REVIEW=true git push
```

## Custom Model Configuration

You can add custom models by creating a JSON file in `config/models/`:

```json
{
  "name": "Custom Model",
  "provider": "custom",
  "model": "custom-model-id",
  "endpoint": "https://api.custom-provider.com/v1/completions",
  "apiKeyEnv": "CUSTOM_API_KEY",
  "headers": {
    "Authorization": "Bearer ${apiKey}",
    "Content-Type": "application/json"
  },
  "maxTokens": 4096,
  "temperature": 0.3,
  "systemPrompt": "You are a code reviewer...",
  "requestFormat": {
    "model": "${model}",
    "prompt": "${content}",
    "max_tokens": "${maxTokens}",
    "temperature": "${temperature}"
  },
  "responseParser": "choices[0].text"
}
```

## Troubleshooting

### API Key Not Found
```
❌ API key not found. Please set ANTHROPIC_API_KEY environment variable.
```

**Solution**: Export the appropriate API key for your chosen model.

### Model Configuration Not Found
```
❌ Model configuration not found: model-name
```

**Solution**: Use `--list` to see available models or add a custom configuration.

### API Request Failed
```
❌ API request failed with code 401
```

**Solution**: Check that your API key is valid and has sufficient credits.

## Best Practices

1. **Review the AI feedback**: While AI can catch many issues, it's not infallible
2. **Set appropriate triggers**: Use `pre-commit` for immediate feedback, `pre-push` for less frequent reviews
3. **Configure allowForcePush carefully**: Only enable if your team is comfortable overriding AI suggestions
4. **Monitor API usage**: Be aware of rate limits and costs associated with your chosen provider

## Security Considerations

- API keys are never stored in the repository
- Diffs are sent over HTTPS to the AI provider
- Consider the sensitivity of your code before enabling
- Review your AI provider's data retention policies