# Vibe Codex Configuration

## Environment Variables

Vibe Codex can be configured using environment variables to customize repository URLs and other settings:

### Repository Configuration

- `VIBE_CODEX_REPO_URL` - Base URL for downloading rules and templates
  - Default: `https://raw.githubusercontent.com/your-org/vibe-codex/main`
  - Example: `VIBE_CODEX_REPO_URL=https://raw.githubusercontent.com/mycompany/our-rules/main`

- `VIBE_CODEX_REPO` - Repository owner/name for GitHub API calls
  - Default: `your-org/vibe-codex`
  - Example: `VIBE_CODEX_REPO=mycompany/our-rules`

### Using a Fork or Custom Repository

To use vibe-codex with your own rules repository:

1. Fork the vibe-codex repository
2. Customize the rules and hooks in your fork
3. Set the environment variables:

```bash
export VIBE_CODEX_REPO_URL=https://raw.githubusercontent.com/mycompany/our-rules/main
export VIBE_CODEX_REPO=mycompany/our-rules
```

4. Run vibe-codex normally:

```bash
npx vibe-codex init --type=web --preset
```

### Configuration File Names

The following file names are used by vibe-codex:

- Configuration: `.vibe-codex.json`
- Ignore file: `.vibe-codexignore`
- Work directory: `.vibe-codex/`
- Backup directory: `.vibe-codex-backup/`

These are currently not configurable but may be in future versions.

## Default Files

The following files are downloaded from the repository:

- `MANDATORY-RULES.md` - Core rules that apply to all projects
- `PROJECT_CONTEXT.md` - Template for documenting project context
- `hooks/*` - Git hook scripts

## Customization

To customize vibe-codex for your organization:

1. Fork the repository
2. Modify the rules in `MANDATORY-RULES.md`
3. Update hook scripts in the `hooks/` directory
4. Set the environment variables to point to your fork
5. Share the configuration with your team

This allows you to maintain organization-specific rules while still benefiting from the vibe-codex framework.