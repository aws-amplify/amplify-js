import { Logger } from '../../src/logging/logger';
import { createLogger } from '../../src/logging';
import { LoggingCategory } from '../../src/logging/types';

const loggerInput: { namespace: string; category: LoggingCategory } = {
	namespace: 'namespace',
	category: 'Auth',
};

describe('createLogger', () => {
	afterEach(() => {
		jest.clearAllMocks();
	});

	it('should create a new logger', () => {
		expect(createLogger(loggerInput)).toBeInstanceOf(Logger);
	});
});
