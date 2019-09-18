jest.mock('../src/vendor/dom-utils', () => {
	return {
		delegate: jest.fn(),
	};
});

import {
	AWS,
	ClientDevice,
	Parser,
	ConsoleLogger as Logger,
	Credentials,
} from '@aws-amplify/core';
import { AnalyticsOptions, EventAttributes, EventMetrics } from '../src/types';
import { default as Analytics } from '../src/Analytics';
import AWSAnalyticsProvider from '../src/Providers/AWSPinpointProvider';

const options: AnalyticsOptions = {
	appId: 'appId',
	platform: 'platform',
	clientId: 'clientId',
	region: 'region',
};

const credentials = {
	accessKeyId: 'accessKeyId',
	sessionToken: 'sessionToken',
	secretAccessKey: 'secretAccessKey',
	identityId: 'identityId',
	authenticated: true,
};

jest.useFakeTimers();

const record_spyon = jest
	.spyOn(AWSAnalyticsProvider.prototype, 'record')
	.mockImplementation((params, handlers) => {
		return handlers.resolve();
	});

describe('Analytics test', () => {
	describe('configure test', () => {
		test('happy case with default parser', () => {
			const analytics = new Analytics();
			const spyon = jest
				.spyOn(ClientDevice, 'clientInfo')
				.mockImplementationOnce(() => {
					return 'clientInfo';
				});
			const spyon2 = jest
				.spyOn(Parser, 'parseMobilehubConfig')
				.mockImplementationOnce(() => {
					return {
						Analytics: {
							AWSPinpoint: {
								appId: 'appId',
							},
						},
					};
				});
			const spyon3 = jest
				.spyOn(AWSAnalyticsProvider.prototype, 'configure')
				.mockImplementationOnce(() => {
					return;
				});

			expect(analytics.configure({ attr: 'attr' })).toEqual({
				AWSPinpoint: { appId: 'appId' },
				attr: 'attr',
				autoSessionRecord: true,
			});

			spyon.mockClear();
			spyon2.mockClear();
			spyon3.mockClear();
		});
	});

	describe('startSession test', () => {
		test('happy case', async () => {
			const analytics = new Analytics();
			const provider = new AWSAnalyticsProvider();
			analytics.addPluggable(provider);
			analytics.configure({ mock: 'value' });

			await analytics.startSession();
			expect(record_spyon).toBeCalled();
		});
		test('analytics not configured', async () => {
			const analytics = new Analytics();

			try {
				await analytics.startSession();
			} catch (e) {
				expect(e.message).toBe('Analytics has not been configured');
			}
			expect.assertions(1);
		});
	});

	describe('stopSession test', () => {
		test('happy case', async () => {
			const analytics = new Analytics();
			const provider = new AWSAnalyticsProvider();
			analytics.addPluggable(provider);
			analytics.configure({ mock: 'value' });

			await analytics.stopSession();
			expect(record_spyon).toBeCalled();
		});
		test('analytics not configured', async () => {
			const analytics = new Analytics();

			try {
				await analytics.stopSession();
			} catch (e) {
				expect(e.message).toBe('Analytics has not been configured');
			}
			expect.assertions(1);
		});
	});

	describe('record test', () => {
		test('happy case', async () => {
			const analytics = new Analytics();
			const provider = new AWSAnalyticsProvider();
			analytics.addPluggable(provider);
			analytics.configure({ mock: 'value' });

			await analytics.record({
				name: 'event',
				attributes: 'attributes',
				metrics: 'metrics',
			});
			expect(record_spyon).toBeCalled();
		});
		test('analytics not configured', async () => {
			const analytics = new Analytics();

			try {
				await analytics.record({});
			} catch (e) {
				expect(e.message).toBe('Analytics has not been configured');
			}
			expect.assertions(1);
		});
	});

	describe('updateEndpoint test', () => {
		test('happy case', async () => {
			const analytics = new Analytics();
			const provider = new AWSAnalyticsProvider();
			analytics.addPluggable(provider);
			analytics.configure({ mock: 'value' });

			await analytics.updateEndpoint({
				UserId: 'id',
			});
			expect(record_spyon).toBeCalled();
		});
		test('analytics not configured', async () => {
			const analytics = new Analytics();

			try {
				await analytics.updateEndpoint({});
			} catch (e) {
				expect(e.message).toBe('Analytics has not been configured');
			}
			expect.assertions(1);
		});
	});

	describe('analytics turn on/off test', () => {
		test('disable test', () => {
			const analytics = new Analytics();
			analytics.disable();
		});

		test('enable test', () => {
			const analytics = new Analytics();
			analytics.enable();
		});
	});

	describe('getPluggable test', () => {
		test('happy case', () => {
			const analytics = new Analytics();

			const provider = new AWSAnalyticsProvider();
			analytics.addPluggable(provider);

			expect(analytics.getPluggable(provider.getProviderName())).toBeInstanceOf(
				AWSAnalyticsProvider
			);
		});
	});

	describe('removePluggable test', () => {
		test('happy case', () => {
			const analytics = new Analytics();

			const provider = new AWSAnalyticsProvider();
			analytics.addPluggable(provider);

			analytics.removePluggable(provider.getProviderName());

			expect(analytics.getPluggable(provider.getProviderName())).toBeNull();
		});
	});
});
