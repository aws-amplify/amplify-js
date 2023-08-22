// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AnalyticsEvent } from './Analytics';

export type RecordParameters = {
	/**
	 * An event to send to the default Analytics provider.
	 */
	event: AnalyticsEvent;

	/**
	 * Flag that indicates the event should be transmitted immediately (i.e not buffered).
	 */
	sendImmediately?: boolean;
};
