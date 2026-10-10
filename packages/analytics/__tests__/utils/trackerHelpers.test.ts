// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { updateProviderTrackers } from '../../src/utils/trackerHelpers';
import {
	EventTracker,
	PageViewTracker,
	SessionTracker,
} from '../../src/trackers';
import {
	TrackerEventRecorder,
	TrackerInterface,
	TrackerType,
} from '../../src/types/trackers';
import { KinesisConfigureAutoTrackInput } from '../../src/providers/kinesis/types';

jest.mock('../../src/trackers');

describe('trackerHelpers: updateProviderTrackers', () => {
	const MockEventTracker = EventTracker as jest.MockedClass<
		typeof EventTracker
	>;
	const MockSessionTracker = SessionTracker as jest.MockedClass<
		typeof SessionTracker
	>;
	const MockPageViewTracker = PageViewTracker as jest.MockedClass<
		typeof PageViewTracker
	>;
	const recorder: TrackerEventRecorder = jest.fn();

	beforeEach(() => {
		MockEventTracker.mockClear();
		MockSessionTracker.mockClear();
		MockPageViewTracker.mockClear();
	});

	it('accepts a generic (non-Pinpoint) configure input and forwards its options to the tracker', () => {
		const providerTrackers: Partial<Record<TrackerType, TrackerInterface>> = {};

		// A Kinesis input carries provider-specific fields (streamName / partitionKey) in its
		// options. It must be assignable to the generic AnalyticsConfigureAutoTrackInput parameter,
		// proving the shared tracker infra is decoupled from any single provider.
		const input: KinesisConfigureAutoTrackInput = {
			enable: true,
			type: 'event',
			options: {
				streamName: 'stream0',
				partitionKey: 'partition0',
				attributes: { 'custom-attr': 'val' },
			},
		};

		updateProviderTrackers(input, recorder, providerTrackers);

		// The full options object (including the provider-specific fields) is forwarded as-is;
		// the trackers themselves only read the generic fields they understand and ignore the rest.
		expect(MockEventTracker).toHaveBeenCalledWith(recorder, input.options);
		expect(providerTrackers.event).toBeDefined();
	});

	it('reconfigures an existing tracker instead of creating a new one', () => {
		const providerTrackers: Partial<Record<TrackerType, TrackerInterface>> = {};
		const input: KinesisConfigureAutoTrackInput = {
			enable: true,
			type: 'session',
			options: { streamName: 'stream0', partitionKey: 'partition0' },
		};

		updateProviderTrackers(input, recorder, providerTrackers);
		updateProviderTrackers(input, recorder, providerTrackers);

		expect(MockSessionTracker).toHaveBeenCalledTimes(1);
		const instance = MockSessionTracker.mock.instances[0];
		expect(instance.configure).toHaveBeenCalledWith(recorder, input.options);
	});

	it('cleans up and removes a tracker when disabled', () => {
		const providerTrackers: Partial<Record<TrackerType, TrackerInterface>> = {};
		const enableInput: KinesisConfigureAutoTrackInput = {
			enable: true,
			type: 'event',
			options: { streamName: 'stream0', partitionKey: 'partition0' },
		};
		updateProviderTrackers(enableInput, recorder, providerTrackers);
		expect(providerTrackers.event).toBeDefined();

		const disableInput: KinesisConfigureAutoTrackInput = {
			enable: false,
			type: 'event',
		};
		updateProviderTrackers(disableInput, recorder, providerTrackers);

		expect(MockEventTracker.mock.instances[0].cleanup).toHaveBeenCalledTimes(1);
		expect(providerTrackers.event).toBeUndefined();
	});
});
