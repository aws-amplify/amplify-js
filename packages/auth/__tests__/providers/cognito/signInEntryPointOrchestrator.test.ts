// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AmplifyContext, KeyValueStorageInterface } from '@aws-amplify/core';
import { registerContextTokenOrchestrator } from '@aws-amplify/core/internals/utils';
import { createMockAmplifyContext } from '@aws-amplify/core/internals/testing';

import { signInWithSRP } from '../../../src/providers/cognito/apis/signInWithSRP';
import { signInWithUserPassword } from '../../../src/providers/cognito/apis/signInWithUserPassword';
import { signInWithCustomAuth } from '../../../src/providers/cognito/apis/signInWithCustomAuth';
import { signInWithCustomSRPAuth } from '../../../src/providers/cognito/apis/signInWithCustomSRPAuth';
import { signInWithUserAuth } from '../../../src/providers/cognito/apis/signInWithUserAuth';
import { confirmSignIn } from '../../../src/providers/cognito/apis/confirmSignIn';
import { handleWebAuthnSignInResult } from '../../../src/client/flows/userAuth/handleWebAuthnSignInResult';
import { handleUserAuthFlow } from '../../../src/client/flows/userAuth/handleUserAuthFlow';
import * as signInHelpers from '../../../src/providers/cognito/utils/signInHelpers';
import {
	resetActiveSignInState,
	setActiveSignInState,
} from '../../../src/client/utils/store/signInStore';
import { DefaultTokenStore } from '../../../src/providers/cognito/tokenProvider/TokenStore';
import { TokenOrchestrator } from '../../../src/providers/cognito/tokenProvider/TokenOrchestrator';
import { tokenOrchestrator as globalTokenOrchestrator } from '../../../src/providers/cognito/tokenProvider';
import { refreshAuthTokensWithoutDedupe } from '../../../src/providers/cognito/utils/refreshAuthTokens';
import { createRespondToAuthChallengeClient } from '../../../src/foundation/factories/serviceClients/cognitoIdentityProvider';
import { RespondToAuthChallengeCommandOutput } from '../../../src/foundation/factories/serviceClients/cognitoIdentityProvider/types';

import { authAPITestParams } from './testUtils/authApiTestParams';

