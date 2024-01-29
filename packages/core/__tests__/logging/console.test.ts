import { logToConsole } from '../../src/logging/console';
import { setConsoleLogLevel } from '../../src/logging/utils';
import { LogParams, LogLevel } from '../../src/logging/types';
import * as loggingUtils from '../../src/logging/utils';

const logFunction = jest.fn();
jest
	.spyOn(loggingUtils, 'getConsoleLogFunction')
	.mockImplementation(() => logFunction);

const mockDate = new Date('2024-01-01T17:30:00Z');
jest.spyOn(global, 'Date').mockImplementation(() => mockDate);

const logLevel: LogLevel = 'VERBOSE';
const sampleLog: LogParams = {
	namespace: 'namespace',
	category: 'Auth',
	logLevel: logLevel,
	message: 'log event',
};

describe('logToConsole', () => {
	afterEach(() => {
		jest.clearAllMocks();
	});

	it('Should log message to console', () => {
		setConsoleLogLevel(logLevel);
		logToConsole(sampleLog);
		expect(logFunction).toHaveBeenCalledTimes(1);
		expect(logFunction).toHaveBeenCalledWith(
			'[VERBOSE] 30:00.0 namespace/Auth',
			sampleLog.message
		);
	});
});
