// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AWSCredentials } from '@aws-amplify/core/internals/utils';
import { EventBufferConfig } from '../../../utils';
import { KinesisShard } from '../../../types';

export type KinesisBufferEvent = KinesisShard & {
	event: Uint8Array;
	timestamp: number;
	retryCount: number;
};

export type KinesisEventBufferConfig = EventBufferConfig & {
	region: string;
	credentials: AWSCredentials;
	identityId?: string;
	resendLimit?: number;
	userAgentValue?: string;
};
