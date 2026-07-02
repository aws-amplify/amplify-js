// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { PinpointProviderConfig } from '../../providers/pinpoint/types';
import { KinesisProviderConfig } from '../../providers/kinesis/types';
import { KinesisFirehoseProviderConfig } from '../../providers/kinesis-firehose/types';
import { PersonalizeProviderConfig } from '../../providers/personalize/types';
import { AtLeastOne } from '../types';

/**
 * Configuration for the Amazon Connect Customer Profiles Analytics provider.
 * The provider backs `identifyUser` with a REST endpoint (typically fronted by
 * a Lambda) that writes to Amazon Connect Customer Profiles.
 */
export interface ConnectCustomerProfilesProviderConfig {
	CustomerProfiles: {
		endpoint: string;
		region: string;
	};
}

export type AnalyticsConfig = AtLeastOne<
	PinpointProviderConfig &
		KinesisProviderConfig &
		KinesisFirehoseProviderConfig &
		PersonalizeProviderConfig &
		ConnectCustomerProfilesProviderConfig
>;
