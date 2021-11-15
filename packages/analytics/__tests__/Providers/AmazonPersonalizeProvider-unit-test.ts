/*
 * Copyright 2019-2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with
 * the License. A copy of the License is located at
 *
 *	 http://aws.amazon.com/apache2.0/
 *
 * or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR
 * CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions
 * and limitations under the License.
 */
import { Credentials } from '@aws-amplify/core';
import { AmazonPersonalizeProvider } from '../../src/Providers/AmazonPersonalizeProvider';
import {
	PersonalizeEventsClient,
	PutEventsCommand,
} from '@aws-sdk/client-personalize-events';

const credentials = {
	accessKeyId: 'accessKeyId',
	sessionToken: 'sessionToken',
	secretAccessKey: 'secretAccessKey',
	identityId: 'identityId',
	authenticated: true,
};

const TRACKING_ID = 'trackingId';

jest.useFakeTimers();

jest.mock('@aws-sdk/client-personalize-events');

beforeEach(() => {
	PersonalizeEventsClient.prototype.send = jest.fn(async (command) => {
		if (command instanceof PutEventsCommand) {
			return 'data';
		}
	});
});

afterEach(() => {
	jest.restoreAllMocks();
});

describe('Personalize provider test', () => {
	describe('getProviderName test', () => {
		test('happy case', () => {
			const analytics = new AmazonPersonalizeProvider();

			expect(analytics.getProviderName()).toBe('AmazonPersonalize');
		});
	});

	describe('configure test', () => {
		test('happy case', () => {
			const analytics = new AmazonPersonalizeProvider();
			analytics.configure({ trackingId: TRACKING_ID });
			expect(analytics.configure({ region: 'region1' })).toEqual({
				flushInterval: 5000,
				flushSize: 5,
				region: 'region1',
				trackingId: 'trackingId',
			});
		});
	});

	describe('record test', () => {
		test('record without credentials', async () => {
			const analytics = new AmazonPersonalizeProvider();
			analytics.configure({ trackingId: TRACKING_ID });
			const spyon = jest
				.spyOn(Credentials, 'get')
				.mockImplementationOnce(() => {
					return Promise.reject('err');
				});

			expect(await analytics.record('params')).toBe(false);
			expect(spyon).toHaveBeenCalledTimes(1);
			spyon.mockClear();
		});

		test('record happy case with identify event', async () => {
			const analytics = new AmazonPersonalizeProvider();
			analytics.configure({ trackingId: TRACKING_ID });
			const spyon = jest
				.spyOn(Credentials, 'get')
				.mockImplementationOnce(() => {
					return Promise.resolve(credentials);
				});

			await analytics.record({
				event: {
					eventType: 'Identify',
					properties: { userId: 'user1' },
				},
				config: {},
			});

			jest.advanceTimersByTime(6000);

			spyon.mockClear();
		});

		test('record happy case with Click event', async () => {
			const analytics = new AmazonPersonalizeProvider();
			analytics.configure({ trackingId: TRACKING_ID });
			const spyon = jest
				.spyOn(Credentials, 'get')
				.mockImplementationOnce(() => {
					return Promise.resolve(credentials);
				});

			await analytics.record({
				event: {
					eventType: 'Click',
					properties: { itemId: 'item1', eventValue: 'value1' },
				},
				config: {},
			});

			jest.advanceTimersByTime(6000);

			spyon.mockClear();
		});
	});
});
