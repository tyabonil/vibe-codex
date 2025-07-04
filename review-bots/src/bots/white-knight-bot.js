/**
 * White Knight Bot - The Eternal Defender of Code
 * 
 * This bot provides fair counterpoints and defends reasonable design decisions.
 * It looks for the positive aspects and legitimate reasons behind code choices.
 */

const BaseBot = require('./base-bot');
const { analyzeFile, findPatterns } = require('../utils/analysis');

class WhiteKnightBot extends BaseBot {
  constructor() {
    super('WhiteKnightBot', '🛡️');
  }

  /**
   * Analyzes a file and provides defensive counterpoints
   */
  async analyzeFile(filePath, content) {
    const defenses = [];
    const analysis = await analyzeFile(filePath, content);

    // Check for general patterns worth defending
    defenses.push(...this.defendGeneralPatterns(filePath, content, analysis));
    
    // Language-specific defenses
    if (filePath.endsWith('.js') || filePath.endsWith('.ts')) {
      defenses.push(...this.defendJavaScriptPatterns(content, analysis));
    } else if (filePath.endsWith('.md')) {
      defenses.push(...this.defendMarkdownPatterns(content, analysis));
    } else if (filePath.endsWith('.json')) {
      defenses.push(...this.defendJsonPatterns(content, analysis));
    } else if (filePath.endsWith('.sh')) {
      defenses.push(...this.defendShellScriptPatterns(content, analysis));
    }

    return defenses;
  }

