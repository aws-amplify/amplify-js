// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { KeyValueStorageInterface } from '@aws-amplify/core';
import { registerContextTokenOrchestrator } from '@aws-amplify/core/internals/utils';
import { createMockAmplifyContext } from '@aws-amplify/core/internals/testing';

import { signInWithSRP } from '../../../src/providers/cognito/apis/signInWithSRP';
import * as signInHelpers from '../../../src/providers/cognito/utils/signInHelpers';
import { DefaultTokenStore } from '../../../src/providers/cognito/tokenProvider/TokenStore';
import { TokenOrchestrator } from '../../../src/providers/cognito/tokenProvider/TokenOrchestrator';
import { tokenOrchestrator as globalTokenOrchestrator } from '../../../src/providers/cognito/tokenProvider';
import { refreshAuthTokensWithoutDedupe } from '../../../src/providers/cognito/utils/refreshAuthTokens';
import { RespondToAuthChallengeCommandOutput } from '../../../src/foundation/factories/serviceClients/cognitoIdentityProvider/types';

import { authAPITestParams } from './testUtils/authApiTestParams';

jest.mock('../../../src/providers/cognito/utils/dispatchSignedInHubEvent');
jest.mock('../../../src/providers/cognito/utils/getNewDeviceMetadata', () => ({
	getNewDeviceMetadata: jest.fn().mockResolvedValue(undefined),
}));

const authConfig = {
	Cognito: {
		userPoolClientId: '111111-aaaaa-42d8-891d-ee81a1549398',
		userPoolId: 'us-west-2_zzzzz',
	},
};

const createMemoryStorage = (): KeyValueStorageInterface => {
	const store = new Map<string, string>();

	return {
		setItem: async (key, value) => {
			store.set(key, value);
		},
		getItem: async key => store.get(key) ?? null,
		removeItem: async key => {
			store.delete(key);
		},
		clear: async () => {
			store.clear();
		},
	};
};

/**
 * Builds the write-capable per-context orchestrator exactly the way
 * `createUserPoolsTokenProvider` does for a local `AmplifyContext`.
 */
const createContextOrchestrator = (): TokenOrchestrator => {
	const tokenStore = new DefaultTokenStore();
	tokenStore.setAuthConfig(authConfig);
	tokenStore.setKeyValueStorage(createMemoryStorage());

	const orchestrator = new TokenOrchestrator();
	orchestrator.setAuthConfig(authConfig);
	orchestrator.setAuthTokenStore(tokenStore);
	orchestrator.setTokenRefresher(refreshAuthTokensWithoutDedupe);

	return orchestrator;
};

/**
 * Regression guard for the local-context sign-in defect: token WRITES were
 * per-context but every `signIn*` entry point handed the flow the module-level
 * GLOBAL singleton orchestrator. Because that singleton is never configured on
 * the `createAmplifyContext()` path, the device-metadata read during the SRP
 * PASSWORD_VERIFIER challenge threw `AuthUserPoolException: Auth UserPool not
 * configured` several frames BEFORE token persistence was reached.
 *
 * The global singleton is deliberately left UNCONFIGURED here — that is the
 * condition the pre-existing mocked signIn tests never exercised.
 */
describe('signIn entry point token orchestrator resolution', () => {
	let handleUserSRPAuthFlowSpy: jest.SpyInstance;
	let contextOrchestrator: TokenOrchestrator;

	beforeEach(() => {
		jest.clearAllMocks();
		contextOrchestrator = createContextOrchestrator();

		// Mirror the real flow: the orchestrator it is handed is used for an
		// early device-metadata read, long before tokens are cached.
		handleUserSRPAuthFlowSpy = jest
			.spyOn(signInHelpers, 'handleUserSRPAuthFlow')
			.mockImplementation(
				async (
					...args: any[]
				): Promise<RespondToAuthChallengeCommandOutput> => {
					const [username, , , , orchestrator] = args;
					await orchestrator.getDeviceMetadata(username);

					return authAPITestParams.RespondToAuthChallengeCommandOutput;
				},
			);
	});

	afterEach(() => {
		handleUserSRPAuthFlowSpy.mockRestore();
	});

	const createLocalCtx = () => {
		const tokenProvider = { getTokens: jest.fn() };
		registerContextTokenOrchestrator(tokenProvider, contextOrchestrator);

		return createMockAmplifyContext(
			{ Auth: authConfig },
			{ libraryOptions: { Auth: { tokenProvider } } },
		);
	};

	it('signs in through a local context without throwing AuthUserPoolException', async () => {
		const setTokensSpy = jest.spyOn(contextOrchestrator, 'setTokens');
		const globalSetTokensSpy = jest.spyOn(globalTokenOrchestrator, 'setTokens');

		const result = await signInWithSRP(createLocalCtx(), {
			username: authAPITestParams.user1.username,
			password: authAPITestParams.user1.password,
		});

		expect(result.isSignedIn).toBe(true);
		expect(setTokensSpy).toHaveBeenCalledTimes(1);
		expect(globalSetTokensSpy).not.toHaveBeenCalled();

		setTokensSpy.mockRestore();
		globalSetTokensSpy.mockRestore();
	});

	it('hands the per-context orchestrator to the SRP flow, not the global singleton', async () => {
		await signInWithSRP(createLocalCtx(), {
			username: authAPITestParams.user1.username,
			password: authAPITestParams.user1.password,
		});

		expect(handleUserSRPAuthFlowSpy).toHaveBeenCalledTimes(1);
		const passedOrchestrator = handleUserSRPAuthFlowSpy.mock.calls[0][4];
		expect(passedOrchestrator).toBe(contextOrchestrator);
		expect(passedOrchestrator).not.toBe(globalTokenOrchestrator);
	});

	it('still uses the global singleton when the context has no registered provider', async () => {
		const globalCtx = createMockAmplifyContext({ Auth: authConfig });

		// The unconfigured global singleton is what the flow gets, so the early
		// device-metadata read fails — proving the fallback path is intact and
		// that this test setup genuinely reproduces the original defect.
		await expect(
			signInWithSRP(globalCtx, {
				username: authAPITestParams.user1.username,
				password: authAPITestParams.user1.password,
			}),
		).rejects.toThrow();

		expect(handleUserSRPAuthFlowSpy.mock.calls[0][4]).toBe(
			globalTokenOrchestrator,
		);
	});
});
