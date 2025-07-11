/**
 * Compliance report generator for vibe-codex
 */

class Reporter {
  generateReport(violations, score, isBlocking, prData) {
    let report = '## 📋 vibe-codex Compliance Report\n\n';
    
    // Summary
    report += `**PR:** #${prData.number} - ${prData.title}\n`;
    report += `**Status:** ${isBlocking ? '❌ BLOCKED' : '✅ PASSED'}\n`;
    report += `**Score:** ${score}/10\n`;
    report += `**Violations:** ${violations.length}\n\n`;
    
    // Violations by level
    if (violations.length > 0) {
      report += '### Violations Found\n\n';
      
      const byLevel = violations.reduce((acc, v) => {
        if (!acc[v.level]) acc[v.level] = [];
        acc[v.level].push(v);
        return acc;
      }, {});
      
      const levelNames = {
        1: '🔒 Security (BLOCKER)',
        2: '🔄 Workflow (MANDATORY)',
        3: '🎯 Quality (MANDATORY)',
        4: '📐 Patterns (RECOMMENDED)'
      };
      
      for (const [level, levelViolations] of Object.entries(byLevel)) {
        report += `#### ${levelNames[level]}\n\n`;
        for (const v of levelViolations) {
          const icon = v.severity === 'error' ? '❌' : '⚠️';
          report += `${icon} **${v.rule}**: ${v.message}\n`;
          if (v.files) {
            report += `   Files: ${v.files.join(', ')}\n`;
          }
          report += '\n';
        }
      }
    } else {
      report += '### ✅ No violations found!\n\n';
      report += 'All compliance checks passed successfully.\n\n';
    }
    
    // Instructions
    if (isBlocking) {
      report += '### 🚨 Action Required\n\n';
      report += 'This PR is blocked due to mandatory rule violations.\n';
      report += 'Please fix the issues above and push new commits.\n\n';
    }
    
    return report;
  }
}

module.exports = Reporter;