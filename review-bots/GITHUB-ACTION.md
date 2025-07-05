# GitHub Action Integration for Review Bots

This document explains how the Review Bots are integrated with GitHub Actions to automatically review PRs.

## How It Works

When a PR is opened or updated against the `main` or `preview` branches:

1. **GitHub Action Triggers**: The workflow runs automatically
2. **Changed Files Detection**: Only modified files are analyzed
3. **Three Perspectives**: All three bots analyze the changes
4. **Combined Report**: Results are posted as a PR comment
5. **Status Check**: Critical/High issues fail the status check

## PR Comment Format

The bot posts a single comment with three collapsible sections:

```markdown
# 🤖 Review Bots Analysis

## 😤 Hater Bot Says:
<details>
<summary>Click to see all criticisms</summary>
[Detailed criticism of code issues]
</details>

## 🛡️ White Knight Bot Says:
<details>
<summary>Click to see all defenses</summary>
[Defense of reasonable design choices]
</details>

## ⚖️ Balance Bot Says (RECOMMENDED):
[Pragmatic recommendations sorted by severity]
```

## Status Check Rules

The PR status check will:
- ✅ **PASS** if only Medium/Low severity issues are found
- ❌ **FAIL** if Critical or High severity issues are found
- ⚠️ **PENDING** while analysis is running

## Configuration

The bots use `.review-bots.config.json` for project-specific rules:

```json
{
  "priorities": {
    "security": "critical",
    "workflowIntegrity": "high",
    "tokenEfficiency": "medium",
    "codeStyle": "low"
  }
}
```

## Responding to Bot Reviews

1. **Read Balance Bot First**: This gives you the pragmatic view
2. **Check Hater Bot for Details**: If you need specifics on issues
3. **Consider White Knight's Defense**: For understanding tradeoffs

## Overriding Bot Decisions

If you need to merge despite bot warnings:

1. Add a comment explaining why the issues are acceptable
2. Have a human reviewer approve the PR
3. Use admin merge if absolutely necessary

## Troubleshooting

### Bot Didn't Run
- Check if files have supported extensions (.js, .ts, .md, .json, .sh)
- Verify the workflow is enabled in Actions tab
- Check workflow runs for error messages

### Comment Too Long
- The bot truncates reports over 65KB
- Check the Action logs for full output
- Consider reviewing files in smaller batches

### False Positives
- Update `.review-bots.config.json` with exceptions
- Open an issue to improve bot logic
- Use White Knight Bot's perspective for context

## Local Testing

Test the bots locally before pushing:

```bash
# Install bots
cd review-bots
npm install
npm link

# Test on your changes
review-bots path/to/changed/files
```

## Customization

To adjust bot behavior for this repository:

1. Edit `.review-bots.config.json`
2. Modify severity mappings
3. Add project-specific patterns
4. Configure auto-labeling rules

## Performance

- Analysis typically takes 30-60 seconds
- Large PRs (>50 files) may take longer
- Binary files are automatically skipped
- Only supported file types are analyzed