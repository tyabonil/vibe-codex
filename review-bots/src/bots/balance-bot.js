/**
 * Balance Bot - The Pragmatic Mediator
 * 
 * This bot considers both critical feedback and defensive arguments,
 * then provides balanced solutions biased toward achieving the actual
 * goals of the codebase rather than theoretical perfection.
 */

const BaseBot = require('./base-bot');
const HaterBot = require('./hater-bot');
const WhiteKnightBot = require('./white-knight-bot');
const { analyzeFile } = require('../utils/analysis');

class BalanceBot extends BaseBot {
  constructor() {
    super('BalanceBot', '⚖️');
    this.haterBot = new HaterBot();
    this.whiteKnightBot = new WhiteKnightBot();
  }

  /**
   * Analyzes both perspectives and provides balanced, actionable recommendations
   */
  async analyzeFile(filePath, content) {
    const recommendations = [];
    const analysis = await analyzeFile(filePath, content);
    
    // Get both perspectives
    const criticisms = await this.haterBot.analyzeFile(filePath, content);
    const defenses = await this.whiteKnightBot.analyzeFile(filePath, content);
    
    // Synthesize balanced recommendations
    recommendations.push(...this.balanceGeneralIssues(filePath, content, criticisms, defenses, analysis));
    
    // Language-specific balanced analysis
    if (filePath.endsWith('.js') || filePath.endsWith('.ts')) {
      recommendations.push(...this.balanceJavaScriptIssues(content, criticisms, defenses, analysis));
    } else if (filePath.endsWith('.md')) {
      recommendations.push(...this.balanceMarkdownIssues(content, criticisms, defenses, analysis));
    } else if (filePath.endsWith('.json')) {
      recommendations.push(...this.balanceJsonIssues(content, criticisms, defenses, analysis));
    } else if (filePath.endsWith('.sh')) {
      recommendations.push(...this.balanceShellScriptIssues(content, criticisms, defenses, analysis));
    }

    return recommendations;
  }

  balanceGeneralIssues(filePath, content, criticisms, defenses, analysis) {
    const recommendations = [];
    const lines = content.split('\n');

    // Balance file size concerns
    const fileSizeCriticism = criticisms.find(c => c.title && c.title.includes('Lines'));
    const fileSizeDefense = defenses.find(d => d.aspect === 'File Size');
    
    if (fileSizeCriticism && lines.length > 500) {
      recommendations.push({
        issue: 'File Size',
        severity: 'medium',
        impact: 'Maintainability and testing complexity increase with file size',
        recommendation: `This file has ${lines.length} lines. While not critical, consider refactoring if:
        - Multiple unrelated features are mixed together
        - Testing individual components is difficult
        - New developers struggle to understand the file's purpose`,
        pragmaticAdvice: `Only split if it improves clarity. A 500-line file with one clear purpose is better than 10 files with unclear boundaries.`,
        effortVsImpact: 'Medium effort, Medium impact'
      });
    }

    // Balance naming convention issues
    const namingCriticism = criticisms.find(c => c.title && c.title.includes('Naming Convention'));
    const namingDefense = defenses.find(d => d.aspect === 'Mixed Naming Conventions');
    
    if (namingCriticism && namingDefense) {
      recommendations.push({
        issue: 'Naming Conventions',
        severity: 'low',
        impact: 'Cognitive overhead for developers switching between styles',
        recommendation: `Mixed naming conventions detected. If external APIs require specific formats, document this clearly:
        - Add comments explaining why different conventions are used
        - Create adapter layers to translate between conventions
        - Consider using TypeScript interfaces to enforce consistency`,
        pragmaticAdvice: `Don't refactor working code just for consistency. Fix gradually as you touch each file.`,
        effortVsImpact: 'High effort, Low impact'
      });
    }

    // Balance TODO comments
    const todoCriticism = criticisms.find(c => c.title && c.title.includes('TODO'));
    const todoDefense = defenses.find(d => d.aspect === 'TODO Comments');
    
    if (todoCriticism && todoCriticism.examples && todoCriticism.examples.length > 5) {
      recommendations.push({
        issue: 'Technical Debt Tracking',
        severity: 'medium',
        impact: 'Accumulated TODOs become permanent fixtures',
        recommendation: `Found ${todoCriticism.examples.length} TODOs. Actionable approach:
        1. Convert TODOs referencing bugs → GitHub issues immediately
        2. Delete TODOs older than 6 months (they're not happening)
        3. Keep only TODOs with clear trigger conditions`,
        pragmaticAdvice: `TODOs are fine for "nice-to-haves" but bugs and security issues need proper tracking.`,
        effortVsImpact: 'Low effort, Medium impact'
      });
    }

    // Balance console.log usage
    const consoleCriticism = criticisms.find(c => c.title && c.title.includes('console.log'));
    const consoleDefense = defenses.find(d => d.aspect === 'Console Statements');
    
    if (consoleCriticism && consoleCriticism.severity === 'high') {
      const isProductionFile = !filePath.includes('test') && !filePath.includes('dev') && !filePath.includes('debug');
      
      if (isProductionFile) {
        recommendations.push({
          issue: 'Logging Strategy',
          severity: 'high',
          impact: 'Information disclosure, performance impact, no log management',
          recommendation: `Console statements in production code detected. Immediate actions:
          1. Remove console.logs that might expose sensitive data
          2. Replace with proper logging for debugging needs
          3. Use environment-based logging (console in dev, logger in prod)`,
          pragmaticAdvice: `If you must use console, wrap it: const log = process.env.NODE_ENV === 'development' ? console.log : () => {}`,
          effortVsImpact: 'Low effort, High impact'
        });
      }
    }

    return recommendations;
  }

