// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
	PageViewTrackingOpts,
	TrackerEventRecorder,
	TrackerInterface,
} from '../types/trackers';

export class PageViewTracker implements TrackerInterface {
	constructor(
		eventRecorder: TrackerEventRecorder,
		options?: PageViewTrackingOpts
	) {}

	public configure(
		eventRecorder: TrackerEventRecorder,
		options?: PageViewTrackingOpts
	) {}

	public cleanup() {}
}
