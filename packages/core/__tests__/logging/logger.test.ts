import { generateLogger } from '../../src/logging/logger';
import { dispatchLogsToProviders } from '../../src/logging/dispatchLogsToProviders';

jest.mock('../../src/logging/dispatchLogsToProviders');

const namespace = 'namespace';
const category = 'Auth';

describe('logging generateLogger', () => {
	const logger = generateLogger({ namespace, category });
	const mockDispatchLogsToProviders = dispatchLogsToProviders as jest.Mock;

	afterEach(() => {
		jest.clearAllMocks();
	});

	it('should log a event with default logLevel', () => {
		logger.log('log event');
		expect(mockDispatchLogsToProviders).toHaveBeenCalledTimes(1);
		expect(mockDispatchLogsToProviders).toHaveBeenCalledWith({
			namespace,
			category,
			logLevel: 'INFO',
			message: 'log event',
		});
	});
	it('should log a ERROR level log event', () => {
		logger.error('log error');
		expect(mockDispatchLogsToProviders).toHaveBeenCalledTimes(1);
		expect(mockDispatchLogsToProviders).toHaveBeenCalledWith({
			namespace,
			category,
			logLevel: 'ERROR',
			message: 'log error',
		});
	});
	it('should log a WARN level log event', () => {
		logger.warn('log warn');
		expect(mockDispatchLogsToProviders).toHaveBeenCalledTimes(1);
		expect(mockDispatchLogsToProviders).toHaveBeenCalledWith({
			namespace,
			category,
			logLevel: 'WARN',
			message: 'log warn',
		});
	});
	it('should log a INFO level log event', () => {
		logger.info('log info');
		expect(mockDispatchLogsToProviders).toHaveBeenCalledTimes(1);
		expect(mockDispatchLogsToProviders).toHaveBeenCalledWith({
			namespace,
			category,
			logLevel: 'INFO',
			message: 'log info',
		});
	});
	it('should log a DEBUG level log event', () => {
		logger.debug('log debug');
		expect(mockDispatchLogsToProviders).toHaveBeenCalledTimes(1);
		expect(mockDispatchLogsToProviders).toHaveBeenCalledWith({
			namespace,
			category,
			logLevel: 'DEBUG',
			message: 'log debug',
		});
	});
	it('should log a VERBOSE level log event', () => {
		logger.verbose('log verbose');
		expect(mockDispatchLogsToProviders).toHaveBeenCalledTimes(1);
		expect(mockDispatchLogsToProviders).toHaveBeenCalledWith({
			namespace,
			category,
			logLevel: 'VERBOSE',
			message: 'log verbose',
		});
	});
});
