/**
 * Tests for logger utility
 */

const { Logger } = require('../../../lib/utils/logger');

describe('Logger', () => {
  let logger;
  let consoleSpy;

  beforeEach(() => {
    logger = new Logger('test');
    // Mock console methods
    consoleSpy = {
      error: jest.spyOn(console, 'error').mockImplementation(),
      warn: jest.spyOn(console, 'warn').mockImplementation(),
      info: jest.spyOn(console, 'info').mockImplementation(),
      debug: jest.spyOn(console, 'debug').mockImplementation(),
      log: jest.spyOn(console, 'log').mockImplementation()
    };
  });

  afterEach(() => {
    jest.restoreAllMocks();
    delete process.env.NODE_ENV;
    delete process.env.DEBUG;
    delete process.env.VIBE_CODEX_DEBUG;
    delete process.env.VIBE_CODEX_SILENT;
    delete process.env.CI;
  });

  describe('constructor', () => {
    it('should initialize with default name', () => {
      const defaultLogger = new Logger();
      expect(defaultLogger.name).toBe('vibe-codex');
    });

    it('should detect development environment', () => {
      process.env.NODE_ENV = 'development';
      const devLogger = new Logger();
      expect(devLogger.isDevelopment).toBe(true);
    });

    it('should detect debug mode', () => {
      process.env.DEBUG = 'true';
      const debugLogger = new Logger();
      expect(debugLogger.isDebug).toBe('true');
    });

    it('should detect silent mode', () => {
      process.env.VIBE_CODEX_SILENT = 'true';
      const silentLogger = new Logger();
      expect(silentLogger.isSilent).toBe('true');
    });
  });

  describe('log levels', () => {
    it('should log error messages even in silent mode', () => {
      logger.isSilent = true;
      logger.error('Test error');
      expect(consoleSpy.error).toHaveBeenCalled();
    });

    it('should not log warnings in silent mode', () => {
      logger.isSilent = true;
      logger.warn('Test warning');
      expect(consoleSpy.warn).not.toHaveBeenCalled();
    });

    it('should log warnings when not silent', () => {
      logger.isSilent = false;
      logger.warn('Test warning');
      expect(consoleSpy.warn).toHaveBeenCalled();
    });

    it('should only log debug messages when debug is enabled', () => {
      logger.isDebug = false;
      logger.debug('Test debug');
      expect(consoleSpy.debug).not.toHaveBeenCalled();

      logger.isDebug = true;
      logger.debug('Test debug');
      expect(consoleSpy.debug).toHaveBeenCalled();
    });

    it('should log info messages when not silent', () => {
      logger.isSilent = false;
      logger.info('Test info');
      expect(consoleSpy.info).toHaveBeenCalled();
    });

    it('should log success messages when not silent', () => {
      logger.isSilent = false;
      logger.success('Test success');
      expect(consoleSpy.log).toHaveBeenCalled();
    });
  });

  describe('output method', () => {
    it('should always output regardless of silent mode', () => {
      logger.isSilent = true;
      logger.output('Test output');
      expect(consoleSpy.log).toHaveBeenCalledWith('Test output');
    });
  });

  describe('timestamp formatting', () => {
    it('should include timestamp in development mode', () => {
      logger.isDevelopment = true;
      logger.info('Test message');
      
      const call = consoleSpy.info.mock.calls[0];
      expect(call[0]).toMatch(/\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z\]/);
    });

    it('should not include timestamp in production mode', () => {
      logger.isDevelopment = false;
      logger.info('Test message');
      
      const call = consoleSpy.info.mock.calls[0];
      expect(call[0]).not.toMatch(/\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z\]/);
    });
  });

  describe('multiple arguments', () => {
    it('should pass multiple arguments to console methods', () => {
      logger.error('Error:', { code: 'TEST' }, 'Additional info');
      expect(consoleSpy.error).toHaveBeenCalledWith(
        expect.any(String),
        'Error:',
        { code: 'TEST' },
        'Additional info'
      );
    });
  });
});