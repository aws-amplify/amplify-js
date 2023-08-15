// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

// Customer-facing types

// Default provider (i.e. Pinpoint) APIs
export * from './Providers/pinpoint';

// TODO(v6) Remove once all default provider functional APIs available
export { Analytics } from './Analytics';
export { AnalyticsProvider } from './types';
export {
	AWSPinpointProvider,
} from './Providers';

// TODO(v6) Refactor as additional Analytics providers come online
/*
export {
	AWSKinesisProvider,
	AWSKinesisFirehoseProvider,
	AmazonPersonalizeProvider,
} from './Providers';
*/
