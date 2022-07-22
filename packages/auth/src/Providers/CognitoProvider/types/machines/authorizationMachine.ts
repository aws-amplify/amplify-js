import { CognitoProviderConfig } from '../../CognitoProvider';
import { ActorRefFrom } from 'xstate';
import { fetchAuthSessionStateMachine } from '../../machines/fetchAuthSessionStateMachine';
import { CognitoService } from '../../serviceClass';

// info/context needed to pass to the fetchAuthSessionStateMachine in order to perform the fetch Session
// First, fetch user pool tokens (JWT) from the user pool
// - session = this.getSessionData();

// Second, fetch the identity ID from the identity pool using the idToken from the first step
// - need idToken passed in as argument for the call

// Third, fetch the AWS Credentials from the identity pool
// - need idToken passed in as argument for the call
// - need identityID passed in as argument for the call as well

export type FetchAuthSessionActorRef = ActorRefFrom<
	typeof fetchAuthSessionStateMachine
>;

export interface AuthorizationMachineContext {
	actorRef?: FetchAuthSessionActorRef;
	config: null | CognitoProviderConfig;
	service: null | CognitoService;
	userPoolTokens: null | {
		idToken: string;
		accessToken: string;
		refreshToken: string;
	};
	identityID: null;
	AWSCredentials: null;
	getSession: any;
}

export type AuthorizationTypestate =
	| {
			value: 'notConfigured';
			context: AuthorizationMachineContext;
	  }
	| {
			value: 'configured';
			context: AuthorizationMachineContext;
	  }
	| {
			value: 'signingIn';
			context: AuthorizationMachineContext;
	  }
	| {
			value: 'fetchAuthSessionWithUserPool';
			context: AuthorizationMachineContext;
	  }
	| {
			value: 'fetchingUnAuthSession';
			context: AuthorizationMachineContext;
	  }
	| {
			value: 'refreshingSession';
			context: AuthorizationMachineContext;
	  }
	| {
			value: 'sessionEstablished';
			context: AuthorizationMachineContext;
	  }
	| {
			value: 'error';
			context: AuthorizationMachineContext;
	  };

export type UserPoolTokens = {
	idToken: string;
	accessToken: string;
	refreshToken: string;
};

export type fetchAuthSessionEvent = {
	data: {
		identityID: string;
		AWSCredentials: {
			accessKeyId: string;
			expiration: Date;
			secretAccessKey: string;
			sessionToken: string;
		};
	};
};

export type AWSCredsRes = {
	AccessKeyId: string;
	Expiration: Date;
	SecretKey: string;
	SessionToken: string;
};
