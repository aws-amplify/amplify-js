import { CognitoProviderConfig } from '../../CognitoProvider';
import { CognitoService } from '../../serviceClass';

export interface RefreshSessionStateMachineContext {
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
			value: 'notStarted';
			context: RefreshSessionStateMachineContext;
	  }
	| {
			value: 'refreshingUserPoolToken';
			context: RefreshSessionStateMachineContext;
	  }
	| {
			value: 'refreshingUserPoolTokenWithIdentity';
			context: RefreshSessionStateMachineContext;
	  }
	| {
			value: 'refreshingAWSCredentialsWithUserPoolTokens';
			context: RefreshSessionStateMachineContext;
	  }
	| {
			value: 'refreshingUnAuthAWSCredentials';
			context: RefreshSessionStateMachineContext;
	  }
	| {
			value: 'fetchingAuthSessionWithUserPool';
			context: RefreshSessionStateMachineContext;
	  }
	| {
			value: 'refreshed';
			context: RefreshSessionStateMachineContext;
	  }
	| {
			value: 'error';
			context: RefreshSessionStateMachineContext;
	  };
