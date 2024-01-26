// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import * as topLevelExports from '../src';
import * as utilsExports from '../src/utils';
import * as apiTopLevelExports from '../src/api';
import * as authTopLevelExports from '../src/auth';
import * as authCognitoExports from '../src/auth/cognito';
import * as analyticsTopLevelExports from '../src/analytics';
import * as analyticsPinpointExports from '../src/analytics/pinpoint';
import * as inAppMessagingTopLevelExports from '../src/in-app-messaging';
import * as inAppMessagingPinpointTopLevelExports from '../src/in-app-messaging/pinpoint';
import * as analyticsKinesisExports from '../src/analytics/kinesis';
import * as analyticsKinesisFirehoseExports from '../src/analytics/kinesis-firehose';
import * as analyticsPersonalizeExports from '../src/analytics/personalize';
import * as storageTopLevelExports from '../src/storage';
import * as storageS3Exports from '../src/storage/s3';
import * as loggingTopLevelExports from '../src/logging';
import * as loggingCloudwatchExports from '../src/logging/cloudwatch';

/**
 * Describes exports from the aws-amplify umbrella package to ensure we're not polluting the export surface.
 *
 * Note: These tests will not capture exported types.
 */
describe('aws-amplify Exports', () => {
	describe('Top-level exports', () => {
		it('should only export expected symbols', () => {
			expect(Object.keys(topLevelExports).sort()).toEqual(['Amplify'].sort());
		});
	});

	describe('Utils exports', () => {
		it('should only export expected symbols', () => {
			expect(Object.keys(utilsExports).sort()).toEqual(
				[
					'Hub',
					'I18n',
					'Cache',
					'ConsoleLogger',
					'ServiceWorker',
					'CookieStorage',
					'defaultStorage',
					'parseAmplifyConfig',
					'sessionStorage',
					'sharedInMemoryStorage',
				].sort()
			);
		});
	});

	describe('API exports', () => {
		it('should only export expected symbols from the top level', () => {
			expect(Object.keys(apiTopLevelExports).sort()).toEqual(
				[
					'CONNECTION_STATE_CHANGE',
					'ConnectionState',
					'GraphQLAuthError',
					'del',
					'generateClient',
					'get',
					'head',
					'isCancelError',
					'patch',
					'post',
					'put',
				].sort()
			);
		});
	});

	describe('Analytics exports', () => {
		it('should only export expected symbols from the top-level', () => {
			expect(Object.keys(analyticsTopLevelExports).sort()).toEqual(
				[
					'record',
					'identifyUser',
					'configureAutoTrack',
					'flushEvents',
					'enable',
					'disable',
					'AnalyticsError',
				].sort()
			);
		});

		it('should only export expected symbols from the Pinpoint provider', () => {
			expect(Object.keys(analyticsPinpointExports).sort()).toEqual(
				['record', 'identifyUser', 'configureAutoTrack', 'flushEvents'].sort()
			);
		});

		it('should only export expected symbols from the Kinesis provider', () => {
			expect(Object.keys(analyticsKinesisExports).sort()).toEqual(
				['record', 'flushEvents'].sort()
			);
		});

		it('should only export expected symbols from the Kinesis Firehose provider', () => {
			expect(Object.keys(analyticsKinesisFirehoseExports).sort()).toEqual(
				['record', 'flushEvents'].sort()
			);
		});

		it('should only export expected symbols from the Personalize provider', () => {
			expect(Object.keys(analyticsPersonalizeExports).sort()).toEqual(
				['record', 'flushEvents'].sort()
			);
		});
	});

	describe('InAppMessaging exports', () => {
		it('should only export expected symbols from the top-level', () => {
			expect(Object.keys(inAppMessagingTopLevelExports).sort()).toEqual(
				[
					'identifyUser',
					'syncMessages',
					'dispatchEvent',
					'setConflictHandler',
					'initializeInAppMessaging',
					'onMessageReceived',
					'onMessageDismissed',
					'onMessageDisplayed',
					'onMessageActionTaken',
					'notifyMessageInteraction',
					'clearMessages',
				].sort()
			);
		});

		it('should only export expected symbols from the Pinpoint provider', () => {
			expect(Object.keys(inAppMessagingPinpointTopLevelExports).sort()).toEqual(
				[
					'identifyUser',
					'syncMessages',
					'dispatchEvent',
					'setConflictHandler',
					'initializeInAppMessaging',
					'onMessageReceived',
					'onMessageDismissed',
					'onMessageDisplayed',
					'onMessageActionTaken',
					'notifyMessageInteraction',
					'clearMessages',
				].sort()
			);
		});
	});

	describe('Auth exports', () => {
		it('should only export expected symbols from the top-level', () => {
			expect(Object.keys(authTopLevelExports).sort()).toEqual(
				[
					'AuthError',
					'signUp',
					'resetPassword',
					'confirmResetPassword',
					'signIn',
					'resendSignUpCode',
					'confirmSignUp',
					'confirmSignIn',
					'updateMFAPreference',
					'fetchMFAPreference',
					'verifyTOTPSetup',
					'updatePassword',
					'setUpTOTP',
					'updateUserAttributes',
					'updateUserAttribute',
					'getCurrentUser',
					'confirmUserAttribute',
					'signInWithRedirect',
					'fetchUserAttributes',
					'signOut',
					'sendUserAttributeVerificationCode',
					'deleteUserAttributes',
					'deleteUser',
					'rememberDevice',
					'forgetDevice',
					'fetchDevices',
					'autoSignIn',
					'fetchAuthSession',
					'decodeJWT',
				].sort()
			);
		});

		it('should only export expected symbols from the Cognito provider', () => {
			expect(Object.keys(authCognitoExports).sort()).toEqual(
				[
					'signUp',
					'resetPassword',
					'confirmResetPassword',
					'signIn',
					'resendSignUpCode',
					'confirmSignUp',
					'confirmSignIn',
					'updateMFAPreference',
					'fetchMFAPreference',
					'verifyTOTPSetup',
					'updatePassword',
					'setUpTOTP',
					'updateUserAttributes',
					'updateUserAttribute',
					'getCurrentUser',
					'confirmUserAttribute',
					'signInWithRedirect',
					'fetchUserAttributes',
					'signOut',
					'sendUserAttributeVerificationCode',
					'deleteUserAttributes',
					'deleteUser',
					'rememberDevice',
					'forgetDevice',
					'fetchDevices',
					'autoSignIn',
					'cognitoCredentialsProvider',
					'cognitoUserPoolsTokenProvider',
					'CognitoAWSCredentialsAndIdentityIdProvider',
					'DefaultIdentityIdStore',
					'TokenOrchestrator',
					'DefaultTokenStore',
					'refreshAuthTokens',
				].sort()
			);
		});
	});

	describe('Storage exports', () => {
		it('should only export expected symbols from the top-level', () => {
			expect(Object.keys(storageTopLevelExports).sort()).toEqual(
				[
					'uploadData',
					'downloadData',
					'remove',
					'list',
					'getProperties',
					'copy',
					'getUrl',
					'isCancelError',
					'StorageError',
				].sort()
			);
		});

		it('should only export expected symbols from the S3 provider', () => {
			expect(Object.keys(storageS3Exports).sort()).toEqual(
				[
					'uploadData',
					'downloadData',
					'remove',
					'list',
					'getProperties',
					'copy',
					'getUrl',
				].sort()
			);
		});
	});

	describe('Logging exports', () => {
		it('should only export expected symbols from the top-level', () => {
			expect(Object.keys(loggingTopLevelExports).sort()).toEqual(
				['disable', 'enable', 'flushLogs', 'createLogger', 'configure'].sort()
			);
		});

		it('should only export expected symbols from the Cloudwatch provider', () => {
			expect(Object.keys(loggingCloudwatchExports).sort()).toEqual(
				['flushLogs', 'createLogger', 'configure'].sort()
			);
		});
	});
});
