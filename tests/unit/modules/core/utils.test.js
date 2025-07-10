/**
 * Tests for core module utilities
 */

// Mock logger
jest.mock('../../../../lib/utils/logger.js', () => ({
  default: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    success: jest.fn()
  }
}));

// Since core utils is ES module, we need to handle it specially
let calculateSimilarity, checkForSecrets, secretPatterns;

beforeAll(async () => {
  const utils = await import('../../../../lib/modules/core/utils.js');
  calculateSimilarity = utils.calculateSimilarity;
  checkForSecrets = utils.checkForSecrets;
  secretPatterns = utils.secretPatterns;
});

describe('Core Module Utils', () => {
  describe('calculateSimilarity', () => {
    it('should return 1 for identical strings', () => {
      const str = 'hello world test';
      expect(calculateSimilarity(str, str)).toBe(1);
    });

    it('should return 0 for completely different strings', () => {
      const str1 = 'apple banana orange';
      const str2 = 'car truck bike';
      expect(calculateSimilarity(str1, str2)).toBe(0);
    });

    it('should calculate partial similarity correctly', () => {
      const str1 = 'hello world';
      const str2 = 'hello universe';
      const similarity = calculateSimilarity(str1, str2);
      expect(similarity).toBeGreaterThan(0);
      expect(similarity).toBeLessThan(1);
      // Should be 1/3 (1 common word out of 3 unique words)
      expect(similarity).toBeCloseTo(0.333, 2);
    });

    it('should handle empty strings', () => {
      expect(calculateSimilarity('', '')).toBe(NaN); // 0/0
      expect(calculateSimilarity('hello', '')).toBe(0);
      expect(calculateSimilarity('', 'world')).toBe(0);
    });

    it('should be case sensitive', () => {
      const str1 = 'Hello World';
      const str2 = 'hello world';
      expect(calculateSimilarity(str1, str2)).toBe(0);
    });
  });

  describe('secretPatterns', () => {
    it('should be an array of regex patterns', () => {
      expect(Array.isArray(secretPatterns)).toBe(true);
      expect(secretPatterns.length).toBeGreaterThan(0);
      secretPatterns.forEach(pattern => {
        expect(pattern).toBeInstanceOf(RegExp);
      });
    });

    it('should have global and case-insensitive flags', () => {
      secretPatterns.forEach(pattern => {
        expect(pattern.flags).toContain('g');
        expect(pattern.flags).toContain('i');
      });
    });
  });

  describe('checkForSecrets', () => {
    it('should detect API keys', () => {
      const content = `
        const config = {
          api_key: "AbCdEfGhIjKlMnOpQrStUvWxYz123456",
          endpoint: "https://api.example.com"
        };
      `;
      
      const violations = checkForSecrets(content);
      expect(violations.length).toBeGreaterThan(0);
      expect(violations[0].line).toBe(3);
    });

    it('should detect passwords', () => {
      const content = `
        const dbConfig = {
          host: "localhost",
          password: "super-secret-password-123",
          database: "myapp"
        };
      `;
      
      const violations = checkForSecrets(content);
      expect(violations.length).toBeGreaterThan(0);
      expect(violations[0].line).toBe(4);
    });

    it('should detect tokens', () => {
      const content = `
        const headers = {
          Authorization: "Bearer",
          token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9",
        };
      `;
      
      const violations = checkForSecrets(content);
      expect(violations.length).toBeGreaterThan(0);
    });

    it('should detect secrets', () => {
      const content = `
        export const config = {
          secret: "this-is-a-real-secret-value",
          public: "this-is-public"
        };
      `;
      
      const violations = checkForSecrets(content);
      expect(violations.length).toBeGreaterThan(0);
      expect(violations[0].line).toBe(3);
    });

    it('should ignore test/mock/example values', () => {
      const content = `
        const testConfig = {
          password: "test",
          secret: "mock",
          api_key: "example",
          real_password: "example-password"
        };
      `;
      
      const violations = checkForSecrets(content);
      expect(violations).toEqual([]);
    });

    it('should return empty array for content without secrets', () => {
      const content = `
        const config = {
          host: "localhost",
          port: 3000,
          debug: true
        };
      `;
      
      const violations = checkForSecrets(content);
      expect(violations).toEqual([]);
    });

    it('should handle multi-line content correctly', () => {
      const content = `line 1
line 2
api_key: "1234567890123456"
line 4
password: "actual-password"
line 6`;
      
      const violations = checkForSecrets(content);
      expect(violations).toHaveLength(2);
      expect(violations[0].line).toBe(3);
      expect(violations[1].line).toBe(5);
    });

    it('should reset regex state between checks', () => {
      const content1 = 'api_key: "1234567890123456"';
      const content2 = 'normal content without secrets';
      
      const violations1 = checkForSecrets(content1);
      const violations2 = checkForSecrets(content2);
      
      expect(violations1.length).toBeGreaterThan(0);
      expect(violations2).toEqual([]);
    });
  });
});