// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { createMockAmplifyContext } from '@aws-amplify/core/internals/testing';
import { updateEndpoint } from '@aws-amplify/core/internals/providers/pinpoint';
import {
	clearGlobalContext,
	setGlobalContext,
} from '@aws-amplify/core/internals/utils';

import {
	getToken,
	isInitialized,
	resolveCredentials,
} from '../../../../../src/pushNotifications/utils';
import { resolveConfig } from '../../../../../src/pushNotifications/providers/pinpoint/utils';
import { credentials, pushModuleConstants } from '../../../../testUtils/data';

jest.mock('@aws-amplify/core/internals/providers/pinpoint');
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
jest.mock('../../../../../src/pushNotifications/providers/pinpoint/utils');
jest.mock('../../../../../src/pushNotifications/utils');

const mockAddMessageEventListener = jest.fn();
const mockAddTokenEventListener = jest.fn();
const mockGetConstants = jest.fn();

const mockUpdateEndpoint = updateEndpoint as jest.Mock;
const mockGetToken = getToken as jest.Mock;
const mockIsInitialized = isInitialized as jest.Mock;
const mockResolveCredentials = resolveCredentials as jest.Mock;
const mockResolveConfig = resolveConfig as jest.Mock;

describe('initializePushNotifications (native) — reconfigure support', () => {
	let initializePushNotifications: (...args: any[]) => Promise<void>;

	const configA = { appId: 'app-A', region: 'us-west-2' };
	const configB = { appId: 'app-B', region: 'us-east-1' };
	const ctxA = createMockAmplifyContext({
		Notifications: { PushNotification: { Pinpoint: configA } },
	});
	const ctxB = createMockAmplifyContext({
		Notifications: { PushNotification: { Pinpoint: configB } },
	});

	beforeAll(() => {
		({
			initializePushNotifications,
		} = require('../../../../../src/pushNotifications/providers/pinpoint/apis/initializePushNotifications.native'));
	});

	beforeEach(() => {
		mockGetConstants.mockReturnValue(pushModuleConstants);
		mockIsInitialized.mockReturnValue(false);
		mockResolveCredentials.mockResolvedValue(credentials);
		mockAddMessageEventListener.mockReturnValue({ remove: jest.fn() });
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	afterAll(() => {
		clearGlobalContext();
	});

	it('token listener uses updated global context after Amplify.configure() is called again', async () => {
		// Set initial global context
		setGlobalContext(ctxA);
		mockResolveConfig.mockReturnValue(configA);
		mockGetToken.mockReturnValue(undefined);

		// Capture the token handler
		let tokenHandler: (token: string) => Promise<void>;
		mockAddTokenEventListener.mockImplementation((_event, handler) => {
			tokenHandler = handler;
		});

		initializePushNotifications();

		// First token event — should use configA
		mockResolveConfig.mockReturnValue(configA);
		await tokenHandler!('token-1');
		expect(mockUpdateEndpoint).toHaveBeenCalledWith(
			expect.objectContaining({ appId: configA.appId, region: configA.region }),
		);

		// Simulate Amplify.configure() swapping global context to ctxB
		setGlobalContext(ctxB);
		mockResolveConfig.mockReturnValue(configB);
		mockGetToken.mockReturnValue('token-1'); // different token needed
		mockUpdateEndpoint.mockClear();

		// Second token event — should resolve configB from the new global context
		await tokenHandler!('token-2');
		expect(mockResolveConfig).toHaveBeenCalledWith(ctxB);
		expect(mockResolveCredentials).toHaveBeenCalledWith(ctxB);
		expect(mockUpdateEndpoint).toHaveBeenCalledWith(
			expect.objectContaining({ appId: configB.appId, region: configB.region }),
		);
	});

	it('explicit ctx remains pinned even after global context changes', async () => {
		const explicitCtx = createMockAmplifyContext({
			Notifications: { PushNotification: { Pinpoint: configA } },
		});

		setGlobalContext(ctxB);
		mockResolveConfig.mockReturnValue(configA);
		mockGetToken.mockReturnValue(undefined);

		let tokenHandler: (token: string) => Promise<void>;
		mockAddTokenEventListener.mockImplementation((_event, handler) => {
			tokenHandler = handler;
		});

		// Initialize with explicit context
		initializePushNotifications(explicitCtx);

		// Change global context
		setGlobalContext(ctxB);
		mockUpdateEndpoint.mockClear();

		// Token event should still use configA (explicit ctx pinned)
		await tokenHandler!('token-explicit');
		expect(mockResolveConfig).toHaveBeenCalledWith(explicitCtx);
	});
});
