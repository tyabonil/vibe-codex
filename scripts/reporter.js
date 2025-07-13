// Legacy stub for backward compatibility
// The mandatory rules system has been replaced by vibe-codex
// This file exists only to prevent breaking existing workflows

class Reporter {
  generateReport(violations, score, isBlocking) {
    return `## ⚠️ Legacy Mandatory Rules System

This repository is using the deprecated mandatory rules system. 

### Migration Required
Please migrate to vibe-codex for modern git hooks:

\`\`\`bash
npx vibe-codex init
\`\`\`

### Why Migrate?
- Simpler setup and configuration
- Optional rules you can enable/disable
- Better integration with modern development workflows
- Active maintenance and support

### Legacy Report
Score: ${score}/10
Status: PASSED (Legacy system deprecated)

For more information, see [vibe-codex documentation](https://github.com/tyabonil/vibe-codex).`;
  }
}

module.exports = Reporter;