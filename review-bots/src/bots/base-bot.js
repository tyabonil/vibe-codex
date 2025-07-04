/**
 * Base Bot - Common interface for all review bots
 */

class BaseBot {
  constructor(name, emoji) {
    this.name = name;
    this.emoji = emoji;
  }

  /**
   * Main analysis method - must be implemented by subclasses
   */
  async analyzeFile(filePath, content) {
    throw new Error('analyzeFile must be implemented by subclass');
  }

  /**
   * Analyze multiple files
   */
  async analyzeFiles(files) {
    const results = [];
    
    for (const file of files) {
      try {
        const analysis = await this.analyzeFile(file.path, file.content);
        if (analysis && analysis.length > 0) {
          results.push({
            file: file.path,
            analysis: analysis
          });
        }
      } catch (error) {
        results.push({
          file: file.path,
          error: `Failed to analyze: ${error.message}`
        });
      }
    }
    
    return results;
  }

  /**
   * Format the complete report - must be implemented by subclasses
   */
  formatReport(filePath, analysis) {
    throw new Error('formatReport must be implemented by subclass');
  }

  /**
   * Generate a complete report for all files
   */
  generateReport(results) {
    let fullReport = `\n${'='.repeat(80)}\n`;
    fullReport += `${this.emoji} ${this.name} Analysis Report\n`;
    fullReport += `${'='.repeat(80)}\n\n`;

    if (results.length === 0) {
      fullReport += 'No files analyzed.\n';
      return fullReport;
    }

    results.forEach(result => {
      if (result.error) {
        fullReport += `\n❌ Error analyzing ${result.file}: ${result.error}\n`;
      } else {
        fullReport += this.formatReport(result.file, result.analysis);
      }
      fullReport += `\n${'-'.repeat(80)}\n`;
    });

    fullReport += `\n${this.getSummary(results)}\n`;
    
    return fullReport;
  }

  /**
   * Get summary statistics
   */
  getSummary(results) {
    const totalFiles = results.length;
    const filesWithIssues = results.filter(r => !r.error && r.analysis.length > 0).length;
    const totalIssues = results.reduce((sum, r) => sum + (r.analysis ? r.analysis.length : 0), 0);
    const errors = results.filter(r => r.error).length;

    return `📊 Summary: ${totalFiles} files analyzed, ${filesWithIssues} with findings, ${totalIssues} total items, ${errors} errors`;
  }
}

module.exports = BaseBot;