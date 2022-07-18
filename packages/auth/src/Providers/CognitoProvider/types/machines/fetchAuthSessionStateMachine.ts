import { CognitoProviderConfig } from '../../CognitoProvider';
import { CognitoService } from '../../serviceClass';

export interface FetchAuthSessionStateMachineContext {
	// actorRef?: FetchAuthSessionActorRef;
	config: null | CognitoProviderConfig;
	service: null | CognitoService;
	userPoolTokens: null | {
		idToken: string;
		accessToken: string;
		refreshToken: string;
	};
}

export type FetchAuthSessionTypestate =
	| {
			value: 'notConfigured';
			context: FetchAuthSessionStateMachineContext;
	  }
	| {
			value: 'configured';
			context: FetchAuthSessionStateMachineContext;
	  }
	| {
			value: 'signingIn';
			context: FetchAuthSessionStateMachineContext;
	  }
	| {
			value: 'fetchAuthSessionWithUserPool';
			context: FetchAuthSessionStateMachineContext;
	  }
	| {
			value: 'fetchingUnAuthSession';
			context: FetchAuthSessionStateMachineContext;
	  }
	| {
			value: 'refreshingSession';
			context: FetchAuthSessionStateMachineContext;
	  }
	| {
			value: 'sessionEstablished';
			context: FetchAuthSessionStateMachineContext;
	  }
	| {
			value: 'error';
			context: FetchAuthSessionStateMachineContext;
	  };
