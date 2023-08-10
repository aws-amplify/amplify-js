// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	FederatedResponse,
	SignUpParams,
	FederatedUser,
	ConfirmSignUpOptions,
	SignOutOpts,
	CurrentUserOpts,
	GetPreferredMFAOpts,
	SignInOpts,
	FederatedSignInOptionsCustom,
	LegacyProvider,
	FederatedSignInOptions,
	ClientMetaData,
} from './types';

import { Amplify, ICredentials } from '@aws-amplify/core';
import {
	ISignUpResult,
	CognitoUser,
	MFAOption,
	CognitoUserSession,
	CognitoUserAttribute,
} from 'amazon-cognito-identity-js';

import { AuthError } from './Errors';
import { IAuthDevice } from './types/Auth';
import { InternalAuthClass } from './internals/InternalAuth';

/**
 * Provide authentication steps
 */
export class AuthClass extends InternalAuthClass {
	public getModuleName() {
		return 'Auth';
	}

	/**
	 * Sign up with username, password and other attributes like phone, email
	 * @param {String | object} params - The user attributes used for signin
	 * @param {String[]} restOfAttrs - for the backward compatability
	 * @return - A promise resolves callback data if success
	 */
	public signUp(
		params: string | SignUpParams,
		...restOfAttrs: string[]
	): Promise<ISignUpResult> {
		return super.signUp(params, restOfAttrs);
	}

	/**
	 * Send the verification code to confirm sign up
	 * @param {String} username - The username to be confirmed
	 * @param {String} code - The verification code
	 * @param {ConfirmSignUpOptions} options - other options for confirm signup
	 * @return - A promise resolves callback data if success
	 */
	public confirmSignUp(
		username: string,
		code: string,
		options?: ConfirmSignUpOptions
	): Promise<any> {
		return super.confirmSignUp(username, code, options);
	}

	/**
	 * Resend the verification code
	 * @param {String} username - The username to be confirmed
	 * @param {ClientMetadata} clientMetadata - Metadata to be passed to Cognito Lambda triggers
	 * @return - A promise resolves code delivery details if successful
	 */
	public resendSignUp(
		username: string,
		clientMetadata?: ClientMetaData
	): Promise<any> {
		return super.resendSignUp(username, clientMetadata);
	}

	/**
	 * Sign in
	 * @param {String | SignInOpts} usernameOrSignInOpts - The username to be signed in or the sign in options
	 * @param {String} pw - The password of the username
	 * @param {ClientMetaData} clientMetadata - Client metadata for custom workflows
	 * @return - A promise resolves the CognitoUser
	 */
	public signIn(
		usernameOrSignInOpts: string | SignInOpts,
		pw?: string,
		clientMetadata?: ClientMetaData
	): Promise<CognitoUser | any> {
		return super.signIn(usernameOrSignInOpts, pw, clientMetadata);
	}

	/**
	 * This was previously used by an authenticated user to get MFAOptions,
	 * but no longer returns a meaningful response. Refer to the documentation for
	 * how to setup and use MFA: https://docs.amplify.aws/lib/auth/mfa/q/platform/js
	 * @deprecated
	 * @param {CognitoUser} user - the current user
	 * @return - A promise resolves the current preferred mfa option if success
	 */
	public getMFAOptions(user: CognitoUser | any): Promise<MFAOption[]> {
		return super.getMFAOptions(user);
	}

	/**
	 * get preferred mfa method
	 * @param {CognitoUser} user - the current cognito user
	 * @param {GetPreferredMFAOpts} params - options for getting the current user preferred MFA
	 */
	public getPreferredMFA(
		user: CognitoUser | any,
		params?: GetPreferredMFAOpts
	): Promise<string> {
		return super.getPreferredMFA(user, params);
	}

	/**
	 * set preferred MFA method
	 * @param {CognitoUser} user - the current Cognito user
	 * @param {string} mfaMethod - preferred mfa method
	 * @return - A promise resolve if success
	 */
	public setPreferredMFA(
		user: CognitoUser | any,
		mfaMethod: 'TOTP' | 'SMS' | 'NOMFA' | 'SMS_MFA' | 'SOFTWARE_TOKEN_MFA'
	): Promise<string> {
		return super.setPreferredMFA(user, mfaMethod);
	}

	/**
	 * disable SMS
	 * @deprecated
	 * @param {CognitoUser} user - the current user
	 * @return - A promise resolves is success
	 */
	public disableSMS(user: CognitoUser): Promise<string> {
		return super.disableSMS(user);
	}

