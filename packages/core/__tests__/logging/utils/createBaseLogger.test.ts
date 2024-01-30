import { createBaseLogger } from '../../../src/logging/utils';
import { dispatchLogsToProviders } from '../../../src/logging/dispatchLogsToProviders';

jest.mock('../../../src/logging/dispatchLogsToProviders');

const namespace = 'namespace';
const category = 'Auth';
const mockDispatchLogsToProviders = dispatchLogsToProviders as jest.Mock;

describe('logging createLogger', () => {
	const logger = createBaseLogger(
		{ namespace, category },
		dispatchLogsToProviders
	);
	afterEach(() => {
		jest.clearAllMocks();
	});

	it.each([
		['ERROR', 'error'],
		['WARN', 'warn'],
		['INFO', 'info'],
		['DEBUG', 'debug'],
		['VERBOSE', 'verbose'],
		['INFO', 'log'],
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
