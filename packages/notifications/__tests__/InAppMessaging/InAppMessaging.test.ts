// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	ConsoleLogger,
	Hub,
	HubCallback,
	HubCapsule,
	InAppMessagingAction,
	StorageHelper,
} from '@aws-amplify/core';

import {
	closestExpiryMessage,
	customHandledMessage,
	inAppMessages,
	notificationsConfig,
	simpleInAppMessages,
	simpleInAppMessagingEvent,
	subcategoryConfig,
	userId,
	userInfo,
} from '../../__mocks__/data';
import { mockInAppMessagingProvider, mockStorage } from '../../__mocks__/mocks';
import {
	addEventListener,
	notifyEventListeners,
} from '../../src/common/eventListeners';
import InAppMessaging, {
	InAppMessageInteractionEvent,
} from '../../src/InAppMessaging';
import { getUserAgentValue } from '../../src/internals/utils';

jest.mock('@aws-amplify/core');
jest.mock('../../src/common/eventListeners');
jest.mock('../../src/InAppMessaging/Providers', () => ({
	AWSPinpointProvider: () => ({
		getCategory: jest.fn,
		getSubCategory: jest.fn,
		getProviderName: jest.fn,
		configure: jest.fn,
	}),
}));

const PROVIDER_NAME = 'InAppMessagingProvider';
const SUBCATEGORY_NAME = 'InAppMessaging';

const getStorageSpy = jest.spyOn(StorageHelper.prototype, 'getStorage');
const loggerDebugSpy = jest.spyOn(ConsoleLogger.prototype, 'debug');
const loggerErrorSpy = jest.spyOn(ConsoleLogger.prototype, 'error');
const hubSpy = jest.spyOn(Hub, 'listen');

