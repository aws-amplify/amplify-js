// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Amplify } from './Amplify';
import { Platform } from './Platform';

export { Amplify } from './Amplify';
export { AmplifyClass } from './Amplify';
export { ClientDevice } from './ClientDevice';
export { ConsoleLogger, ConsoleLogger as Logger } from './Logger';
export { invalidParameter, missingConfig } from './Errors';
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
export { ICredentials } from './types';
export { StorageHelper, MemoryStorage } from './StorageHelper';
export { UniversalStorage } from './UniversalStorage';
export { Platform, getAmplifyUserAgent } from './Platform';
export {
	INTERNAL_AWS_APPSYNC_PUBSUB_PROVIDER,
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

/**
 * @deprecated use named import
 */
export default Amplify;
