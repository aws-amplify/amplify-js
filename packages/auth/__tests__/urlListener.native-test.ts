import { Linking, AppState } from 'react-native';

jest.mock('@aws-amplify/core', () => ({
	ConsoleLogger: class MockConsoleLogger {
		debug = jest.fn();
	},
}));

jest.mock('react-native', () => ({
	Linking: {
		addEventListener: jest.fn(),
		getInitialURL: jest.fn(),
	},
	AppState: {
		addEventListener: jest.fn(),
	},
}));

describe('urlListener react-native', () => {
	const delay = (ms: number) => new Promise(ok => setTimeout(ok, ms));
	const mockLinking = () => {
		let linkingListener;
		let appStateListener;

		(AppState.addEventListener as jest.Mock).mockImplementation(
			(event, callback) => {
				appStateListener = callback;
			}
		);

		(Linking.addEventListener as jest.Mock).mockImplementation(
			(eventName, _listener) => {
				linkingListener = _listener;
			}
		);

		return {
			emitAppStateChange: event => appStateListener(event),
			emitLinkingChange: event => linkingListener(event),
		};
	};

	it('should add event listeners once', cb => {
		jest.isolateModules(async () => {
			const urlListener = require('../src/urlListener.native').default;

			await urlListener(jest.fn());
			await urlListener(jest.fn());

			expect(Linking.addEventListener).toHaveBeenCalledTimes(1);
			expect(AppState.addEventListener).toHaveBeenCalledTimes(1);

			cb();
		});
	});

	it('should invoke passed callback with url when change', cb => {
		jest.isolateModules(async () => {
			const { emitLinkingChange } = mockLinking();
			const url = 'https://aws.amazon.com/mock_url_1';
			const callback = jest.fn();
			const urlListener = require('../src/urlListener.native').default;

			await urlListener(callback);

			emitLinkingChange({ url });

			expect(callback).toHaveBeenCalledWith({ url });

			cb();
		});
	});

	it('should invoke passed callback with url app when app was opened by link', cb => {
		jest.isolateModules(async () => {
			const { emitAppStateChange } = mockLinking();

			const url = 'https://aws.amazon.com/mock_url_2';

			(Linking.getInitialURL as jest.Mock).mockResolvedValueOnce(url);

			const callback = jest.fn();
			const urlListener = require('../src/urlListener.native').default;

			await urlListener(callback);

			emitAppStateChange('active');

			await delay(0); // wait next tick, when `getInitialURL` will be resolved

			expect(callback).toHaveBeenCalledWith({ url });

			cb();
		});
	});
});