	/**
	 * enable SMS
	 * @deprecated
	 * @param {CognitoUser} user - the current user
	 * @return - A promise resolves is success
	 */
	public enableSMS(user: CognitoUser): Promise<string> {
		return super.enableSMS(user);
	}

	/**
	 * Setup TOTP
	 * @param {CognitoUser} user - the current user
	 * @return - A promise resolves with the secret code if success
	 */
	public setupTOTP(user: CognitoUser | any): Promise<string> {
		return super.setupTOTP(user);
	}

	/**
	 * verify TOTP setup
	 * @param {CognitoUser} user - the current user
	 * @param {string} challengeAnswer - challenge answer
	 * @return - A promise resolves is success
	 */
	public verifyTotpToken(
		user: CognitoUser | any,
		challengeAnswer: string
	): Promise<CognitoUserSession> {
		return super.verifyTotpToken(user, challengeAnswer);
	}

	/**
	 * Send MFA code to confirm sign in
	 * @param {Object} user - The CognitoUser object
	 * @param {String} code - The confirmation code
	 */
	public confirmSignIn(
		user: CognitoUser | any,
		code: string,
		mfaType?: 'SMS_MFA' | 'SOFTWARE_TOKEN_MFA' | null,
		clientMetadata?: ClientMetaData
	): Promise<CognitoUser | any> {
		return super.confirmSignIn(user, code, mfaType, clientMetadata);
	}

	public completeNewPassword(
		user: CognitoUser | any,
		password: string,
		requiredAttributes: any = {},
		clientMetadata?: ClientMetaData
	): Promise<CognitoUser | any> {
		return super.completeNewPassword(
			user,
			password,
			requiredAttributes,
			clientMetadata
		);
	}

	/**
	 * Send the answer to a custom challenge
	 * @param {CognitoUser} user - The CognitoUser object
	 * @param {String} challengeResponses - The confirmation code
	 */
	public sendCustomChallengeAnswer(
		user: CognitoUser | any,
		challengeResponses: string,
		clientMetadata?: ClientMetaData
	): Promise<CognitoUser | any> {
		return super.sendCustomChallengeAnswer(
			user,
			challengeResponses,
			clientMetadata
		);
	}

	/**
	 * Delete an authenticated users' attributes
	 * @param {CognitoUser} - The currently logged in user object
	 * @return {Promise}
	 **/
	public deleteUserAttributes(
		user: CognitoUser | any,
		attributeNames: string[]
	) {
		return super.deleteUserAttributes(user, attributeNames);
	}

	/**
	 * Delete the current authenticated user
	 * @return {Promise}
	 **/
	// TODO: Check return type void
	public deleteUser(): Promise<string | void> {
		return super.deleteUser();
	}

	/**
	 * Update an authenticated users' attributes
	 * @param {CognitoUser} - The currently logged in user object
	 * @return {Promise}
	 **/
	public updateUserAttributes(
		user: CognitoUser | any,
		attributes: object,
		clientMetadata?: ClientMetaData
	): Promise<string> {
		return super.updateUserAttributes(user, attributes, clientMetadata);
	}

	/**
	 * Return user attributes
	 * @param {Object} user - The CognitoUser object
	 * @return - A promise resolves to user attributes if success
	 */
	public userAttributes(
		user: CognitoUser | any
	): Promise<CognitoUserAttribute[]> {
		return super.userAttributes(user);
	}

	public verifiedContact(user: CognitoUser | any) {
		return super.verifiedContact(user);
	}

	/**
	 * Get current authenticated user
	 * @return - A promise resolves to current authenticated CognitoUser if success
	 */
	public currentUserPoolUser(
		params?: CurrentUserOpts
	): Promise<CognitoUser | any> {
		return super.currentUserPoolUser(params);
	}

	/**
	 * Get current authenticated user
	 * @param {CurrentUserOpts} - options for getting the current user
	 * @return - A promise resolves to current authenticated CognitoUser if success
	 */
	public currentAuthenticatedUser(
		params?: CurrentUserOpts
	): Promise<CognitoUser | any> {
		return super.currentAuthenticatedUser(params);
	}

	/**
	 * Get current user's session
	 * @return - A promise resolves to session object if success
	 */
	public currentSession(): Promise<CognitoUserSession> {
		return super.currentSession();
	}

	/**
	 * Get the corresponding user session
	 * @param {Object} user - The CognitoUser object
	 * @return - A promise resolves to the session
	 */
	public userSession(user): Promise<CognitoUserSession> {
		return super.userSession(user);
	}

