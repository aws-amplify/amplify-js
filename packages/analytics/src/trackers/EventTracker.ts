// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	EventTrackingOpts,
	TrackerEventRecorder,
	TrackerInterface,
} from '../types/trackers';

export class EventTracker implements TrackerInterface {
	constructor(
		eventRecorder: TrackerEventRecorder,
		options?: EventTrackingOpts
	) {}

	public configure(
		eventRecorder: TrackerEventRecorder,
		options?: EventTrackingOpts
	) {}

	public cleanup() {}
}
