import { createMachine, MachineConfig, AssignAction } from 'xstate';
import { createModel } from 'xstate/lib/model';
import {
	AuthorizationMachineContext,
	RefreshSessionContext,
	UserPoolTokens,
} from '../types/machines';
import { fetchAuthSessionStateMachine } from '../machines/fetchAuthSessionStateMachine';
import { cacheRefreshTokenResult } from '../service';
import { AWSCredentials } from '../../../types';
import { decodeJWT } from '../Util';

export const refreshSessionMachineModel = createModel(
	{
		awsCredentials: null,
		identityId: null,
		forceRefresh: false,
	} as RefreshSessionContext,
	{
		events: {
			refreshCognitoUserPool: () => ({}),
			refreshCognitoUserPoolWithIdentityId: () => ({}),
			refreshAWSCredentialsWithUserPool: () => ({}),
			refreshUnAuthAWSCredentials: () => ({}),
			refreshedCognitoUserPool: () => ({}),
			refreshedIdentityInfo: () => ({}),
			throwError: () => ({}),
			fetchedAWSCredentials: () => ({}),
			fetched: () => ({}),
		},
	}
);

const refreshAuthSessionStateMachineActions: Record<
	string,
	AssignAction<RefreshSessionContext, any>
> = {
	assignUnAuthedSession: refreshSessionMachineModel.assign({
		identityId: (context, event) => {
			return (event as any).data.identityID;
		},
		awsCredentials: (context, event) => (event as any).data.AWSCredentials,
	}),
	assignAWSCredentials: refreshSessionMachineModel.assign({
		awsCredentials: (context, event) => (event as any).data,
	}),
};

function isUserPoolTokensExpired(
	userPoolTokens: UserPoolTokens,
	bufferTime?: number
) {
	const { exp: idTokenExpiration } = decodeJWT(userPoolTokens.idToken);
	const { exp: accessTokenExpiration } = decodeJWT(userPoolTokens.accessToken);
	return (
		Date.now() / 1000 > idTokenExpiration ||
		Date.now() / 1000 > accessTokenExpiration
	);
}

async function invokeRefreshToken(
	context: RefreshSessionContext & {
		userPoolTokens: { refreshToken: string };
	},
	_event: any
) {
	const refreshTokensRes = await context.service.refreshUserPoolTokens(
		context.userPoolTokens.refreshToken
	);
	if (!refreshTokensRes.AuthenticationResult)
		throw new Error('no authentication result');
	if (
		!refreshTokensRes.AuthenticationResult.AccessToken ||
		!refreshTokensRes.AuthenticationResult.IdToken
	) {
		throw new Error('no access token or id token');
	}
	cacheRefreshTokenResult(refreshTokensRes);
	return {
		accessToken: refreshTokensRes.AuthenticationResult.AccessToken,
		idToken: refreshTokensRes.AuthenticationResult.IdToken,
	};
}

