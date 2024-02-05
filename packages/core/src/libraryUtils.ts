// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import WordArray from './utils/WordArray';
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
	deDupeAsyncFunction,
} from './utils';
export { parseAWSExports } from './parseAWSExports';
export { LegacyConfig } from './singleton/types';
export { ADD_OAUTH_LISTENER } from './singleton/constants';
export { amplifyUuid } from './utils/amplifyUuid';
export { AmplifyUrl, AmplifyUrlSearchParams } from './utils/amplifyUrl';

// Auth utilities
export {
	decodeJWT,
	assertTokenProviderConfig,
	assertIdentityPoolIdConfig,
	assertOAuthConfig,
} from './singleton/Auth/utils';
export { isTokenExpired } from './singleton/Auth';
export {
	AssociationBelongsTo,
	AssociationHasMany,
	AssociationHasOne,
	DocumentType,
	GraphQLAuthMode,
	ModelFieldType,
	ModelIntrospectionSchema,
	SchemaModel,
	SchemaModels,
} from './singleton/API/types';
export { Signer } from './Signer';
export {
	JWT,
	StrictUnion,
	CognitoIdentityPoolConfig,
	JwtPayload,
	AuthStandardAttributeKey,
	AuthVerifiableAttributeKey,
	AWSCredentials,
} from './singleton/Auth/types';
export { haveCredentialsChanged } from './utils/haveCredentialsChanged';

// Platform & user-agent utilities
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
	StorageUserAgentInput,
	AuthUserAgentInput,
	InAppMessagingUserAgentInput,
	GeoUserAgentInput,
} from './Platform/types';
export { setCustomUserAgent } from './Platform/customUserAgent';

// Error handling
export {
	AmplifyError,
	PlatformNotSupportedError,
	createAssertionFunction,
	ApiError,
	ApiErrorParams,
	ApiErrorResponse,
} from './errors';
export {
	AmplifyErrorCode,
	AmplifyErrorMap,
	AmplifyErrorParams,
	AssertionFunction,
	ServiceError,
} from './types';

// Other utilities & constants
export { BackgroundProcessManager } from './BackgroundProcessManager';
export { Mutex } from './Mutex';
export { Reachability } from './Reachability';
export { USER_AGENT_HEADER } from './constants';
export { fetchAuthSession } from './singleton/apis/internal/fetchAuthSession';
export { AMPLIFY_SYMBOL } from './Hub';
export { base64Decoder, base64Encoder } from './utils/convert';
export { getCrypto } from './utils/globalHelpers';
export { cryptoSecureRandomInt } from './utils/cryptoSecureRandomInt';
export { WordArray };

// Hub
export { HubInternal } from './Hub';

// Session listener
export { sessionListener } from './utils/sessionListener';
export { SessionState } from './utils/sessionListener/types';
export {
	SESSION_START_EVENT,
	SESSION_STOP_EVENT,
} from './utils/sessionListener';
