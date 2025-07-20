# Changelog

All notable changes to vibe-codex will be documented in this file.

## [0.8.0] - 2025-07-20

### Added
- Command-line first architecture - all commands require explicit CLI arguments
- Comprehensive file scanning for security and code quality violations
- Support for environment variables to configure repository URLs
- Migration guide for upgrading from v0.6
- Comprehensive test coverage for all commands
- New modules reference documentation

### Changed
- **BREAKING**: Removed all interactive prompts and menu system
- **BREAKING**: Init command now requires explicit module configuration via CLI flags
- **BREAKING**: Config command now uses CLI arguments instead of interactive menu
- **BREAKING**: Update-issue command requires message via CLI arguments
- All repository references are now configurable (no hardcoded URLs)
- Improved validation with actual file scanning (not just checking .gitignore)
- Better error messages with file paths and line numbers

### Removed
- Interactive mode completely removed
- Inquirer dependency removed
- All project-specific implementations

### Fixed
- Validation rules now actually scan file contents
- Security scanning properly detects API keys, passwords, and secrets
- Test coverage calculation includes all source files

## [0.6.x] - Previous versions

Previous versions used an interactive menu system. See git history for details.