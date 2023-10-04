// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { PersonalizeEvent } from './';
import { EventBufferConfig } from '../../../utils';
import { Credentials } from '@aws-sdk/types';

export type PersonalizeBufferEvent = {
	trackingId: string;
	sessionId?: string;
	userId?: string;
	event: PersonalizeEvent;
	timestamp: number;
};

export type PersonalizeBufferConfig = EventBufferConfig & {
	region: string;
	credentials: Credentials;
	identityId?: string;
	userAgentValue?: string;
};