describe('InAppMessaging', () => {
	let inAppMessaging: InAppMessaging;
	beforeEach(() => {
		jest.clearAllMocks();
		getStorageSpy.mockReturnValue(mockStorage);
		inAppMessaging = new InAppMessaging();
		inAppMessaging.addPluggable(mockInAppMessagingProvider);
		mockInAppMessagingProvider.getCategory.mockReturnValue('Notifications');
		mockInAppMessagingProvider.getInAppMessages.mockReturnValue(
			simpleInAppMessages
		);
		mockInAppMessagingProvider.getProviderName.mockReturnValue(PROVIDER_NAME);
		mockInAppMessagingProvider.getSubCategory.mockReturnValue(SUBCATEGORY_NAME);
	});

	test('returns the correct module name', () => {
		expect(inAppMessaging.getModuleName()).toBe(SUBCATEGORY_NAME);
	});

	describe('Pluggables', () => {
		test('can be added', () => {
			expect(mockInAppMessagingProvider.configure).toBeCalled();
		});

		test('can be gotten', () => {
			expect(inAppMessaging.getPluggable(PROVIDER_NAME)).not.toBeNull();
		});

		test('can be removed', () => {
			inAppMessaging.removePluggable(PROVIDER_NAME);

			expect(inAppMessaging.getPluggable(PROVIDER_NAME)).toBeNull();
		});

		test('cannot be removed if not found', () => {
			inAppMessaging.removePluggable('InvalidProvider');

			expect(loggerDebugSpy).toBeCalledWith(
				expect.stringContaining('InvalidProvider')
			);
		});

		test('cannot be added if duplicate', () => {
			expect(() => {
				inAppMessaging.addPluggable(mockInAppMessagingProvider);
			}).toThrow(/has already been added/);
		});

		test('cannot be added if invalid', () => {
			inAppMessaging.removePluggable(PROVIDER_NAME);
			mockInAppMessagingProvider.configure.mockClear();
			mockInAppMessagingProvider.getSubCategory.mockReturnValue(
				'InvalidSubCategory'
			);

			expect(mockInAppMessagingProvider.configure).not.toBeCalled();
		});
	});

	describe('configure', () => {
		test('can be called without input', () => {
			const config = inAppMessaging.configure();

			expect(config).toMatchObject({});
		});

		test('attaches a storage helper to the config', () => {
			const config = inAppMessaging.configure({
				Notifications: notificationsConfig,
			});

			expect(config).toStrictEqual({
				...subcategoryConfig,
				storage: mockStorage,
			});
		});

		test('adds a Hub listener for analytics record events', () => {
			const recordCapsule = {
				payload: {
					event: 'record',
					data: simpleInAppMessagingEvent,
				},
			} as HubCapsule;
			const configuredCapsule = {
				payload: {
					event: 'configured',
				},
			} as HubCapsule;
			const dispatchEventSpy = jest.spyOn(inAppMessaging, 'dispatchEvent');
			hubSpy.mockImplementation((channel, callback) => {
				expect(channel).toBe('analytics');
				const analyticsListener = callback as HubCallback;
				// simulate analytics events by calling the registered callback directly
				analyticsListener(recordCapsule);
				analyticsListener(configuredCapsule);
				return () => {};
			});

			inAppMessaging.configure();

			expect(hubSpy).toBeCalled();
			expect(dispatchEventSpy).toBeCalledTimes(1);
		});

		test('does not listen to analytics events if `listenForAnalyticsEvents` is false', () => {
			const config = {
				Notifications: {
					InAppMessaging: { listenForAnalyticsEvents: false },
				},
			};
			inAppMessaging.configure(config);

			expect(hubSpy).not.toBeCalled();
		});
	});

	describe('syncMessages', () => {
		test('Gets in-app messages from added providers and stores them', async () => {
			await inAppMessaging.syncMessages();

			expect(mockStorage.setItem).toBeCalledWith(
				expect.stringContaining(PROVIDER_NAME),
				JSON.stringify(simpleInAppMessages)
			);
		});

		test('only tries to store messages if there are messages to store', async () => {
			mockInAppMessagingProvider.getInAppMessages.mockReturnValue(null);

			await inAppMessaging.syncMessages();

			expect(mockStorage.setItem).not.toBeCalled();
		});

		test('rejects if there is a failure getting messages', async () => {
			mockInAppMessagingProvider.getInAppMessages.mockImplementation(() => {
				throw new Error();
			});

			await expect(inAppMessaging.syncMessages()).rejects.toStrictEqual(
				expect.any(Error)
			);

			expect(mockStorage.setItem).not.toBeCalled();
		});

		test('logs error if storage sync fails', async () => {
			mockStorage.sync.mockImplementation(() => {
				throw new Error();
			});

			await inAppMessaging.syncMessages();

			expect(loggerErrorSpy).toBeCalledWith(
				expect.stringContaining('Failed to sync'),
				expect.any(Error)
			);
		});

		test('logs error if storage save fails', async () => {
			mockStorage.setItem.mockImplementation(() => {
				throw new Error();
			});

			await inAppMessaging.syncMessages();

			expect(loggerErrorSpy).toBeCalledWith(
				expect.stringContaining('Failed to store'),
				expect.any(Error)
			);
		});
	});

	describe('clearMessages', () => {
		test('clears in-app messages from store', async () => {
			await inAppMessaging.clearMessages();

			expect(mockStorage.removeItem).toBeCalledWith(
				expect.stringContaining(PROVIDER_NAME)
			);
		});

		test('logs error if storage remove fails', async () => {
			mockStorage.removeItem.mockImplementation(() => {
				throw new Error();
			});

			await inAppMessaging.clearMessages();

			expect(loggerErrorSpy).toBeCalledWith(
				expect.stringContaining('Failed to remove'),
				expect.any(Error)
			);
		});
	});

	describe('dispatchEvent', () => {
		test('gets in-app messages from store and notifies listeners', async () => {
			const [message] = inAppMessages;
			mockInAppMessagingProvider.processInAppMessages.mockReturnValue([
				message,
			]);
			mockStorage.getItem.mockReturnValue(JSON.stringify(simpleInAppMessages));

			await inAppMessaging.dispatchEvent(simpleInAppMessagingEvent);

			expect(mockInAppMessagingProvider.processInAppMessages).toBeCalledWith(
				simpleInAppMessages,
				simpleInAppMessagingEvent
			);
			expect(notifyEventListeners).toBeCalledWith(
				InAppMessageInteractionEvent.MESSAGE_RECEIVED,
				message
			);
		});

		test('does not notify listeners if no messages are returned', async () => {
			mockInAppMessagingProvider.processInAppMessages.mockReturnValue([]);
			mockStorage.getItem.mockReturnValue(JSON.stringify(simpleInAppMessages));

			await inAppMessaging.dispatchEvent(simpleInAppMessagingEvent);

			expect(notifyEventListeners).not.toBeCalled();
		});

		test('logs error if storage retrieval fails', async () => {
			mockStorage.getItem.mockImplementation(() => {
				throw new Error();
			});

			await inAppMessaging.dispatchEvent(simpleInAppMessagingEvent);

			expect(loggerErrorSpy).toBeCalledWith(
				expect.stringContaining('Failed to retrieve'),
				expect.any(Error)
			);
		});
	});

	describe('identifyUser', () => {
		test('identifies users with pluggables', async () => {
			await inAppMessaging.identifyUser(userId, userInfo);

			const userAgentValue = getUserAgentValue(
				InAppMessagingAction.IdentifyUser
			);

			expect(mockInAppMessagingProvider.identifyUser).toBeCalledWith(
				userId,
				userInfo,
				userAgentValue
			);
		});

		test('rejects if there is a failure identifying user', async () => {
			mockInAppMessagingProvider.identifyUser.mockImplementation(() => {
				throw new Error();
			});

			await expect(
				inAppMessaging.identifyUser(userId, userInfo)
			).rejects.toStrictEqual(expect.any(Error));
		});
	});

	describe('Interaction events', () => {
		const handler = jest.fn();
		test('can be listened to by onMessageReceived', () => {
			inAppMessaging.onMessageReceived(handler);

			expect(addEventListener).toBeCalledWith(
				InAppMessageInteractionEvent.MESSAGE_RECEIVED,
				handler
			);
		});

		test('can be listened to by onMessageDisplayed', () => {
			inAppMessaging.onMessageDisplayed(handler);

			expect(addEventListener).toBeCalledWith(
				InAppMessageInteractionEvent.MESSAGE_DISPLAYED,
				handler
			);
		});

		test('can be listened to by onMessageDismissed', () => {
			inAppMessaging.onMessageDismissed(handler);

			expect(addEventListener).toBeCalledWith(
				InAppMessageInteractionEvent.MESSAGE_DISMISSED,
				handler
			);
		});

		test('can be listened to by onMessageActionTaken', () => {
			inAppMessaging.onMessageActionTaken(handler);

			expect(addEventListener).toBeCalledWith(
				InAppMessageInteractionEvent.MESSAGE_ACTION_TAKEN,
				handler
			);
		});

		test('can be notified by notifyMessageInteraction', () => {
			const [message] = inAppMessages;

			inAppMessaging.notifyMessageInteraction(
				message,
				InAppMessageInteractionEvent.MESSAGE_RECEIVED
			);

			expect(notifyEventListeners).toBeCalledWith(
				InAppMessageInteractionEvent.MESSAGE_RECEIVED,
				message
			);
		});
	});

	describe('Conflict handling', () => {
		test('has a default implementation', async () => {
			mockInAppMessagingProvider.processInAppMessages.mockReturnValue(
				inAppMessages
			);

			await inAppMessaging.dispatchEvent(simpleInAppMessagingEvent);

			expect(notifyEventListeners).toBeCalledWith(
				InAppMessageInteractionEvent.MESSAGE_RECEIVED,
				closestExpiryMessage
			);
		});

		test('can be customized through setConflictHandler', async () => {
			const customConflictHandler = messages =>
				messages.find(message => message.id === 'custom-handled');
			mockInAppMessagingProvider.processInAppMessages.mockReturnValue(
				inAppMessages
			);

			inAppMessaging.setConflictHandler(customConflictHandler);
			await inAppMessaging.dispatchEvent(simpleInAppMessagingEvent);

			expect(notifyEventListeners).toBeCalledWith(
				InAppMessageInteractionEvent.MESSAGE_RECEIVED,
				customHandledMessage
			);
		});
	});
});
