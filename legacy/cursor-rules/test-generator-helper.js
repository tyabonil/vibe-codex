#!/usr/bin/env node

/**
 * Test Generator Helper
 * Provides templates and suggestions for creating tests
 */

const fs = require('fs');
const path = require('path');

function generateTestTemplate(filePath, framework = 'jest') {
  const fileContent = fs.readFileSync(filePath, 'utf8');
  const fileName = path.basename(filePath);
  const moduleName = fileName.replace(/\.[^/.]+$/, '');
  
  // Extract exported functions/classes
  const exports = extractExports(fileContent);
  
  const templates = {
    jest: generateJestTemplate,
    mocha: generateMochaTemplate,
    vitest: generateVitestTemplate,
    pytest: generatePytestTemplate
  };
  
  const generator = templates[framework] || generateJestTemplate;
  return generator(moduleName, exports, filePath);
}

function extractExports(content) {
  const exports = {
    functions: [],
    classes: [],
    constants: []
  };
  
  // Extract function exports
  const funcPattern = /export\s+(?:async\s+)?function\s+(\w+)/g;
  let match;
  while ((match = funcPattern.exec(content)) !== null) {
    exports.functions.push(match[1]);
  }
  
  // Extract class exports
  const classPattern = /export\s+class\s+(\w+)/g;
  while ((match = classPattern.exec(content)) !== null) {
    exports.classes.push(match[1]);
  }
  
  // Extract const exports
  const constPattern = /export\s+const\s+(\w+)/g;
  while ((match = constPattern.exec(content)) !== null) {
    exports.constants.push(match[1]);
  }
  
  return exports;
}

function generateJestTemplate(moduleName, exports, filePath) {
  const relativePath = filePath.replace(/\\/g, '/');
  
  let template = `/**
 * Tests for ${moduleName}
 * 
 * Coverage requirements:
 * - Branches: 100%
 * - Functions: 100%
 * - Lines: 100%
 * - Statements: 100%
 */

const { ${[...exports.functions, ...exports.classes].join(', ')} } = require('./${moduleName}');

describe('${moduleName}', () => {
`;

  // Generate test cases for functions
  exports.functions.forEach(func => {
    template += `
  describe('${func}', () => {
    it('should handle normal input', () => {
      // Arrange
      const input = /* TODO: Add test input */;
      const expected = /* TODO: Add expected output */;
      
      // Act
      const result = ${func}(input);
      
      // Assert
      expect(result).toBe(expected);
    });
    
    it('should handle edge cases', () => {
      // TODO: Test edge cases (null, undefined, empty)
    });
    
    it('should handle error conditions', () => {
      // TODO: Test error scenarios
      expect(() => ${func}(/* invalid input */)).toThrow();
    });
  });
`;
  });
  
  // Generate test cases for classes
  exports.classes.forEach(cls => {
    template += `
  describe('${cls}', () => {
    let instance;
    
    beforeEach(() => {
      instance = new ${cls}();
    });
    
    it('should create instance', () => {
      expect(instance).toBeInstanceOf(${cls});
    });
    
    // TODO: Add tests for each method
  });
`;
  });
  
  template += `});

/**
 * Test Coverage Checklist:
 * [ ] All functions have tests
 * [ ] All branches are covered (if/else, switch)
 * [ ] Error cases are tested
 * [ ] Edge cases are handled
 * [ ] Async operations are tested
 * [ ] Mocks are used appropriately
 */
`;
  
  return template;
}

function generateMochaTemplate(moduleName, exports) {
  return `const { expect } = require('chai');
const { ${[...exports.functions, ...exports.classes].join(', ')} } = require('./${moduleName}');

describe('${moduleName}', () => {
  // TODO: Add test cases
});
`;
}

function generateVitestTemplate(moduleName, exports) {
  return `import { describe, it, expect, beforeEach } from 'vitest';
import { ${[...exports.functions, ...exports.classes].join(', ')} } from './${moduleName}';

describe('${moduleName}', () => {
  // TODO: Add test cases
});
`;
}

function generatePytestTemplate(moduleName, exports) {
  return `import pytest
from ${moduleName} import *

class Test${moduleName.charAt(0).toUpperCase() + moduleName.slice(1)}:
    """Test cases for ${moduleName}"""
    
    def test_example(self):
        """Test basic functionality"""
        # TODO: Add test implementation
        assert True
        
    def test_edge_cases(self):
        """Test edge cases"""
        # TODO: Add edge case tests
        pass
        
    def test_error_conditions(self):
        """Test error handling"""
        with pytest.raises(Exception):
            # TODO: Add error case
            pass
`;
}

// CLI usage
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.length < 1) {
    console.log('Usage: node test-generator-helper.js <file-path> [framework]');
    console.log('Frameworks: jest (default), mocha, vitest, pytest');
    process.exit(1);
  }
  
  const filePath = args[0];
  const framework = args[1] || 'jest';
  
  if (!fs.existsSync(filePath)) {
    console.error(`File not found: ${filePath}`);
    process.exit(1);
  }
  
  const template = generateTestTemplate(filePath, framework);
  console.log(template);
}

module.exports = {
  generateTestTemplate,
  extractExports
};