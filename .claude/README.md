# .claude Directory

This directory contains AI-assisted development tools and configurations for the vibe-codex repository.

## Structure

```
.claude/
├── hooks/                    # Claude and workflow hooks
│   ├── monitor-context.sh    # Monitor Claude context usage
│   ├── update-restart-context.sh  # Update restart context file
│   ├── pr-check-handler.sh   # Analyze PR check failures
│   ├── report-issue.sh       # Report issues to vibe-codex
│   └── post-deploy.sh        # Post-deployment verification
├── config/                   # Configuration files
├── templates/                # Code generation templates
├── scripts/                  # Utility scripts
├── context/                  # Context preservation files
│   └── RESTART_CONTEXT.md    # Generated restart context
└── README.md                 # This file
```

## Usage

### Context Management
```bash
# Check current context usage
./.claude/hooks/monitor-context.sh

# Update restart context when usage is high
./.claude/hooks/update-restart-context.sh
```

### PR Management
```bash
# Analyze PR check failures
./.claude/hooks/pr-check-handler.sh [PR_NUMBER]

# Report issues with vibe-codex
./.claude/hooks/report-issue.sh
```

### Deployment
```bash
# Verify deployment after merge
./.claude/hooks/post-deploy.sh [BRANCH]
```

## Integration with vibe-codex

This .claude directory extends the standard vibe-codex functionality with:
- Context management for AI-assisted development
- Intelligent PR check analysis
- Issue reporting for rule improvements
- Post-deployment verification

All hooks are designed to work alongside the standard vibe-codex workflow and enhance the AI-assisted development experience.

## Configuration

The hooks use standard Git and GitHub CLI commands. Ensure you have:
- Git configured
- GitHub CLI (`gh`) authenticated
- Appropriate repository permissions

## Contributing

These hooks are based on patterns from successful AI-assisted development workflows. To improve them:
1. Test thoroughly before submitting changes
2. Follow the vibe-codex workflow for contributions
3. Document any new features or changes