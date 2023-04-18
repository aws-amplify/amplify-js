const mockAddEventListener = jest.fn();
const mockRemoveEventListener = jest.fn();

jest.mock('react-native', () => {
	return {
		AppState: {
			currentState: 'inactive',
			addEventListener: mockAddEventListener,
			removeEventListener: mockRemoveEventListener,
		},
	};
});

import { SessionTracker } from '../../src/trackers/SessionTracker-rn';
import { AppState } from 'react-native';

const tracker = jest.fn().mockImplementation(() => {
	return Promise.resolve();
});

describe('SessionTracker test', () => {
	describe('constructor test', () => {
		test('happy case', () => {
			tracker.mockClear();

			const sessionTracker = new SessionTracker(tracker, {
				enable: true,
			});

			expect(tracker).toBeCalledWith(
				{
					name: '_session.start',
					attributes: {},
					immediate: false,
				},
				'AWSPinpoint'
			);
			expect(mockAddEventListener).toBeCalled();

			mockAddEventListener.mockClear();
		});
	});

	describe('configure test', () => {
		test('happy case', () => {
			const sessionTracker = new SessionTracker(tracker, {
				enable: true,
			});

			expect(
				sessionTracker.configure({
					enable: true,
					attributes: {
						attr1: 'val1',
					},
					provider: 'myProvider',
				})
			).toEqual({
				enable: true,
				attributes: {
					attr1: 'val1',
				},
				provider: 'myProvider',
			});
		});

		test('autoTrack disabled', () => {
			const sessionTracker = new SessionTracker(tracker, {
				enable: true,
			});

			mockRemoveEventListener.mockClear();

			sessionTracker.configure({
				enable: false,
			});

			expect(mockRemoveEventListener).toBeCalled();
			mockRemoveEventListener.mockClear();
		});
	});

	describe('track function test', () => {
		test('if the app turns to be active', () => {
			const sessionTracker = new SessionTracker(tracker, {
				enable: true,
			});
			tracker.mockClear();

			// mock to be inactive
			sessionTracker._currentState = 'inactive';
			sessionTracker._trackFunc('active');

			expect(tracker).toBeCalledWith(
				{
					name: '_session.start',
					attributes: {},
					immediate: false,
				},
				'AWSPinpoint'
			);
		});

		test('if app turns into background', () => {
			const sessionTracker = new SessionTracker(tracker, {
				enable: true,
			});
			tracker.mockClear();

			sessionTracker._trackFunc('inactive');

			expect(tracker).toBeCalledWith(
				{ attributes: {}, immediate: false, name: '_session.stop' },
				'AWSPinpoint'
			);
		});
	});
});
