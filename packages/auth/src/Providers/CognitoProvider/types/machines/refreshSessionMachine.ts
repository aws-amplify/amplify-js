import { UserPoolTokens } from './authorizationMachine';
import { CognitoProviderConfig } from '../../CognitoProvider';
import { CognitoService } from '../../serviceClass';

export interface RefreshSessionStateMachineContext {
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

export type RefreshSessionContext = {
	identityId: string | null;
	awsCredentials: {
		accessKeyId: string;
		expiration: Date;
		secretAccessKey: string;
		sessionToken: string;
	} | null;
	service: CognitoService;
	forceRefresh: boolean;
	userPoolTokens?: UserPoolTokens;
};
