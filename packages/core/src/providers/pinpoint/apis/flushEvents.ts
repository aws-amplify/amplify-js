// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Credentials } from '@aws-sdk/types';
import { getEventBuffer } from '../utils/getEventBuffer';
import {
	BUFFER_SIZE,
	FLUSH_INTERVAL,
	FLUSH_SIZE,
	RESEND_LIMIT,
} from '../utils/constants';

export const flushEvents = (
	appId: string,
	region: string,
	credentials: Credentials,
	identityId?: string
) => {
	getEventBuffer({
		appId,
		bufferSize: BUFFER_SIZE,
		credentials,
		flushInterval: FLUSH_INTERVAL,
		flushSize: FLUSH_SIZE,
		identityId,
		region,
		resendLimit: RESEND_LIMIT,
	}).flushAll();
};
