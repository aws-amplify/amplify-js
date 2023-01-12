// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

export { Amplify } from '@aws-amplify/core';
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
export { Cache } from '@aws-amplify/cache';
export { Interactions } from '@aws-amplify/interactions';
export { Notifications } from '@aws-amplify/notifications';
export { XR } from '@aws-amplify/xr';
export { Predictions } from '@aws-amplify/predictions';
export {
	ConsoleLogger as Logger,
	Hub,
	ClientDevice,
	Signer,
	I18n,
	ServiceWorker,
	AWSCloudWatchProvider,
} from '@aws-amplify/core';
export { withSSRContext } from './withSSRContext';
export { Geo } from '@aws-amplify/geo';
