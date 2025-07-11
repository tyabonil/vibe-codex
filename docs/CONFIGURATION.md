# Configuration

vibe-codex uses a simple JSON configuration file.

## Configuration File

After initialization, vibe-codex creates `.vibe-codex.json`:

```json
{
  "version": "3.0.0",
  "gitHooks": true,
  "githubActions": false,
  "rules": ["security", "commit-format"],
  "created": "2025-07-10T10:00:00.000Z"
}
```

## Options

### `gitHooks`
- `true` - Install git hooks (default)
- `false` - Skip hook installation

### `githubActions`
- `true` - Install GitHub Actions workflow
- `false` - Skip GitHub Actions (default)

### `rules`
Array of enabled rules:
- `"security"` - Check for secrets
- `"commit-format"` - Validate commit messages
- `"testing"` - Run tests before commit
- `"documentation"` - Check for README
- `"code-style"` - Run linting

## Changing Configuration

### Interactive (Recommended)
```bash
npx vibe-codex config
```

This opens a menu to select/deselect rules.

### Manual
Edit `.vibe-codex.json` directly, then reinstall:
```bash
npx vibe-codex init
```

## Minimal Configuration

For the simplest setup:
```json
{
  "version": "3.0.0",
  "gitHooks": true,
  "rules": ["security"]
}
```

This only checks for secrets - perfect for most projects.