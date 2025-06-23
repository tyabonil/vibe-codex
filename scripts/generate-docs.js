#!/usr/bin/env node

/**
 * Documentation Generator for MANDATORY Rules Checker
 * Generates comprehensive documentation from rule configurations
 */

const fs = require('fs');
const path = require('path');

function generateDocs() {
    console.log('📝 Generating documentation...');
    
    const configPath = path.join(__dirname, '..', 'config', 'rules.json');
    const outputPath = path.join(__dirname, '..', 'docs', 'RULE-REFERENCE.md');
    
    try {
        // Ensure docs directory exists
        const docsDir = path.dirname(outputPath);
        if (!fs.existsSync(docsDir)) {
            fs.mkdirSync(docsDir, { recursive: true });
        }
        
        // Load configuration
        const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        
        // Generate documentation content
        const docs = generateMarkdownDocs(config);
        
        // Write documentation file
        fs.writeFileSync(outputPath, docs, 'utf8');
        
        console.log(`✅ Documentation generated: ${outputPath}`);
        
    } catch (error) {
        console.error('❌ Error generating documentation:', error.message);
        process.exit(1);
    }
}

function generateMarkdownDocs(config) {
    const timestamp = new Date().toISOString();
    
    return `# MANDATORY Rules Reference

*Auto-generated on ${timestamp}*

This document provides a comprehensive reference for all MANDATORY rules enforced by the GitHub Rules Checker.

## Table of Contents

- [Level 1: Security & Safety](#level-1-security--safety)
- [Level 2: Workflow Integrity](#level-2-workflow-integrity)
- [Level 3: Quality Gates](#level-3-quality-gates)
- [Level 4: Development Patterns](#level-4-development-patterns)

---

## Level 1: Security & Safety

**Severity: BLOCKER** - These violations will prevent PR merge

### Secret Detection

The system scans for the following secret patterns:

${config.level1.secretPatterns.map((pattern, index) => `${index + 1}. \`${pattern}\``).join('\n')}

**Fix:** Remove all secrets and credentials from code. Use environment variables or secure storage.

### Environment File Protection

**Protected files:**
- \`.env\`
- \`.env.local\`
- \`.env.production\`
- \`.env.development\`

**Fix:** Never modify .env files directly. Use .env.example for templates.

---

## Level 2: Workflow Integrity

**Severity: MANDATORY** - These violations must be fixed before merge

### Issue Reference Validation

Every PR must reference an issue number in either:
- PR title (e.g., "Fix login bug - Issue #123")
- PR description body

**Pattern:** \`#\\d+\`

**Fix:** Add issue reference (#123) to PR title or description

### Branch Naming Convention

Valid branch patterns:

${config.level2.branchPatterns.map((pattern, index) => `${index + 1}. \`${pattern}\``).join('\n')}

**Fix:** Use format: \`feature/issue-{number}-{description}\`

### MCP API Usage

For remote Git operations, use MCP GitHub API instead of terminal commands.

**Detected terminal patterns:**
- \`git add\`
- \`git commit\`
- \`git push\`
- \`git pull\`
- \`git merge\`

**Fix:** Replace terminal git commands with MCP GitHub API calls

### PROJECT_CONTEXT Updates

Significant changes (>5 files or >100 additions) require documentation updates.

**Required files:**
- PROJECT_CONTEXT.md
- README.md
- CHANGELOG.md

**Fix:** Update PROJECT_CONTEXT.md or README.md to reflect changes

---

## Level 3: Quality Gates

**Severity: MANDATORY** - These violations must be fixed before merge

### Test Coverage

**Requirement:** ${config.level3.testCoverage}% test coverage for all new code

**Valid test file patterns:**
- \`*.test.js\`
- \`*.spec.js\`
- \`__tests__/**\`

**Fix:** Add comprehensive test files for all new functionality

### Copilot Review

All PRs must request and complete a Copilot review.

**Fix:** Request Copilot review using \`@copilot-pull-request-reviewer review\`

### PR Feedback Response

All review comments must be addressed comprehensively.

**Fix:** Respond to all review feedback with detailed explanations or code changes

---

## Level 4: Development Patterns

**Severity: RECOMMENDED** - These are warnings that don't block merge

### File Size Limits

**Maximum recommended lines:** ${config.level4.maxFileLines}

**Fix:** Consider breaking large files into smaller, focused modules

### Code Duplication Detection

The system warns when multiple files of the same type are added simultaneously.

**Fix:** Extract common functionality into shared modules

### Branch Targeting

For multi-file changes, consider using development branches before merging to main.

**Fix:** Use feature branches and merge to develop before main

---

## Compliance Scoring

The system calculates a compliance score based on violations:

- **BLOCKER violations:** -3 points each
- **MANDATORY violations:** -2 points each  
- **RECOMMENDED violations:** -1 point each

**Maximum score:** 10 points

**Merge requirements:**
- 0 BLOCKER violations
- 0 MANDATORY violations
- Score ≥ 6 recommended

---

## Configuration

This documentation is generated from \`config/rules.json\`. To modify rules:

1. Edit the configuration file
2. Run \`npm run validate\` to verify changes
3. Run \`npm run docs\` to regenerate this documentation

---

*For more information, see [MANDATORY-RULES.md](../MANDATORY-RULES.md)*
`;
}

// Run documentation generation if called directly
if (require.main === module) {
    generateDocs();
}

module.exports = { generateDocs };