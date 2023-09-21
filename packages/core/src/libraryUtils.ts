// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

/*
This file maps top-level exports from `@aws-amplify/core/internals/utils`. These are intended to be internal
utils for use throughout the library.
*/
// JS utilities
export {
	isBrowser,
	filenameToContentType,
	generateRandomString,
	isEmpty,
	isStrictObject,
	isTextFile,
	isWebWorker,
	makeQuerablePromise,
	objectLessAttributes,
	sortByField,
	transferKeyToLowerCase,
	transferKeyToUpperCase,
} from './Util/JS';
export { parseAWSExports } from './parseAWSExports';
export { LegacyConfig } from './singleton/types';
export {
	JWT,
	StrictUnion,
	CognitoIdentityPoolConfig,
	JwtPayload,
} from './singleton/Auth/types';
// Auth utilities
export {
	decodeJWT,
	assertTokenProviderConfig,
	assertIdentityPoolIdConfig,
	assertOAuthConfig,
} from './singleton/Auth/utils';
export { isTokenExpired } from './singleton/Auth';
export { GraphQLAuthModeKeys } from './singleton/API/types';
export { Signer } from './Signer';

// Logging utilities
export { ConsoleLogger, ConsoleLogger as Logger } from './Logger';

// Platform & device utils
import { Platform } from './Platform';
export { ClientDevice } from './ClientDevice';
export {
	Platform,
	getAmplifyUserAgentObject,
	getAmplifyUserAgent,
} from './Platform';
export {
	ApiAction,
	AuthAction,
	AnalyticsAction,
	Category,
	CustomUserAgentDetails,
	DataStoreAction,
	Framework,
	GeoAction,
	InteractionsAction,
	InAppMessagingAction,
	PredictionsAction,
	PubSubAction,
	PushNotificationAction,
	StorageAction,
} from './Platform/types';
export const Constants = {
	userAgent: Platform.userAgent,
};

// Service worker
export { ServiceWorker } from './ServiceWorker';

// Other utilities & constants
export {
	AWS_CLOUDWATCH_CATEGORY,
	BackgroundManagerNotOpenError,
	BackgroundProcessManager,
	BackgroundProcessManagerState,
	DateUtils,
	Mutex,
	NO_CREDS_ERROR_STRING,
	NonRetryableError,
	RETRY_ERROR_CODES,
	Reachability,
	isNonRetryableError,
	jitteredBackoff,
	jitteredExponentialRetry,
	retry,
	urlSafeDecode,
	urlSafeEncode,
} from './Util';
export {
	AmplifyError,
	PlatformNotSupportedError,
	createAssertionFunction,
} from './errors';
export {
	AmplifyErrorCode,
	AmplifyErrorMap,
	AmplifyErrorParams,
	AssertionFunction,
	ServiceError,
} from './types';
export {
	INTERNAL_AWS_APPSYNC_REALTIME_PUBSUB_PROVIDER,
	USER_AGENT_HEADER,
} from './Util/Constants';
export { fetchAuthSession } from './singleton/apis/internal/fetchAuthSession';
export { AMPLIFY_SYMBOL } from './Hub';
