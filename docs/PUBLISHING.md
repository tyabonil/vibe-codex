# Publishing to npm

This guide explains how to publish vibe-codex to npm.

## Prerequisites

1. npm account with access to publish vibe-codex
2. npm CLI logged in: `npm login`
3. NPM_TOKEN secret added to GitHub repository

## Manual Publishing

```bash
# Ensure tests pass
npm test

# Check package contents
npm pack --dry-run

# Publish to npm
npm publish
```

## Automated Publishing

Publishing is automated via GitHub Actions when a release is created:

1. Go to GitHub Releases
2. Click "Create a new release"
3. Choose a tag (e.g., v3.0.1)
4. Fill in release notes
5. Click "Publish release"

The GitHub Action will automatically:
- Run tests
- Publish to npm
- Tag as `latest`

## Version Bumping

Before publishing:

```bash
# Patch version (3.0.0 -> 3.0.1)
npm version patch

# Minor version (3.0.0 -> 3.1.0)
npm version minor

# Major version (3.0.0 -> 4.0.0)
npm version major
```

## Verifying Publication

After publishing:

```bash
# Check npm registry
npm view vibe-codex

# Test installation
npx vibe-codex@latest init
```

## Troubleshooting

### "403 Forbidden"
- Check npm login: `npm whoami`
- Verify package name availability
- Ensure you have publish permissions

### GitHub Action Fails
- Check NPM_TOKEN secret is set
- Verify tests pass locally
- Check npm registry status