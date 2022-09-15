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

import { UserPoolTokens } from './authorizationMachine';
import { CognitoProviderConfig } from '../model/config';
import { CognitoService } from '../../services/CognitoService';

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
