/**
 * Hater Bot - The World's Greatest Developer Who Is Also The World's Greatest Hater
 * 
 * This bot reviews code with maximum criticism, finding every possible flaw
 * and expressing them in the most pedantic yet truthful way possible.
 */

const BaseBot = require('./base-bot');
const { analyzeFile, findPatterns } = require('../utils/analysis');

class HaterBot extends BaseBot {
  constructor() {
    super('HaterBot', '😤');
  }

  /**
   * Analyzes a file and generates scathing but accurate criticism
   */
  async analyzeFile(filePath, content) {
    const issues = [];
    const analysis = await analyzeFile(filePath, content);

    // Check for general code smells
    issues.push(...this.checkGeneralIssues(filePath, content, analysis));
    
    // Language-specific checks
    if (filePath.endsWith('.js') || filePath.endsWith('.ts')) {
      issues.push(...this.checkJavaScriptIssues(content, analysis));
    } else if (filePath.endsWith('.md')) {
      issues.push(...this.checkMarkdownIssues(content, analysis));
    } else if (filePath.endsWith('.json')) {
      issues.push(...this.checkJsonIssues(content, analysis));
    } else if (filePath.endsWith('.sh')) {
      issues.push(...this.checkShellScriptIssues(content, analysis));
    }

    return issues;
  }

  checkGeneralIssues(filePath, content, analysis) {
    const issues = [];
    const lines = content.split('\n');

    // File size critique
    if (lines.length > 300) {
      issues.push({
        severity: 'high',
        title: `${lines.length} Lines of Spaghetti Code`,
        description: `This file is ${lines.length} lines long. What is this, a novel? Ever heard of the Single Responsibility Principle? This file is doing more jobs than a Silicon Valley "full-stack ninja".`,
        suggestion: `Break this monstrosity into smaller, focused modules. Your future self will thank you when debugging at 3 AM.`,
        line: null
      });
    }

    // Inconsistent naming
    const camelCaseVars = content.match(/\b[a-z][a-zA-Z0-9]*\b/g) || [];
    const snakeCaseVars = content.match(/\b[a-z]+(?:_[a-z]+)+\b/g) || [];
    if (camelCaseVars.length > 0 && snakeCaseVars.length > 0) {
      issues.push({
        severity: 'medium',
        title: 'Naming Convention Identity Crisis',
        description: `Make up your mind! You're using both camelCase and snake_case. This isn't a diversity initiative, it's a codebase. Pick one and stick with it.`,
        examples: [`camelCase: ${camelCaseVars[0]}`, `snake_case: ${snakeCaseVars[0]}`],
        suggestion: `Choose one naming convention and refactor everything. Consistency is more important than your personal preferences.`
      });
    }

    // TODO comments
    const todoMatches = content.match(/\/\/\s*(TODO|FIXME|HACK|XXX|BUG).*$/gim) || [];
    if (todoMatches.length > 0) {
      issues.push({
        severity: 'medium',
        title: `${todoMatches.length} Broken Promises (TODOs)`,
        description: `Found ${todoMatches.length} TODO comments. These are just technical debt IOUs that you'll never pay back. We all know these TODOs are really NEVER-DOs.`,
        examples: todoMatches.slice(0, 3),
        suggestion: `Either fix them now or delete them. Stop lying to yourself about "getting to it later".`
      });
    }

    // Console.log statements - but be smart about it
    const consoleMatches = content.match(/console\.(log|error|warn|info)/g) || [];
    if (consoleMatches.length > 0) {
      // Check if this is a CLI tool or logger utility
      const isCLITool = filePath.includes('bin/') || filePath.includes('/cli/') || filePath.endsWith('-cli.js');
      const isLogger = filePath.includes('logger') || filePath.includes('log');
      const isTest = filePath.includes('.test.') || filePath.includes('.spec.') || filePath.includes('test/');
      
      // Check if console statements are wrapped in environment checks
      const unwrappedConsoles = this.findUnwrappedConsoleStatements(content);
      
      if (unwrappedConsoles.length > 0 && !isCLITool && !isLogger && !isTest) {
        issues.push({
          severity: 'high',
          title: `${unwrappedConsoles.length} Amateur Hour console.log Statements`,
          description: `Still using console.log for debugging in production code? What's next, alert() dialogs? This isn't 2008. Use a proper logging library like a professional.`,
          suggestion: `Use a real logger with levels, timestamps, and output control. Winston, Bunyan, Pino - pick one. Or at least wrap them in environment checks like: if (process.env.NODE_ENV !== 'production') { console.log(...) }`
        });
      } else if (consoleMatches.length > 10 && !isCLITool) {
        // Even wrapped consoles are suspicious if there are too many
        issues.push({
          severity: 'medium',
          title: `${consoleMatches.length} Console Statements - Even Wrapped Ones Get Excessive`,
          description: `Sure, you wrapped them in environment checks, but ${consoleMatches.length} console statements? This isn't a debugging playground. Use a proper logging library.`,
          suggestion: `Consider using a structured logging library that provides better control over log levels, formatting, and output destinations.`
        });
      }
    }

    return issues;
  }

