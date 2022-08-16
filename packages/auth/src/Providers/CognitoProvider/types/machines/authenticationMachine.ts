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
import { AmplifyUser } from '../../../../types';
import { ActorRefFrom } from 'xstate';
import { signInMachine } from '../../machines/signInMachine';
import { signUpMachine } from '../../machines/signUpMachine';

export type SignInActorRef = ActorRefFrom<typeof signInMachine>;
export type SignUpActorRef = ActorRefFrom<typeof signUpMachine>;

export interface AuthenticationMachineContext {
	// TODO: union other valid actor refs here when we add more actors
	actorRef?: SignInActorRef | SignUpActorRef;
	config: null | CognitoProviderConfig;
	service: null | CognitoService;
	session?: AmplifyUser;
	error?: any;
}

export type AuthenticationTypeState =
	| {
			value: 'notConfigured';
			context: AuthenticationMachineContext & {
				config: null;
				service: null;
				session: undefined;
			};
	  }
	| {
			value: 'configured';
			context: AuthenticationMachineContext & {
				config: CognitoProviderConfig;
				service: CognitoService;
			};
	  }
	| {
			value: 'signedOut';
			context: AuthenticationMachineContext & {
				config: CognitoProviderConfig;
				service: CognitoService;
			};
	  }
	| {
			value: 'signedIn';
			context: AuthenticationMachineContext & {
				config: CognitoProviderConfig;
				service: CognitoService;
			};
	  }
	| {
			value: 'signingUp';
			context: AuthenticationMachineContext;
	  }
	| { value: 'error'; context: AuthenticationMachineContext }
	| {
			value: 'signedUp';
			context: AuthenticationMachineContext & {
				config: CognitoProviderConfig;
				service: CognitoService;
			};
	  }
	| {
			value: 'signingIn';
			context: AuthenticationMachineContext & {
				config: CognitoProviderConfig;
				service: CognitoService;
			};
	  };