	/**
	 * Get authenticated credentials of current user.
	 * @return - A promise resolves to be current user's credentials
	 */
	public currentUserCredentials(): Promise<ICredentials> {
		return super.currentUserCredentials();
	}

	public currentCredentials(): Promise<ICredentials> {
		return super.currentCredentials();
	}

	/**
	 * Initiate an attribute confirmation request
	 * @param {Object} user - The CognitoUser
	 * @param {Object} attr - The attributes to be verified
	 * @return - A promise resolves to callback data if success
	 */
	public verifyUserAttribute(
		user: CognitoUser | any,
		attr: string,
		clientMetadata?: ClientMetaData
	): Promise<void> {
		return super.verifyUserAttribute(user, attr, clientMetadata);
	}

	/**
	 * Confirm an attribute using a confirmation code
	 * @param {Object} user - The CognitoUser
	 * @param {Object} attr - The attribute to be verified
	 * @param {String} code - The confirmation code
	 * @return - A promise resolves to callback data if success
	 */
	public verifyUserAttributeSubmit(
		user: CognitoUser | any,
		attr: string,
		code: string
	): Promise<string> {
		return super.verifyUserAttributeSubmit(user, attr, code);
	}

	public verifyCurrentUserAttribute(attr: string): Promise<void> {
		return super.verifyCurrentUserAttribute(attr);
	}

	/**
	 * Confirm current user's attribute using a confirmation code
	 * @param {Object} attr - The attribute to be verified
	 * @param {String} code - The confirmation code
	 * @return - A promise resolves to callback data if success
	 */
	verifyCurrentUserAttributeSubmit(
		attr: string,
		code: string
	): Promise<string> {
		return super.verifyCurrentUserAttributeSubmit(attr, code);
	}

	/**
	 * Sign out method
	 * @
	 * @return - A promise resolved if success
	 */
	public signOut(opts?: SignOutOpts): Promise<any> {
		return super.signOut(opts);
	}

	/**
	 * Change a password for an authenticated user
	 * @param {Object} user - The CognitoUser object
	 * @param {String} oldPassword - the current password
	 * @param {String} newPassword - the requested new password
	 * @return - A promise resolves if success
	 */
	public changePassword(
		user: CognitoUser | any,
		oldPassword: string,
		newPassword: string,
		clientMetadata?: ClientMetaData
	): Promise<'SUCCESS'> {
		return super.changePassword(user, oldPassword, newPassword, clientMetadata);
	}

	/**
	 * Initiate a forgot password request
	 * @param {String} username - the username to change password
	 * @return - A promise resolves if success
	 */
	public forgotPassword(
		username: string,
		clientMetadata?: ClientMetaData
	): Promise<any> {
		return super.forgotPassword(username, clientMetadata);
	}

	/**
	 * Confirm a new password using a confirmation Code
	 * @param {String} username - The username
	 * @param {String} code - The confirmation code
	 * @param {String} password - The new password
	 * @return - A promise that resolves if success
	 */
	public forgotPasswordSubmit(
		username: string,
		code: string,
		password: string,
		clientMetadata?: ClientMetaData
	): Promise<string> {
		return super.forgotPasswordSubmit(username, code, password, clientMetadata);
	}

	/**
	 * Get user information
	 * @async
	 * @return {Object }- current User's information
	 */
	public currentUserInfo() {
		return super.currentUserInfo();
	}

	public federatedSignIn(
		options?: FederatedSignInOptions
	): Promise<ICredentials>;
	public federatedSignIn(
		provider: LegacyProvider,
		response: FederatedResponse,
		user: FederatedUser
	): Promise<ICredentials>;
	public federatedSignIn(
		options?: FederatedSignInOptionsCustom
	): Promise<ICredentials>;
	public federatedSignIn(
		providerOrOptions:
			| LegacyProvider
			| FederatedSignInOptions
			| FederatedSignInOptionsCustom,
		response?: FederatedResponse,
		user?: FederatedUser
	): Promise<ICredentials> {
		return super.federatedSignIn(providerOrOptions, response, user);
	}

	/**
	 * Compact version of credentials
	 * @param {Object} credentials
	 * @return {Object} - Credentials
	 */
	public essentialCredentials(credentials): ICredentials {
		return super.essentialCredentials(credentials);
	}

	public rememberDevice(): Promise<string | AuthError> {
		return super.rememberDevice();
	}

	public forgetDevice(): Promise<void> {
		return super.forgetDevice();
	}

	public fetchDevices(): Promise<IAuthDevice[]> {
		return super.fetchDevices();
	}
}

export const Auth = new AuthClass(null);
Amplify.register(Auth);
