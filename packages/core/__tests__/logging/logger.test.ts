import { createLogger } from '../../src/logging';
import { dispatchLogsToProviders } from '../../src/logging/dispatchLogsToProviders';

jest.mock('../../src/logging/dispatchLogsToProviders');

const namespace = 'namespace';
const category = 'Auth';

describe('logging createLogger', () => {
	const logger = createLogger({ namespace, category });
	const mockDispatchLogsToProviders = dispatchLogsToProviders as jest.Mock;

	afterEach(() => {
		jest.clearAllMocks();
	});

	it.each([
		['ERROR', 'error'],
		['WARN', 'warn'],
		['INFO', 'info'],
		['DEBUG', 'debug'],
		['VERBOSE', 'verbose'],
	])('should log a %p level log', (logLevel, event) => {
		const message = `log ${event} event`;
		logger[event](message);
		expect(mockDispatchLogsToProviders).toHaveBeenCalledTimes(1);
		expect(mockDispatchLogsToProviders).toHaveBeenCalledWith({
			namespace,
			category,
			logLevel: logLevel,
			message: message,
		});
	});
});
