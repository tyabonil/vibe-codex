/**
 * MANDATORY Rules Compliance Reporter
 * Generates detailed, actionable compliance reports for PR feedback
 */

class Reporter {
  constructor() {
    this.emojis = {
      level1: '🚨',
      level2: '⚠️',
      level3: '❌',
      level4: '💡',
      success: '✅',
      blocker: '🛑',
      mandatory: '⚡',
      recommended: '📝'
    };
  }

  /**
   * Generate comprehensive compliance report
   */
  generateReport(violations, score, isBlocking, prData) {
    const report = [];
    
    // Header
    report.push(this.generateHeader(score, isBlocking, violations.length));
    
    // Level-specific sections
    const levelGroups = this.groupViolationsByLevel(violations);
    
    // Level 1: Security (BLOCKER)
    if (levelGroups[1] && levelGroups[1].length > 0) {
      report.push(this.generateLevel1Section(levelGroups[1]));
    } else {
      report.push('### ✅ **Level 1: Security & Safety**\n- ✅ No security violations detected\n- ✅ No secrets found in commits\n- ✅ Environment files protected\n');
    }
    
    // Level 2: Workflow (MANDATORY)
    if (levelGroups[2] && levelGroups[2].length > 0) {
      report.push(this.generateLevel2Section(levelGroups[2]));
    } else {
      report.push('### ✅ **Level 2: Workflow Integrity**\n- ✅ Issue reference found\n- ✅ Branch naming compliant\n- ✅ MCP GitHub API usage detected\n- ✅ TOKEN efficiency maintained\n');
    }
    
    // Level 3: Quality (MANDATORY)
    if (levelGroups[3] && levelGroups[3].length > 0) {
      report.push(this.generateLevel3Section(levelGroups[3]));
    } else {
      report.push('### ✅ **Level 3: Quality Gates**\n- ✅ Test coverage adequate\n- ✅ Copilot review compliance\n- ✅ PR feedback responsiveness\n- ✅ Documentation requirements met\n');
    }
    
    // Level 4: Patterns (RECOMMENDED)
    if (levelGroups[4] && levelGroups[4].length > 0) {
      report.push(this.generateLevel4Section(levelGroups[4]));
    } else {
      report.push('### ✅ **Level 4: Development Patterns**\n- ✅ File sizes appropriate\n- ✅ No code duplication detected\n- ✅ Clean development patterns\n');
    }
    
    // Summary and actions
    report.push(this.generateSummary(violations, score, isBlocking));
    
    // Quick reference
    report.push(this.generateQuickReference(violations));
    
    return report.join('\n\n');
  }

  generateHeader(score, isBlocking, violationCount) {
    const status = isBlocking ? '🛑 BLOCKED' : '✅ PASSED';
    const statusColor = isBlocking ? '🔴' : '🟢';
    
    return `## ${this.emojis.success} **MANDATORY Rules Compliance Report**

### 📊 **Compliance Score: ${score}/10** ${statusColor}
**Status: ${status}** | **Violations: ${violationCount}** | **Merge: ${isBlocking ? 'BLOCKED' : 'ALLOWED'}**

---`;
  }

