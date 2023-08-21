// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { 
	AnalyticsEvent
} from "../../../types";

/**
 * Sends an event to Pinpoint.
 * 
 * @param params - An AnalyticsEvent to send to Pinpoint.
 * 
 * @throws AnalyticsError Thrown when an error occurs sending the event.
 * 
 * @returns Returns a promise that will resolve with the results of operation.
 */
export const record = async (params: AnalyticsEvent) => {
	// TODO(v6) Use internal `record` API from core
};
