// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import * as topLevelExports from '../src';
import * as utilsExports from '../src/utils';
import * as authTopLevelExports from '../src/auth';
import * as authCognitoExports from '../src/auth/cognito';
import * as analyticsTopLevelExports from '../src/analytics';
import * as analyticsPinpointExports from '../src/analytics/pinpoint';
import * as storageTopLevelExports from '../src/storage';
import * as storageS3Exports from '../src/storage/s3';

/**
 * Describes exports from the aws-amplify umbrella package to ensure we're not polluting the export surface.
 *
 * Note: These tests will not capture exported types.
 */
describe('aws-amplify Exports', () => {
	describe('Top-level exports', () => {
		it('should only export expected symbols', () => {
			expect(Object.keys(topLevelExports)).toMatchInlineSnapshot(`
			Array [
			  "Amplify",
			]
		`);
		});
	});

	describe('Utils exports', () => {
		it('should only export expected symbols', () => {
			expect(Object.keys(utilsExports)).toMatchInlineSnapshot(`
			Array [
			  "Hub",
			  "I18n",
			]
		`);
		});
	});

	describe('Analytics exports', () => {
		it('should only export expected symbols from the top-level', () => {
			expect(Object.keys(analyticsTopLevelExports)).toMatchInlineSnapshot(`
			Array [
			  "record",
			  "identifyUser",
			  "enable",
			  "disable",
			  "AnalyticsError",
			]
		`);
		});

		it('should only export expected symbols from the Pinpoint provider', () => {
			expect(Object.keys(analyticsPinpointExports)).toMatchInlineSnapshot(`
			Array [
			  "record",
			  "identifyUser",
			]
		`);
		});
	});

	describe('Auth exports', () => {
		it('should only export expected symbols from the top-level', () => {
			expect(Object.keys(authTopLevelExports)).toMatchInlineSnapshot(`
			Array [
			  "signUp",
			  "resetPassword",
			  "confirmResetPassword",
			  "signIn",
			  "resendSignUpCode",
			  "confirmSignUp",
			  "confirmSignIn",
			  "updateMFAPreference",
			  "fetchMFAPreference",
			  "verifyTOTPSetup",
			  "updatePassword",
			  "setUpTOTP",
			  "updateUserAttributes",
			  "updateUserAttribute",
			  "getCurrentUser",
			  "confirmUserAttribute",
			  "signInWithRedirect",
			  "fetchUserAttributes",
			  "signOut",
			  "sendUserAttributeVerificationCode",
			  "deleteUserAttributes",
			  "deleteUser",
			  "rememberDevice",
			  "AuthError",
			  "fetchAuthSession",
			]
		`);
		});

		it('should only export expected symbols from the Cognito provider', () => {
			expect(Object.keys(authCognitoExports)).toMatchInlineSnapshot(`
			Array [
			  "signUp",
			  "resetPassword",
			  "confirmResetPassword",
			  "signIn",
			  "resendSignUpCode",
			  "confirmSignUp",
			  "confirmSignIn",
			  "updateMFAPreference",
			  "fetchMFAPreference",
			  "verifyTOTPSetup",
			  "updatePassword",
			  "setUpTOTP",
			  "updateUserAttributes",
			  "updateUserAttribute",
			  "getCurrentUser",
			  "confirmUserAttribute",
			  "signInWithRedirect",
			  "fetchUserAttributes",
			  "signOut",
			  "sendUserAttributeVerificationCode",
			  "deleteUserAttributes",
			  "deleteUser",
			  "rememberDevice",
			  "cognitoCredentialsProvider",
			  "CognitoAWSCredentialsAndIdentityIdProvider",
			  "DefaultIdentityIdStore",
			  "CognitoUserPoolsTokenProvider",
			  "TokenOrchestrator",
			  "DefaultTokenStore",
			  "refreshAuthTokens",
			]
		`);
		});
	});

	describe('Storage exports', () => {
		it('should only export expected symbols from the top-level', () => {
			expect(Object.keys(storageTopLevelExports)).toMatchInlineSnapshot(`
			Array [
			  "upload",
			  "download",
			  "remove",
			  "list",
			  "getProperties",
			  "copy",
			  "getUrl",
			  "isCancelError",
			  "StorageError",
			]
		`);
		});

		it('should only export expected symbols from the S3 provider', () => {
			expect(Object.keys(storageS3Exports)).toMatchInlineSnapshot(`
			Array [
			  "upload",
			  "download",
			  "remove",
			  "list",
			  "getProperties",
			  "copy",
			  "getUrl",
			]
		`);
		});
	});
});
