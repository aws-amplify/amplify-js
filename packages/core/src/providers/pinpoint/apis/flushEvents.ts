// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { getEventBuffer } from '~/src/providers/pinpoint/utils/getEventBuffer';
import { EventBufferConfig } from '~/src/providers/pinpoint/types/buffer';
import { AuthSession } from '~/src/singleton/Auth/types';
import {
	BUFFER_SIZE,
	FLUSH_INTERVAL,
	FLUSH_SIZE,
	RESEND_LIMIT,
} from '~/src/providers/pinpoint/utils/constants';

export type PinpointFlushEventsInput = Partial<EventBufferConfig> & {
	appId: string;
	region: string;
	credentials: Required<AuthSession>['credentials'];
	identityId?: AuthSession['identityId'];
	userAgentValue?: string;
};

export const flushEvents = ({
	appId,
	region,
	credentials,
	bufferSize,
	flushInterval,
	flushSize,
	resendLimit,
	identityId,
	userAgentValue,
}: PinpointFlushEventsInput) => {
	getEventBuffer({
		appId,
		region,
		credentials,
		bufferSize: bufferSize ?? BUFFER_SIZE,
		flushInterval: flushInterval ?? FLUSH_INTERVAL,
		flushSize: flushSize ?? FLUSH_SIZE,
		resendLimit: resendLimit ?? RESEND_LIMIT,
		identityId,
		userAgentValue,
	}).flushAll();
};
