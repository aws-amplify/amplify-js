import { ConsoleLogger } from '../../src';
import { getConsoleLogLevel } from '../../src/logging/utils';

describe('ConsoleLogger', () => {
	describe('pluggables', () => {
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
			};

			const logger = new ConsoleLogger('name');
			logger.addPluggable(provider);
			const pluggables = logger.listPluggables();

			expect(pluggables).toHaveLength(0);
		});

		it('should update log level of console', () => {
			const level = 'DEBUG';
			ConsoleLogger.LOG_LEVEL = level;
			expect(getConsoleLogLevel()).toBe(level);
		});
	});
});