jest.mock('../../../src/providers/cognito/utils/dispatchSignedInHubEvent');
jest.mock('../../../src/providers/cognito/utils/getNewDeviceMetadata', () => ({
	getNewDeviceMetadata: jest.fn().mockResolvedValue(undefined),
}));
jest.mock('../../../src/client/flows/userAuth/handleUserAuthFlow');
jest.mock('../../../src/client/utils/passkey', () => ({
	getPasskey: jest.fn().mockResolvedValue({ id: 'mock-credential' }),
}));
jest.mock(
	'../../../src/foundation/factories/serviceClients/cognitoIdentityProvider',
	() => ({
		...jest.requireActual(
			'../../../src/foundation/factories/serviceClients/cognitoIdentityProvider',
		),
		createRespondToAuthChallengeClient: jest.fn(),
	}),
);

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
	const { username, password } = authAPITestParams.user1;

	let contextOrchestrator: TokenOrchestrator;
	/** The orchestrator the flow under test was actually handed. */
	let receivedOrchestrator: unknown;

	beforeEach(() => {
		jest.clearAllMocks();
		resetActiveSignInState();
		receivedOrchestrator = undefined;
		contextOrchestrator = createContextOrchestrator();
	});

	afterEach(() => {
		jest.restoreAllMocks();
		resetActiveSignInState();
	});

	const createLocalCtx = () => {
		const tokenProvider = { getTokens: jest.fn() };
		registerContextTokenOrchestrator(tokenProvider, contextOrchestrator);

		return createMockAmplifyContext(
			{ Auth: authConfig },
			{ libraryOptions: { Auth: { tokenProvider } } },
		);
	};

	/**
	 * Mirrors the real flow: the orchestrator a flow helper is handed is used
	 * for an early device-metadata read, long before tokens are cached — which
	 * is where the original defect threw.
	 */
	const recordAndSucceed = async (
		orchestrator: any,
		flowUsername: string,
	): Promise<RespondToAuthChallengeCommandOutput> => {
		receivedOrchestrator = orchestrator;
		await orchestrator.getDeviceMetadata(flowUsername);

		return authAPITestParams.RespondToAuthChallengeCommandOutput;
	};

	/**
	 * Spies on a `signInHelpers` flow helper whose orchestrator argument sits at
	 * `orchestratorIndex` (username is always the first argument).
	 */
	const spyOnFlowHelper = (
		helper:
			| 'handleUserSRPAuthFlow'
			| 'handleUserPasswordAuthFlow'
			| 'handleCustomAuthFlowWithoutSRP'
			| 'handleCustomSRPAuthFlow'
			| 'handleChallengeName',
		orchestratorIndex: number,
	) =>
		jest
			.spyOn(signInHelpers, helper)
			.mockImplementation(async (...args: any[]) =>
				recordAndSucceed(args[orchestratorIndex], args[0]),
			);

	interface EntryPointCase {
		/** Installs the flow mock that records the orchestrator it receives. */
		arrange(): void;
		invoke(ctx: AmplifyContext): Promise<unknown>;
		/**
		 * `false` for entry points that resolve the orchestrator inline at the
		 * persistence step rather than threading it into a flow helper.
		 */
		threadsOrchestrator: boolean;
	}

	const entryPoints: [string, EntryPointCase][] = [
		[
			'signInWithSRP',
			{
				arrange: () => spyOnFlowHelper('handleUserSRPAuthFlow', 4),
				invoke: ctx => signInWithSRP(ctx, { username, password }),
				threadsOrchestrator: true,
			},
		],
		[
			'signInWithUserPassword',
			{
				arrange: () => spyOnFlowHelper('handleUserPasswordAuthFlow', 4),
				invoke: ctx => signInWithUserPassword(ctx, { username, password }),
				threadsOrchestrator: true,
			},
		],
		[
			'signInWithCustomAuth',
			{
				arrange: () => spyOnFlowHelper('handleCustomAuthFlowWithoutSRP', 3),
				// CUSTOM_WITHOUT_SRP rejects a password by design.
				invoke: ctx => signInWithCustomAuth(ctx, { username }),
				threadsOrchestrator: true,
			},
		],
		[
			'signInWithCustomSRPAuth',
			{
				arrange: () => spyOnFlowHelper('handleCustomSRPAuthFlow', 4),
				invoke: ctx => signInWithCustomSRPAuth(ctx, { username, password }),
				threadsOrchestrator: true,
			},
		],
		[
			'signInWithUserAuth',
			{
				arrange: () => {
					jest
						.mocked(handleUserAuthFlow)
						.mockImplementation(async (input: any) =>
							recordAndSucceed(input.tokenOrchestrator, input.username),
						);
				},
				invoke: ctx => signInWithUserAuth(ctx, { username, password }),
				threadsOrchestrator: true,
			},
		],
		[
			'confirmSignIn',
			{
				arrange: () => {
					setActiveSignInState({
						signInSession: 'session-token',
						username,
						challengeName: 'SMS_MFA',
						signInDetails: { loginId: username },
					});
					spyOnFlowHelper('handleChallengeName', 5);
				},
				invoke: ctx => confirmSignIn(ctx, { challengeResponse: '123456' }),
				threadsOrchestrator: true,
			},
		],
		[
			'handleWebAuthnSignInResult',
			{
				arrange: () => {
					setActiveSignInState({
						signInSession: 'session-token',
						username,
						challengeName: 'WEB_AUTHN',
						signInDetails: { loginId: username },
					});
					jest
						.mocked(createRespondToAuthChallengeClient)
						.mockReturnValue(
							jest
								.fn()
								.mockResolvedValue(
									authAPITestParams.RespondToAuthChallengeCommandOutput,
								),
						);
				},
				invoke: ctx =>
					handleWebAuthnSignInResult(ctx, {
						CREDENTIAL_REQUEST_OPTIONS: '{}',
					}),
				// The orchestrator is resolved inline at `cacheCognitoTokens`.
				threadsOrchestrator: false,
			},
		],
	];

	describe.each(entryPoints)('%s', (_name, entryPoint) => {
		it('persists tokens through the per-context orchestrator, not the global singleton', async () => {
			const setTokensSpy = jest.spyOn(contextOrchestrator, 'setTokens');
			const globalSetTokensSpy = jest
				.spyOn(globalTokenOrchestrator, 'setTokens')
				.mockResolvedValue(undefined);
			entryPoint.arrange();

			await entryPoint.invoke(createLocalCtx());

			expect(setTokensSpy).toHaveBeenCalledTimes(1);
			expect(globalSetTokensSpy).not.toHaveBeenCalled();
		});

		if (entryPoint.threadsOrchestrator) {
			it('hands the per-context orchestrator to the flow', async () => {
				jest
					.spyOn(globalTokenOrchestrator, 'setTokens')
					.mockResolvedValue(undefined);
				entryPoint.arrange();

				await entryPoint.invoke(createLocalCtx());

				expect(receivedOrchestrator).toBe(contextOrchestrator);
				expect(receivedOrchestrator).not.toBe(globalTokenOrchestrator);
			});
		}
	});

	it('signs in through a local context without throwing AuthUserPoolException', async () => {
		spyOnFlowHelper('handleUserSRPAuthFlow', 4);

		const result = await signInWithSRP(createLocalCtx(), {
			username,
			password,
		});

		expect(result.isSignedIn).toBe(true);
	});

	it('still uses the global singleton when the context has no registered provider', async () => {
		const spy = spyOnFlowHelper('handleUserSRPAuthFlow', 4);
		const globalCtx = createMockAmplifyContext({ Auth: authConfig });

		// The unconfigured global singleton is what the flow gets, so the early
		// device-metadata read fails — proving the fallback path is intact and
		// that this test setup genuinely reproduces the original defect.
		await expect(
			signInWithSRP(globalCtx, { username, password }),
		).rejects.toThrow();

		expect(spy.mock.calls[0][4]).toBe(globalTokenOrchestrator);
	});
});
