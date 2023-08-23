// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { RecordParameters } from '../types';
import { record as pinpointRecord } from '../providers/pinpoint';

/**
 * Sends an event to the default analytics provider.
 *
 * @param {RecordParameters} params Parameters used to construct the request.
 *
 * @throws An {@link AnalyticsError} when an error occurs invoking the API.
 *
 * @returns A promise that will resolve when the request is complete.
 */
export const record = async (params: RecordParameters): Promise<void> =>
	pinpointRecord(params);