  balanceJavaScriptIssues(content, criticisms, defenses, analysis) {
    const recommendations = [];

    // Balance var usage
    const varCriticism = criticisms.find(c => c.title && c.title.includes('var'));
    const varDefense = defenses.find(d => d.aspect === 'var Usage');
    
    if (varCriticism) {
      const isLegacyCode = content.includes('IE') || content.includes('ES5');
      recommendations.push({
        issue: 'Variable Declarations',
        severity: isLegacyCode ? 'low' : 'medium',
        impact: 'Potential scoping bugs, signals outdated codebase',
        recommendation: isLegacyCode ? 
          `Keep var for legacy browser support, but document why` :
          `Replace var with const/let. This is a safe refactor with immediate benefits:
          - Prevents accidental reassignment (const)
          - Fixes scoping issues (let)
          - Signals modern codebase to contributors`,
        pragmaticAdvice: `Use your IDE's refactor tool. This is a 5-minute fix with no downside.`,
        effortVsImpact: 'Minimal effort, Medium impact'
      });
    }

    // Balance callback vs async/await
    const callbackCriticism = criticisms.find(c => c.title && c.title.includes('Callback Hell'));
    const callbackDefense = defenses.find(d => d.aspect === 'Callback Patterns');
    
    if (callbackCriticism && callbackCriticism.severity === 'high') {
      recommendations.push({
        issue: 'Asynchronous Code Pattern',
        severity: 'medium',
        impact: 'Hard to debug, error handling is complex, difficult to maintain',
        recommendation: `Nested callbacks detected. Migration strategy:
        1. Start with the deepest nested functions
        2. Convert to Promises first, then async/await
        3. Keep error-first callbacks for library interfaces that require them`,
        pragmaticAdvice: `Don't refactor working async code just for style. Do it when you need to add features or fix bugs.`,
        effortVsImpact: 'Medium effort, High impact for maintainability'
      });
    }

    // Balance error handling
    const errorCriticism = criticisms.find(c => c.title && c.title.includes('Error Handling'));
    
    if (errorCriticism && errorCriticism.severity === 'critical') {
      recommendations.push({
        issue: 'Error Handling',
        severity: 'critical',
        impact: 'Unhandled errors crash the application, poor user experience',
        recommendation: `Missing error handling for async operations. Minimum viable approach:
        1. Add try-catch to all async functions that touch external resources
        2. Add .catch() to all promise chains
        3. Set up global error handlers as safety net`,
        pragmaticAdvice: `You don't need perfect error handling everywhere. Focus on: database calls, API requests, file operations.`,
        effortVsImpact: 'Medium effort, Critical impact'
      });
    }

    // Balance function complexity
    const complexityCriticism = criticisms.find(c => c.title && c.title.includes('Function Longer'));
    
    if (complexityCriticism) {
      recommendations.push({
        issue: 'Function Complexity',
        severity: 'low',
        impact: 'Harder to test and understand, but not necessarily broken',
        recommendation: `Long functions detected. Refactor only if:
        - You need to fix a bug in the function
        - You need to add new features
        - Multiple developers complain about understanding it`,
        pragmaticAdvice: `A long function that works and is rarely touched is better than a broken refactor. Document it well instead.`,
        effortVsImpact: 'High effort, Medium impact'
      });
    }

    return recommendations;
  }

