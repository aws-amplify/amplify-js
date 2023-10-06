// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { EventBufferConfig } from '../../../utils';
import { KinesisStream } from '../../../types';
import { Credentials } from '@aws-sdk/types';

export type KinesisFirehoseBufferEvent = KinesisStream & {
	event: Uint8Array;
	retryCount: number;
	timestamp: number;
};

export type KinesisFirehoseEventBufferConfig = EventBufferConfig & {
	region: string;
	credentials: Credentials;
	identityId?: string;
	resendLimit?: number;
	userAgentValue?: string;
};
