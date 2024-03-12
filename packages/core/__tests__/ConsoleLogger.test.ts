import { ConsoleLogger } from '../src';
import { LoggingProvider, LogType } from '../src/Logger/types';

type LogEvent = 'verbose' | 'debug' | 'info' | 'warn' | 'error';

describe('ConsoleLogger', () => {
	beforeAll(() => {
		jest.spyOn(console, 'log').mockImplementation(() => {});
		jest.spyOn(console, 'error').mockImplementation(() => {});
		jest.spyOn(console, 'warn').mockImplementation(() => {});
		jest.spyOn(console, 'info').mockImplementation(() => {});
		jest.spyOn(console, 'debug').mockImplementation(() => {});
	});
	afterEach(() => {
		jest.clearAllMocks();
	});

	describe('pluggables', () => {
		/*it('should store pluggables correctly when addPluggable is called', () => {
			const provider = new AWSCloudWatchProvider();
			const logger = new Logger('name');
			logger.addPluggable(provider);
			const pluggables = logger.listPluggables();

			expect(pluggables).toHaveLength(1);
			expect(pluggables[0].getProviderName()).toEqual(
				AWS_CLOUDWATCH_PROVIDER_NAME
			);
		});*/

		it('should do nothing when no plugin is provided to addPluggable', () => {
			const logger = new ConsoleLogger('name');
			logger.addPluggable(null as any);
			const pluggables = logger.listPluggables();

			expect(pluggables).toHaveLength(0);
		});

		it('should do nothing when a non-logging category plugin is provided to addPluggable', () => {
			const provider = {
				getCategoryName: function () {
					return 'non-logging';
				},
				getProviderName: function () {
					return 'lol';
				},
				configure: function () {
					return {};
				},
				pushLogs: () => {},
			} as LoggingProvider;

			const logger = new ConsoleLogger('name');
			logger.addPluggable(provider);
			const pluggables = logger.listPluggables();

			expect(pluggables).toHaveLength(0);
		});
	});

	describe('log level filter', () => {
		afterEach(() => {
			jest.clearAllMocks();
		});
		const logEventToConsoleApiDefaultMapping: Record<string, string> = {
			error: 'error',
			warn: 'warn',
			info: 'log',
			debug: 'log',
			verbose: 'log',
		};
		const levelVerbose: [LogEvent, LogType, number][] = [
			['verbose', LogType.VERBOSE, 1],
			['debug', LogType.VERBOSE, 1],
			['info', LogType.VERBOSE, 1],
			['warn', LogType.VERBOSE, 1],
			['error', LogType.VERBOSE, 1],
		];
		const levelDebug: [LogEvent, LogType, number][] = [
			['verbose', LogType.DEBUG, 0],
			['debug', LogType.DEBUG, 1],
			['info', LogType.DEBUG, 1],
			['warn', LogType.DEBUG, 1],
			['error', LogType.DEBUG, 1],
		];
		const levelInfo: [LogEvent, LogType, number][] = [
			['verbose', LogType.INFO, 0],
			['debug', LogType.INFO, 0],
			['info', LogType.INFO, 1],
			['warn', LogType.INFO, 1],
			['error', LogType.INFO, 1],
		];
		const levelWarn: [LogEvent, LogType, number][] = [
			['verbose', LogType.WARN, 0],
			['debug', LogType.WARN, 0],
			['info', LogType.WARN, 0],
			['warn', LogType.WARN, 1],
			['error', LogType.WARN, 1],
		];
		const levelError: [LogEvent, LogType, number][] = [
			['verbose', LogType.ERROR, 0],
			['debug', LogType.ERROR, 0],
			['info', LogType.ERROR, 0],
			['warn', LogType.ERROR, 0],
			['error', LogType.ERROR, 1],
		];
		const levelNone: [LogEvent, LogType, number][] = [
			['verbose', LogType.NONE, 0],
			['debug', LogType.NONE, 0],
			['info', LogType.NONE, 0],
			['warn', LogType.NONE, 0],
			['error', LogType.NONE, 0],
		];

		it.each([
			...levelVerbose,
			...levelDebug,
			...levelInfo,
			...levelWarn,
			...levelError,
			...levelNone,
		])(
			'can user log a %p log event if current level is %p',
			(logEvent, currentLogLevel, result) => {
				const loggerName = 'test-logger';
				const message = `${logEvent} log message`;
				const consoleEvent = logEventToConsoleApiDefaultMapping[logEvent];
				ConsoleLogger.LOG_LEVEL = currentLogLevel;

				const logger = new ConsoleLogger(loggerName);
				logger[logEvent](message);

				expect(
					console[consoleEvent as keyof typeof console],
				).toHaveBeenCalledTimes(result);
			},
		);
	});

	describe('log to console', () => {
		const mockDate = new Date('2024-01-01T17:30:00Z');
		jest.spyOn(global, 'Date').mockImplementation(() => mockDate);

		afterEach(() => {
			jest.clearAllMocks();
		});

		it.each<[LogEvent, string, string]>([
			['error', 'error', 'ERROR'],
			['warn', 'warn', 'WARN'],
			['info', 'log', 'INFO'],
			['debug', 'log', 'DEBUG'],
			['verbose', 'log', 'VERBOSE'],
		])(
			'logger.%p log event should call console.%p API',
			(logEvent, consoleEvent, logLevel) => {
				const loggerName = 'test-logger';
				const message = `${logEvent} log message`;
				ConsoleLogger.LOG_LEVEL = logLevel;

				const logger = new ConsoleLogger(loggerName);
				logger[logEvent](message);

				expect(
					console[consoleEvent as keyof typeof console],
				).toHaveBeenCalledTimes(1);
				expect(
					console[consoleEvent as keyof typeof console],
				).toHaveBeenCalledWith(
					`[${logLevel}] 30:00.0 ${loggerName} - ${message}`,
				);
			},
		);

		it.each<[LogEvent, string, string]>([
			['error', 'error', 'ERROR'],
			['warn', 'warn', 'WARN'],
			['info', 'info', 'INFO'],
			['debug', 'debug', 'DEBUG'],
			['verbose', 'log', 'VERBOSE'],
		])(
			'logger.%p log event should call console.%p API when BIND_ALL_LOG_LEVELS is enabled',
			(logEvent, consoleEvent, logLevel) => {
				const loggerName = 'test-logger';
				const message = `${logEvent} log message`;
				ConsoleLogger.BIND_ALL_LOG_LEVELS = true;
				ConsoleLogger.LOG_LEVEL = logLevel;

				const logger = new ConsoleLogger(loggerName);
				logger[logEvent](message);

				expect(
					console[consoleEvent as keyof typeof console],
				).toHaveBeenCalledTimes(1);
				expect(
					console[consoleEvent as keyof typeof console],
				).toHaveBeenCalledWith(
					`[${logLevel}] 30:00.0 ${loggerName} - ${message}`,
				);
			},
		);
	});
});