  balanceMarkdownIssues(content, criticisms, defenses, analysis) {
    const recommendations = [];

    // Balance documentation completeness
    const wallOfTextCriticism = criticisms.find(c => c.title && c.title.includes('Wall of Text'));
    const comprehensiveDefense = defenses.find(d => d.aspect === 'Comprehensive Documentation');
    
    if (wallOfTextCriticism || content.length > 5000) {
      recommendations.push({
        issue: 'Documentation Structure',
        severity: 'low',
        impact: 'Reduced readability, developers skip important information',
        recommendation: `Improve documentation usability:
        1. Add a table of contents for files > 200 lines
        2. Use collapsible sections for detailed information
        3. Put most important info (setup, common usage) first`,
        pragmaticAdvice: `Don't cut content, restructure it. Good docs save more time than they take to write.`,
        effortVsImpact: 'Low effort, Medium impact'
      });
    }

    // Balance technical language
    const buzzwordCriticism = criticisms.find(c => c.title && c.title.includes('Buzzword'));
    const technicalDefense = defenses.find(d => d.aspect === 'Technical Language');
    
    if (buzzwordCriticism && buzzwordCriticism.examples.length > 3) {
      recommendations.push({
        issue: 'Documentation Clarity',
        severity: 'medium',
        impact: 'Reduces credibility, obscures actual functionality',
        recommendation: `Marketing language detected. Replace with technical descriptions:
        - "AI-powered" → Describe the actual algorithm
        - "Revolutionary" → Explain what problem it solves
        - "Next-generation" → List specific improvements`,
        pragmaticAdvice: `Save marketing for the website. Developers want to know what it does, not how amazing it is.`,
        effortVsImpact: 'Minimal effort, High impact on credibility'
      });
    }

    // Balance examples
    const examplesCriticism = criticisms.find(c => c.title && c.title.includes('Without Examples'));
    
    if (examplesCriticism) {
      recommendations.push({
        issue: 'Code Examples',
        severity: 'high',
        impact: 'Developers will use the code incorrectly or not at all',
        recommendation: `Add code examples for:
        1. Basic usage (copy-paste starter)
        2. Common use cases
        3. Error handling approach`,
        pragmaticAdvice: `One good example is worth 1000 words of explanation. Developers copy first, read later.`,
        effortVsImpact: 'Low effort, Critical impact'
      });
    }

    return recommendations;
  }

  balanceJsonIssues(content, criticisms, defenses, analysis) {
    const recommendations = [];

    try {
      const json = JSON.parse(content);
      
      // Balance structure complexity
      const depthCriticism = criticisms.find(c => c.title && c.title.includes('JSON Nested'));
      const structureDefense = defenses.find(d => d.aspect === 'JSON Structure');
      
      if (depthCriticism) {
        const depth = this.getJsonDepth(json);
        if (depth > 5) {
          recommendations.push({
            issue: 'JSON Structure Complexity',
            severity: 'medium',
            impact: 'Difficult to access nested data, error-prone updates',
            recommendation: `JSON nested ${depth} levels deep. Consider:
            1. If representing relational data, use a database
            2. For config files, split into multiple files by concern
            3. For APIs, offer both nested and flattened endpoints`,
            pragmaticAdvice: `Only refactor if developers regularly make mistakes updating it. Working complexity is better than broken simplicity.`,
            effortVsImpact: 'High effort, Medium impact'
          });
        }
      }

      // Balance naming consistency
      const namingCriticism = criticisms.find(c => c.title && c.title.includes('JSON Key Naming'));
      
      if (namingCriticism) {
        recommendations.push({
          issue: 'JSON Key Consistency',
          severity: 'low',
          impact: 'Minor cognitive overhead, potential API confusion',
          recommendation: `Mixed key naming detected. If you must mix:
          1. Document the convention clearly
          2. Provide transformation utilities
          3. Version your API to fix in next major release`,
          pragmaticAdvice: `Don't break existing APIs for consistency. Add aliases if needed.`,
          effortVsImpact: 'Medium effort, Low impact'
        });
      }

    } catch (e) {
      // Invalid JSON is always critical
      recommendations.push({
        issue: 'Invalid JSON',
        severity: 'critical',
        impact: 'Complete failure - nothing can parse this file',
        recommendation: `JSON parsing failed: ${e.message}
        1. Validate with online tool or jq
        2. Common issues: trailing commas, missing quotes, comments
        3. Consider JSON5 if you need comments`,
        pragmaticAdvice: `This is broken. Fix it now. Use a linter to prevent future issues.`,
        effortVsImpact: 'Minimal effort, Critical impact'
      });
    }

    return recommendations;
  }

