// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	clearGlobalContext,
	setGlobalContext,
} from '@aws-amplify/core/internals/utils';
import { Hub } from '@aws-amplify/core';

import { createMockAmplifyContext } from '../../../../testUtils/createMockAmplifyContext';
import {
	getToken,
	isInitialized,
} from '../../../../../src/pushNotifications/utils';
import { registerDevice } from '../../../../../src/pushNotifications/providers/customer-profiles/apis/registerDevice';
import { pushModuleConstants, pushToken } from '../../../../testUtils/data';

jest.mock('@aws-amplify/core', () => ({
	...jest.requireActual('@aws-amplify/core'),
	ConsoleLogger: jest.fn(() => ({
		info: jest.fn(),
		error: jest.fn(),
	})),
	Hub: { listen: jest.fn() },
}));
jest.mock('@aws-amplify/react-native', () => ({
	getOperatingSystem: jest.fn(),
	loadAmplifyPushNotification: jest.fn(() => ({
		addMessageEventListener: mockAddMessageEventListener,
		addTokenEventListener: mockAddTokenEventListener,
		completeNotification: jest.fn(),
		getConstants: mockGetConstants,
		registerHeadlessTask: jest.fn(),
	})),
}));
jest.mock('../../../../../src/eventListeners');
jest.mock(
	'../../../../../src/pushNotifications/providers/customer-profiles/utils',
);
jest.mock(
	'../../../../../src/pushNotifications/providers/customer-profiles/apis/registerDevice',
);
jest.mock('../../../../../src/pushNotifications/utils');

const mockAddMessageEventListener = jest.fn();
const mockAddTokenEventListener = jest.fn();
const mockGetConstants = jest.fn();

const mockRegisterDevice = registerDevice as jest.Mock;
const mockHubListen = Hub.listen as jest.Mock;
const mockGetToken = getToken as jest.Mock;
const mockIsInitialized = isInitialized as jest.Mock;

describe('initializePushNotifications (customer-profiles, native) — reconfigure support', () => {
	let initializePushNotifications: (...args: any[]) => void;

	const ctxA = createMockAmplifyContext({
		Notifications: {
			PushNotification: {
				CustomerProfiles: {
					endpoint: 'https://a.example.com',
					region: 'us-west-2',
				},
			},
		},
	});
	const ctxB = createMockAmplifyContext({
		Notifications: {
			PushNotification: {
				CustomerProfiles: {
					endpoint: 'https://b.example.com',
					region: 'us-east-1',
				},
			},
		},
	});

	beforeAll(() => {
		({
			initializePushNotifications,
		} = require('../../../../../src/pushNotifications/providers/customer-profiles/apis/initializePushNotifications.native'));
	});

	beforeEach(() => {
		mockGetConstants.mockReturnValue(pushModuleConstants);
		mockIsInitialized.mockReturnValue(false);
		mockRegisterDevice.mockResolvedValue(undefined);
		mockAddMessageEventListener.mockReturnValue({ remove: jest.fn() });
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	afterAll(() => {
		clearGlobalContext();
	});

	it('token listener uses updated global context after reconfigure', async () => {
		setGlobalContext(ctxA);
		mockGetToken.mockReturnValue(undefined);

		let tokenHandler: (token: string) => Promise<void>;
		mockAddTokenEventListener.mockImplementation((_event, handler) => {
			tokenHandler = handler;
		});

		initializePushNotifications();

		// First token — ctx should be ctxA
		await tokenHandler!('token-1');
		expect(mockRegisterDevice).toHaveBeenCalledWith(ctxA, { token: 'token-1' });

		// Reconfigure
		setGlobalContext(ctxB);
		mockGetToken.mockReturnValue('token-1');
		mockRegisterDevice.mockClear();

		// Second token — ctx should be ctxB
		await tokenHandler!('token-2');
		expect(mockRegisterDevice).toHaveBeenCalledWith(ctxB, { token: 'token-2' });
	});

	it('auth listener uses updated global context after reconfigure', async () => {
		setGlobalContext(ctxA);
		mockGetToken.mockReturnValue(pushToken);

		initializePushNotifications();

		const authHandler = mockHubListen.mock.calls.find(
			call => call[0] === 'auth',
		)![1];

		// Fire auth event with ctxA
		authHandler({ payload: { event: 'signedIn' } });
		await Promise.resolve();
		expect(mockRegisterDevice).toHaveBeenCalledWith(ctxA, { token: pushToken });

		// Reconfigure
		setGlobalContext(ctxB);
		mockRegisterDevice.mockClear();

		// Fire auth event again — should now use ctxB
		authHandler({ payload: { event: 'signedIn' } });
		await Promise.resolve();
		expect(mockRegisterDevice).toHaveBeenCalledWith(ctxB, { token: pushToken });
	});

	it('explicit ctx remains pinned even after global context changes', async () => {
		const explicitCtx = createMockAmplifyContext({
			Notifications: {
				PushNotification: {
					CustomerProfiles: {
						endpoint: 'https://explicit.example.com',
						region: 'eu-west-1',
					},
				},
			},
		});

		setGlobalContext(ctxA);
		mockGetToken.mockReturnValue(undefined);

		let tokenHandler: (token: string) => Promise<void>;
		mockAddTokenEventListener.mockImplementation((_event, handler) => {
			tokenHandler = handler;
		});

		// Initialize with explicit context
		initializePushNotifications(explicitCtx);

		// Change global context
		setGlobalContext(ctxB);

		// Token event should still use explicitCtx
		await tokenHandler!('token-pinned');
		expect(mockRegisterDevice).toHaveBeenCalledWith(explicitCtx, {
			token: 'token-pinned',
		});
	});
});
