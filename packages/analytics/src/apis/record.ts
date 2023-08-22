// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { RecordParameters } from '../types';
import { record as pinpointRecord } from '../providers/pinpoint';

/**
 * Sends an event to the default analytics provider.
 *
 * @param {RecordParameters} params parameters used to construct requests sent to service.
 *
 * @throws An {@link RecordException} when the underlying service returns an error.
 * @throws An {@link AnalyticsValidationErrorCode} when API call parameters are invalid.
 */
export const record = async (params: RecordParameters): Promise<void> =>
	pinpointRecord(params);
