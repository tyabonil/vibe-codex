/**
 * Common analysis utilities used by all bots
 */

const fs = require('fs').promises;
const path = require('path');

/**
 * Basic file analysis
 */
async function analyzeFile(filePath, content) {
  const analysis = {
    filePath,
    extension: path.extname(filePath),
    fileName: path.basename(filePath),
    lines: content.split('\n'),
    lineCount: content.split('\n').length,
    size: content.length,
    hasTests: isTestFile(filePath),
    isEmpty: content.trim().length === 0
  };

  // Language detection
  analysis.language = detectLanguage(filePath, content);
  
  // Basic metrics
  analysis.metrics = {
    blankLines: analysis.lines.filter(line => line.trim() === '').length,
    commentLines: countCommentLines(content, analysis.language),
    codeLines: 0
  };
  
  analysis.metrics.codeLines = analysis.lineCount - analysis.metrics.blankLines - analysis.metrics.commentLines;
  
  return analysis;
}

/**
 * Find patterns in content
 */
function findPatterns(content, patterns) {
  const matches = [];
  
  patterns.forEach(pattern => {
    const regex = pattern instanceof RegExp ? pattern : new RegExp(pattern, 'g');
    let match;
    
    while ((match = regex.exec(content)) !== null) {
      matches.push({
        pattern: pattern.toString(),
        match: match[0],
        index: match.index,
        line: content.substring(0, match.index).split('\n').length
      });
    }
  });
  
  return matches;
}

/**
 * Detect programming language from file extension and content
 */
function detectLanguage(filePath, content) {
  const ext = path.extname(filePath).toLowerCase();
  
  const extensionMap = {
    '.js': 'javascript',
    '.jsx': 'javascript',
    '.ts': 'typescript',
    '.tsx': 'typescript',
    '.py': 'python',
    '.rb': 'ruby',
    '.java': 'java',
    '.cpp': 'cpp',
    '.c': 'c',
    '.cs': 'csharp',
    '.php': 'php',
    '.go': 'go',
    '.rs': 'rust',
    '.swift': 'swift',
    '.kt': 'kotlin',
    '.scala': 'scala',
    '.sh': 'shell',
    '.bash': 'shell',
    '.zsh': 'shell',
    '.fish': 'shell',
    '.ps1': 'powershell',
    '.yml': 'yaml',
    '.yaml': 'yaml',
    '.json': 'json',
    '.xml': 'xml',
    '.html': 'html',
    '.css': 'css',
    '.scss': 'scss',
    '.sass': 'sass',
    '.less': 'less',
    '.md': 'markdown',
    '.mdx': 'markdown',
    '.rst': 'restructuredtext',
    '.tex': 'latex',
    '.sql': 'sql',
    '.r': 'r',
    '.R': 'r',
    '.m': 'matlab',
    '.jl': 'julia',
    '.lua': 'lua',
    '.vim': 'vimscript',
    '.el': 'elisp',
    '.clj': 'clojure',
    '.ex': 'elixir',
    '.exs': 'elixir',
    '.erl': 'erlang',
    '.hrl': 'erlang',
    '.fs': 'fsharp',
    '.fsx': 'fsharp',
    '.ml': 'ocaml',
    '.mli': 'ocaml',
    '.nim': 'nim',
    '.nims': 'nim',
    '.cr': 'crystal',
    '.dart': 'dart',
    '.zig': 'zig',
    '.v': 'v',
    '.sol': 'solidity'
  };

  const language = extensionMap[ext];
  if (language) return language;

  // Check shebang for shell scripts
  if (content.startsWith('#!')) {
    const firstLine = content.split('\n')[0];
    if (firstLine.includes('bash')) return 'shell';
    if (firstLine.includes('sh')) return 'shell';
    if (firstLine.includes('python')) return 'python';
    if (firstLine.includes('node')) return 'javascript';
    if (firstLine.includes('ruby')) return 'ruby';
    if (firstLine.includes('perl')) return 'perl';
  }

  return 'unknown';
}

