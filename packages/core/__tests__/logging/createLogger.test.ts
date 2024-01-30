import { createBaseLogger } from '../../src/logging/utils/createBaseLogger';
import { createLogger } from '../../src/logging';
import { LoggingCategory } from '../../src/logging/types';
import { dispatchLogsToProviders } from '../../src/logging/dispatchLogsToProviders';

jest.mock('../../src/logging/utils/createBaseLogger');

const mockCreateBaseLogger = createBaseLogger as jest.Mock;
const loggerInput: { namespace: string; category: LoggingCategory } = {
	namespace: 'namespace',
	category: 'Auth',
};

describe('createLogger', () => {
	afterEach(() => {
		jest.clearAllMocks();
	});

	it('should create a new logger', () => {
		createLogger(loggerInput);
		expect(mockCreateBaseLogger).toHaveBeenCalledTimes(1);
		expect(mockCreateBaseLogger).toHaveBeenCalledWith(
			loggerInput,
			dispatchLogsToProviders
		);
	});
});
