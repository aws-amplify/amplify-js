// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
jest.mock('../src/vendor/dom-utils', () => {
	return {
		delegate: jest.fn(),
	};
});

import { ClientDevice, parseAWSExports, Hub } from '@aws-amplify/core';
import { AnalyticsClass as Analytics } from '../src/Analytics';
import { AnalyticsProvider, PromiseHandlers } from '../src/types';
import { AWSPinpointProvider as AWSAnalyticsProvider } from '../src/providers/AWSPinpointProvider';

jest.mock('@aws-amplify/core');
const mockHubDispatch = Hub.dispatch as jest.Mock;

jest.useFakeTimers();

const record_spyon = jest
	.spyOn(AWSAnalyticsProvider.prototype, 'record')
	.mockImplementation((params, handlers) => {
		return handlers.resolve();
	});

/**
 * CAUTION: This mock class implements a publicly available interface `AnalyticsProvider` which customers can use to
 * implement custom providers. Exercise caution when modifying this class as additive changes to this interface can
 * break customers when not marked as optional.
 */
class TestCustomProvider implements AnalyticsProvider {
	getProviderName(): string {
		return 'CustomProvider' as const;
	}

	getCategory() {
		return 'Analytics' as const;
	}

	configure(o: object) {
		return o;
	}

	record(params: object, handlers?: PromiseHandlers) {
		handlers?.resolve(true);

		return Promise.resolve(true);
	}
}

describe('Analytics test', () => {
	beforeEach(() => {
		(parseAWSExports as jest.Mock).mockReturnValueOnce({
			Analytics: {
				AWSPinpoint: {
					appId: 'appId',
				},
			},
		});
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	describe('configure test', () => {
		test('happy case with default parser', () => {
			const analytics = new Analytics();
			ClientDevice.clientInfo = jest.fn().mockReturnValueOnce('clientInfo');

			const mockAWSAnalyticsProviderConfigure = jest
				.spyOn(AWSAnalyticsProvider.prototype, 'configure')
				.mockImplementationOnce(() => {
					return;
				});

			expect(analytics.configure({ attr: 'attr' })).toEqual({
				AWSPinpoint: { appId: 'appId' },
				attr: 'attr',
				autoSessionRecord: true,
			});

			mockAWSAnalyticsProviderConfigure.mockClear();
		});
	});

	describe('startSession test', () => {
		test('happy case', async () => {
			const analytics = new Analytics();
			const provider = new AWSAnalyticsProvider();
			analytics.addPluggable(provider);
			analytics.configure({ mock: 'value' });

			await analytics.startSession();
			expect(mockHubDispatch).toBeCalledWith(
				'analytics',
				{
					event: 'record',
					data: { name: '_session.start' },
					message: 'Recording Analytics session start event',
				},
				'Analytics',
				expect.anything()
			);
			expect(record_spyon).toBeCalled();
		});
	});

	describe('stopSession test', () => {
		test('happy case', async () => {
			const analytics = new Analytics();
			const provider = new AWSAnalyticsProvider();
			analytics.addPluggable(provider);
			analytics.configure({ mock: 'value' });

			await analytics.stopSession();
			expect(mockHubDispatch).toBeCalledWith(
				'analytics',
				{
					event: 'record',
					data: { name: '_session.stop' },
					message: 'Recording Analytics session stop event',
				},
				'Analytics',
				expect.anything()
			);
			expect(record_spyon).toBeCalled();
		});
	});

	describe('record test', () => {
		test('happy case', async () => {
			const analytics = new Analytics();
			const provider = new AWSAnalyticsProvider();
			analytics.addPluggable(provider);
			analytics.configure({ mock: 'value' });
			const event = {
				name: 'event',
				attributes: { key: 'value' },
				metrics: { metric: 123 },
			};

			await analytics.record(event);
			expect(mockHubDispatch).toBeCalledWith(
				'analytics',
				{
					event: 'record',
					data: event,
					message: 'Recording Analytics event',
				},
				'Analytics',
				expect.anything()
			);
			expect(record_spyon).toBeCalled();
		});

		/**
		 * Custom providers are a publically available feature via the `AnalyticsProvider` interface. Exercise caution when
		 * updating these to ensure backwards compatibility.
		 */
		test('record with custom provider', async () => {
			const analytics = new Analytics();
			const customProvider = new TestCustomProvider();
			const customProviderRecordSpy = jest.spyOn(customProvider, 'record');

			analytics.addPluggable(customProvider);

			const recordResponse = await analytics.record(
				{ name: 'testEvent' },
				'CustomProvider'
			);

			expect(customProviderRecordSpy).toBeCalled();
			expect(recordResponse).toBe(true);
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

			// this provider is added by default in the configure method
			// of analytics when initialized. No need to add it again here.
			const provider = new AWSAnalyticsProvider();

			analytics.removePluggable(provider.getProviderName());

			expect(analytics.getPluggable(provider.getProviderName())).toBeNull();
		});
	});
});