  generateLevel1Section(violations) {
    const section = [`### ${this.emojis.level1} **Level 1: Security & Safety (NON-NEGOTIABLE)**`];
    
    violations.forEach(violation => {
      section.push(`#### ${this.emojis.blocker} **${violation.rule}**
- **Issue**: ${violation.message}
- **Details**: ${violation.details}
- **Action Required**: ${violation.action}
- **Fix**: ${violation.fix}
${violation.file ? `- **File**: \`${violation.file}\`` : ''}
${violation.evidence ? `- **Evidence**: ${violation.evidence.join(', ')}` : ''}`);
    });
    
    section.push('> **🚨 CRITICAL**: Level 1 violations MUST be fixed before proceeding. No exceptions allowed.');
    
    return section.join('\n\n');
  }

  generateLevel2Section(violations) {
    const section = [`### ${this.emojis.level2} **Level 2: Workflow Integrity (MANDATORY)**`];
    
    violations.forEach(violation => {
      section.push(`#### ${this.emojis.mandatory} **${violation.rule}**
- **Issue**: ${violation.message}
- **Details**: ${violation.details}
- **Action Required**: ${violation.action}
- **Fix**: ${violation.fix}
${violation.file ? `- **File**: \`${violation.file}\`` : ''}
${violation.evidence ? `- **Evidence**: ${violation.evidence.join(', ')}` : ''}`);
    });
    
    section.push('> **⚡ MANDATORY**: Level 2 violations must be resolved for merge approval.');
    
    return section.join('\n\n');
  }

  generateLevel3Section(violations) {
    const section = [`### ${this.emojis.level3} **Level 3: Quality Gates (MANDATORY)**`];
    
    violations.forEach(violation => {
      section.push(`#### ${this.emojis.mandatory} **${violation.rule}**
- **Issue**: ${violation.message}
- **Details**: ${violation.details}
- **Action Required**: ${violation.action}
- **Fix**: ${violation.fix}
${violation.file ? `- **File**: \`${violation.file}\`` : ''}
${violation.evidence ? `- **Evidence**: ${violation.evidence.join(', ')}` : ''}`);
    });
    
    section.push('> **🎯 QUALITY**: Level 3 violations block merge until all addressed.');
    
    return section.join('\n\n');
  }

  generateLevel4Section(violations) {
    const section = [`### ${this.emojis.level4} **Level 4: Development Patterns (RECOMMENDED)**`];
    
    violations.forEach(violation => {
      section.push(`#### ${this.emojis.recommended} **${violation.rule}**
- **Suggestion**: ${violation.message}
- **Details**: ${violation.details}
- **Recommended Action**: ${violation.action}
- **How to Improve**: ${violation.fix}
${violation.file ? `- **File**: \`${violation.file}\`` : ''}`);
    });
    
    section.push('> **💡 RECOMMENDED**: Level 4 suggestions improve code quality but don\'t block merge.');
    
    return section.join('\n\n');
  }

  generateSummary(violations, score, isBlocking) {
    const criticalCount = violations.filter(v => v.level <= 2).length;
    const qualityCount = violations.filter(v => v.level === 3).length;
    const patternCount = violations.filter(v => v.level === 4).length;
    
    let summary = `## 📋 **Compliance Summary**

### **Violation Breakdown**
- 🚨 **Level 1-2 (Critical)**: ${criticalCount} violations
- ❌ **Level 3 (Quality)**: ${qualityCount} violations  
- 💡 **Level 4 (Patterns)**: ${patternCount} suggestions

### **Overall Assessment**
- **Compliance Score**: ${score}/10
- **Merge Status**: ${isBlocking ? '🛑 BLOCKED' : '✅ APPROVED'}`;

    if (isBlocking) {
      summary += `\n- **Required Actions**: Fix all Level 1-3 violations before merge
- **Next Steps**: Address violations listed above, then re-run compliance check`;
    } else {
      summary += `\n- **Status**: All mandatory rules compliant! 🎉
- **Optional**: Consider addressing Level 4 recommendations for improved code quality`;
    }

    return summary;
  }

  generateQuickReference(violations) {
    if (violations.length === 0) {
      return `## 🎯 **Quick Reference**

✅ **All MANDATORY rules compliant!**

**Remember for future PRs:**
- 🔐 Never commit secrets or modify .env files
- 📝 Always reference issue numbers
- 🧪 Maintain 100% test coverage  
- 👀 Request Copilot review
- 📚 Update PROJECT_CONTEXT.md for significant changes

For complete rules, see [MANDATORY-RULES.md](./MANDATORY-RULES.md)`;
    }

    const quickFixes = violations
      .filter(v => v.level <= 3)
      .map(v => `- **${v.rule}**: ${v.fix}`)
      .slice(0, 5);

    return `## 🎯 **Quick Fix Checklist**

**To resolve violations:**
${quickFixes.join('\n')}

**Then:**
- [ ] Re-run compliance check
- [ ] Ensure all violations addressed
- [ ] Request review when ready

For complete rules, see [MANDATORY-RULES.md](./MANDATORY-RULES.md)`;
  }

  groupViolationsByLevel(violations) {
    const groups = { 1: [], 2: [], 3: [], 4: [] };
    violations.forEach(violation => {
      if (groups[violation.level]) {
        groups[violation.level].push(violation);
      }
    });
    return groups;
  }

  /**
   * Generate success report for compliant PRs
   */
  generateSuccessReport(prData) {
    return `## ✅ **MANDATORY Rules Compliance - PASSED**

### 🎉 **Excellent Work!**

All MANDATORY rules are compliant for PR #${prData.number}: **${prData.title}**

### ✅ **Compliance Verified**
- 🔐 **Security**: No secrets detected, environment files protected
- 🔄 **Workflow**: Issue referenced, branch naming correct, MCP API usage
- 🎯 **Quality**: Test coverage adequate, review compliance maintained
- 💡 **Patterns**: Clean development patterns followed

### 📊 **Score: 10/10** 🟢

**Status**: Ready for merge! 🚀

---

*Keep up the excellent work following the MANDATORY rules!*

For complete rules reference, see [MANDATORY-RULES.md](./MANDATORY-RULES.md)`;
  }

  /**
   * Generate error report for checker failures
   */
  generateErrorReport(error, prData) {
    return `## ❌ **MANDATORY Rules Checker Error**

### 🚨 **Compliance Check Failed**

An error occurred while checking PR #${prData?.number || 'unknown'} for MANDATORY rules compliance.

### **Error Details**
\`\`\`
${error.message}
\`\`\`

### **What to do**
1. Check the [workflow logs](${process.env.GITHUB_SERVER_URL}/${process.env.GITHUB_REPOSITORY}/actions) for detailed error information
2. Verify all required files are present in the repository
3. Contact the repository maintainer if the issue persists

### **Manual Compliance Check**
While the automated checker is unavailable, please manually verify:
- [ ] No secrets committed (API keys, passwords, tokens)
- [ ] Issue number referenced in PR title/description
- [ ] Branch naming follows convention: \`feature/issue-{number}-{description}\`
- [ ] Test coverage included for new code
- [ ] Copilot review requested

For complete rules, see [MANDATORY-RULES.md](./MANDATORY-RULES.md)`;
  }
}

module.exports = Reporter;