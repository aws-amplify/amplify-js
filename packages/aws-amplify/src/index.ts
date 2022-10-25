/*
 * Copyright 2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
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

export { Amplify } from './amplifySingleton';
export {
	Analytics,
	AnalyticsProvider,
	AWSPinpointProvider,
	AWSKinesisProvider,
	AWSKinesisFirehoseProvider,
	AmazonPersonalizeProvider,
} from '@aws-amplify/analytics';
export { Auth } from '@aws-amplify/auth';
export { Storage, StorageClass } from '@aws-amplify/storage';
export { API, APIClass, graphqlOperation } from '@aws-amplify/api';
export {
	AuthModeStrategyType,
	DataStore,
	Predicates,
	SortDirection,
	syncExpression,
} from '@aws-amplify/datastore';
export { PubSub } from '@aws-amplify/pubsub';
export { BrowserStorageCache as Cache } from '@aws-amplify/cache';
export { Interactions } from '@aws-amplify/interactions';
export { Notifications } from '@aws-amplify/notifications';
export { XR } from '@aws-amplify/xr';
export { Predictions } from '@aws-amplify/predictions';
export {
	ConsoleLogger as Logger,
	Hub,
	JS,
	ClientDevice,
	Signer,
	I18n,
	ServiceWorker,
	AWSCloudWatchProvider,
} from '@aws-amplify/core';
export { withSSRContext } from './withSSRContext';
export { Geo } from '@aws-amplify/geo';
