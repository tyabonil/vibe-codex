// Mock chalk before requiring the module
jest.mock('chalk', () => ({
  green: (str) => `[green]${str}[/green]`,
  red: (str) => `[red]${str}[/red]`,
  yellow: (str) => `[yellow]${str}[/yellow]`,
  gray: (str) => `[gray]${str}[/gray]`,
  bold: (str) => `[bold]${str}[/bold]`
}));

const { SimpleLogger } = require('../../lib/utils/simple-logger');
let { getLogger } = require('../../lib/utils/simple-logger');

describe('SimpleLogger', () => {
  let logger;
  let consoleSpy;
  let errorSpy;
  let warnSpy;

  beforeEach(() => {
    logger = new SimpleLogger();
    consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    errorSpy = jest.spyOn(console, 'error').mockImplementation();
    warnSpy = jest.spyOn(console, 'warn').mockImplementation();
  });

  afterEach(() => {
    consoleSpy.mockRestore();
    errorSpy.mockRestore();
    warnSpy.mockRestore();
  });

  describe('basic logging', () => {
    test('should log info messages', () => {
      logger.info('test message');
      expect(consoleSpy).toHaveBeenCalledWith('vibe-codex: test message');
    });

    test('should log success messages in green', () => {
      logger.success('operation completed');
      expect(consoleSpy).toHaveBeenCalledWith(
        '[green]vibe-codex: operation completed[/green]'
      );
    });

    test('should log error messages in red', () => {
      logger.error('something went wrong');
      expect(errorSpy).toHaveBeenCalledWith(
        '[red]vibe-codex: error: something went wrong[/red]'
      );
    });

    test('should log warning messages in yellow', () => {
      logger.warning('be careful');
      expect(warnSpy).toHaveBeenCalledWith(
        '[yellow]vibe-codex: warning: be careful[/yellow]'
      );
    });
  });

  describe('quiet mode', () => {
    test('should not log when quiet is true', () => {
      logger = new SimpleLogger({ quiet: true });
      logger.info('test');
      logger.success('test');
      logger.error('test');
      
      expect(consoleSpy).not.toHaveBeenCalled();
      expect(errorSpy).not.toHaveBeenCalled();
      expect(warnSpy).not.toHaveBeenCalled();
    });
  });

  describe('JSON mode', () => {
    test('should output JSON format when json is true', () => {
      logger = new SimpleLogger({ json: true });
      logger.info('test message');
      
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringMatching(/"type":"info".*"message":"test message"/)
      );
    });

    test('should include timestamp in JSON output', () => {
      logger = new SimpleLogger({ json: true });
      logger.info('test');
      
      const output = consoleSpy.mock.calls[0][0];
      const parsed = JSON.parse(output);
      expect(parsed).toHaveProperty('timestamp');
      expect(parsed.type).toBe('info');
      expect(parsed.message).toBe('test');
    });
  });

  describe('verbose mode', () => {
    test('should not log verbose messages by default', () => {
      logger.verbose('debug info');
      expect(consoleSpy).not.toHaveBeenCalled();
    });

    test('should log verbose messages when verbose is true', () => {
      logger = new SimpleLogger({ verbose: true });
      logger.verbose('debug info');
      expect(consoleSpy).toHaveBeenCalledWith(
        '[gray]vibe-codex: debug info[/gray]'
      );
    });
  });

  describe('task management', () => {
    test('should start and succeed a task', () => {
      const task = logger.startTask('Installing dependencies');
      expect(consoleSpy).toHaveBeenCalledWith('vibe-codex: Installing dependencies...');
      
      task.succeed('Installation complete');
      expect(consoleSpy).toHaveBeenCalledWith(
        '[green]vibe-codex: Installation complete[/green]'
      );
    });

    test('should start and fail a task', () => {
      const task = logger.startTask('Building project');
      task.fail('Build failed');
      
      expect(errorSpy).toHaveBeenCalledWith(
        '[red]vibe-codex: error: Build failed[/red]'
      );
    });
  });

  describe('list formatting', () => {
    test('should format string list', () => {
      logger.list(['item1', 'item2', 'item3']);
      
      expect(consoleSpy).toHaveBeenCalledWith('  item1');
      expect(consoleSpy).toHaveBeenCalledWith('  item2');
      expect(consoleSpy).toHaveBeenCalledWith('  item3');
    });

    test('should format object list with status', () => {
      logger.list([
        { name: 'rule1', status: 'enabled' },
        { name: 'rule2', status: 'disabled' }
      ]);
      
      expect(consoleSpy).toHaveBeenCalledWith('  rule1 [enabled]');
      expect(consoleSpy).toHaveBeenCalledWith('  rule2 [disabled]');
    });

    test('should output JSON list when in JSON mode', () => {
      logger = new SimpleLogger({ json: true });
      logger.list(['a', 'b']);
      
      const output = consoleSpy.mock.calls[0][0];
      const parsed = JSON.parse(output);
      expect(parsed.type).toBe('list');
      expect(parsed.items).toEqual(['a', 'b']);
    });
  });

  describe('custom prefix', () => {
    test('should use custom prefix', () => {
      logger = new SimpleLogger({ prefix: 'my-app' });
      logger.info('test');
      expect(consoleSpy).toHaveBeenCalledWith('my-app: test');
    });
  });

  describe('singleton getLogger', () => {
    beforeEach(() => {
      // Clear module cache for singleton tests
      delete require.cache[require.resolve('../../lib/utils/simple-logger')];
      const freshModule = require('../../lib/utils/simple-logger');
      getLogger = freshModule.getLogger;
    });

    test('should return same instance', () => {
      const logger1 = getLogger();
      const logger2 = getLogger();
      expect(logger1).toBe(logger2);
    });

    test('should update options on existing instance', () => {
      const logger1 = getLogger({ prefix: 'test1' });
      logger1.info('message1');
      
      const logger2 = getLogger({ prefix: 'test2' });
      logger2.info('message2');
      
      expect(consoleSpy).toHaveBeenCalledWith('test1: message1');
      expect(consoleSpy).toHaveBeenCalledWith('test2: message2');
      expect(logger1).toBe(logger2);
    });
  });
});