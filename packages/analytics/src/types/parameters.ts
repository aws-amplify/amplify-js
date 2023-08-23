// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

export type RecordParameters<EventType> = {
	/**
	 * An event to send to the default Analytics provider.
	 */
	event: EventType;
};
