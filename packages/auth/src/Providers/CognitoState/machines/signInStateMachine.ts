import { Machine } from '../../../stateMachine/machine';
import { SignInStateEvents } from '../events/signInStateMachineEvents';
import {
	CognitoIdentityProviderClient,
	InitiateAuthCommand,
	InitiateAuthCommandOutput,
} from '@aws-sdk/client-cognito-identity-provider';

export type SignInContext = {
	client?: CognitoIdentityProviderClient;
	config?: any;
};

export type SignInStates =
	| 'NotStarted'
	| 'SigningInWithPassword'
	| 'ResolvingChallenge'
	| 'SignedIn'
	| 'Error';

export const SignInStateMachine = new Machine<
	SignInContext,
	SignInStateEvents,
	SignInStates
>({
	context: {},
	name: 'SignInMachine' as const,
	initial: 'NotStarted',
	finalStates: ['Error', 'SignedIn'],
	states: {
		NotStarted: {
			InitiateUserPasswordSignIn: [
				{
					nextState: 'SigningInWithPassword',
					reducers: [
						(_, event) => {
							return {
								client: event.payload.client,
								config: event.payload.config,
							};
						},
					],
					actions: [
						async (context, event, broker) => {
							try {
								let res: InitiateAuthCommandOutput = await context.client!.send(
									new InitiateAuthCommand({
										AuthFlow: 'USER_PASSWORD_AUTH',
										ClientId: context.config.userPoolWebClientId,
										AuthParameters: {
											USERNAME: event.payload.username,
											PASSWORD: event.payload.password,
										},
									})
								);
								if (res.AuthenticationResult) {
									broker.dispatch({
										toMachine: 'SignInMachine',
										type: 'SignedIn',
									});
								}
							} catch (e) {
								broker.dispatch({
									toMachine: 'SignInMachine',
									type: 'ThrowError',
								});
							}
						},
					],
				},
			],
		},
		SigningInWithPassword: {
			SignedIn: [{ nextState: 'SignedIn' }],
			ThrowError: [
				{
					nextState: 'Error',
					actions: [
						async (_context, _event, broker) => {
							broker.dispatch({
								toMachine: 'AuthenticationStateMachine',
								type: 'Error',
							});
						},
					],
				},
			],
		},
		ResolvingChallenge: {},
		SignedIn: {},
		Error: {},
	},
});
