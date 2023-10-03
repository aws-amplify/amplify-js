// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { PersonalizeEvent } from './';
import { EventBufferConfig } from '../../../utils/eventBuffer';
import { AuthSession } from '@aws-amplify/core/src/singleton/Auth/types';

export type PersonalizeBufferEvent = {
	trackingId: string;
	sessionId?: string;
	userId?: string;
	event: PersonalizeEvent;
	timestamp: number;
};

export type PersonalizeBufferConfig = EventBufferConfig & {
	region: string;
	credentials: Required<AuthSession>['credentials'];
	identityId: AuthSession['identityId'];
};
