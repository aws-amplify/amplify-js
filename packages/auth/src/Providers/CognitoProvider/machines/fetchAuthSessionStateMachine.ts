import { assign, createMachine, MachineConfig } from 'xstate';
import { createModel } from 'xstate/lib/model';
import { FetchAuthSessionStateMachineContext } from '../types/machines/fetchAuthSessionStateMachine';

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
						// fetch unauth identity id if user isn't authenticated
						if (!_context.authenticated) {
							const identityID =
								await _context.service?.fetchUnAuthIdentityID();
							return identityID;
						}

						const identityID = await _context.service?.fetchIdentityId(
							_context.userPoolTokens.idToken
						);

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
						if (!_context.authenticated) {
							const AWSCreds =
								await _context.service?.fetchUnAuthAWSCredentials(
									_context.identityID
								);
							return AWSCreds;
						}

						const AWSCreds = await _context.service?.fetchAWSCredentials(
							_context.identityID,
							_context.userPoolTokens.idToken
						);
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
				// onEntry: [
				// 	(context, event) => {
				// 		console.log('DONE');
				// 	},
				// ],
				data: {
					identityID: (context: any, event: any) => context.identityID,
					AWSCredentials: (context: any, event: any) => context.AWSCreds,
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
