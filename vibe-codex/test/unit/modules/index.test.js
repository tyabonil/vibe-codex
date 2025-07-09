/**
 * Tests for main module index
 */

describe('Module Index', () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  it('should export expected modules', () => {
    // Mock the ES modules
    jest.mock('../../../lib/modules/core/index.js', () => ({ default: { name: 'core' } }));
    jest.mock('../../../lib/modules/testing/index.js', () => ({ default: { name: 'testing' } }));
    jest.mock('../../../lib/modules/github/index.js', () => ({ default: { name: 'github' } }));
    jest.mock('../../../lib/modules/deployment/index.js', () => ({ default: { name: 'deployment' } }));
    jest.mock('../../../lib/modules/documentation/index.js', () => ({ default: { name: 'documentation' } }));
    jest.mock('../../../lib/modules/patterns/index.js', () => ({ default: { name: 'patterns' } }));
    jest.mock('../../../lib/modules/github-workflow/index.js', () => ({ default: { name: 'github-workflow' } }));
    
    const moduleIndex = require('../../../lib/modules/index.js');
    
    expect(moduleIndex).toBeDefined();
    expect(typeof moduleIndex).toBe('object');
  });

  it('should handle module loading errors gracefully', () => {
    // Test that missing modules don't crash the system
    jest.mock('../../../lib/modules/core/index.js', () => {
      throw new Error('Module not found');
    });
    
    expect(() => {
      require('../../../lib/modules/index.js');
    }).not.toThrow();
  });
});