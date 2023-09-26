// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Credentials, StorageHelper } from '@aws-amplify/core';
import { getInAppMessages } from '@aws-amplify/core/internals/aws-clients/pinpoint';
import cloneDeep from 'lodash/cloneDeep';

import { addEventListener } from '../../../../src/common/eventListeners';
import {
	InAppMessage,
	InAppMessageInteractionEvent,
} from '../../../../src/inAppMessaging';
import { AWSPinpointProvider } from '../../../../src/inAppMessaging/Providers';
import {
	isBeforeEndDate,
	logger as mockLogger,
	matchesAttributes,
	matchesEventType,
	matchesMetrics,
} from '../../../../src/inAppMessaging/Providers/AWSPinpointProvider/utils';

import {
	awsPinpointConfig,
	credentials,
	inAppMessagingConfig,
	pinpointInAppMessage,
	simpleInAppMessagingEvent,
} from '../../../../__mocks__/data';
import { mockStorage } from '../../../../__mocks__/mocks';

jest.mock('@aws-amplify/core');
jest.mock('@aws-amplify/core/internals/aws-clients/pinpoint');
jest.mock('../../../../src/common/eventListeners');
jest.mock('../../../../src/inAppMessaging/Providers/AWSPinpointProvider/utils');
jest.mock(
	'../../../../src/inAppMessaging/sessionTracker/SessionTracker',
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
const mockAddEventListener = addEventListener as jest.Mock;
const mockIsBeforeEndDate = isBeforeEndDate as jest.Mock;
const mockMatchesAttributes = matchesAttributes as jest.Mock;
const mockMatchesEventType = matchesEventType as jest.Mock;
const mockMatchesMetrics = matchesMetrics as jest.Mock;
const mockGetInAppMessages = getInAppMessages as jest.Mock;

describe('AWSPinpoint InAppMessaging Provider', () => {
	let provider: AWSPinpointProvider;
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

	describe('configure', () => {
		test('attaches In-App Messaging channel info', () => {
			const config = provider.configure();

			expect(config).toMatchObject(inAppMessagingConfig);
		});
	});

	describe('getInAppMessages', () => {
		const messages = [cloneDeep(pinpointInAppMessage)];
		beforeEach(() => {
			provider.configure(awsPinpointConfig);
		});

		test('gets in-app messages from Pinpoint', async () => {
			mockGetInAppMessages.mockResolvedValueOnce({
				InAppMessagesResponse: {
					InAppMessageCampaigns: messages,
				},
			});

			expect(await provider.getInAppMessages()).toStrictEqual(messages);
		});

		test('throws an error on client failure', async () => {
			mockGetInAppMessages.mockImplementationOnce(() => {
				throw new Error();
			});

			await expect(provider.getInAppMessages()).rejects.toThrow();

			expect(mockLogger.error).toBeCalledWith(
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
			mockMatchesEventType.mockReturnValue(true);
			mockMatchesAttributes.mockReturnValue(true);
			mockMatchesMetrics.mockReturnValue(true);
			mockIsBeforeEndDate.mockReturnValue(true);
		});

		test('filters in-app messages from Pinpoint by criteria', async () => {
			mockMatchesEventType.mockReturnValueOnce(false);
			mockMatchesAttributes.mockReturnValueOnce(false);
			mockMatchesMetrics.mockReturnValueOnce(false);
			const [result] = await provider.processInAppMessages(
				messages,
				simpleInAppMessagingEvent
			);

			expect(result.id).toBe('uuid-4');
		});

		test('filters in-app messages from Pinpoint by criteria', async () => {
			const [result] = await provider.processInAppMessages(
				messages,
				simpleInAppMessagingEvent
			);

			expect(result.id).toBe('uuid-3');
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
			mockMatchesEventType.mockReturnValue(true);
			mockMatchesAttributes.mockReturnValue(true);
			mockMatchesMetrics.mockReturnValue(true);
			mockIsBeforeEndDate.mockReturnValue(true);
			mockAddEventListener.mockImplementation((type, handleEvent) => {
				if (type === InAppMessageInteractionEvent.MESSAGE_DISPLAYED) {
					notify = handleEvent;
				}
				return { handleEvent, remove: jest.fn() };
			});
		});
		beforeEach(() => {
			provider.configure(awsPinpointConfig);
		});

		test('messages stop being processed if session cap is met', async () => {
			const message = cloneDeep(pinpointInAppMessage);
			message.SessionCap = 1;

			expect(getStorageSpy).toBeCalled();
			expect(
				await provider.processInAppMessages(
					[message],
					simpleInAppMessagingEvent
				)
			).toHaveLength(1);

			notify(displayedMessage);

			expect(
				await provider.processInAppMessages(
					[message],
					simpleInAppMessagingEvent
				)
			).toHaveLength(0);
		});

		test('messages stop being processed if daily cap is met', async () => {
			const message = cloneDeep(pinpointInAppMessage);
			message.DailyCap = 1;

			expect(getStorageSpy).toBeCalled();
			expect(
				await provider.processInAppMessages(
					[message],
					simpleInAppMessagingEvent
				)
			).toHaveLength(1);

			notify(displayedMessage);

			expect(
				await provider.processInAppMessages(
					[message],
					simpleInAppMessagingEvent
				)
			).toHaveLength(0);
		});

		test('messages stop being processed if total cap is met', async () => {
			const message = cloneDeep(pinpointInAppMessage);
			message.TotalCap = 1;

			expect(getStorageSpy).toBeCalled();
			expect(
				await provider.processInAppMessages(
					[message],
					simpleInAppMessagingEvent
				)
			).toHaveLength(1);

			notify(displayedMessage);

			expect(
				await provider.processInAppMessages(
					[message],
					simpleInAppMessagingEvent
				)
			).toHaveLength(0);
		});

		test('session caps are tracked per message', async () => {
			const firstMessage = cloneDeep(pinpointInAppMessage);
			firstMessage.SessionCap = 1;
			const secondMessage = {
				...cloneDeep(pinpointInAppMessage),
				CampaignId: 'uuid-2',
			};
			secondMessage.SessionCap = 1;
			const messages = [firstMessage, secondMessage];

			expect(getStorageSpy).toBeCalled();
			expect(
				await provider.processInAppMessages(messages, simpleInAppMessagingEvent)
			).toHaveLength(2);

			notify(displayedMessage);

			expect(
				await provider.processInAppMessages(messages, simpleInAppMessagingEvent)
			).toHaveLength(1);

			notify({ ...displayedMessage, id: 'uuid-2' });

			expect(
				await provider.processInAppMessages(messages, simpleInAppMessagingEvent)
			).toHaveLength(0);
		});

		test('daily caps are tracked across messages', async () => {
			const firstMessage = cloneDeep(pinpointInAppMessage);
			firstMessage.DailyCap = 1;
			const secondMessage = {
				...cloneDeep(pinpointInAppMessage),
				CampaignId: 'uuid-2',
			};
			secondMessage.DailyCap = 1;
			const messages = [firstMessage, secondMessage];

			expect(getStorageSpy).toBeCalled();
			expect(
				await provider.processInAppMessages(messages, simpleInAppMessagingEvent)
			).toHaveLength(2);

			notify(displayedMessage);

			expect(
				await provider.processInAppMessages(messages, simpleInAppMessagingEvent)
			).toHaveLength(0);
		});
	});
});
