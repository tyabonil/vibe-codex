# Hook Alignment Analysis for vibe-codex

## Overview

This document analyzes the current state of hooks in the vibe-codex project and proposes alignment with the project's intended functionality as a simple npx tool for installing development rules and git hooks.

## Current Hook State

### 1. **Active Git Hooks** (in .git/hooks/)
- `pre-commit`: Runs pr-health-check.sh and security-pre-commit.sh
- `commit-msg`: Validates commit messages
- `post-commit`: References missing continuous-pr-monitor.sh
- `post-merge`: Branch cleanup automation
- `pre-push`: References missing enforce-pr-workflow.sh

### 2. **Development Scripts** (in /hooks/)
Contains 20+ hook scripts including:
- Workflow enforcement hooks
- Issue management hooks
- PR review hooks
- Testing and quality hooks
- Installation utilities

### 3. **Claude-Specific Hooks** (in /.claude/hooks/)
Contains specialized hooks for Claude integration but missing referenced scripts.

### 4. **NPX Tool Hooks** (vibe-codex/lib/installer/git-hooks.js)
The actual product installs:
- `pre-commit`: Always installed, runs validation
- `commit-msg`: Conditional, validates commit format
- `pre-push`: Conditional, runs tests and PR checks
- `post-commit`: Conditional, tracks issue progress

### 5. **Module Hook Directories** (Empty)
Prepared for modular architecture but unused.

## Alignment Issues

### 1. **Missing Referenced Scripts**
- `.claude/hooks/continuous-pr-monitor.sh` (referenced by post-commit)
- `.claude/hooks/enforce-pr-workflow.sh` (referenced by pre-push)

### 2. **Inconsistent Implementation**
- Development hooks in /hooks/ are complex bash scripts
- NPX tool generates simple wrapper scripts
- Module directories prepared but empty

### 3. **Scope Creep**
- Many hooks implement features beyond core functionality
- Complex workflow enforcement vs simple rule checking
- Development-specific hooks mixed with user-facing hooks

## Proposed Alignment

### Core Product Hooks (NPX vibe-codex)

Based on the simplified vision (#212), vibe-codex should install only:

#### 1. **pre-commit**
```bash
#!/bin/sh
# Check for rule violations
# Run security checks
# Validate file formatting
```

#### 2. **commit-msg**
```bash
#!/bin/sh
# Validate conventional commit format
# Ensure issue references
```

#### 3. **pre-push** (optional)
```bash
#!/bin/sh
# Run tests if configured
# Check PR status if GitHub integration enabled
```

### Development Hooks (This Repository)

Keep separate from product:

#### 1. **Workflow Enforcement**
- PR health checks
- Issue tracking
- Branch management

#### 2. **Claude Integration**
- Context monitoring
- PR workflow enforcement
- Automated updates

## Recommended Actions

### 1. **Immediate Fixes**
- Remove broken hook references in .git/hooks/
- Create missing Claude hooks or update references
- Clean up stale development hooks

### 2. **Product Clarification**
- Move complex hooks to development-only directory
- Simplify NPX tool to install only essential hooks
- Document which hooks are for development vs users

### 3. **Module Integration**
- Populate module hook directories with appropriate scripts
- Create clear separation between core and optional hooks
- Implement hook discovery mechanism

### 4. **Documentation**
- Create user guide for hook installation
- Document development workflow hooks separately
- Provide customization examples

## Hook Categories

### Essential (Core Product)
1. `pre-commit` - Basic validation
2. `commit-msg` - Message format

### Optional (Modules)
1. `pre-push` - Testing module
2. `post-commit` - GitHub module
3. `prepare-commit-msg` - Templates module

### Development Only
1. Issue tracking hooks
2. PR workflow enforcement
3. Claude integration hooks
4. Branch cleanup automation

## Next Steps

1. Create issue to fix broken hook references
2. Create issue to simplify product hooks
3. Create issue to reorganize hook directories
4. Create issue to document hook system
5. Update existing transformation issues to reflect hook simplification