import { consoleProvider } from '../../src/logging/providers/console';
import { cloudWatchProvider } from '../../src/logging/providers/cloudWatch';
import { dispatchLogsToProviders } from '../../src/logging/dispatchLogsToProviders';
import { LogParams } from '../../src/logging/types';

jest.mock('../../src/singleton/Amplify', () => ({
	Amplify: {
		libraryOptions: {
			Logger: {
				console: consoleProvider,
				additionalProviders: [cloudWatchProvider],
			},
		},
	},
}));
jest.mock('../../src/logging/providers/console', () => ({
	consoleProvider: {
		log: jest.fn(),
	},
}));
jest.mock('../../src/logging/providers/cloudWatch', () => ({
	cloudWatchProvider: {
		log: jest.fn(),
	},
}));

const logParams: LogParams = {
	namespace: 'namespace',
	category: 'Auth',
	logLevel: 'INFO',
	message: 'log event',
};

describe('logging dispatchLogsToProviders', () => {
	afterEach(() => {
		jest.clearAllMocks();
	});

	const mockConsoleProviderLog = consoleProvider.log as jest.Mock;
	const mockCloudWatchProviderLog = cloudWatchProvider.log as jest.Mock;
	it('should dispatch log event to all configured logging providers ', () => {
		dispatchLogsToProviders(logParams);

		expect(mockConsoleProviderLog).toHaveBeenCalledTimes(1);
		expect(mockConsoleProviderLog).toHaveBeenCalledWith(logParams);

		expect(mockCloudWatchProviderLog).toHaveBeenCalledTimes(1);
		expect(mockCloudWatchProviderLog).toHaveBeenCalledWith(logParams);
	});
});
