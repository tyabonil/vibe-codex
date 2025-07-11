// Minimal PR file validator stub for CI
class PRFileValidator {
  static validateFiles(files) {
    return { 
      valid: true, 
      errors: [],
      warnings: []
    };
  }
  
  static checkFilePatterns(files) {
    return [];
  }
  
  static validatePRMetadata(pr) {
    return { valid: true };
  }
}

module.exports = PRFileValidator;