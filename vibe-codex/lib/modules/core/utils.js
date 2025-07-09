/**
 * Utility functions for core module
 */

/**
 * Calculate similarity between two strings using Jaccard index
 * @param {string} str1 - First string
 * @param {string} str2 - Second string
 * @returns {number} Similarity score between 0 and 1
 */
export function calculateSimilarity(str1, str2) {
  const words1 = str1.split(' ');
  const words2 = str2.split(' ');
  const set1 = new Set(words1);
  const set2 = new Set(words2);
  
  const intersection = new Set([...set1].filter(x => set2.has(x)));
  const union = new Set([...set1, ...set2]);
  
  return intersection.size / union.size;
}

/**
 * Common patterns for detecting secrets in code
 */
export const secretPatterns = [
  /api[_-]?key\s*[:=]\s*["'][A-Za-z0-9]{16,}["']/gi,
  /password\s*[:=]\s*["'](?!test|mock|example)[^"']+["']/gi,
  /token\s*[:=]\s*["'][A-Za-z0-9]{20,}["']/gi,
  /secret\s*[:=]\s*["'](?!test|mock|example)[^"']+["']/gi
];

/**
 * Check if content contains secrets
 * @param {string} content - Content to check
 * @returns {Array} Found secret patterns with their line numbers
 */
export function checkForSecrets(content) {
  const violations = [];
  const lines = content.split('\n');
  
  for (let i = 0; i < lines.length; i++) {
    for (const pattern of secretPatterns) {
      pattern.lastIndex = 0; // Reset regex state
      if (pattern.test(lines[i])) {
        violations.push({
          line: i + 1,
          pattern: pattern.source
        });
      }
    }
  }
  
  return violations;
}