  checkJavaScriptIssues(content, analysis) {
    const issues = [];

    // var usage
    const varCount = (content.match(/\bvar\s+/g) || []).length;
    if (varCount > 0) {
      issues.push({
        severity: 'high',
        title: `'var' in ${new Date().getFullYear()}? Time Traveler Detected`,
        description: `Found ${varCount} uses of 'var'. Did you write this code in 2009 and just commit it now? ES6 has been out for almost a decade. Use const/let like someone who keeps up with the times.`,
        suggestion: `Replace all 'var' with 'const' or 'let'. It's literally a find-and-replace operation. Even your IDE can do it automatically.`
      });
    }

    // Callback hell detection
    const callbackNesting = this.detectCallbackHell(content);
    if (callbackNesting > 3) {
      issues.push({
        severity: 'high',
        title: 'Callback Hell: Dante Would Be Proud',
        description: `Your callbacks are nested ${callbackNesting} levels deep. This isn't Inception, it's supposed to be maintainable code. Ever heard of Promises? Async/await? They've only been around for years.`,
        suggestion: `Refactor to use async/await. It's 2025, not 2012. Your code shouldn't look like a pyramid scheme.`
      });
    }

    // No error handling
    const tryCount = (content.match(/\btry\s*{/g) || []).length;
    const asyncCount = (content.match(/\basync\s+/g) || []).length;
    if (asyncCount > 0 && tryCount === 0) {
      issues.push({
        severity: 'critical',
        title: 'YOLO Error Handling',
        description: `${asyncCount} async operations and zero try-catch blocks. What's your error handling strategy? Prayer? This code will crash harder than crypto in 2022.`,
        suggestion: `Add proper error handling. Wrap async calls in try-catch blocks. Handle errors gracefully instead of letting them bubble up to crash your app.`
      });
    }

    // Function complexity
    const functions = content.match(/function\s*\w*\s*\([^)]*\)\s*{[^}]*}/g) || [];
    functions.forEach(func => {
      const lines = func.split('\n').length;
      if (lines > 50) {
        issues.push({
          severity: 'high',
          title: 'Function Longer Than a CVS Receipt',
          description: `Found a function with ${lines} lines. This isn't a function, it's a dissertation. Functions should do ONE thing. This does ALL the things.`,
          suggestion: `Break it down into smaller functions. If you can't describe what it does in one sentence, it's doing too much.`
        });
      }
    });

