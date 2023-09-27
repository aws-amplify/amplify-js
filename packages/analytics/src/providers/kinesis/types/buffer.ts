// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { EventBufferConfig } from '../../../utils';
import { Credentials } from '@aws-sdk/types';
import { KinesisShard } from '../../../types';

export type KinesisBufferEvent = KinesisShard & {
	event: Uint8Array;
	timestamp: number;
	retryCount: number;
};

export type KinesisEventBufferConfig = EventBufferConfig & {
	region: string;
	credentials: Credentials;
	identityId?: string;
	resendLimit?: number;
	userAgentValue?: string;
};
