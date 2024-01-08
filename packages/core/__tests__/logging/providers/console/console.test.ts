import { consoleProvider } from '../../../../src/logging/providers/console';
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
describe('logging console provider', () => {
	it.each(logLevels)('should log to console with %p log level', level => {
		consoleProvider.initialize({ defaultLogLevel: level, enable: true });
		consoleProvider.enable();
		consoleProvider.disable();
		consoleProvider.flushLogs();
		consoleProvider.log(logParams);
	});
});
