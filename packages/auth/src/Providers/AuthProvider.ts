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

export interface AuthProvider {
	// you need to implement those methods

	// configure your provider
	configure();

	// return 'Storage';
	getCategory(): string;

	// return the name of you provider
	getProviderName(): string;

	signUp(): Promise<any>;

	confirmSignUp(): Promise<any>;

	resendSignUpCode(): Promise<any>;

	signIn(): Promise<any>;

	confirmSignIn(): Promise<any>;

	signInWithWebUI(): Promise<any>;

	fetchSession(): Promise<any>;

	signOut(): Promise<void>;

	resetPassword(): Promise<void>;

	confirmResetPassword(): Promise<void>;

	updatePassword(): Promise<void>;

	fetchUserAttributes(): Promise<any>;

	updateUserAttribute(): Promise<any>;

	updateUserAttributes(): Promise<any>;

	resendUserAttributeConfirmationCode(): Promise<any>;

	rememberDevice(): Promise<any>;

	forgetDevice(): Promise<any>;

	fetchDevices(): Promise<any>;

	deleteUser(): Promise<any>;
}
