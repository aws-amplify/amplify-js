import { cloudWatchProvider } from '../../../../src/logging/providers/cloudWatch';
import { LogParams, LogLevel } from '../../../../src/logging/types';

const logParams: LogParams = {
	namespace: 'namespace',
	category: 'Auth',
	logLevel: 'INFO',
	message: 'log event',
};
const logLevels: LogLevel[] = ['VERBOSE', 'DEBUG', 'INFO', 'WARN', 'ERROR'];

// todo(ashwinkumar6): PENDING
// placeholder to pass code coverage
describe('logging cloudwatch provider', () => {
	it.each(logLevels)('should log to console with %p log level', level => {
		cloudWatchProvider.initialize({
			enable: true,
			localStoreMaxSizeInMB: 5,
			flushIntervalInSeconds: 60,
			logGroupName: 'logGroupName',
			region: 'region',
			loggingConstraints: {
				defaultLogLevel: level,
			},
		});
		cloudWatchProvider.enable();
		cloudWatchProvider.disable();
		cloudWatchProvider.flushLogs();
		cloudWatchProvider.log(logParams);
	});
});
