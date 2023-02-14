import { Auth } from '../../../Auth';
import { Machine } from '../../../stateMachine/machine';
import { AuthenticationStateEvents } from '../events/authenticationMachineEvents';
import { CognitoIdentityProviderClient } from '@aws-sdk/client-cognito-identity-provider';

export type AuthenticationStateContext = {
	client?: CognitoIdentityProviderClient;
	config?: any;
};
export type AuthenticationStates =
	| 'NotConfigured'
	| 'Configured'
	| 'SigningOut'
	| 'SignedOut'
	| 'SigningIn'
	| 'SignedIn'
	| 'DeletingUser'
	| 'ClearingFederation'
	| 'FederatedToIdentityPool'
	| 'Error';

export const AuthenticationStateMachine = new Machine<
	AuthenticationStateContext,
	AuthenticationStateEvents,
	AuthenticationStates
>({
	context: {},
	name: 'AuthenticationStateMachine' as const,
	initial: 'NotConfigured',
	states: {
		NotConfigured: {
			Configure: [
				{
					nextState: 'Configured',
					reducers: [
						(_, event) => {
							return {
								client: new CognitoIdentityProviderClient({
									region: event.payload.config.region,
								}),
								config: event.payload.config,
							};
						},
					],
				},
			],
		},
		Configured: {
			InitializedSignIn: [
				{
					nextState: 'SignedIn',
				},
			],
			InitializedSignOut: [
				{
					nextState: 'SignedOut',
				},
			],
		},
		SigningOut: {},
		SignedOut: {
			SignInRequested: [
				{
					nextState: 'SigningIn',
					actions: [
						async (context, event, broker) => {
							broker.dispatch({
								toMachine: 'SignInMachine',
								type: 'InitiateUserPasswordSignIn',
								payload: {
									client: context.client,
									config: context.config,
									username: event.payload.username,
									password: event.payload.password,
								},
							});
						},
					],
				},
			],
		},
		SigningIn: {
			CancelSignIn: [
				{
					nextState: 'SignedOut',
				},
			],
			Error: [
				{
					nextState: 'SignedOut',
				},
			],
		},
		SignedIn: {},
		DeletingUser: {},
		ClearingFederation: {},
		FederatedToIdentityPool: {},
		Error: {},
	},
});