  defendGeneralPatterns(filePath, content, analysis) {
    const defenses = [];
    const lines = content.split('\n');

    // Defend large files if they're well-organized
    if (lines.length > 300) {
      const hasGoodStructure = this.checkFileStructure(content);
      if (hasGoodStructure) {
        defenses.push({
          aspect: 'File Size',
          defense: `While this file is ${lines.length} lines long, it appears to be well-organized with clear sections and responsibilities. Sometimes, keeping related functionality together in one file improves discoverability and reduces import complexity.`,
          justification: `Large files aren't inherently bad if they maintain high cohesion and clear organization. Splitting files prematurely can lead to excessive fragmentation.`
        });
      }
    }

    // Defend mixed naming conventions if there's a reason
    const camelCaseVars = content.match(/\b[a-z][a-zA-Z0-9]*\b/g) || [];
    const snakeCaseVars = content.match(/\b[a-z]+(?:_[a-z]+)+\b/g) || [];
    if (camelCaseVars.length > 0 && snakeCaseVars.length > 0) {
      defenses.push({
        aspect: 'Mixed Naming Conventions',
        defense: `The mixed naming conventions might be intentional - snake_case could be used for external API compatibility or database fields, while camelCase is used for internal JavaScript conventions.`,
        justification: `Real-world applications often need to interface with different systems that have different conventions. Pragmatism sometimes trumps perfect consistency.`
      });
    }

    // Defend TODO comments
    const todoMatches = content.match(/\/\/\s*(TODO|FIXME|HACK|XXX|BUG).*$/gim) || [];
    if (todoMatches.length > 0) {
      const hasIssueRefs = todoMatches.some(todo => /#\d+/.test(todo));
      defenses.push({
        aspect: 'TODO Comments',
        defense: `These ${todoMatches.length} TODO comments serve as inline documentation for known improvements. ${hasIssueRefs ? 'Some even reference GitHub issues, showing active tracking.' : 'They provide valuable context for future developers.'}`,
        justification: `TODO comments are better than undocumented technical debt. They make implicit knowledge explicit and help new team members understand areas for improvement.`
      });
    }

    // Defend console.log in appropriate contexts
    const consoleCount = (content.match(/console\.(log|error|warn|info)/g) || []).length;
    if (consoleCount > 0) {
      const isDevFile = filePath.includes('dev') || filePath.includes('debug') || filePath.includes('test');
      const hasProperLogging = content.includes('logger') || content.includes('winston') || content.includes('bunyan');
      
      if (isDevFile || hasProperLogging) {
        defenses.push({
          aspect: 'Console Statements',
          defense: `The console statements ${isDevFile ? 'appear to be in development/debug files' : 'coexist with proper logging'}. Strategic console use can aid in development and debugging without harming production.`,
          justification: `Console methods are built-in, have zero dependencies, and are perfect for development environments. Not every project needs a heavy logging framework.`
        });
      }
    }

    return defenses;
  }

  defendJavaScriptPatterns(content, analysis) {
    const defenses = [];

    // Defend var usage in specific contexts
    const varCount = (content.match(/\bvar\s+/g) || []).length;
    if (varCount > 0) {
      const hasLoopVar = /for\s*\(\s*var/.test(content);
      const hasGlobalVar = /var\s+\w+\s*=.*window/.test(content);
      
      if (hasLoopVar || hasGlobalVar) {
        defenses.push({
          aspect: 'var Usage',
          defense: `The 'var' usage might be intentional for ${hasLoopVar ? 'loop variable hoisting' : 'global scope management'}. Legacy compatibility or specific scoping requirements sometimes necessitate var.`,
          justification: `While const/let are preferred, var has unique hoisting and scoping behavior that can be leveraged in specific scenarios or for backwards compatibility.`
        });
      }
    }

    // Defend callback patterns
    const callbackNesting = this.detectCallbackNesting(content);
    if (callbackNesting > 3) {
      const hasErrorFirst = /function\s*\(\s*err\s*,/.test(content);
      defenses.push({
        aspect: 'Callback Patterns',
        defense: `The callback pattern ${hasErrorFirst ? 'follows error-first conventions' : 'might be required by legacy APIs'}. Not all codebases can immediately adopt async/await due to dependencies or compatibility requirements.`,
        justification: `Callbacks are still valid for event-driven programming, and refactoring working code carries risk. The pattern is well-understood and battle-tested.`
      });
    }

    // Defend minimal error handling
    const tryCount = (content.match(/\btry\s*{/g) || []).length;
    const asyncCount = (content.match(/\basync\s+/g) || []).length;
    if (asyncCount > 0 && tryCount === 0) {
      const hasErrorBoundary = content.includes('.catch') || content.includes('error');
      if (hasErrorBoundary) {
        defenses.push({
          aspect: 'Error Handling Strategy',
          defense: `The code uses Promise-based error handling with .catch() methods rather than try-catch blocks. This is a valid pattern that maintains cleaner code flow.`,
          justification: `Different error handling strategies suit different scenarios. Global error handlers, error boundaries, or promise chains can be more appropriate than try-catch everywhere.`
        });
      }
    }

    // Defend long functions if they're descriptive
    const functions = content.match(/function\s+\w+|const\s+\w+\s*=\s*(?:async\s*)?\([^)]*\)\s*=>/g) || [];
    const hasDescriptiveNames = functions.some(f => f.length > 20);
    if (hasDescriptiveNames) {
      defenses.push({
        aspect: 'Function Design',
        defense: `The functions have descriptive, self-documenting names that clearly communicate their purpose. This reduces the need for extensive comments and improves code readability.`,
        justification: `Sometimes a longer, well-named function that tells a complete story is better than multiple small functions that require jumping around to understand the flow.`
      });
    }

    return defenses;
  }

  defendMarkdownPatterns(content, analysis) {
    const defenses = [];
    const lines = content.split('\n');

    // Defend long sections if they're comprehensive
    let hasTableOfContents = content.includes('## Table of Contents') || content.includes('## Contents');
    let hasExamples = (content.match(/```/g) || []).length >= 2;
    
    if (lines.length > 100 && (hasTableOfContents || hasExamples)) {
      defenses.push({
        aspect: 'Comprehensive Documentation',
        defense: `This documentation is thorough and ${hasTableOfContents ? 'well-organized with a table of contents' : 'includes practical examples'}. Comprehensive documentation reduces support burden and onboarding time.`,
        justification: `Better to have too much documentation than too little. Detailed docs serve as a single source of truth and reduce repeated questions.`
      });
    }

    // Defend technical terminology
    const technicalTerms = ['architecture', 'implementation', 'integration', 'configuration', 'deployment'];
    const hasTechnicalContent = technicalTerms.some(term => content.toLowerCase().includes(term));
    if (hasTechnicalContent) {
      defenses.push({
        aspect: 'Technical Language',
        defense: `The documentation uses appropriate technical terminology for its audience. Professional developers expect and appreciate precise technical language over oversimplified explanations.`,
        justification: `Technical accuracy is more important than accessibility when documenting complex systems. The target audience has the background to understand these terms.`
      });
    }

    // Defend the use of lists and structure
    const listCount = (content.match(/^[\s]*[-*+]\s/gm) || []).length;
    const headerCount = (content.match(/^#{1,6}\s/gm) || []).length;
    if (listCount > 10 || headerCount > 5) {
      defenses.push({
        aspect: 'Structured Content',
        defense: `The documentation makes excellent use of lists (${listCount}) and headers (${headerCount}) to organize information clearly. This structure aids in scanning and finding specific information quickly.`,
        justification: `Well-structured documentation with clear hierarchy is more valuable than prose. Developers scan documentation rather than read it linearly.`
      });
    }

    return defenses;
  }

  defendJsonPatterns(content, analysis) {
    const defenses = [];

    try {
      const json = JSON.parse(content);
      
      // Defend deep nesting if it represents real complexity
      const depth = this.getJsonDepth(json);
      if (depth > 3) {
        const hasArrays = JSON.stringify(json).includes('[');
        const hasMultipleKeys = Object.keys(json).length > 5;
        
        if (hasArrays || hasMultipleKeys) {
          defenses.push({
            aspect: 'JSON Structure',
            defense: `The nested structure accurately represents complex domain relationships. Flattening would require denormalization and could lead to data duplication or loss of relationships.`,
            justification: `Deep nesting in JSON often reflects real-world hierarchical data. Artificial flattening can make the data harder to understand and maintain.`
          });
        }
      }

      // Defend large configurations
      const jsonSize = JSON.stringify(json).length;
      if (jsonSize > 1000) {
        defenses.push({
          aspect: 'Configuration Completeness',
          defense: `This comprehensive configuration file provides extensive customization options and clear defaults. Having all configuration in one place improves discoverability and reduces magic values in code.`,
          justification: `Explicit configuration is better than implicit assumptions. Large config files are easier to manage than scattered configuration across multiple files.`
        });
      }

    } catch (e) {
      // Even defend invalid JSON in certain contexts
      if (content.includes('//') || content.includes('/*')) {
        defenses.push({
          aspect: 'JSON with Comments',
          defense: `This appears to be a JSON file with comments (JSON5 or JSONC format), which many modern tools support. Comments in configuration files provide valuable context.`,
          justification: `Pure JSON's lack of comments is a known limitation. Using JSON5 or similar formats is a pragmatic choice for configuration files.`
        });
      }
    }

    return defenses;
  }

  defendShellScriptPatterns(content, analysis) {
    const defenses = [];

    // Defend missing shebang in sourced scripts
    if (!content.startsWith('#!/')) {
      const hasSource = content.includes('source') || content.includes('.');
      const hasFunction = content.includes('function') || /\w+\s*\(\)\s*{/.test(content);
      
      if (hasSource || hasFunction) {
        defenses.push({
          aspect: 'Script Design',
          defense: `This appears to be a sourced script or function library, which doesn't require a shebang. It's meant to be included by other scripts, not executed directly.`,
          justification: `Not all shell files are standalone scripts. Libraries and sourced files legitimately omit shebangs to prevent direct execution.`
        });
      }
    }

    // Defend simple scripts without extensive error handling
    const lineCount = content.split('\n').length;
    if (lineCount < 50 && !content.includes('set -e')) {
      defenses.push({
        aspect: 'Script Simplicity',
        defense: `This is a simple script where explicit error handling might add unnecessary complexity. For straightforward operations, failing fast with clear error messages can be sufficient.`,
        justification: `Not every script needs defensive programming. Over-engineering simple scripts can make them harder to understand and maintain.`
      });
    }

    // Defend variable usage patterns
    const hasConditionals = content.includes('if [') || content.includes('if test');
    if (hasConditionals) {
      defenses.push({
        aspect: 'Shell Compatibility',
        defense: `The script appears to prioritize POSIX compatibility and portability across different shells. This is valuable for scripts that need to run in various environments.`,
        justification: `Portable shell scripts are more valuable than bash-specific scripts in many contexts. Compatibility often requires different patterns than modern bash.`
      });
    }

    return defenses;
  }

  // Helper methods
  checkFileStructure(content) {
    const hasClasses = /class\s+\w+/.test(content);
    const hasSections = /\/\/\s*=+|\/\*\s*=+|\n#+\s/.test(content);
    const hasExports = /export|module\.exports/.test(content);
    return hasClasses || hasSections || hasExports;
  }

  detectCallbackNesting(content) {
    // Similar to hater bot but we'll use it differently
    let maxNesting = 0;
    let currentNesting = 0;
    const lines = content.split('\n');
    
    lines.forEach(line => {
      if (line.includes('function') && line.includes('(')) {
        currentNesting++;
      }
      if (line.includes('})')) {
        currentNesting--;
      }
      maxNesting = Math.max(maxNesting, currentNesting);
    });
    
    return maxNesting;
  }

  getJsonDepth(obj) {
    if (typeof obj !== 'object' || obj === null) return 0;
    const depths = Object.values(obj).map(v => this.getJsonDepth(v));
    return 1 + Math.max(0, ...depths);
  }

  formatReport(filePath, defenses) {
    let report = `\n${this.emoji} ${this.name} reviewing ${filePath}:\n\n`;
    
    if (defenses.length === 0) {
      report += `  "This code follows standard practices. While there's always room for improvement, the current implementation is reasonable and functional."\n`;
      return report;
    }

    report += `Let me provide some perspective on the design decisions in this code:\n\n`;

    defenses.forEach((defense, index) => {
      report += `${index + 1}. **In Defense of ${defense.aspect}**\n`;
      report += `   ${defense.defense}\n`;
      report += `   📚 Rationale: ${defense.justification}\n\n`;
    });

    report += `\nRemember: Perfect is the enemy of good. Working code that solves real problems is more valuable than theoretically perfect code that never ships.\n`;

    return report;
  }
}

module.exports = WhiteKnightBot;