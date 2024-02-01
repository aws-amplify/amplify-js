import { logToConsole } from '../../src/logging/console';
import {
	setConsoleLogLevel,
	getConsoleLogFunction,
} from '../../src/logging/utils';
import { LogParams, LogLevel } from '../../src/logging/types';

const mockDate = new Date('2024-01-01T17:30:00Z');
jest.spyOn(global, 'Date').mockImplementation(() => mockDate);

jest.mock('../../src/logging/utils', () => {
	return {
		...jest.requireActual('../../src/logging/utils'),
		getConsoleLogFunction: jest.fn(),
	};
});

const mockGetConsoleLogFunction = getConsoleLogFunction as jest.Mock;
const logFunction = jest.fn();

const logLevel: LogLevel = 'VERBOSE';
const sampleLog: LogParams = {
	namespace: 'namespace',
	category: 'Auth',
	logLevel: logLevel,
	message: 'log event',
};

describe('logToConsole', () => {
	beforeEach(() => {
		mockGetConsoleLogFunction.mockImplementation(() => logFunction);
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	it('Should log the message to console', () => {
		setConsoleLogLevel(logLevel);
		logToConsole(sampleLog);
		expect(logFunction).toHaveBeenCalledTimes(1);
		expect(logFunction).toHaveBeenCalledWith(
			'[VERBOSE] 30:00.0 namespace/Auth',
			sampleLog.message
		);
	});
});
