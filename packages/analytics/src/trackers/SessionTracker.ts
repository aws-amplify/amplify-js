// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	SessionTrackingOpts,
	TrackerEventRecorder,
	TrackerInterface,
} from '../types/trackers';

export class SessionTracker implements TrackerInterface {
	constructor(
		eventRecorder: TrackerEventRecorder,
		options?: SessionTrackingOpts
	) {}

	public configure(
		eventRecorder: TrackerEventRecorder,
		options?: SessionTrackingOpts
	) {}

	public cleanup() {}
}
