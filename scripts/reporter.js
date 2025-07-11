// Minimal reporter stub for CI
class Reporter {
  generateReport(violations, score, isBlocking) {
    return `## Compliance Report\nScore: ${score}/10\nStatus: ${isBlocking ? 'BLOCKED' : 'PASSED'}`;
  }
}
module.exports = Reporter;