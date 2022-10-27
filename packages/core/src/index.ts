/*
 * Copyright 2017-2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with
 * the License. A copy of the License is located at
 *
 *     http://aws.amazon.com/apache2.0/
 *
 * or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR
 * CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions
 * and limitations under the License.
 */

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
