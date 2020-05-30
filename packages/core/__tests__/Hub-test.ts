import { Hub, Logger } from '../src';

describe('Hub', () => {
	test('happy case', () => {
		const listener = jest.fn(() => {});

		Hub.listen('auth', listener);

		Hub.dispatch(
			'auth',
			{
				event: 'signOut',
				data: 'the user has been signed out',
				message: 'User singout has taken place',
			},
			'Auth',
			Symbol.for('amplify_default')
		);

		expect(listener).toHaveBeenCalled();
	});

	test('Legacy config', () => {
		class MyClass {
			constructor() {
				Hub.listen('auth', this, 'MyListener');
			}

			// Default handler for listening events
			onHubCapsule = jest.fn(function(capsule) {
				const { channel, payload } = capsule;
				if (channel === 'auth') {
					this.onAuthEvent(payload);
				}
			});

			onAuthEvent = jest.fn(function(payload) {
				// ... your implementation
			});
		}

		const listener = new MyClass();

		const loggerSpy = jest.spyOn(Logger.prototype, '_log');

		Hub.listen('auth', listener);

		Hub.dispatch(
			'auth',
			{
				event: 'signOut',
				data: 'the user has been signed out',
				message: 'User singout has taken place',
			},
			'Auth',
			Symbol.for('amplify_default')
		);

		expect(listener.onHubCapsule).toHaveBeenCalled();
		expect(listener.onAuthEvent).toHaveBeenCalled();

		expect(loggerSpy).toHaveBeenCalledWith(
			'WARN',
			'WARNING onHubCapsule is Deprecated. Please pass in a callback.'
		);
	});

	test('Protected channel', () => {
		const listener = jest.fn(() => {});
		const loggerSpy = jest.spyOn(Logger.prototype, '_log');

		Hub.listen('auth', listener);

		Hub.dispatch(
			'auth',
			{
				event: 'signOut',
				data: 'the user has been signed out',
				message: 'User singout has taken place',
			},
			'Auth'
		);

		expect(listener).toHaveBeenCalled();
		expect(loggerSpy).toHaveBeenCalledWith(
			'WARN',
			'WARNING: auth is protected and dispatching on it can have unintended consequences'
		);
	});

	test('Regex Listener', () => {
		const listener = jest.fn(() => {});

		Hub.listen(/user/, listener);

		Hub.dispatch(
			'auth',
			{
				event: 'signOut',
				data: 'the user has been signed out',
				message: 'A user sign out event has taken place.',
			},
			'Auth',
			Symbol.for('amplify_default')
		);

		expect(listener).toHaveBeenCalledWith({
			channel: 'auth',
			payload: {
				data: 'the user has been signed out',
				event: 'signOut',
				message: 'A user sign out event has taken place.',
			},
			patternInfo: [],
			source: 'Auth',
		});
	});

	test('Regex Listener one group', () => {
		const listener = jest.fn(() => {});

		Hub.listen(/user(.*)/, listener);

		Hub.dispatch(
			'auth',
			{
				event: 'signOut',
				data: 'the user has been signed out',
				message: 'A user sign out event has taken place.',
			},
			'Auth',
			Symbol.for('amplify_default')
		);

		expect(listener).toHaveBeenCalledWith({
			channel: 'auth',
			payload: {
				data: 'the user has been signed out',
				event: 'signOut',
				message: 'A user sign out event has taken place.',
			},
			patternInfo: [' sign out event has taken place.'],
			source: 'Auth',
		});
	});

	test('Regex Listener three groups', () => {
		const listener = jest.fn(() => {});

		Hub.listen(/user ([^ ]+) ([^ ]+) (.*)/, listener);

		Hub.dispatch(
			'auth',
			{
				event: 'signOut',
				data: 'the user has been signed out',
				message: 'A user sign out event has taken place.',
			},
			'Auth',
			Symbol.for('amplify_default')
		);

		expect(listener).toHaveBeenCalledWith({
			channel: 'auth',
			payload: {
				data: 'the user has been signed out',
				event: 'signOut',
				message: 'A user sign out event has taken place.',
			},
			patternInfo: ['sign', 'out', 'event has taken place.'],
			source: 'Auth',
		});
	});

	test('Regex All Messages', () => {
		const listener = jest.fn(() => {});

		Hub.listen(/.*/, listener);

		Hub.dispatch(
			'auth',
			{
				event: 'signOut',
				data: 'the user has been signed out',
				message: 'A user sign out event has taken place.',
			},
			'Auth',
			Symbol.for('amplify_default')
		);

		expect(listener).toHaveBeenCalledWith({
			channel: 'auth',
			payload: {
				data: 'the user has been signed out',
				event: 'signOut',
				message: 'A user sign out event has taken place.',
			},
			patternInfo: [],
			source: 'Auth',
		});
	});

	test('Regex Listener No Message', () => {
		const listener = jest.fn(() => {});

		Hub.listen(/user(.*)/, listener);
		const loggerSpy = jest.spyOn(Logger.prototype, '_log');

		Hub.dispatch(
			'auth',
			{
				event: 'signOut',
				message: null,
			},
			'Auth',
			Symbol.for('amplify_default')
		);

		expect(listener).not.toHaveBeenCalled();
		expect(loggerSpy).toHaveBeenCalledWith(
			'WARN',
			'Cannot perform pattern matching without a message key'
		);
	});

	test('Remove listener', () => {
		const listener = jest.fn(() => {});

		Hub.listen('auth', listener);

		Hub.dispatch(
			'auth',
			{
				event: 'signOut',
				data: 'the user has been signed out',
				message: 'User singout has taken place',
			},
			'Auth',
			Symbol.for('amplify_default')
		);

		expect(listener).toHaveBeenCalled();

		listener.mockReset();

		Hub.remove('auth', listener);

		Hub.dispatch(
			'auth',
			{
				event: 'signOut2',
				data: 'the user has been signed out',
				message: 'User singout has taken place',
			},
			'Auth',
			Symbol.for('amplify_default')
		);

		expect(listener).not.toHaveBeenCalled();
	});

	test('Remove listener with unsubscribe function', () => {
		const listener = jest.fn(() => {});

		const unsubscribe = Hub.listen('auth', listener);

		Hub.dispatch(
			'auth',
			{
				event: 'signOut',
				data: 'the user has been signed out',
				message: 'User singout has taken place',
			},
			'Auth',
			Symbol.for('amplify_default')
		);

		expect(listener).toHaveBeenCalled();

		listener.mockReset();

		unsubscribe();

		Hub.dispatch(
			'auth',
			{
				event: 'signOut2',
				data: 'the user has been signed out',
				message: 'User singout has taken place',
			},
			'Auth',
			Symbol.for('amplify_default')
		);

		expect(listener).not.toHaveBeenCalled();
	});
});
