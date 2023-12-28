// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	assertOAuthConfig,
	assertTokenProviderConfig,
} from '@aws-amplify/core/internals/utils';

import { attemptCompleteOAuthFlow } from '../../../../../src/providers/cognito/utils/oauth/attemptCompleteOAuthFlow';
import { completeOAuthFlow } from '../../../../../src/providers/cognito/utils/oauth/completeOAuthFlow';
import { getRedirectUrl } from '../../../../../src/providers/cognito/utils/oauth/getRedirectUrl';
import { oAuthStore } from '../../../../../src/providers/cognito/utils/oauth/oAuthStore';
import { addInflightPromise } from '../../../../../src/providers/cognito/utils/oauth/inflightPromise';
import { cognitoUserPoolsTokenProvider } from '../../../../../src/providers/cognito/tokenProvider/tokenProvider';
import { mockAuthConfigWithOAuth } from '../../../../mockData';

import type { OAuthStore } from '../../../../../src/providers/cognito/utils/types';

jest.mock('@aws-amplify/core/internals/utils');
jest.mock('../../../../../src/providers/cognito/utils/oauth/completeOAuthFlow');
jest.mock('../../../../../src/providers/cognito/utils/oauth/getRedirectUrl');
jest.mock(
	'../../../../../src/providers/cognito/utils/oauth/oAuthStore',
	() => ({
		oAuthStore: {
			setAuthConfig: jest.fn(),
			storeOAuthInFlight: jest.fn(),
			storeOAuthState: jest.fn(),
			storePKCE: jest.fn(),
			loadOAuthInFlight: jest.fn(),
			loadOAuthSignIn: jest.fn(),
			storeOAuthSignIn: jest.fn(),
			loadOAuthState: jest.fn(),
			loadPKCE: jest.fn(),
			clearOAuthData: jest.fn(),
			clearOAuthInflightData: jest.fn(),
		} as OAuthStore,
	})
);
jest.mock(
	'../../../../../src/providers/cognito/tokenProvider/tokenProvider',
	() => ({
		cognitoUserPoolsTokenProvider: {
			setWaitForInflightOAuth: jest.fn(),
		},
	})
);
jest.mock(
	'../../../../../src/providers/cognito/utils/oauth/inflightPromise',
	() => ({
		addInflightPromise: jest.fn(resolver => {
			resolver();
		}),
	})
);

const mockAssertOAuthConfig = assertOAuthConfig as jest.Mock;
const mockAssertTokenProviderConfig = assertTokenProviderConfig as jest.Mock;
const mockCompleteOAuthFlow = completeOAuthFlow as jest.Mock;
const mockGetRedirectUrl = getRedirectUrl as jest.Mock;
const mockAddInflightPromise = addInflightPromise as jest.Mock;

describe('attemptCompleteOAuthFlow', () => {
	let windowSpy = jest.spyOn(window, 'window', 'get');
	const mockRedirectUrl = 'http://localhost:3000/';

	beforeAll(() => {
		(oAuthStore.loadOAuthInFlight as jest.Mock).mockResolvedValue(false);
		mockGetRedirectUrl.mockReturnValue(mockRedirectUrl);

		windowSpy.mockImplementation(
			() =>
				({
					location: {
						href: 'http://localhost:3000/',
						origin: 'http://localhost:3000',
						pathname: undefined,
					},
				}) as any
		);
	});

	afterAll(() => {
		windowSpy.mockRestore();
	});

	afterEach(() => {
		mockAssertTokenProviderConfig.mockClear();
		mockAssertOAuthConfig.mockClear();
		mockCompleteOAuthFlow.mockClear();

		(oAuthStore.setAuthConfig as jest.Mock).mockClear();
		(oAuthStore.loadOAuthInFlight as jest.Mock).mockClear();
	});

	it('invokes config asserters', async () => {
		const cognitoConfig = mockAuthConfigWithOAuth.Auth.Cognito;
		await attemptCompleteOAuthFlow(cognitoConfig);

		expect(mockAssertTokenProviderConfig).toHaveBeenCalledWith(cognitoConfig);
		expect(mockAssertOAuthConfig).toHaveBeenCalledWith(cognitoConfig);
		expect(oAuthStore.setAuthConfig).toHaveBeenCalledWith(cognitoConfig);
	});

	it('does nothing when `await oAuthStore.loadOAuthInFlight()` resolves `false` (there is no inflight oauth process)', async () => {
		await attemptCompleteOAuthFlow(mockAuthConfigWithOAuth.Auth.Cognito);

		expect(oAuthStore.loadOAuthInFlight).toHaveBeenCalledTimes(1);
		expect(mockCompleteOAuthFlow).not.toHaveBeenCalled();
	});

	it('sets inflight oauth promise and invokes `completeOAuthFlow` to complete an inflight oauth process', async () => {
		(oAuthStore.loadOAuthInFlight as jest.Mock).mockResolvedValueOnce(true);

		await attemptCompleteOAuthFlow(mockAuthConfigWithOAuth.Auth.Cognito);

		expect(mockCompleteOAuthFlow).toHaveBeenCalledWith(
			expect.objectContaining({
				currentUrl: 'http://localhost:3000/',
				redirectUri: 'http://localhost:3000/',
			})
		);

		expect(
			cognitoUserPoolsTokenProvider.setWaitForInflightOAuth
		).toHaveBeenCalledTimes(1);

		const callback = (
			cognitoUserPoolsTokenProvider.setWaitForInflightOAuth as jest.Mock
		).mock.calls[0][0];

		// the blocking promise should resolve
		expect(callback()).resolves.toBeUndefined();
	});

	test.each([
		['assertTokenProviderConfig', mockAssertTokenProviderConfig],
		['assertOAuthConfig', mockAssertOAuthConfig],
		['getRedirectUrl', mockGetRedirectUrl],
	])('when `%s` throws it does nothing', async (_, mockFunc) => {
		mockFunc.mockImplementationOnce(() => {
			throw new Error('some error');
		});
		expect(
			attemptCompleteOAuthFlow(mockAuthConfigWithOAuth.Auth.Cognito)
		).resolves.toBeUndefined();
	});
});
