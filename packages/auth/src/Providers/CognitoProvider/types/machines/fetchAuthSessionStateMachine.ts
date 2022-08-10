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
import { CognitoService } from '../../serviceClass';

export interface FetchAuthSessionStateMachineContext {
	config: null | CognitoProviderConfig;
	service: null | CognitoService;
	userPoolTokens: null | {
		idToken: string;
		accessToken: string;
		refreshToken: string;
	};
	authenticated: boolean;
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

export type FetchAuthSessionReturnContext = {
	identityID: string;
	AWSCreds: {
		accessKeyId: string;
		expiration: Date;
		secretAccessKey: string;
		sessionToken: string;
	};
};
