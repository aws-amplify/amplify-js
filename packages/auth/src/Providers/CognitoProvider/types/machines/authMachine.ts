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
import { authenticationMachine } from '../../machines/authenticationMachine';
import { authorizationMachine } from '../../machines/authorizationMachine';
import { CognitoServiceConfig } from '../model/config/CognitoServiceConfig';

export type AuthnActorRef = ActorRefFrom<typeof authenticationMachine>;
export type AuthzActorRef = ActorRefFrom<typeof authorizationMachine>;

export interface AuthMachineContext {
	authenticationActorRef?: AuthnActorRef;
	authorizationActorRef?: AuthzActorRef;
	config?: null | CognitoServiceConfig;
}

export type AuthTypeState =
	| {
			value: 'notConfigured';
			context: AuthMachineContext & {
				config: null;
			};
	  }
	| {
			value: 'configuringAuthentication';
			context: AuthMachineContext & {
				config: CognitoProviderConfig;
			};
	  }
	| {
			value: 'configuringAuthorization';
			context: AuthMachineContext & {
				config: CognitoProviderConfig;
			};
	  }
	| {
			value: 'configuringAuthorizationFailed';
			context: AuthMachineContext & {
				config: CognitoProviderConfig;
			};
	  }
	| {
			value: 'configured';
			context: AuthMachineContext & {
				config: CognitoProviderConfig;
			};
	  }
	| {
			value: 'error';
			context: AuthMachineContext & {
				config: CognitoProviderConfig;
			};
	  };
