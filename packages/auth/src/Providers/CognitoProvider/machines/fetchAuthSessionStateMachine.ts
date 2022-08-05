import { assign, createMachine, MachineConfig } from 'xstate';
import { createModel } from 'xstate/lib/model';
import { FetchAuthSessionReturnContext } from '../types/machines/fetchAuthSessionStateMachine';

export const fetchAuthSessionMachineModel = createModel({
	events: {
		fetchUnAuthIdentityID: () => ({}),
		fetchAuthenticatedIdentityID: () => ({}),
		fetchedIdentityID: () => ({}),
		throwError: () => ({}),
	},
});

// Fetch Auth Session state machine
export const fetchAuthSessionStateMachineConfig: MachineConfig<any, any, any> =
	{
		id: 'fetchAuthSessionStateMachine',
		initial: 'notStarted',
		context: fetchAuthSessionMachineModel.initialContext,
		states: {
			notStarted: {
				onEntry: [
					(_context, _event) => {
						console.log('Fetch Auth Session Machine has been spawned.');
					},
				],
				always: [
					{
						// fetch identity ID if there isn't already an identity ID
						target: 'fetchingIdentityID',
						cond: (context, _event) => !context.identityID,
					},
					{
						target: 'fetchingAWSCredentials',
					},
				],
			},
			fetchingIdentityID: {
				invoke: {
					id: 'fetchAuthSession',
					src: async (context, _event) => {
						if (!context.clientConfig.identityPoolId) {
							return null;
						}

						// fetch unauth identity id if user isn't authenticated
						if (!context.authenticated) {
							const identityID = await context.service?.fetchUnAuthIdentityID();
							return identityID;
						}

						const identityID = await context.service?.fetchIdentityId(
							context.userPoolTokens.idToken
						);

						return identityID;
					},
					onDone: {
						target: 'fetchingAWSCredentials',
						actions: assign({
							identityID: (_context, event) => event.data,
						}),
					},
					onError: {
						target: 'error',
					},
				},
				on: {
					fetchedIdentityID: 'fetchingAWSCredentials',
					throwError: 'error',
				},
			},
			fetchingAWSCredentials: {
				invoke: {
					id: 'fetchAWSCredentials',
					src: async (context, _event) => {
						if (!context.clientConfig.identityPoolId) {
							return null;
						}

						if (!context.authenticated) {
							const AWSCreds = await context.service?.fetchUnAuthAWSCredentials(
								context.identityID
							);
							return AWSCreds;
						}

						const AWSCreds = await context.service?.fetchAWSCredentials(
							context.identityID,
							context.userPoolTokens.idToken
						);
						return AWSCreds;
					},
					onDone: {
						target: 'fetched',
						actions: assign({
							AWSCreds: (_context, event) => event.data,
						}),
					},
					onError: {
						target: 'error',
					},
				},
			},
			fetched: {
				type: 'final',
				data: {
					identityID: (context: FetchAuthSessionReturnContext, _event: any) =>
						context.identityID,
					AWSCredentials: (
						context: FetchAuthSessionReturnContext,
						_event: any
					) => context.AWSCreds,
				},
			},
			error: {
				type: 'final',
			},
		},
	};

export const fetchAuthSessionStateMachine = createMachine(
	fetchAuthSessionStateMachineConfig
);
