// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { ConfigureAutoTrackInput } from '../../../../src/providers/pinpoint';
import {
	EventTracker,
	PageViewTracker,
	SessionTracker,
} from '../../../../src/trackers';
import { record } from '../../../../src/providers/pinpoint/apis/record';
import { createMockAmplifyContext } from '../../../testUtils/mockAmplifyContext';

jest.mock('../../../../src/trackers');
jest.mock('../../../../src/providers/pinpoint/apis/record');

const mockCtx = createMockAmplifyContext();

const MOCK_INPUT = {
	enable: true,
	type: 'event',
	options: {
		attributes: {
			'custom-attr': 'val',
		},
	},
} as ConfigureAutoTrackInput;

describe('Pinpoint API: configureAutoTrack', () => {
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

	it('Validates the tracker configuration', () => {
		expect.assertions(1);

		jest.isolateModules(() => {
			const {
				configureAutoTrack,
			} = require('../../../../src/providers/pinpoint/apis');

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

	it('Creates a new Event tracker when required', () => {
		jest.isolateModules(() => {
			const {
				configureAutoTrack,
			} = require('../../../../src/providers/pinpoint/apis');

			configureAutoTrack(MOCK_INPUT);
		});

		expect(MockEventTracker).toHaveBeenCalledWith(
			expect.any(Function),
			MOCK_INPUT.options,
		);
	});

	it('Creates a new Session tracker when required', () => {
		const testInput = {
			...MOCK_INPUT,
			type: 'session',
		} as ConfigureAutoTrackInput;

		jest.isolateModules(() => {
			const {
				configureAutoTrack,
			} = require('../../../../src/providers/pinpoint/apis');

			configureAutoTrack(testInput);
		});

		expect(MockSessionTracker).toHaveBeenCalledWith(
			expect.any(Function),
			testInput.options,
		);
	});

	it('Creates a new PageView tracker when required', () => {
		const testInput = {
			...MOCK_INPUT,
			type: 'pageView',
		} as ConfigureAutoTrackInput;

		jest.isolateModules(() => {
			const {
				configureAutoTrack,
			} = require('../../../../src/providers/pinpoint/apis');

			configureAutoTrack(testInput);
		});

		expect(MockPageViewTracker).toHaveBeenCalledWith(
			expect.any(Function),
			testInput.options,
		);
	});

	it('accepts an explicitly provided context and threads it through to record', () => {
		jest.isolateModules(() => {
			const {
				configureAutoTrack,
			} = require('../../../../src/providers/pinpoint/apis');

			configureAutoTrack(mockCtx, MOCK_INPUT);
		});

		expect(MockEventTracker).toHaveBeenCalledWith(
			expect.any(Function),
			MOCK_INPUT.options,
		);

		// Fire the recorder callback handed to the tracker and confirm the
		// explicit context actually reaches record().
		const emitTrackingEvent = MockEventTracker.mock.calls[0][0];
		emitTrackingEvent('my-event', { foo: 'bar' });

		expect(mockRecord).toHaveBeenCalledWith(mockCtx, {
			name: 'my-event',
			attributes: { foo: 'bar' },
		});
	});

	it('can be configured before Amplify.configure (no global context)', () => {
		jest.isolateModules(() => {
			const {
				configureAutoTrack,
			} = require('../../../../src/providers/pinpoint/apis');

			// The isolated registry has NO global context set — tracker setup must
			// not resolve the context eagerly, so this must not throw.
			expect(() => {
				configureAutoTrack(MOCK_INPUT);
			}).not.toThrow();
		});

		// On the global-fallback path record is called WITHOUT a captured context,
		// so it resolves the live global context lazily at emit time.
		const emitTrackingEvent = MockEventTracker.mock.calls[0][0];
		emitTrackingEvent('my-event', { foo: 'bar' });

		expect(mockRecord).toHaveBeenCalledWith({
			name: 'my-event',
			attributes: { foo: 'bar' },
		});
	});

	it('Reconfigures an existing tracker', () => {
		jest.isolateModules(() => {
			const {
				configureAutoTrack,
			} = require('../../../../src/providers/pinpoint/apis');

			// Enable the tracker
			configureAutoTrack(MOCK_INPUT);
			expect(MockEventTracker).toHaveBeenCalledWith(
				expect.any(Function),
				MOCK_INPUT.options,
			);

			// Reconfigure the tracker
			configureAutoTrack(MOCK_INPUT);
			expect(
				MockEventTracker.mock.instances[0].configure,
			).toHaveBeenCalledTimes(1);
		});
	});

	it("Cleans up a tracker when it's disabled", () => {
		const testInput = {
			...MOCK_INPUT,
			enable: false,
		} as ConfigureAutoTrackInput;

		jest.isolateModules(() => {
			const {
				configureAutoTrack,
			} = require('../../../../src/providers/pinpoint/apis');

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
