/*
 * Copyright 2022 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with
 * the License. A copy of the License is located at
 *
 *	 http://aws.amazon.com/apache2.0/
 *
 * or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR
 * CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions
 * and limitations under the License.
 */

import { CognitoProviderConfig } from '../../CognitoProvider';
import { ActorRefFrom } from 'xstate';
import { fetchAuthSessionStateMachine } from '../../machines/fetchAuthSessionStateMachine';
import { CognitoService } from '../../services/CognitoService';

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
	config?: null | CognitoProviderConfig;
	service?: null | CognitoService;
	userPoolTokens?: null | {
		idToken: string;
		accessToken: string;
		refreshToken: string;
	};
	identityID?: null;
	AWSCredentials?: null;
	sessionInfo?: any;
	clientConfig?: CognitoProviderConfig;
}

export type AuthorizationTypeState =
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

export type beginningSessionEvent = {
	userPoolTokens: UserPoolTokens;
};

export type AWSCredsRes = {
	AccessKeyId: string;
	Expiration: Date;
	SecretKey: string;
	SessionToken: string;
};
