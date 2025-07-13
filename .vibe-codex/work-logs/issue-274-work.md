# Issue #274: Add dependency safety check rule

## Summary
Implementing a dependency safety check as an optional rule in vibe-codex to scan for vulnerable dependencies.

## Plan
1. Create dependency-safety-check.sh script
2. Add dependency-safety rule option to commands
3. Integrate into pre-commit hook
4. Add tests
5. Update documentation

## Implementation Details
- Scan package-lock.json, yarn.lock, pnpm-lock.yaml
- Check for known vulnerabilities using npm audit or similar
- Optional and configurable
- Simple implementation that works across package managers

## Work Log
- Created feature branch: feature/issue-274-dependency-safety
- Starting implementation...