/*
 * Copyright 2017-2021 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with
 * the License. A copy of the License is located at
 *
 *     http://aws.amazon.com/apache2.0/
 *
 * or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR
 * CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions
 * and limitations under the License.
 */
jest.mock('../src/vendor/dom-utils', () => {
	return {
		delegate: jest.fn(),
	};
});

import { ClientDevice, parseAWSExports, Hub } from '@aws-amplify/core';
import { AnalyticsClass as Analytics } from '../src/Analytics';
import AWSAnalyticsProvider from '../src/Providers/AWSPinpointProvider';

jest.mock('@aws-amplify/core');

jest.useFakeTimers();

const record_spyon = jest
	.spyOn(AWSAnalyticsProvider.prototype, 'record')
	.mockImplementation((params, handlers) => {
		return handlers.resolve();
	});

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
			expect(Hub.dispatch as jest.Mock).toBeCalledWith(
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
			expect(Hub.dispatch as jest.Mock).toBeCalledWith(
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
			expect(Hub.dispatch as jest.Mock).toBeCalledWith(
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
