// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { fetchAuthSession } from '@aws-amplify/core';
import { getDeviceId } from '@aws-amplify/core/internals/utils';
import { RejectedLogEventsInfo } from '@aws-sdk/client-cloudwatch-logs';

const GUEST_USER_ID_FOR_LOG_STREAM_NAME: string = 'guest';

export async function getDefaultStreamName() {
	const { userSub } = await fetchAuthSession();
	const userId = userSub ?? GUEST_USER_ID_FOR_LOG_STREAM_NAME;
	const deviceId = await getDeviceId();
	const dateNow = new Date().toISOString().split('T')[0];
	return `${dateNow}.${deviceId}.${userId}`;
}

// TODO: can be used when retry logic is added
export function parseRejectedLogEvents(
	rejectedLogEventsInfo: RejectedLogEventsInfo
) {
	const {
		tooOldLogEventEndIndex,
		tooNewLogEventStartIndex,
		expiredLogEventEndIndex,
	} = rejectedLogEventsInfo;
	let oldOrExpiredLogsEndIndex;
	if (tooOldLogEventEndIndex) {
		oldOrExpiredLogsEndIndex = tooOldLogEventEndIndex;
	}
	if (expiredLogEventEndIndex) {
		oldOrExpiredLogsEndIndex = oldOrExpiredLogsEndIndex
			? Math.max(oldOrExpiredLogsEndIndex, expiredLogEventEndIndex)
			: expiredLogEventEndIndex;
	}
	return { oldOrExpiredLogsEndIndex, tooNewLogEventStartIndex };
}
