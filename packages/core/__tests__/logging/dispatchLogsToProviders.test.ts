import { logToConsole } from '../../src/logging/console';
import { LoggingProvider } from '../../src/logging';
import { dispatchLogsToProviders } from '../../src/logging/dispatchLogsToProviders';
import { LogParams } from '../../src/logging/types';

const additionalProviders: LoggingProvider[] = [
	{
		log: jest.fn(),
	},
	{
		log: jest.fn(),
	},
];
const sampleLog: LogParams = {
	namespace: 'namespace',
	category: 'Auth',
	logLevel: 'INFO',
	message: 'log event',
};

jest.mock('../../src/singleton/Amplify', () => ({
	Amplify: {
		libraryOptions: {
			Logging: {
				get additionalProviders() {
					return additionalProviders;
				},
			},
		},
	},
}));
jest.mock('../../src/logging/console', () => ({
	logToConsole: jest.fn(),
}));

describe('logging dispatchLogsToProviders', () => {
	afterEach(() => {
		jest.clearAllMocks();
	});

	const mockLogToConsole = logToConsole as jest.Mock;

	it('should dispatch amplify generated logs to console and all configured logging providers ', () => {
		dispatchLogsToProviders(sampleLog);

		expect(mockLogToConsole).toHaveBeenCalledTimes(1);
		expect(mockLogToConsole).toHaveBeenCalledWith(sampleLog);

		additionalProviders.forEach(provider => {
			expect(provider.log).toHaveBeenCalledTimes(1);
			expect(provider.log).toHaveBeenCalledWith(sampleLog);
		});
	});
});
