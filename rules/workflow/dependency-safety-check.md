# Dependency Safety Check Rule

## RULE-WFL-009: Dependency Safety Check

**Category**: Workflow  
**Complexity**: Advanced  
**Default**: Enabled  
**Hook Type**: Pre-commit  
**Performance Impact**: Low

### Purpose
Prevents accidental deletion or modification of files and directories that have active dependencies in the codebase, ensuring refactoring safety and preventing broken builds.

### Problem It Solves
- Developers (human or AI) may delete files without checking if they're still referenced
- Refactoring can break imports, scripts, or configuration references
- Reward hacking by AI agents that prioritize task completion over codebase integrity
- Loss of functionality when "cleaning up" without proper migration

### Implementation

The rule uses a comprehensive dependency check that searches for references in:
- All branches (main, preview, current)
- Working directory including untracked files
- Git hooks
- Various file types (.js, .ts, .json, .yml, .yaml, .sh, .md)

```bash
# Hook location: templates/hooks/dependency-check-hook.sh
# Usage in pre-commit or manual check:
./templates/hooks/dependency-check-hook.sh <file_or_directory>
```

### Configuration

```json
{
  "rules": {
    "wfl-009": {
      "enabled": true,
      "options": {
        "check_branches": ["main", "preview"],
        "file_extensions": [".js", ".ts", ".json", ".yml", ".yaml", ".sh", ".md"],
        "check_git_hooks": true,
        "max_results_shown": 20
      }
    }
  }
}
```

### Best Practices

1. **Run before any deletion**: Always check dependencies before removing files
2. **Create migration issues**: If dependencies exist, create an issue to properly migrate them
3. **Update references first**: Change all imports/references before deleting source files
4. **Document removals**: Keep a record of what was removed and why

### Example Workflow

```bash
# Before deleting legacy code
$ ./templates/hooks/dependency-check-hook.sh legacy/cursor-rules

🔍 Checking dependencies for: legacy/cursor-rules
❌ DEPENDENCIES FOUND for legacy/cursor-rules

Dependencies found in working directory:
scripts/rule-engine.js:10:module.exports = require('../legacy/cursor-rules/rule-engine.js');
.github/workflows/review-bots.yml:30:cache-dependency-path: legacy/review-bots/package.json

⚠️ Before deleting legacy/cursor-rules:
1. Analyze what functionality it provides
2. Ensure replacement code covers all use cases
3. Update all references to point to new location
4. Create migration plan if needed

🛑 Deletion blocked due to active dependencies
```

### Integration with AI Agents

This rule is especially important for AI-driven development to prevent:
- Reward hacking (deleting files just to complete a "cleanup" task)
- Loss of context about why certain files exist
- Breaking changes that aren't immediately obvious

AI agents should:
1. Always run dependency checks before proposing deletions
2. Create issues for proper migration when dependencies exist
3. Validate that new implementations cover all use cases of deleted code