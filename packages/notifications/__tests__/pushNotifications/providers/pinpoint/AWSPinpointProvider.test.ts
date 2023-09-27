// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { updateEndpoint } from '@aws-amplify/core/internals/aws-clients/pinpoint';

import { addEventListener } from '../../../../src/common/eventListeners';
import { Platform } from '../../../../src/pushNotifications/Platform';
import { AWSPinpointMessageEvent } from '../../../../src/pushNotifications/providers/AWSPinpointProvider/types';
import {
	logger as mockLogger,
	getAnalyticsEvent as mockGetAnalyticsEvent,
} from '../../../../src/pushNotifications/providers/AWSPinpointProvider/utils';

import {
	awsPinpointConfig,
	credentials,
	pushNotificationApnsConfig,
	pushNotificationFcmConfig,
	pushToken,
	simplePushMessage,
} from '../../../../__mocks__/data';
import { mockStorage } from '../../../../__mocks__/mocks';
import AWSPinpointProvider from '../../../../src/pushNotifications/providers/AWSPinpointProvider';

jest.mock('@aws-amplify/core');
jest.mock('@aws-amplify/core/internals/aws-clients/pinpoint');
jest.mock('../../../../src/common/eventListeners');
jest.mock('../../../../src/pushNotifications/Platform');
jest.mock(
	'../../../../src/pushNotifications/providers/AWSPinpointProvider/utils'
);

// const getStorageSpy = jest.spyOn(StorageHelper.prototype, 'getStorage');
// const credentialsGetSpy = jest.spyOn(Credentials, 'get');
// const credentialsShearSpy = jest.spyOn(Credentials, 'shear');
const mockAddEventListener = addEventListener as jest.Mock;
const mockUpdateEndpoint = updateEndpoint as jest.Mock;

describe('AWSPinpoint InAppMessaging Provider', () => {
	let provider: AWSPinpointProvider;
	let mockStorageMemory = {};
	const os = Platform.OS;
	beforeAll(() => {
		mockStorage.setItem.mockImplementation((key, val) => {
			mockStorageMemory[key] = val;
		});
		mockStorage.getItem.mockImplementation(key => mockStorageMemory[key]);
	});
	beforeEach(() => {
		jest.clearAllMocks();
		// getStorageSpy.mockReturnValue(mockStorage);
		// credentialsGetSpy.mockResolvedValue(credentials);
		// credentialsShearSpy.mockImplementation(credentials => credentials);
		mockStorageMemory = {};
		provider = new AWSPinpointProvider();
	});
	afterAll(() => {
		Platform.OS = os;
	});

	describe('configure', () => {
		test('is not supported except on ios and android', () => {
			expect(provider.configure).toThrow(/Function not supported/);
		});

		test('attaches APNS channel info', () => {
			Platform.OS = 'ios';
			const config = provider.configure();

			expect(config).toMatchObject(pushNotificationApnsConfig);
		});

		test('attaches FCM channel info', () => {
			Platform.OS = 'android';
			const config = provider.configure();

			expect(config).toMatchObject(pushNotificationFcmConfig);
		});

		describe('push notification event listeners', () => {
			let handlers: Function[];
			let removers: Function[];
			beforeEach(() => {
				handlers = [];
				removers = [];
				mockAddEventListener.mockImplementation((_, handleEvent) => {
					const remove = jest.fn();
					handlers.push(handleEvent);
					removers.push(remove);
					return { handleEvent, remove };
				});
				provider.configure();
			});

			test('background received listener', () => {
				handlers[0](simplePushMessage);
				expect(mockGetAnalyticsEvent).toBeCalledWith(
					simplePushMessage,
					AWSPinpointMessageEvent.BACKGROUND_MESSAGE_RECEIVED
				);
			});

			test('foreground received listener', () => {
				handlers[1](simplePushMessage);
				expect(mockGetAnalyticsEvent).toBeCalledWith(
					simplePushMessage,
					AWSPinpointMessageEvent.FOREGROUND_MESSAGE_RECEIVED
				);
			});

			test('launch notification opened listener', () => {
				handlers[2](simplePushMessage);
				expect(mockGetAnalyticsEvent).toBeCalledWith(
					simplePushMessage,
					AWSPinpointMessageEvent.NOTIFICATION_OPENED
				);
				expect(removers[2]).toBeCalled();
			});

			test('notification opened listener', () => {
				handlers[3](simplePushMessage);
				expect(mockGetAnalyticsEvent).toBeCalledWith(
					simplePushMessage,
					AWSPinpointMessageEvent.NOTIFICATION_OPENED
				);
				expect(removers[2]).toBeCalled();
			});
		});
	});

	describe('registerDevice', () => {
		beforeEach(() => {
			provider.configure(awsPinpointConfig);
		});

		// TODO(V6): requires mocking config
		// test('registers device with Pinpoint', async () => {
		// 	await provider.registerDevice(pushToken);
		// 	expect(mockUpdateEndpoint).toBeCalled();
		// });

		test('throws an error on client failure', async () => {
			mockUpdateEndpoint.mockImplementationOnce(() => {
				throw new Error();
			});

			await expect(provider.registerDevice(pushToken)).rejects.toThrow();

			expect(mockLogger.error).toBeCalledWith(
				expect.stringContaining('Error registering device'),
				expect.any(Error)
			);
		});
	});
});
