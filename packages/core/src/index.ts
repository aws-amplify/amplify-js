// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Amplify } from './Amplify';
import { Platform } from './Platform';

export { Amplify };
export { AmplifyClass } from './Amplify';
export { ClientDevice } from './ClientDevice';
export { ConsoleLogger, ConsoleLogger as Logger } from './Logger';
export {
	invalidParameter,
	missingConfig,
	AmplifyError,
	AmplifyErrorString,
} from './Errors';
export { Hub, HubCapsule, HubCallback, HubPayload } from './Hub';
export { I18n } from './I18n';
export {
	browserOrNode,
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
} from './JS';
export { Signer } from './Signer';
export { parseAWSExports } from './parseAWSExports';
export { AWSCloudWatchProvider } from './Providers';
export { FacebookOAuth, GoogleOAuth } from './OAuthHelper';
export { AppState, AsyncStorage, Linking } from './RNComponents';
export { Credentials, CredentialsClass } from './Credentials';
export { ServiceWorker } from './ServiceWorker';
export {
	ICredentials,
	ErrorParams,
	AmplifyErrorMap,
	ServiceError,
	KeyValueStorageInterface,
} from './types';
export {
	StorageHelper,
	MemoryStorage,
	LocalStorage,
	CookieStorage,
	SessionStorage,
	MemoryKeyValueStorage,
} from './StorageHelper';
export { UniversalStorage } from './UniversalStorage';
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
export {
	INTERNAL_AWS_APPSYNC_REALTIME_PUBSUB_PROVIDER,
	USER_AGENT_HEADER,
} from './constants';

export const Constants = {
	userAgent: Platform.userAgent,
};

export {
	AWS_CLOUDWATCH_BASE_BUFFER_SIZE,
	AWS_CLOUDWATCH_CATEGORY,
	AWS_CLOUDWATCH_MAX_BATCH_EVENT_SIZE,
	AWS_CLOUDWATCH_MAX_EVENT_SIZE,
	AWS_CLOUDWATCH_PROVIDER_NAME,
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

// Cache exports
import { BrowserStorageCache } from './Cache/BrowserStorageCache';
export { asserts } from './Util/errors/AssertError';
export { isTokenExpired } from './singleton/Auth';
export { InMemoryCache } from './Cache/InMemoryCache';
export { CacheConfig } from './Cache/types';
export { ICache } from './Cache/types';
export { BrowserStorageCache };
export {
	decodeJWT,
	assertTokenProviderConfig,
	assertIdentityPooIdConfig,
} from './singleton/Auth/utils';
export {
	TokenProvider,
	AuthTokens,
	FetchAuthSessionOptions,
	AWSCredentialsAndIdentityIdProvider,
	AWSCredentialsAndIdentityId,
	Identity,
} from './singleton/Auth/types';
export {
	AuthConfig,
	UserPoolConfig,
	UserPoolConfigAndIdentityPoolConfig,
	StorageAccessLevel,
	StorageConfig,
	GetCredentialsOptions,
} from './singleton/types';

// AWSClients exports
export {
	getCredentialsForIdentity,
	getId,
	GetCredentialsForIdentityInput,
	GetCredentialsForIdentityOutput,
} from './AwsClients/CognitoIdentity';

export { AmplifyV6, fetchAuthSession } from './singleton';
export { LibraryOptions, ResourcesConfig } from './singleton/types';

// Standard `Cache` export to maintain interoperability with React Native
export { BrowserStorageCache as Cache };

/**
 * @deprecated use named import
 */
export default Amplify;
