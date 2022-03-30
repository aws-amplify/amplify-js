import {
	CognitoUser,
	CognitoUserSession,
	ISignUpResult,
} from './AWSCognitoProvider';
import { CurrentUserOpts } from '.';
import {
	ClientMetaData,
	SignInOpts,
	SignOutOpts,
	AuthOptions,
	SignUpParams,
} from './Auth';

/*
 * Copyright 2017-2022 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with
 * the License. A copy of the License is located at
 *
 *     http://aws.amazon.com/apache2.0/
 *
 * or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR
 * CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions
 * and limitations under the License.
 */
export interface AuthProvider {
	// you need to implement those methods

	// configure your provider
	configure(config: AuthOptions);

	// return 'Storage';
	getCategory(): string;

	// return the name of you provider
	getProviderName(): string;

	// signup
	signUp?(
		params: string | SignUpParams,
		...restOfAttrs: string[]
	): Promise<ISignUpResult>;

	// signIn
	signIn?(
		usernameOrSignInOpts: string | SignInOpts,
		pw?: string,
		clientMetadata?: ClientMetaData
	): Promise<CognitoUser>;

	// signOut
	signOut?(opts?: SignOutOpts): Promise<any>;

	currentUserPoolUser?(params?: CurrentUserOpts): Promise<CognitoUser>;
	currentSession?(): Promise<CognitoUserSession>;
	getCreds?(): any;
}
