// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

export interface AuthProvider {
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