/**
 * Check if file is a test file
 */
function isTestFile(filePath) {
  const testPatterns = [
    /[._-]test\./i,
    /[._-]spec\./i,
    /tests?\//i,
    /specs?\//i,
    /__tests__\//i,
    /__mocks__\//i,
    /\.test\./i,
    /\.spec\./i
  ];
  
  return testPatterns.some(pattern => pattern.test(filePath));
}

/**
 * Count comment lines based on language
 */
function countCommentLines(content, language) {
  const lines = content.split('\n');
  let commentCount = 0;
  let inMultilineComment = false;

  const commentStyles = {
    javascript: { single: '//', multiStart: '/*', multiEnd: '*/' },
    typescript: { single: '//', multiStart: '/*', multiEnd: '*/' },
    java: { single: '//', multiStart: '/*', multiEnd: '*/' },
    cpp: { single: '//', multiStart: '/*', multiEnd: '*/' },
    c: { single: '//', multiStart: '/*', multiEnd: '*/' },
    csharp: { single: '//', multiStart: '/*', multiEnd: '*/' },
    python: { single: '#', multiStart: '"""', multiEnd: '"""', altMultiStart: "'''", altMultiEnd: "'''" },
    ruby: { single: '#', multiStart: '=begin', multiEnd: '=end' },
    shell: { single: '#' },
    yaml: { single: '#' },
    sql: { single: '--', multiStart: '/*', multiEnd: '*/' },
    html: { multiStart: '<!--', multiEnd: '-->' },
    css: { multiStart: '/*', multiEnd: '*/' }
  };

  const style = commentStyles[language];
  if (!style) return 0;

  lines.forEach(line => {
    const trimmed = line.trim();

    // Check for multiline comment end
    if (inMultilineComment) {
      commentCount++;
      if (style.multiEnd && trimmed.includes(style.multiEnd)) {
        inMultilineComment = false;
      }
      return;
    }

    // Check for single line comments
    if (style.single && trimmed.startsWith(style.single)) {
      commentCount++;
      return;
    }

    // Check for multiline comment start
    if (style.multiStart && trimmed.includes(style.multiStart)) {
      commentCount++;
      if (!trimmed.includes(style.multiEnd)) {
        inMultilineComment = true;
      }
      return;
    }

    // Python's alternative multiline comments
    if (language === 'python' && style.altMultiStart && trimmed.startsWith(style.altMultiStart)) {
      commentCount++;
      if (!trimmed.endsWith(style.altMultiEnd) || trimmed.length === 3) {
        inMultilineComment = true;
      }
    }
  });

  return commentCount;
}

/**
 * Get files from a directory recursively
 */
async function getFiles(dir, extensions = null) {
  const files = [];
  
  async function walk(currentPath) {
    const entries = await fs.readdir(currentPath, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(currentPath, entry.name);
      
      if (entry.isDirectory()) {
        // Skip common directories
        if (!['node_modules', '.git', 'dist', 'build', 'coverage', '.next', '.nuxt', 'out'].includes(entry.name)) {
          await walk(fullPath);
        }
      } else if (entry.isFile()) {
        // Check extension filter
        if (!extensions || extensions.includes(path.extname(fullPath))) {
          files.push(fullPath);
        }
      }
    }
  }
  
  await walk(dir);
  return files;
}

/**
 * Read file safely with encoding detection
 */
async function readFileSafe(filePath) {
  try {
    const content = await fs.readFile(filePath, 'utf8');
    return { path: filePath, content, error: null };
  } catch (error) {
    // Try with different encoding
    try {
      const content = await fs.readFile(filePath, 'latin1');
      return { path: filePath, content, error: null };
    } catch (innerError) {
      return { path: filePath, content: null, error: error.message };
    }
  }
}

module.exports = {
  analyzeFile,
  findPatterns,
  detectLanguage,
  isTestFile,
  countCommentLines,
  getFiles,
  readFileSafe
};