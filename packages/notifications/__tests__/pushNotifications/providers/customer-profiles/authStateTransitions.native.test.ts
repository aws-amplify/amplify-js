// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Amplify, Hub, fetchAuthSession } from '@aws-amplify/core';

import { customerProfilesConfig, pushToken } from '../../../testUtils/data';

jest.mock('@aws-amplify/core', () => ({
	...jest.requireActual('@aws-amplify/core'),
	fetchAuthSession: jest.fn(),
}));
jest.mock('@aws-amplify/react-native', () => ({
	getOperatingSystem: jest.fn(() => 'ios'),
	loadAsyncStorage: jest.fn(() => ({
		getItem: jest.fn().mockResolvedValue('persisted-device-id'),
		setItem: jest.fn().mockResolvedValue(undefined),
	})),
	loadAmplifyPushNotification: jest.fn(() => ({
		addMessageEventListener: jest.fn(() => ({ remove: jest.fn() })),
		addTokenEventListener: jest.fn(),
		completeNotification: jest.fn(),
		getConstants: jest.fn(() => ({
			NativeEvent: {
				BACKGROUND_MESSAGE_RECEIVED: 'BackgroundMessageReceived',
				FOREGROUND_MESSAGE_RECEIVED: 'ForegroundMessageReceived',
				LAUNCH_NOTIFICATION_OPENED: 'LaunchNotificationOpened',
				NOTIFICATION_OPENED: 'NotificationOpened',
				TOKEN_RECEIVED: 'TokenReceived',
			},
			NativeHeadlessTaskKey: 'PushNotificationHeadlessTaskKey',
		})),
		registerHeadlessTask: jest.fn(),
	})),
}));
// Jest does not apply React Native platform resolution, so the initializer's
// `./registerDevice` import would resolve to the web stub. Resolve it to the real
// native implementation — the register/sign path under test is NOT mocked.
jest.mock(
	'../../../../src/pushNotifications/providers/customer-profiles/apis/registerDevice',
	() =>
		require('../../../../src/pushNotifications/providers/customer-profiles/apis/registerDevice.native'),
);

const PROVIDER_PATH =
	'../../../../src/pushNotifications/providers/customer-profiles';
const DEVICE_ID = 'persisted-device-id';
const GUEST_IDENTITY_ID = 'us-east-1:guest-identity-id';
const AUTH_IDENTITY_ID = 'us-east-1:auth-identity-id';

const credentialsForIdentity = (identityId: string) => ({
	accessKeyId: `ASIA-${identityId}`,
	secretAccessKey: `secret-${identityId}`,
	sessionToken: `session-${identityId}`,
});

const flushMicrotasks = () =>
	new Promise(resolve => {
		setTimeout(resolve, 0);
	});

/**
 * These tests deliberately exercise the REAL credential path — `resolveCredentials`,
 * `signedFetch` and the SigV4 `signRequest` implementation are NOT mocked. Only the
 * auth-session boundary (`fetchAuthSession`) and the network boundary (`fetch`) are
 * stubbed, so each assertion reflects the identity that actually signs the request
 * and therefore the `principalId` the backend derives to own / gate the device row.
 */
