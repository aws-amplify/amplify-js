// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { PinpointProviderConfig } from '../../providers/pinpoint/types';
import { KinesisProviderConfig } from '../../providers/kinesis/types';
import { KinesisFirehoseProviderConfig } from '../../providers/kinesis-firehose/types';
import { PersonalizeProviderConfig } from '../../providers/personalize/types';

export type AnalyticsConfig = PinpointProviderConfig &
	KinesisProviderConfig &
	KinesisFirehoseProviderConfig &
	PersonalizeProviderConfig;
