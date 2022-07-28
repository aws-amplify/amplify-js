import { assign, createMachine, MachineConfig } from 'xstate';
import { createModel } from 'xstate/lib/model';
import { FetchAuthSessionReturnContext } from '../types/machines/fetchAuthSessionStateMachine';

// info/context needed to fetch session
// First, fetch user pool tokens (JWT) from the user pool
// - session = this.getSessionData();

// Second, fetch the identity ID from the identity pool using the idToken from the first step
// - need idToken passed in as argument for the call

// Third, fetch the AWS Credentials from the identity pool
// - need idToken passed in as argument for the call
// - need identityID passed in as argument for the call as well

export const fetchAuthSessionMachineModel = createModel({
	events: {
		fetchUnAuthIdentityID: () => ({}),
		fetchAuthenticatedIdentityID: () => ({}),
		fetchedIdentityID: () => ({}),
		throwError: () => ({}),
		fetchedAWSCredentials: () => ({}),
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
						// fetchUnAuthIdentityID: 'fetchingIdentityID',
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
						console.log({ clientConfig: context.clientConfig });
						if (!context.clientConfig.identityPoolId) {
							return null;
						}

						// fetch unauth identity id if user isn't authenticated
						if (!context.authenticated) {
							console.log('fetching unauth identity ID');
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
				// onEntry: [
				// 	(context, event) => {
				// 		console.log('DONE');
				// 	},
				// ],
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
				// onEntry: [
				// 	(context, event) => {
				// 		console.log('NOOOOOOO');
				// 	},
				// ],
			},
		},
	};

export const fetchAuthSessionStateMachine = createMachine(
	fetchAuthSessionStateMachineConfig
);
