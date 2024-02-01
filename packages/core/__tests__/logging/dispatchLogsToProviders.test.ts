import { logToConsole } from '../../src/logging/console';
import { LoggingProvider } from '../../src/logging';
import { dispatchLogsToProviders } from '../../src/logging/dispatchLogsToProviders';
import { LogParams } from '../../src/logging/types';

const providers: LoggingProvider[] = [
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
				get providers() {
					return providers;
				},
			},
		},
	},
}));
jest.mock('../../src/logging/console', () => ({
	logToConsole: jest.fn(),
}));

describe('dispatchLogsToProviders', () => {
	afterEach(() => {
		jest.clearAllMocks();
	});

	const mockLogToConsole = logToConsole as jest.Mock;

	it('should dispatch amplify generated logs to console and all configured logging providers ', () => {
		dispatchLogsToProviders(sampleLog);

		expect(mockLogToConsole).toHaveBeenCalledTimes(1);
		expect(mockLogToConsole).toHaveBeenCalledWith(sampleLog);

		providers.forEach(provider => {
			expect(provider.log).toHaveBeenCalledTimes(1);
			expect(provider.log).toHaveBeenCalledWith(sampleLog);
		});
	});
});
