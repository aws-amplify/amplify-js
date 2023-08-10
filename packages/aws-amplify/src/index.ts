// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

/*
This file maps top-level exports from `aws-amplify`.
*/
export { Amplify } from '@aws-amplify/core';
export { withSSRContext } from './ssr/withSSRContext';

// TODO(v6): Refactor these into category-specific exports as they come online
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
export {
	ConsoleLogger as Logger,
	Hub,
	ClientDevice,
	Signer,
	I18n,
	ServiceWorker,
	AWSCloudWatchProvider,
} from '@aws-amplify/core';

export { DefaultAmplifyV6 as AmplifyV6 } from './initSingleton';

// TODO(v6): Re-enable these exports when available
/*
export { API, APIClass, graphqlOperation } from '@aws-amplify/api';
export { PubSub } from '@aws-amplify/pubsub';
export {
	AuthModeStrategyType,
	DataStore,
	Predicates,
	SortDirection,
	syncExpression,
} from '@aws-amplify/datastore';
export { Interactions } from '@aws-amplify/interactions';
export { Notifications } from '@aws-amplify/notifications';
export { Predictions } from '@aws-amplify/predictions';
export { Geo } from '@aws-amplify/geo';
*/
