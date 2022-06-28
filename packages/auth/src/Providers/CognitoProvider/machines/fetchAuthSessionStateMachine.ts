import { serviceMap } from '@xstate/inspect/lib/browser';
import { ContextReplacementPlugin } from 'webpack';
import { assign, createMachine, MachineConfig } from 'xstate';
import { createModel } from 'xstate/lib/model';

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
				always: {
					// fetchUnAuthIdentityID: 'fetchingIdentityID',
					target: 'fetchingIdentityID',
				},
			},
			fetchingIdentityID: {
				invoke: {
					id: 'fetchAuthSession',
					src: async (_context, _event) => {
						// console.log(_context.userPoolTokens.idToken);
						// console.log('TEST INVOKE FETCH IDENTITY ID');
						const identityID = await _context.service?.fetchIdentityId(
							_context.userPoolTokens.idToken
						);
						console.log('IdentityID: ');
						console.log(identityID);
						return identityID;
					},
					onDone: {
						target: 'fetchingAWSCredentials',
						actions: assign({
							identityID: (context, event) => event.data,
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
					src: async (_context, _event) => {
						// console.log('FETCH AWS CREDENTIALS TEST');
						// console.log(_context.identityID);
						const AWSCreds = await _context.service?.fetchAWSCredentials(
							_context.identityID,
							_context.userPoolTokens.idToken
						);
						console.log('AWS CREDENTIALS: ');
						console.log(AWSCreds);
						return AWSCreds;
					},
					onDone: {
						target: 'fetched',
						actions: assign({
							AWSCreds: (context, event) => event.data,
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
					identityID: (context: any, event: any) => context.identityID,
					AWSCredentials: (context: any, event: any) => context.AWSCreds,
					accessKeyId: (context: any, event: any) =>
						context.AWSCreds.AccessKeyId,
					secretKey: (context: any, event: any) => context.AWSCreds.SecretKey,
					sessionToken: (context: any, event: any) =>
						context.AWSCreds.SessionToken,
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

// const finalMachine = createMachine(fetchAuthSessionStateMachine);

// fetchAuthSessionStateMachine;
