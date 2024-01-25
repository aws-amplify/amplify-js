import { ConsoleLogger } from '../src';
import { LoggingProvider } from '../src/logging/types';

describe('ConsoleLogger', () => {
	describe('pluggables', () => {
		/*it('should store pluggables correctly when addPluggable is called', () => {
			const provider = new AWSCloudWatchProvider();
			const logger = new Logger('name');
			logger.addPluggable(provider);
			const pluggables = logger.listPluggables();

			expect(pluggables).toHaveLength(1);
			expect(pluggables[0].getProviderName()).toEqual(
				AWS_CLOUDWATCH_PROVIDER_NAME
			);
		});*/

		it('should do nothing when no plugin is provided to addPluggable', () => {
			const logger = new ConsoleLogger('name');
			logger.addPluggable(null as any);
			const pluggables = logger.listPluggables();

			expect(pluggables).toHaveLength(0);
		});

		it('should do nothing when a non-logging category plugin is provided to addPluggable', () => {
			const provider = {
				getCategoryName: function () {
					return 'non-logging';
				},
				getProviderName: function () {
					return 'lol';
				},
				configure: function () {
					return {};
				},
				pushLogs: () => {},
			} as LoggingProvider;

			const logger = new ConsoleLogger('name');
			logger.addPluggable(provider);
			const pluggables = logger.listPluggables();

			expect(pluggables).toHaveLength(0);
		});
	});
});
