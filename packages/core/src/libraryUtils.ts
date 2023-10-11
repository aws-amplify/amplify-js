// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

/*
This file maps top-level exports from `@aws-amplify/core/internals/utils`. These are intended to be internal
utils for use throughout the library.
*/
// Core utilities
export {
	generateRandomString,
	isBrowser,
	isNonRetryableError,
	isWebWorker,
	jitteredBackoff,
	jitteredExponentialRetry,
	NonRetryableError,
	retry,
	urlSafeDecode,
	urlSafeEncode,
} from './utils';
export { parseAWSExports } from './parseAWSExports';
export { LegacyConfig } from './singleton/types';

// Auth utilities
export {
	decodeJWT,
	assertTokenProviderConfig,
	assertIdentityPoolIdConfig,
	assertOAuthConfig,
} from './singleton/Auth/utils';
export { isTokenExpired } from './singleton/Auth';
export { APIAuthMode, DocumentType } from './singleton/API/types';
export { Signer } from './Signer';
export {
	JWT,
	StrictUnion,
	CognitoIdentityPoolConfig,
	JwtPayload,
	AuthStandardAttributeKey,
	AuthVerifiableAttributeKey,
} from './singleton/Auth/types';

// Platform & user-agent utilities
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
	SetCustomUserAgentInput,
} from './Platform/types';
export { setCustomUserAgent } from './Platform/customUserAgent';

// Service worker
export { ServiceWorker } from './ServiceWorker';

// Other utilities & constants
export { BackgroundProcessManager } from './BackgroundProcessManager';
export { Mutex } from './Mutex';
export { Reachability } from './Reachability';
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
} from './constants';
export { fetchAuthSession } from './singleton/apis/internal/fetchAuthSession';
export { AMPLIFY_SYMBOL } from './Hub';
export { base64Decoder, base64Encoder } from './utils/convert';
export { getCrypto } from './utils/globalHelpers';

// Hub
export { HubInternal } from './Hub';
