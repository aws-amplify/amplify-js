/*
 * Copyright 2017-2022 Amazon.com, Inc. or its affiliates. All Rights Reserved.
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
import { Credentials, StorageHelper } from '@aws-amplify/core';
import { PinpointClient } from '@aws-sdk/client-pinpoint';
import cloneDeep from 'lodash/cloneDeep';

import * as eventListeners from '../../../../src/InAppMessaging/eventListeners';
import {
	InAppMessage,
	InAppMessageInteractionEvent,
} from '../../../../src/InAppMessaging';
import { AWSPinpointProvider } from '../../../../src/InAppMessaging/Providers';
import * as utils from '../../../../src/InAppMessaging/Providers/AWSPinpointProvider/utils';

import {
	awsPinpointConfig,
	credentials,
	pinpointEndpointPayload,
	pinpointInAppMessage,
	simpleEvent,
	userId,
	userInfo,
} from '../../../../__mocks__/data';
import { mockStorage } from '../../../../__mocks__/mocks';

jest.mock('@aws-amplify/core');
jest.mock('@aws-sdk/client-pinpoint');
jest.mock('../../../../src/InAppMessaging/eventListeners');
jest.mock('../../../../src/InAppMessaging/Providers/AWSPinpointProvider/utils');
jest.mock(
	'../../../../src/InAppMessaging/SessionTracker/SessionTracker',
	() => ({
		__esModule: true,
		default: jest.fn(() => ({
			start: jest.fn(),
		})),
	})
);

const getStorageSpy = jest.spyOn(StorageHelper.prototype, 'getStorage');
const credentialsGetSpy = jest.spyOn(Credentials, 'get');
const credentialsShearSpy = jest.spyOn(Credentials, 'shear');
const matchesEventTypeSpy = jest.spyOn(utils, 'matchesEventType');
const matchesAttributesSpy = jest.spyOn(utils, 'matchesAttributes');
const matchesMetricsSpy = jest.spyOn(utils, 'matchesMetrics');
const isBeforeEndDateSpy = jest.spyOn(utils, 'isBeforeEndDate');
const addListenerSpy = jest.spyOn(
	eventListeners,
	'addMessageInteractionEventListener'
);
const clientSendSpy = jest.spyOn(PinpointClient.prototype, 'send') as jest.Mock;

describe('AWSPinpoint InAppMessaging Provider', () => {
	let provider: AWSPinpointProvider;
	const { logger } = utils;
	let mockStorageMemory = {};
	beforeAll(() => {
		mockStorage.setItem.mockImplementation((key, val) => {
			mockStorageMemory[key] = val;
		});
		mockStorage.getItem.mockImplementation(key => mockStorageMemory[key]);
	});
	beforeEach(() => {
		jest.clearAllMocks();
		getStorageSpy.mockReturnValue(mockStorage);
		credentialsGetSpy.mockResolvedValue(credentials);
		credentialsShearSpy.mockImplementation(credentials => credentials);
		mockStorageMemory = {};
		provider = new AWSPinpointProvider();
	});

	test('returns the correct category name', () => {
		expect(provider.getCategory()).toBe('Notifications');
	});

	test('returns the correct sub-category name', () => {
		expect(provider.getSubCategory()).toBe('InAppMessaging');
	});

	test('returns the correct provider name', () => {
		expect(provider.getProviderName()).toBe('AWSPinpoint');
	});

	describe('configure', () => {
		test('can be called without input', () => {
			const config = provider.configure();

			expect(config).toMatchObject({});
		});

		test('attaches a storage helper to the config', () => {
			const config = provider.configure(awsPinpointConfig);

			expect(config).toStrictEqual({
				...awsPinpointConfig,
				storage: mockStorage,
			});
		});
	});

	describe('getInAppMessages', () => {
		const messages = [cloneDeep(pinpointInAppMessage)];
		beforeEach(() => {
			provider.configure(awsPinpointConfig);
		});

		test('gets in-app messages from Pinpoint', async () => {
			clientSendSpy.mockResolvedValueOnce(null).mockResolvedValueOnce({
				InAppMessagesResponse: {
					InAppMessageCampaigns: messages,
				},
			});

			expect(await provider.getInAppMessages()).toStrictEqual(messages);
		});

		test('throws an error if credentials are empty', async () => {
			credentialsGetSpy.mockResolvedValue(null);

			await expect(provider.getInAppMessages()).rejects.toThrow();

			expect(logger.debug).toBeCalledWith('no credentials found');
		});

		test('throws an error on credentials get failure', async () => {
			credentialsGetSpy.mockImplementation(() => {
				throw new Error();
			});

			await expect(provider.getInAppMessages()).rejects.toThrow();

			expect(logger.error).toBeCalledWith(
				expect.stringContaining('Error getting credentials'),
				expect.any(Error)
			);
		});

		test('throws an error on client failure', async () => {
			clientSendSpy.mockImplementationOnce(() => {
				throw new Error();
			});

			await expect(provider.getInAppMessages()).rejects.toThrow();

			expect(logger.error).toBeCalledWith(
				expect.stringContaining('Error getting in-app messages'),
				expect.any(Error)
			);
		});
	});

	describe('processInAppMessages', () => {
		const messages = [
			cloneDeep(pinpointInAppMessage),
			{ ...cloneDeep(pinpointInAppMessage), CampaignId: 'uuid-2', Priority: 3 },
			{ ...cloneDeep(pinpointInAppMessage), CampaignId: 'uuid-3', Priority: 1 },
			{ ...cloneDeep(pinpointInAppMessage), CampaignId: 'uuid-4', Priority: 2 },
		];
		beforeEach(() => {
			matchesEventTypeSpy.mockReturnValue(true);
			matchesAttributesSpy.mockReturnValue(true);
			matchesMetricsSpy.mockReturnValue(true);
			isBeforeEndDateSpy.mockReturnValue(true);
		});

		test('filters in-app messages from Pinpoint by criteria', async () => {
			matchesEventTypeSpy.mockReturnValueOnce(false);
			matchesAttributesSpy.mockReturnValueOnce(false);
			matchesMetricsSpy.mockReturnValueOnce(false);
			const [result] = await provider.processInAppMessages(
				messages,
				simpleEvent
			);

			expect(result.id).toBe('uuid-4');
		});

		test('filters in-app messages from Pinpoint by criteria', async () => {
			const [result] = await provider.processInAppMessages(
				messages,
				simpleEvent
			);

			expect(result.id).toBe('uuid-3');
		});
	});

	describe('identifyUser', () => {
		beforeEach(() => {
			provider.configure(awsPinpointConfig);
		});

		test('updates Pinpoint endpoint', async () => {
			await provider.identifyUser(userId, userInfo);

			expect(logger.debug).toBeCalledWith(
				'updating endpoint',
				expect.objectContaining(pinpointEndpointPayload)
			);
			expect(clientSendSpy).toBeCalled();
		});

		test('throws an error on client failure', async () => {
			clientSendSpy.mockImplementationOnce(() => {
				throw new Error();
			});

			await expect(provider.identifyUser(userId, userInfo)).rejects.toThrow();

			expect(logger.error).toBeCalledWith(
				expect.stringContaining('Error identifying user'),
				expect.any(Error)
			);
		});
	});

	describe('Display caps', () => {
		let notify;
		const displayedMessage: InAppMessage = {
			id: 'uuid-1',
			layout: 'TOP_BANNER',
			content: [],
		};
		beforeAll(() => {
			matchesEventTypeSpy.mockReturnValue(true);
			matchesAttributesSpy.mockReturnValue(true);
			matchesMetricsSpy.mockReturnValue(true);
			isBeforeEndDateSpy.mockReturnValue(true);
			addListenerSpy.mockImplementation((handleEvent, event) => {
				if (event === InAppMessageInteractionEvent.MESSAGE_DISPLAYED) {
					notify = handleEvent;
				}
				return { handleEvent, remove: jest.fn() };
			});
		});

		test('messages stop being processed if session cap is met', async () => {
			expect(getStorageSpy).toBeCalled();

			provider.configure(awsPinpointConfig);
			const message = cloneDeep(pinpointInAppMessage);
			message.SessionCap = 1;

			expect(
				await provider.processInAppMessages([message], simpleEvent)
			).toHaveLength(1);

			notify(displayedMessage);

			expect(
				await provider.processInAppMessages([message], simpleEvent)
			).toHaveLength(0);
		});

		test('messages stop being processed if daily cap is met', async () => {
			expect(getStorageSpy).toBeCalled();

			provider.configure(awsPinpointConfig);
			const message = cloneDeep(pinpointInAppMessage);
			message.DailyCap = 1;

			expect(
				await provider.processInAppMessages([message], simpleEvent)
			).toHaveLength(1);

			notify(displayedMessage);

			expect(
				await provider.processInAppMessages([message], simpleEvent)
			).toHaveLength(0);
		});

		test('messages stop being processed if total cap is met', async () => {
			expect(getStorageSpy).toBeCalled();

			provider.configure(awsPinpointConfig);
			const message = cloneDeep(pinpointInAppMessage);
			message.TotalCap = 1;

			expect(
				await provider.processInAppMessages([message], simpleEvent)
			).toHaveLength(1);

			notify(displayedMessage);

			expect(
				await provider.processInAppMessages([message], simpleEvent)
			).toHaveLength(0);
		});

		test('session caps are tracked per message', async () => {
			expect(getStorageSpy).toBeCalled();

			provider.configure(awsPinpointConfig);
			const firstMessage = cloneDeep(pinpointInAppMessage);
			firstMessage.SessionCap = 1;
			const secondMessage = {
				...cloneDeep(pinpointInAppMessage),
				CampaignId: 'uuid-2',
			};
			secondMessage.SessionCap = 1;
			const messages = [firstMessage, secondMessage];

			expect(
				await provider.processInAppMessages(messages, simpleEvent)
			).toHaveLength(2);

			notify(displayedMessage);

			expect(
				await provider.processInAppMessages(messages, simpleEvent)
			).toHaveLength(1);

			notify({ ...displayedMessage, id: 'uuid-2' });

			expect(
				await provider.processInAppMessages(messages, simpleEvent)
			).toHaveLength(0);
		});

		test('daily caps are tracked across messages', async () => {
			expect(getStorageSpy).toBeCalled();

			provider.configure(awsPinpointConfig);
			const firstMessage = cloneDeep(pinpointInAppMessage);
			firstMessage.DailyCap = 1;
			const secondMessage = {
				...cloneDeep(pinpointInAppMessage),
				CampaignId: 'uuid-2',
			};
			secondMessage.DailyCap = 1;
			const messages = [firstMessage, secondMessage];

			expect(
				await provider.processInAppMessages(messages, simpleEvent)
			).toHaveLength(2);

			notify(displayedMessage);

			expect(
				await provider.processInAppMessages(messages, simpleEvent)
			).toHaveLength(0);
		});
	});
});
