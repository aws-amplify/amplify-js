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

export {
	Analytics,
	AnalyticsClass,
	AnalyticsProvider,
	AWSPinpointProvider,
	AWSKinesisProvider,
} from '@aws-amplify/analytics';
export { Auth, AuthClass } from '@aws-amplify/auth';
export { Storage, StorageClass } from '@aws-amplify/storage';
export { API, APIClass, graphqlOperation } from '@aws-amplify/api';
export { PubSub, PubSubClass } from '@aws-amplify/pubsub';
export { default as Cache } from '@aws-amplify/cache';
export { Interactions, InteractionsClass } from '@aws-amplify/interactions';
export * from '@aws-amplify/ui';
export { XR, XRClass } from '@aws-amplify/xr';
export {
	Predictions,
	AmazonAIPredictionsProvider,
} from '@aws-amplify/predictions';
export {
	Amplify,
	ConsoleLogger as Logger,
	Hub,
	JS,
	ClientDevice,
	Signer,
	I18n,
	ServiceWorker,
} from '@aws-amplify/core';

import { Amplify, ServiceWorker } from '@aws-amplify/core';

import Cache from '@aws-amplify/cache';

Amplify.Cache = Cache;
Amplify.ServiceWorker = ServiceWorker;

/**
 * @deprecated use named import
 */
export default Amplify;
