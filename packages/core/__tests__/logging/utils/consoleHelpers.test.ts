import {
	setConsoleLogLevel,
	getConsoleLogLevel,
	getConsoleLogFunction,
} from '../../../src/logging/utils';

describe('logging utils', () => {
	describe('consoleLogLevel', () => {
		it('should get default console log level', () => {
			expect(getConsoleLogLevel()).toEqual('WARN');
		});

		it('should set console log level', () => {
			setConsoleLogLevel('DEBUG');
			expect(getConsoleLogLevel()).toEqual('DEBUG');
		});
	});

	describe('getConsoleLogFunction', () => {
		beforeEach(() => {
			jest.spyOn(console, 'log').mockImplementation(() => {});
			jest.spyOn(console, 'error').mockImplementation(() => {});
			jest.spyOn(console, 'warn').mockImplementation(() => {});
			jest.spyOn(console, 'info').mockImplementation(() => {});
			jest.spyOn(console, 'debug').mockImplementation(() => {});
		});

		afterEach(() => {
			jest.clearAllMocks();
		});

		it.each([
			['log', 'UNKNOWN'],
			['error', 'ERROR'],
			['warn', 'WARN'],
			['info', 'INFO'],
			['debug', 'DEBUG'],
			['debug', 'VERBOSE'],
		])('should return console.%p for %p log level', (event, logLevel) => {
			// @ts-expect-error
			const logFunction = getConsoleLogFunction(logLevel);
			logFunction();
			expect(console[event]).toHaveBeenCalledTimes(1);
		});
	});
});