// Refresh Auth Session state machine
const refreshAuthSessionStateMachineConfig: MachineConfig<any, any, any> = {
	id: 'refreshAuthSessionStateMachine',
	initial: 'notStarted',
	context: refreshSessionMachineModel.initialContext,
	states: {
		notStarted: {
			on: {
				refreshCognitoUserPool: 'refreshingUserPoolToken',
				refreshCognitoUserPoolWithIdentityId:
					'refreshingUserPoolTokenWithIdentity',
				refreshAWSCredentialsWithUserPool:
					'refreshingAWSCredentialsWithUserPoolTokens',
				refreshUnAuthAWSCredentials: 'refreshingUnAuthAWSCredentials',
			},
			always: [
				{
					target: 'refreshingUserPoolToken',
					cond: (context: RefreshSessionContext) =>
						context.userPoolTokens
							? isUserPoolTokensExpired(context.userPoolTokens) ||
							  context.forceRefresh
							: false,
				},
				{
					target: 'refreshingUserPoolTokenWithIdentity',
					cond: (context: RefreshSessionContext) =>
						context.userPoolTokens
							? Boolean(
									isUserPoolTokensExpired(context.userPoolTokens) &&
										context.identityId
							  ) || context.forceRefresh
							: false,
				},
				{
					target: 'refreshingAWSCredentialsWithUserPoolTokens',
					cond: (context: RefreshSessionContext) =>
						context.userPoolTokens
							? !isUserPoolTokensExpired(context.userPoolTokens) ||
							  context.forceRefresh
							: false,
				},
				{
					target: 'refreshingUnAuthAWSCredentials',
				},
			],
		},
		refreshingUserPoolToken: {
			on: {
				refreshedCognitoUserPool: 'refreshed',
				refreshIdentityInfo: 'fetchingAuthSessionWithUserPool',
				throwError: 'error',
			},
			invoke: {
				src: invokeRefreshToken,
				onDone: [
					{
						target: 'fetchingAuthSessionWithUserPool',
						cond: (
							context: RefreshSessionContext & {
								awsCredentials: AWSCredentials;
							},
							event
						) => {
							const now = new Date();
							return (
								now > context.awsCredentials.expiration || context.forceRefresh
							);
						},
					},
					{
						target: 'refreshed',
					},
				],
				onError: {
					target: 'error',
				},
			},
		},
		// aws creds expired, but we have the id
		refreshingUserPoolTokenWithIdentity: {
			invoke: {
				src: invokeRefreshToken,
				onDone: [
					{
						target: 'refreshingAWSCredentialsWithUserPoolTokens',
					},
				],
			},
			on: {
				refreshedCognitoUserPool: 'refreshed',
				refreshIdentityInfo: 'refreshingAWSCredentialsWithUserPoolTokens',
				throwError: 'error',
			},
		},
		// aws creds expired, we have id, and we have user pool tokens
		refreshingAWSCredentialsWithUserPoolTokens: {
			on: {
				fetchedAWSCredentials: 'refreshed',
				throwError: 'error',
			},
			invoke: {
				src: async (
					context: RefreshSessionContext & {
						identityId: string;
						userPoolTokens: { idToken: string };
					},
					_event
				) => {
					return await context.service.fetchAWSCredentials(
						context.identityId,
						context.userPoolTokens.idToken
					);
				},
				onDone: {
					target: 'refreshed',
					actions: [refreshAuthSessionStateMachineActions.assignAWSCredentials],
				},
				onError: {
					target: 'error',
				},
			},
		},
		refreshingUnAuthAWSCredentials: {
			// on: {
			// 	fetchedAWSCredentials: 'refreshed',
			// 	throwError: 'error',
			// },
			invoke: {
				id: 'spawnFetchAuthSessionActor',
				src: fetchAuthSessionStateMachine,
				data: {
					clientConfig: (context: AuthorizationMachineContext, _event: any) =>
						// @ts-ignore
						context.clientConfig,
					service: (context: AuthorizationMachineContext, _event: any) =>
						context.service,
					authenticated: false,
					identityID: (context: RefreshSessionContext, _event: any) =>
						context.identityId,
				},
				onDone: {
					target: 'refreshed',
					actions: [
						refreshAuthSessionStateMachineActions.assignUnAuthedSession,
					],
				},
				onError: {
					target: 'error',
				},
			},
		},
		fetchingAuthSessionWithUserPool: {
			// invoke the fetchAuthSessionStateMachine
			invoke: {
				id: 'spawnFetchAuthSessionActor',
				src: fetchAuthSessionStateMachine,
				onError: {
					target: 'error',
				},
				data: {
					clientConfig: (context: AuthorizationMachineContext, _event: any) =>
						// @ts-ignore
						context.clientConfig,
					service: (context: RefreshSessionContext, _event: any) =>
						context.service,
					userPoolTokens: (context: RefreshSessionContext, _event: any) =>
						context.userPoolTokens,
					identityID: (context: RefreshSessionContext) => context.identityId,
					authenticated: true,
				},
				onDone: {
					target: 'refreshed',
					actions: [
						refreshAuthSessionStateMachineActions.assignUnAuthedSession,
					],
				},
			},
			on: {
				fetched: 'refreshed',
				throwError: 'error',
			},
			// set up invoke later
			// ...fetchAuthSessionStateMachine,
		},
		refreshed: {
			type: 'final',
			data: {
				identityID: (context: RefreshSessionContext) => context.identityId,
				AWSCredentials: (context: RefreshSessionContext) =>
					context.awsCredentials,
			},
		},
		error: {
			type: 'final',
		},
	},
};

export const refreshSessionStateMachine = createMachine(
	refreshAuthSessionStateMachineConfig
);
