import SessionTracker from '../../src/trackers/SessionTracker';

const tracker = jest.fn().mockImplementation(() => {
	return Promise.resolve();
});

describe('SessionTracker test', () => {
	describe('constructor test', () => {
		test('happy case', () => {
			tracker.mockClear();

			const spyon = jest
				.spyOn(document, 'addEventListener')
				.mockImplementationOnce(() => {
					return;
				});

			const sessionTracker = new SessionTracker(tracker, {
				enable: true,
			});

			expect(tracker).toBeCalledWith(
				{
					name: '_session.start',
					attributes: {},
				},
				'AWSPinpoint'
			);
			expect(spyon).toBeCalled();

			spyon.mockClear();
		});

		test('not in the supported env', () => {
			tracker.mockClear();
			let tmp = document;
			Object.defineProperty(window.document, 'hidden', {
				writable: true,
				value: undefined,
			});

			const sessionTracker = new SessionTracker(tracker, {
				enable: true,
			});

			expect(tracker).not.toBeCalled();
			Object.defineProperty(window.document, 'hidden', {
				writable: true,
				value: false,
			});
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

			const spyon = jest
				.spyOn(document, 'removeEventListener')
				.mockImplementationOnce(() => {
					return;
				});
			sessionTracker.configure({
				enable: false,
			});

			expect(spyon).toBeCalled();
			spyon.mockClear();
		});
	});

	describe('track function test', () => {
		test('if the page is hidden', async () => {
			const sessionTracker = new SessionTracker(tracker, {
				enable: true,
			});
			tracker.mockClear();

			Object.defineProperty(window.document, 'hidden', {
				writable: true,
				value: true,
			});

			Object.defineProperty(window.document, 'visibilityState', {
				writable: true,
				value: 'hidden',
			});

			await sessionTracker._trackFunc();

			expect(tracker).toBeCalledWith(
				{
					name: '_session.stop',
					attributes: {},
				},
				'AWSPinpoint'
			);
		});

		test('if the page is not hidden', async () => {
			const sessionTracker = new SessionTracker(tracker, {
				enable: true,
			});
			tracker.mockClear();

			Object.defineProperty(window.document, 'hidden', {
				writable: true,
				value: false,
			});

			Object.defineProperty(window.document, 'visibilityState', {
				writable: true,
				value: 'visible',
			});

			await sessionTracker._trackFunc();

			expect(tracker).toBeCalledWith(
				{
					name: '_session.start',
					attributes: {},
				},
				'AWSPinpoint'
			);
		});
	});
});
