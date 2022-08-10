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

import {
	AmplifyUser,
	ConfirmSignInParams,
	ConfirmSignUpParams,
	PluginConfig,
	SignInParams,
	SignInResult,
	SignUpResult,
	SignUpParams,
	AddAuthenticatorResponse,
	RequestScopeResponse,
	AuthZOptions,
	AuthorizationResponse,
} from '.';

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
	configure(config: PluginConfig);

	// return 'Storage';
	getCategory(): string;

	// return the name of you provider
	getProviderName(): string;

	signUp(params: SignUpParams): Promise<SignUpResult>;

	confirmSignUp(params: ConfirmSignUpParams): Promise<SignUpResult>;

	signIn(params: SignInParams): Promise<SignInResult>;

	confirmSignIn(params: ConfirmSignInParams): Promise<SignInResult>;

	fetchSession(): Promise<AmplifyUser>;

	addAuthenticator(): Promise<AddAuthenticatorResponse>;

	requestScope(scope: string): Promise<RequestScopeResponse>;

	authorize(authorizationOptions: AuthZOptions): Promise<AuthorizationResponse>;

	signOut(): Promise<void>;
}
