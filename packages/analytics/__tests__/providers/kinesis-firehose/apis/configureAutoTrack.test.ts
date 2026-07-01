// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { KinesisFirehoseConfigureAutoTrackInput } from '../../../../src/providers/kinesis-firehose/types';
import {
	EventTracker,
	PageViewTracker,
	SessionTracker,
} from '../../../../src/trackers';
import { record } from '../../../../src/providers/kinesis-firehose/apis/record';

jest.mock('../../../../src/trackers');
jest.mock('../../../../src/providers/kinesis-firehose/apis/record');

const MOCK_STREAM_NAME = 'stream0';

const MOCK_INPUT = {
	enable: true,
	type: 'event',
	options: {
		streamName: MOCK_STREAM_NAME,
		attributes: {
			'custom-attr': 'val',
		},
	},
} as KinesisFirehoseConfigureAutoTrackInput;

describe('Kinesis Firehose API: configureAutoTrack', () => {
	const mockRecord = record as jest.Mock;
	const MockEventTracker = EventTracker as jest.MockedClass<
		typeof EventTracker
	>;
	const MockPageViewTracker = PageViewTracker as jest.MockedClass<
		typeof PageViewTracker
	>;
	const MockSessionTracker = SessionTracker as jest.MockedClass<
		typeof SessionTracker
	>;

	beforeEach(() => {
		MockEventTracker.mockClear();
		MockPageViewTracker.mockClear();
		MockSessionTracker.mockClear();
		mockRecord.mockClear();
	});

	it('validates the tracker configuration', () => {
		expect.assertions(1);

		jest.isolateModules(() => {
			const {
				configureAutoTrack,
			} = require('../../../../src/providers/kinesis-firehose/apis');

			try {
				configureAutoTrack({
					...MOCK_INPUT,
					type: 'invalidTracker',
				} as any);
			} catch (e: any) {
				expect(e.message).toBe('Invalid tracker type specified.');
			}
		});
	});

	it('throws when enabling a tracker without a streamName', () => {
		expect.assertions(1);

		jest.isolateModules(() => {
			const {
				configureAutoTrack,
			} = require('../../../../src/providers/kinesis-firehose/apis');

			try {
				configureAutoTrack({
					enable: true,
					type: 'session',
					options: {},
				} as any);
			} catch (e: any) {
				expect(e.message).toBe(
					'A streamName is required to enable auto-tracking.',
				);
			}
		});
	});

	it('does not require a streamName when disabling a tracker', () => {
		jest.isolateModules(() => {
			const {
				configureAutoTrack,
			} = require('../../../../src/providers/kinesis-firehose/apis');

			expect(() => {
				configureAutoTrack({
					enable: false,
					type: 'session',
				} as KinesisFirehoseConfigureAutoTrackInput);
			}).not.toThrow();
		});
	});

	it('creates a new Event tracker when required', () => {
		jest.isolateModules(() => {
			const {
				configureAutoTrack,
			} = require('../../../../src/providers/kinesis-firehose/apis');

			configureAutoTrack(MOCK_INPUT);
		});

		expect(MockEventTracker).toHaveBeenCalledWith(
			expect.any(Function),
			MOCK_INPUT.options,
		);
	});

	it('creates a new Session tracker when required', () => {
		const testInput = {
			...MOCK_INPUT,
			type: 'session',
		} as KinesisFirehoseConfigureAutoTrackInput;

		jest.isolateModules(() => {
			const {
				configureAutoTrack,
			} = require('../../../../src/providers/kinesis-firehose/apis');

			configureAutoTrack(testInput);
		});

		expect(MockSessionTracker).toHaveBeenCalledWith(
			expect.any(Function),
			testInput.options,
		);
	});

	it('creates a new PageView tracker when required', () => {
		const testInput = {
			...MOCK_INPUT,
			type: 'pageView',
		} as KinesisFirehoseConfigureAutoTrackInput;

		jest.isolateModules(() => {
			const {
				configureAutoTrack,
			} = require('../../../../src/providers/kinesis-firehose/apis');

			configureAutoTrack(testInput);
		});

		expect(MockPageViewTracker).toHaveBeenCalledWith(
			expect.any(Function),
			testInput.options,
		);
	});

	it('records an event to the configured stream when the tracker fires', () => {
		jest.isolateModules(() => {
			const {
				configureAutoTrack,
			} = require('../../../../src/providers/kinesis-firehose/apis');

			configureAutoTrack(MOCK_INPUT);
		});

		// The recorder callback passed to the tracker should emit to the configured stream
		const emitTrackingEvent = MockEventTracker.mock.calls[0][0];
		emitTrackingEvent('my-event', { foo: 'bar' });

		expect(mockRecord).toHaveBeenCalledWith({
			streamName: MOCK_STREAM_NAME,
			data: {
				name: 'my-event',
				attributes: { foo: 'bar' },
			},
		});
	});

	it('reconfigures an existing tracker and updates the stream', () => {
		jest.isolateModules(() => {
			const {
				configureAutoTrack,
			} = require('../../../../src/providers/kinesis-firehose/apis');

			// Enable the tracker
			configureAutoTrack(MOCK_INPUT);
			expect(MockEventTracker).toHaveBeenCalledWith(
				expect.any(Function),
				MOCK_INPUT.options,
			);

			// Reconfigure the tracker with a new stream
			const reconfigureInput = {
				...MOCK_INPUT,
				options: {
					...MOCK_INPUT.options,
					streamName: 'stream1',
				},
			} as KinesisFirehoseConfigureAutoTrackInput;
			configureAutoTrack(reconfigureInput);

			const trackerInstance = MockEventTracker.mock.instances[0];
			expect(trackerInstance.configure).toHaveBeenCalledTimes(1);
			expect(trackerInstance.configure).toHaveBeenCalledWith(
				expect.any(Function),
				reconfigureInput.options,
			);

			// The recorder from the reconfigure call should target the updated stream
			const emitTrackingEvent = (trackerInstance.configure as jest.Mock).mock
				.calls[0][0];
			emitTrackingEvent('reconfigured-event', { a: 'b' });

			expect(mockRecord).toHaveBeenCalledWith({
				streamName: 'stream1',
				data: {
					name: 'reconfigured-event',
					attributes: { a: 'b' },
				},
			});
		});
	});

	it("cleans up a tracker when it's disabled", () => {
		const testInput = {
			...MOCK_INPUT,
			enable: false,
		} as KinesisFirehoseConfigureAutoTrackInput;

		jest.isolateModules(() => {
			const {
				configureAutoTrack,
			} = require('../../../../src/providers/kinesis-firehose/apis');

			// Enable the tracker
			configureAutoTrack(MOCK_INPUT);
			expect(MockEventTracker).toHaveBeenCalledWith(
				expect.any(Function),
				MOCK_INPUT.options,
			);

			// Disable the tracker
			configureAutoTrack(testInput);
			expect(MockEventTracker.mock.instances[0].cleanup).toHaveBeenCalledTimes(
				1,
			);
		});
	});
});