describe('customer-profiles push device auth-state transitions (native)', () => {
	const mockFetchAuthSession = fetchAuthSession as jest.Mock;
	const mockFetch = jest.fn();

	interface LoadedProvider {
		initializePushNotifications(): void;
		setToken(token: string): void;
		registerDevice(input: { token: string }): Promise<void>;
		removeDevice(): Promise<void>;
	}

	// The initializer, token manager, initialization manager and deviceId resolver
	// all hold module state, so every test loads them from one fresh registry (a
	// single registry per test keeps `isInitialized` shared across them).
	const loadProvider = (): LoadedProvider => {
		let loaded!: LoadedProvider;
		jest.isolateModules(() => {
			const { initializePushNotifications } = require(
				`${PROVIDER_PATH}/apis/initializePushNotifications.native`,
			);
			const {
				setToken,
			} = require('../../../../src/pushNotifications/utils/tokenManager');
			const { registerDevice } = require(
				`${PROVIDER_PATH}/apis/registerDevice.native`,
			);
			const { removeDevice } = require(
				`${PROVIDER_PATH}/apis/removeDevice.native`,
			);
			loaded = {
				initializePushNotifications,
				setToken,
				registerDevice,
				removeDevice,
			};
		});

		return loaded;
	};

	const signInAs = (identityId: string) => {
		mockFetchAuthSession.mockResolvedValue({
			identityId,
			credentials: credentialsForIdentity(identityId),
		});
	};

	const getAuthListener = () =>
		(Hub.listen as jest.Mock).mock.calls.find(call => call[0] === 'auth')![1];

	const signedRequests = () =>
		mockFetch.mock.calls.map(([url, request]) => ({
			url: url as string,
			authorization: (request.headers as Record<string, string>).authorization,
			body: JSON.parse(request.body as string),
		}));

	beforeAll(() => {
		(global as any).fetch = mockFetch;
	});

	beforeEach(() => {
		jest.spyOn(Amplify, 'getConfig').mockReturnValue({
			Notifications: {
				PushNotification: { CustomerProfiles: customerProfilesConfig } as any,
			},
		});
		jest.spyOn(Hub, 'listen');
		mockFetch.mockResolvedValue({ ok: true, status: 200 });
		signInAs(AUTH_IDENTITY_ID);
	});

	afterEach(() => {
		jest.restoreAllMocks();
		mockFetch.mockReset();
		mockFetchAuthSession.mockReset();
	});

	describe('sign-in re-registration (Hub listener)', () => {
		it('re-registers the device, signing with the now-authenticated identity', async () => {
			const { initializePushNotifications, setToken } = loadProvider();
			initializePushNotifications();
			setToken(pushToken);

			// A returning user signs in: the push token is unchanged so the native
			// token listener never fires, and the identityId flips guest ->
			// authenticated. The signedIn handler is what re-homes the device.
			signInAs(AUTH_IDENTITY_ID);
			getAuthListener()({ payload: { event: 'signedIn' } });
			await flushMicrotasks();

			expect(Hub.listen).toHaveBeenCalledWith('auth', expect.any(Function));
			const requests = signedRequests();
			expect(requests).toHaveLength(1);
			expect(requests[0].url).toBe(
				`${customerProfilesConfig.endpoint}/register-device`,
			);
			expect(requests[0].body).toStrictEqual({
				device: {
					token: pushToken,
					deviceId: DEVICE_ID,
					platform: expect.any(String),
					appVersion: '',
					channelType: 'APNS_SANDBOX',
				},
			});
			// The request is signed with the AUTHENTICATED identity's access key, so
			// the backend derives that principal as the owner of the device row.
			expect(requests[0].authorization).toContain('AWS4-HMAC-SHA256');
			expect(requests[0].authorization).toContain(
				`Credential=ASIA-${AUTH_IDENTITY_ID}/`,
			);
			expect(requests[0].authorization).not.toContain(GUEST_IDENTITY_ID);
		});

		it('does NOT reach the network when no token has been received yet', async () => {
			const { initializePushNotifications } = loadProvider();
			initializePushNotifications();

			getAuthListener()({ payload: { event: 'signedIn' } });
			await flushMicrotasks();

			expect(mockFetch).not.toHaveBeenCalled();
			expect(mockFetchAuthSession).not.toHaveBeenCalled();
		});

		it('does NOT attempt a removal on signedOut (removal after sign-out cannot work)', async () => {
			const { initializePushNotifications, setToken } = loadProvider();
			initializePushNotifications();
			setToken(pushToken);

			// After `signOut` the session is a brand-new guest identity — a removal
			// signed with it would be a silent no-op against the principal-gated
			// backend, so no request must be attempted at all.
			signInAs(GUEST_IDENTITY_ID);
			getAuthListener()({ payload: { event: 'signedOut' } });
			await flushMicrotasks();

			expect(mockFetch).not.toHaveBeenCalled();
		});
	});

	describe('credential path: the identity that signs each call', () => {
		const initializeProvider = (): LoadedProvider => {
			const provider = loadProvider();
			provider.initializePushNotifications();
			provider.setToken(pushToken);

			return provider;
		};

		it('signs register-device with the identity fetchAuthSession returns', async () => {
			const { registerDevice } = initializeProvider();
			signInAs(AUTH_IDENTITY_ID);

			await registerDevice({ token: pushToken });

			const [request] = signedRequests();
			expect(request.url).toBe(
				`${customerProfilesConfig.endpoint}/register-device`,
			);
			expect(request.authorization).toContain(
				`Credential=ASIA-${AUTH_IDENTITY_ID}/`,
			);
			expect(request.authorization).toContain(
				'/us-east-1/execute-api/aws4_request',
			);
			// The client never sends an identity — the backend derives principalId
			// from the signer.
			expect(JSON.stringify(request.body)).not.toContain(AUTH_IDENTITY_ID);
		});

		it('signs remove-device with the CURRENT identity, so a guest session cannot remove the authenticated row', async () => {
			const { registerDevice, removeDevice } = initializeProvider();

			signInAs(AUTH_IDENTITY_ID);
			await registerDevice({ token: pushToken });

			// Sign-out replaces the session with a fresh guest identity.
			signInAs(GUEST_IDENTITY_ID);
			await removeDevice();

			const [registerRequest, removeRequest] = signedRequests();
			expect(registerRequest.authorization).toContain(
				`Credential=ASIA-${AUTH_IDENTITY_ID}/`,
			);
			expect(removeRequest.url).toBe(
				`${customerProfilesConfig.endpoint}/remove-device`,
			);
			expect(removeRequest.body).toStrictEqual({ deviceId: DEVICE_ID });
			// Same deviceId, DIFFERENT signing principal: the backend gate means this
			// removal does not delete the row registered above. This is why apps must
			// call `removeDevice()` before `signOut()`.
			expect(removeRequest.authorization).toContain(
				`Credential=ASIA-${GUEST_IDENTITY_ID}/`,
			);
			expect(removeRequest.authorization).not.toContain(AUTH_IDENTITY_ID);
		});

		it('signs remove-device with the authenticated identity when called BEFORE sign-out', async () => {
			const { registerDevice, removeDevice } = initializeProvider();
			signInAs(AUTH_IDENTITY_ID);

			await registerDevice({ token: pushToken });
			await removeDevice();

			const [registerRequest, removeRequest] = signedRequests();
			expect(registerRequest.body.device.deviceId).toBe(DEVICE_ID);
			expect(removeRequest.body.deviceId).toBe(DEVICE_ID);
			// Both calls sign with the SAME authenticated principal, so the backend
			// gate permits the removal.
			expect(removeRequest.authorization).toContain(
				`Credential=ASIA-${AUTH_IDENTITY_ID}/`,
			);
		});

		it('rejects when the session has no credentials to sign with', async () => {
			const { registerDevice } = initializeProvider();
			mockFetchAuthSession.mockResolvedValue({
				identityId: undefined,
				credentials: undefined,
			});

			await expect(registerDevice({ token: pushToken })).rejects.toThrow(
				'Credentials should not be empty.',
			);
			expect(mockFetch).not.toHaveBeenCalled();
		});
	});
});
