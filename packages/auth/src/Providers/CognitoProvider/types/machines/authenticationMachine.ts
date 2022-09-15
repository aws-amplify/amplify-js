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

import { CognitoUserPoolService } from '../../services/CognitoUserPoolService';
import { AmplifyUser } from '../../../../types';
import { ActorRefFrom } from 'xstate';
import { signInMachine } from '../../machines/signInMachine';
import { UserPoolConfig } from '../model/config';

export type SignInActorRef = ActorRefFrom<typeof signInMachine>;

export interface AuthenticationMachineContext {
	actorRef?: SignInActorRef;
	config?: null | UserPoolConfig;
	storagePrefix?: null | string;
	service: null | CognitoUserPoolService;
	session?: AmplifyUser;
	error?: any;
}

export type AuthenticationTypeState =
	| {
			value: 'notConfigured';
			context: AuthenticationMachineContext & {
				config: UserPoolConfig;
				service: null;
				session: undefined;
				storagePrefix: null;
			};
	  }
	| {
			value: 'configuring';
			context: AuthenticationMachineContext & {
				config: UserPoolConfig;
				service: CognitoUserPoolService;
				storagePrefix: string;
			};
	  }
	| {
			value: 'configured';
			context: AuthenticationMachineContext & {
				config: UserPoolConfig;
				service: CognitoUserPoolService;
				storagePrefix: string;
			};
	  }
	| {
			value: 'configurationFailed';
			context: AuthenticationMachineContext & {
				config: UserPoolConfig;
				service: CognitoUserPoolService;
				storagePrefix: string;
			};
	  }
	| {
			value: 'signedOut';
			context: AuthenticationMachineContext & {
				config: UserPoolConfig;
				service: CognitoUserPoolService;
				storagePrefix: string;
			};
	  }
	| {
			value: 'signedIn';
			context: AuthenticationMachineContext & {
				config: UserPoolConfig;
				service: CognitoUserPoolService;
				storagePrefix: string;
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
				config: UserPoolConfig;
				service: CognitoUserPoolService;
			};
	  }
	| {
			value: 'signingIn';
			context: AuthenticationMachineContext & {
				config: UserPoolConfig;
				service: CognitoUserPoolService;
				storagePrefix: string;
			};
	  };
