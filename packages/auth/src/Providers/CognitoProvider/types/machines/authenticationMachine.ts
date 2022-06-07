import { CognitoProviderConfig } from '../../CognitoProvider';
import { CognitoService } from '../../serviceClass';
import { AmplifyUser } from '../../../../types';
import { ActorRefFrom } from 'xstate';
import { signInMachine } from '../../machines/signInMachine';

export type SignInActorRef = ActorRefFrom<typeof signInMachine>;

export interface AuthMachineContext {
	// TODO: union other valid actor refs here when we add more actors
	actorRef?: SignInActorRef;
	config: null | CognitoProviderConfig;
	service: null | CognitoService;
	session?: AmplifyUser;
	error?: any;
}

export type AuthTypestate =
	| {
			value: 'notConfigured';
			context: AuthMachineContext & {
				config: null;
				service: null;
				session: undefined;
			};
	  }
	| {
			value: 'configured';
			context: AuthMachineContext & {
				config: CognitoProviderConfig;
				service: CognitoService;
			};
	  }
	| {
			value: 'signedOut';
			context: AuthMachineContext & {
				config: CognitoProviderConfig;
				service: CognitoService;
			};
	  }
	| {
			value: 'signedIn';
			context: AuthMachineContext & {
				config: CognitoProviderConfig;
				service: CognitoService;
			};
	  }
	| {
			value: 'signingUp';
			context: AuthMachineContext;
	  }
	| { value: 'error'; context: AuthMachineContext }
	| {
			value: 'signedUp';
			context: AuthMachineContext & {
				config: CognitoProviderConfig;
				service: CognitoService;
			};
	  }
	| {
			value: 'signingIn';
			context: AuthMachineContext & {
				config: CognitoProviderConfig;
				service: CognitoService;
			};
	  };
