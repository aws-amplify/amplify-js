// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AuthSession } from '@aws-amplify/core/src/singleton/Auth/types';
import { KinesisShard } from '@aws-amplify/core/lib/providers/kinesis/types/kinesis';
import { EventBufferConfig } from '../../../utils/EventBuffer';

export type KinesisBufferEvent = KinesisShard & {
	event: Uint8Array;
	timestamp: number;
	retryCount: number;
};

export type KinesisEventBufferConfig = EventBufferConfig & {
	region: string;
	credentials: Required<AuthSession>['credentials'];
	identityId: AuthSession['identityId'];
	resendLimit?: number;
	userAgentValue?: string;
};
