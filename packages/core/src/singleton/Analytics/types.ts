// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { PinpointProviderConfig } from '~/src/providers/pinpoint/types';
import { KinesisProviderConfig } from '~/src/providers/kinesis/types';
import { KinesisFirehoseProviderConfig } from '~/src/providers/kinesis-firehose/types';
import { PersonalizeProviderConfig } from '~/src/providers/personalize/types';
import { AtLeastOne } from '~/src/singleton/types';

export type AnalyticsConfig = AtLeastOne<
	PinpointProviderConfig &
		KinesisProviderConfig &
		KinesisFirehoseProviderConfig &
		PersonalizeProviderConfig
>;
