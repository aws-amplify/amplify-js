// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { PinpointProviderConfig } from '../../providers/pinpoint/types';
import { KinesisProviderConfig } from '../../providers/kinesis/types';
import { KinesisFirehoseProviderConfig } from '../../providers/kinesis-firehose/types';
import { PersonalizeProviderConfig } from '../../providers/personalize/types';

type AtLeastOne<T, U = { [K in keyof T]: Pick<T, K> }> = Partial<T> &
	U[keyof U];

export type AnalyticsConfig = AtLeastOne<
	PinpointProviderConfig &
		KinesisProviderConfig &
		KinesisFirehoseProviderConfig &
		PersonalizeProviderConfig
>;