    return issues;
  }

  checkMarkdownIssues(content, analysis) {
    const issues = [];
    const lines = content.split('\n');

    // Check for walls of text
    let consecutiveTextLines = 0;
    let maxConsecutive = 0;
    lines.forEach(line => {
      if (line.trim() && !line.startsWith('#')) {
        consecutiveTextLines++;
        maxConsecutive = Math.max(maxConsecutive, consecutiveTextLines);
      } else {
        consecutiveTextLines = 0;
      }
    });

    if (maxConsecutive > 10) {
      issues.push({
        severity: 'medium',
        title: 'Wall of Text Detected',
        description: `You have ${maxConsecutive} consecutive lines without headers or breaks. This isn't a terms of service agreement. Use headers, lists, or paragraphs like someone who understands readability.`,
        suggestion: `Break up your text with headers, bullet points, or at least paragraph breaks. Your readers have attention spans shorter than a TikTok video.`
      });
    }

    // Marketing speak detection
    const buzzwords = ['synergy', 'leverage', 'paradigm', 'disrupt', 'blockchain', 'AI-powered', 'revolutionary', 'game-changing', 'cutting-edge', 'next-generation'];
    const foundBuzzwords = buzzwords.filter(word => content.toLowerCase().includes(word));
    if (foundBuzzwords.length > 0) {
      issues.push({
        severity: 'high',
        title: 'LinkedIn Influencer Detected',
        description: `Found ${foundBuzzwords.length} buzzwords: ${foundBuzzwords.join(', ')}. This is documentation, not a pitch deck. Save the corporate speak for your investors.`,
        suggestion: `Use plain, technical language. Describe what your code actually does, not what your marketing team wishes it did.`
      });
    }

    // Missing examples
    if (content.includes('## Usage') || content.includes('## API')) {
      const codeBlockCount = (content.match(/```/g) || []).length / 2;
      if (codeBlockCount < 1) {
        issues.push({
          severity: 'high',
          title: 'Documentation Without Examples',
          description: `You have usage/API sections but no code examples. That's like a cookbook without recipes. How are developers supposed to use this? Telepathy?`,
          suggestion: `Add actual code examples. Show, don't tell. Developers copy-paste first, read later.`
        });
      }
    }

    return issues;
  }

  checkJsonIssues(content, analysis) {
    const issues = [];

    try {
      const json = JSON.parse(content);
      
      // Check for inconsistent property naming
      const keys = this.getAllKeys(json);
      const hasSnakeCase = keys.some(k => k.includes('_'));
      const hasCamelCase = keys.some(k => /[a-z][A-Z]/.test(k));
      
      if (hasSnakeCase && hasCamelCase) {
        issues.push({
          severity: 'medium',
          title: 'JSON Key Naming: Pick a Lane',
          description: `Your JSON has both snake_case and camelCase keys. This is what happens when different developers don't talk to each other. Consistency died here.`,
          suggestion: `Pick either camelCase or snake_case for all keys. Your API consumers will thank you.`
        });
      }

      // Nested depth check
      const depth = this.getJsonDepth(json);
      if (depth > 4) {
        issues.push({
          severity: 'high',
          title: `JSON Nested ${depth} Levels Deep`,
          description: `Your JSON is nested ${depth} levels deep. This isn't Inception, it's supposed to be a data structure. Good luck accessing data with chains like data.foo.bar.baz.qux.item[0].value.`,
          suggestion: `Flatten your structure. If you need this much nesting, you probably need a database, not a JSON file.`
        });
      }

    } catch (e) {
      issues.push({
        severity: 'critical',
        title: 'Invalid JSON: You Had ONE Job',
        description: `This JSON file doesn't even parse. ${e.message}. How did this even get committed? Does nobody test anything anymore?`,
        suggestion: `Fix your JSON syntax. Use a linter. Use an online validator. Use your brain. Just make it valid JSON.`
      });
    }

    return issues;
  }

  checkShellScriptIssues(content, analysis) {
    const issues = [];

    // No shebang
    if (!content.startsWith('#!/')) {
      issues.push({
        severity: 'high',
        title: 'Missing Shebang: Amateur Hour',
        description: `No shebang line? How is the system supposed to know what interpreter to use? Magic? This is Shell Scripting 101.`,
        suggestion: `Add #!/bin/bash or appropriate shebang as the first line. It's literally the first thing you learn about shell scripts.`
      });
    }

    // No error handling
    if (!content.includes('set -e') && !content.includes('trap')) {
      issues.push({
        severity: 'high',
        title: 'YOLO Error Handling in Shell Script',
        description: `No 'set -e' or error trapping? Your script will happily continue after failures, like a lemming walking off a cliff. "It worked on my machine" isn't a error handling strategy.`,
        suggestion: `Add 'set -euo pipefail' at the top. Handle errors properly. Your script shouldn't pretend everything is fine when it's not.`
      });
    }

    // Unquoted variables
    const unquotedVars = content.match(/\$[A-Za-z_][A-Za-z0-9_]*(?!["\'])/g) || [];
    if (unquotedVars.length > 0) {
      issues.push({
        severity: 'high',
        title: `${unquotedVars.length} Unquoted Variables: Space, The Final Frontier`,
        description: `Found ${unquotedVars.length} unquoted variables. Wait until a filename with spaces breaks your script. "Works fine until it doesn't" isn't a development strategy.`,
        examples: unquotedVars.slice(0, 3),
        suggestion: `Quote your variables: "$VAR" not $VAR. It's not hard. Even shellcheck would have caught this.`
      });
    }

    return issues;
  }

  // Helper methods
  detectCallbackHell(content) {
    let maxNesting = 0;
    let currentNesting = 0;
    const lines = content.split('\n');
    
    lines.forEach(line => {
      const openCallbacks = (line.match(/function\s*\(/g) || []).length;
      const closeCallbacks = (line.match(/}\s*\)/g) || []).length;
      currentNesting += openCallbacks - closeCallbacks;
      maxNesting = Math.max(maxNesting, currentNesting);
    });
    
    return maxNesting;
  }

  getAllKeys(obj, keys = []) {
    if (typeof obj === 'object' && obj !== null) {
      Object.keys(obj).forEach(key => {
        keys.push(key);
        this.getAllKeys(obj[key], keys);
      });
    }
    return keys;
  }

  getJsonDepth(obj) {
    if (typeof obj !== 'object' || obj === null) return 0;
    const depths = Object.values(obj).map(v => this.getJsonDepth(v));
    return 1 + Math.max(0, ...depths);
  }

  formatReport(filePath, issues) {
    if (issues.length === 0) {
      return `\n${this.emoji} ${this.name} reviewing ${filePath}:\n\n  "Surprisingly, I found nothing wrong. Either this code is perfect or I need coffee. Probably the latter."\n`;
    }

    let report = `\n${this.emoji} ${this.name} reviewing ${filePath}:\n\n`;
    report += `Found ${issues.length} issues. Let me tell you everything wrong with your code:\n\n`;

    issues.forEach((issue, index) => {
      report += `${index + 1}. **${issue.title}**\n`;
      report += `   Severity: ${issue.severity.toUpperCase()}\n`;
      report += `   ${issue.description}\n`;
      if (issue.examples) {
        report += `   Examples: ${issue.examples.join(', ')}\n`;
      }
      report += `   💡 ${issue.suggestion}\n\n`;
    });

    report += `\nRemember: I'm not angry, I'm just disappointed. Actually, I'm both.\n`;

    return report;
  }

  /**
   * Find console statements that aren't wrapped in environment checks
   */
  findUnwrappedConsoleStatements(content) {
    const lines = content.split('\n');
    const unwrapped = [];
    
    lines.forEach((line, index) => {
      // Skip if line is commented out
      if (line.trim().startsWith('//') || line.trim().startsWith('*')) {
        return;
      }
      
      // Check if line contains console statement
      if (line.match(/console\.(log|error|warn|info)/)) {
        // Look for environment check in surrounding lines (up to 5 lines above)
        let isWrapped = false;
        const startCheck = Math.max(0, index - 5);
        
        for (let i = startCheck; i <= index; i++) {
          const checkLine = lines[i];
          // Check for common environment wrapping patterns
          if (checkLine.match(/process\.env\.NODE_ENV\s*!==?\s*['"]production['"]/) ||
              checkLine.match(/process\.env\.DEBUG/) ||
              checkLine.match(/if\s*\(\s*debug\s*\)/) ||
              checkLine.match(/logger\.(log|debug|info|warn|error)/) ||
              checkLine.match(/DEV|DEVELOPMENT|DEBUG/)) {
            isWrapped = true;
            break;
          }
        }
        
        if (!isWrapped) {
          unwrapped.push({
            line: index + 1,
            content: line.trim()
          });
        }
      }
    });
    
    return unwrapped;
  }
}

module.exports = HaterBot;