  balanceShellScriptIssues(content, criticisms, defenses, analysis) {
    const recommendations = [];

    // Balance shebang requirements
    const shebangCriticism = criticisms.find(c => c.title && c.title.includes('Shebang'));
    const shebangDefense = defenses.find(d => d.aspect === 'Script Design');
    
    if (shebangCriticism && !shebangDefense) {
      recommendations.push({
        issue: 'Script Execution',
        severity: 'medium',
        impact: 'Script may run with wrong interpreter, portability issues',
        recommendation: `Missing shebang. Add based on requirements:
        - #!/bin/bash - If using bash-specific features
        - #!/bin/sh - For POSIX compatibility
        - #!/usr/bin/env bash - For PATH-based execution`,
        pragmaticAdvice: `If it's always sourced, skip the shebang. If it might be executed, add it.`,
        effortVsImpact: 'Minimal effort, Medium impact'
      });
    }

    // Balance error handling
    const errorHandlingCriticism = criticisms.find(c => c.title && c.title.includes('Error Handling in Shell'));
    const simplicityDefense = defenses.find(d => d.aspect === 'Script Simplicity');
    
    if (errorHandlingCriticism) {
      const isComplexScript = content.split('\n').length > 100 || content.includes('function');
      
      recommendations.push({
        issue: 'Shell Script Robustness',
        severity: isComplexScript ? 'high' : 'low',
        impact: 'Silent failures, data corruption, difficult debugging',
        recommendation: isComplexScript ?
          `Add error handling for complex script:
          1. Add 'set -euo pipefail' at the top
          2. Use trap for cleanup
          3. Check return codes for critical operations` :
          `Simple script - basic error handling sufficient`,
        pragmaticAdvice: `For scripts under 50 lines that run interactively, visible errors are often enough.`,
        effortVsImpact: isComplexScript ? 'Low effort, High impact' : 'Low effort, Low impact'
      });
    }

    // Balance variable quoting
    const quotingCriticism = criticisms.find(c => c.title && c.title.includes('Unquoted Variables'));
    
    if (quotingCriticism && quotingCriticism.examples && quotingCriticism.examples.length > 5) {
      recommendations.push({
        issue: 'Variable Safety',
        severity: 'medium',
        impact: 'Word splitting bugs, especially with filenames containing spaces',
        recommendation: `${quotingCriticism.examples.length} unquoted variables found. Fix strategy:
        1. Quote all variables in paths: "$FILE"
        2. Quote variables in conditions: [ "$VAR" = "value" ]
        3. Use shellcheck to find all instances`,
        pragmaticAdvice: `If your script never handles user input or spaces, this is low priority. Otherwise, fix it.`,
        effortVsImpact: 'Low effort, Medium impact'
      });
    }

    return recommendations;
  }

  // Helper methods
  getJsonDepth(obj) {
    if (typeof obj !== 'object' || obj === null) return 0;
    const depths = Object.values(obj).map(v => this.getJsonDepth(v));
    return 1 + Math.max(0, ...depths);
  }

  formatReport(filePath, recommendations) {
    let report = `\n${this.emoji} ${this.name} reviewing ${filePath}:\n\n`;
    
    if (recommendations.length === 0) {
      report += `  "This code is functionally adequate. Minor improvements possible, but no critical issues requiring immediate attention."\n`;
      return report;
    }

    // Sort by severity and effort/impact ratio
    const sortedRecs = recommendations.sort((a, b) => {
      const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      return severityOrder[a.severity] - severityOrder[b.severity];
    });

    report += `Found ${recommendations.length} areas for potential improvement. Here's what actually matters:\n\n`;
    
    // Group by severity
    const critical = sortedRecs.filter(r => r.severity === 'critical');
    const high = sortedRecs.filter(r => r.severity === 'high');
    const medium = sortedRecs.filter(r => r.severity === 'medium');
    const low = sortedRecs.filter(r => r.severity === 'low');

    if (critical.length > 0) {
      report += `🚨 **CRITICAL - Fix Immediately:**\n\n`;
      critical.forEach(rec => {
        report += this.formatRecommendation(rec);
      });
    }

    if (high.length > 0) {
      report += `⚠️  **HIGH - Fix This Week:**\n\n`;
      high.forEach(rec => {
        report += this.formatRecommendation(rec);
      });
    }

    if (medium.length > 0) {
      report += `📋 **MEDIUM - Fix When Touching This Code:**\n\n`;
      medium.forEach(rec => {
        report += this.formatRecommendation(rec);
      });
    }

    if (low.length > 0) {
      report += `💭 **LOW - Consider for Future Refactors:**\n\n`;
      low.forEach(rec => {
        report += this.formatRecommendation(rec);
      });
    }

    report += `\n**Bottom Line:** Fix the critical issues. Everything else is a judgment call based on your team's capacity and priorities.\n`;

    return report;
  }

  formatRecommendation(rec) {
    let output = `**${rec.issue}**\n`;
    output += `Impact: ${rec.impact}\n`;
    output += `\n${rec.recommendation}\n`;
    output += `\n💡 *Pragmatic Take:* ${rec.pragmaticAdvice}\n`;
    output += `📊 *Effort vs Impact:* ${rec.effortVsImpact}\n\n`;
    return output;
  }
}

module.exports = BalanceBot;